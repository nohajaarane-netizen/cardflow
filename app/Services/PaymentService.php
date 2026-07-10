<?php

namespace App\Services;

use App\Models\Card;
use App\Models\Transaction;
use App\Models\Alert;
use App\Models\Beneficiary;
use Illuminate\Support\Facades\Cache;
use Twilio\Rest\Client;

class PaymentService
{
    // Code accepté quand le mode test local (OTP_BYPASS) est actif
    private const BYPASS_CODE = '000000';

    private FraudService $fraudService;
    private Client $twilio;
    private string $verifySid;
    private bool $otpBypass;

    public function __construct()
    {
        $this->fraudService = new FraudService();
        $this->otpBypass = (bool) config('services.twilio.otp_bypass');

        // Client Twilio initialisé une seule fois
        $this->twilio = new Client(
            config('services.twilio.sid'),
            config('services.twilio.auth_token')
        );
        $this->verifySid = config('services.twilio.verify_sid');
    }

    /*
    |----------------------------------------------------------
    | initiate — Lancer un paiement + envoyer OTP via Twilio
    |----------------------------------------------------------
    | Vérifications dans l'ordre :
    | 1. Carte existe
    | 2. Carte active
    | 3. Plafond global suffisant
    | 4. Plafond journalier suffisant
    | 5. Fraude détectée ?
    | 6. Envoyer OTP réel via Twilio (SMS)
    |----------------------------------------------------------
    */
    public function initiate(int $cardId, float $montant, string $marchand, ?array $beneficiary = null): array
    {
        // Étape 1 : La carte existe ?
        $card = Card::find($cardId);
        if (!$card) {
            return ['success' => false, 'message' => 'Carte introuvable', 'code' => '14'];
        }

        // Étape 2 : La carte est bloquée ?
        if ($card->statut === 'blocked') {
            return ['success' => false, 'message' => 'Carte bloquee', 'code' => '62'];
        }

        // Étape 3 : La carte est expirée ?
        if ($card->statut === 'expired') {
            return ['success' => false, 'message' => 'Carte expiree', 'code' => '54'];
        }

        // Étape 4 : Plafond global suffisant ?
        if ($montant > $card->plafond) {
            return ['success' => false, 'message' => 'Plafond insuffisant', 'code' => '51'];
        }

        // Étape 5 : Plafond journalier suffisant ?
        $totalAujourdhui = Transaction::where('card_id', $card->id)
            ->where('statut', 'accepted')
            ->whereDate('created_at', today())
            ->sum('montant');

        if (($totalAujourdhui + $montant) > $card->plafond_journalier) {
            return [
                'success' => false,
                'message' => 'Plafond journalier atteint — total aujourd\'hui : ' . $totalAujourdhui . ' MAD',
                'code'    => '61',
            ];
        }

        // Étape 6 : Détection fraude
        $fraud = $this->fraudService->analyze($card, $montant, $marchand);
        if ($fraud['is_fraud']) {
            $this->save($card, $montant, $marchand, '59', 'refused');
            return [
                'success' => false,
                'message' => 'Transaction suspecte — fraude détectée',
                'code'    => '59',
                'reasons' => $fraud['reasons'],
            ];
        }

        // Étape 7 : Récupérer le numéro de téléphone du titulaire de la carte
        $telephone = $card->user->telephone ?? null;

        if (!$telephone) {
            return ['success' => false, 'message' => 'Numero de telephone introuvable pour ce client', 'code' => '96'];
        }

        // Étape 8 : Envoyer le vrai OTP via Twilio (remplace l'ancienne génération manuelle)
        // — sauf en mode test local (OTP_BYPASS), utile quand Twilio bloque le numéro trial.
        if (!$this->otpBypass) {
            try {
                $this->twilio->verify->v2->services($this->verifySid)
                    ->verifications
                    ->create($telephone, 'sms');
            } catch (\Exception $e) {
                return ['success' => false, 'message' => 'Erreur envoi SMS : ' . $e->getMessage(), 'code' => '96'];
            }
        }

        // On garde une trace en cache (sans le code — Twilio le gère lui-même)
        $cacheKey = 'otp_' . $cardId . '_' . $montant;
        Cache::put($cacheKey, [
            'card_id'     => $cardId,
            'montant'     => $montant,
            'marchand'    => $marchand,
            'telephone'   => $telephone,
            'beneficiary' => $beneficiary, // infos du bénéficiaire du virement (ou null)
        ], 300);

        return [
            'success'   => true,
            'message'   => $this->otpBypass
                ? 'Mode test — utilisez le code ' . self::BYPASS_CODE
                : 'Code envoye par SMS — valide 5 minutes',
            'cache_key' => $cacheKey,
        ];
    }

    /*
    |----------------------------------------------------------
    | confirm — Confirmer le paiement avec l'OTP (vérifié par Twilio)
    |----------------------------------------------------------
    | Limite : 3 tentatives max → carte bloquée automatiquement
    |----------------------------------------------------------
    */
    public function confirm(string $cacheKey, string $otpSaisi): array
    {
        $data = Cache::get($cacheKey);

        // OTP expiré ou introuvable
        if (!$data) {
            return $this->respond('05', 'refused', 'OTP expire ou invalide', null);
        }

        // Clé pour compter les tentatives (logique inchangée)
        $attemptsKey = 'otp_attempts_' . $cacheKey;
        $attempts    = Cache::get($attemptsKey, 0);

        // Vérification du code — en mode test local (OTP_BYPASS), on compare au code
        // fixe au lieu d'appeler Twilio (utile quand le numéro trial est bloqué).
        if ($this->otpBypass) {
            $otpValide = ($otpSaisi === self::BYPASS_CODE);
        } else {
            try {
                $check = $this->twilio->verify->v2->services($this->verifySid)
                    ->verificationChecks
                    ->create([
                        'to'   => $data['telephone'],
                        'code' => $otpSaisi,
                    ]);
                $otpValide = ($check->status === 'approved');
            } catch (\Exception $e) {
                $otpValide = false;
            }
        }

        // OTP incorrect
        if (!$otpValide) {
            $attempts++;
            Cache::put($attemptsKey, $attempts, 300);

            // 3 tentatives échouées → bloquer la carte
            if ($attempts >= 3) {
                $card = Card::find($data['card_id']);
                if ($card) {
                    $card->update(['statut' => 'blocked']);
                    Alert::create([
                        'card_id' => $card->id,
                        'type'    => 'security',
                        'message' => 'Carte bloquée automatiquement après 3 tentatives OTP incorrectes',
                        'lue'     => false,
                    ]);
                }
                Cache::forget($cacheKey);
                Cache::forget($attemptsKey);
                return $this->respond('62', 'refused', 'Carte bloquee apres 3 tentatives incorrectes', null);
            }

            $restantes = 3 - $attempts;
            return $this->respond('05', 'refused', "Code SMS incorrect — {$restantes} tentative(s) restante(s)", null);
        }

        // OTP correct → résoudre le bénéficiaire (virement) puis enregistrer la transaction
        $beneficiaryId = $this->resolveBeneficiary($data);

        $transaction = Transaction::create([
            'card_id'        => $data['card_id'],
            'beneficiary_id' => $beneficiaryId,
            'montant'        => $data['montant'],
            'marchand'       => $data['marchand'],
            'statut'         => 'accepted',
            'code_reponse'   => '00',
            'otp'            => $otpSaisi,
            'otp_verifie'    => true,
        ]);

        Cache::forget($cacheKey);
        Cache::forget($attemptsKey);

        return $this->respond('00', 'accepted', 'Paiement accepte', $transaction);
    }

    /*
    |----------------------------------------------------------
    | resolveBeneficiary — Retrouver ou enregistrer le bénéficiaire
    |----------------------------------------------------------
    | - Bénéficiaire existant → on renvoie son id.
    | - Nouveau bénéficiaire → on l'enregistre automatiquement dans la
    |   liste du client (firstOrCreate évite les doublons de RIB).
    | Renvoie l'id du bénéficiaire, ou null pour un paiement marchand.
    |----------------------------------------------------------
    */
    private function resolveBeneficiary(array $data): ?int
    {
        $benef = $data['beneficiary'] ?? null;
        if (!$benef) {
            return null;
        }

        // Bénéficiaire déjà enregistré
        if (!empty($benef['id'])) {
            return (int) $benef['id'];
        }

        // Nouveau bénéficiaire → enregistrement automatique pour le titulaire de la carte
        $card = Card::find($data['card_id']);
        if (!$card) {
            return null;
        }

        $created = Beneficiary::firstOrCreate(
            ['user_id' => $card->user_id, 'rib' => $benef['rib']],
            [
                'prenom' => $benef['prenom'] ?? '',
                'nom'    => $benef['nom'] ?? '',
                'banque' => $benef['banque'] ?? '',
            ]
        );

        return $created->id;
    }

    /*
    |----------------------------------------------------------
    | process — Paiement direct sans 3DS (inchangé)
    |----------------------------------------------------------
    */
    public function process(int $cardId, float $montant, string $marchand): array
    {
        $card = Card::find($cardId);
        if (!$card) {
            return $this->respond('14', 'refused', 'Carte introuvable', null);
        }
        if ($card->statut === 'blocked') {
            $transaction = $this->save($card, $montant, $marchand, '62', 'refused');
            return $this->respond('62', 'refused', 'Carte bloquee', $transaction);
        }
        if ($card->statut === 'expired') {
            $transaction = $this->save($card, $montant, $marchand, '54', 'refused');
            return $this->respond('54', 'refused', 'Carte expiree', $transaction);
        }
        if ($montant > $card->plafond) {
            $transaction = $this->save($card, $montant, $marchand, '51', 'refused');
            return $this->respond('51', 'refused', 'Plafond insuffisant', $transaction);
        }

        $totalAujourdhui = Transaction::where('card_id', $card->id)
            ->where('statut', 'accepted')
            ->whereDate('created_at', today())
            ->sum('montant');

        if (($totalAujourdhui + $montant) > $card->plafond_journalier) {
            $transaction = $this->save($card, $montant, $marchand, '61', 'refused');
            return $this->respond('61', 'refused', 'Plafond journalier atteint', $transaction);
        }

        $fraud = $this->fraudService->analyze($card, $montant, $marchand);
        if ($fraud['is_fraud']) {
            $transaction = $this->save($card, $montant, $marchand, '59', 'refused');
            return $this->respond('59', 'refused', 'Transaction suspecte', $transaction);
        }

        $transaction = $this->save($card, $montant, $marchand, '00', 'accepted');
        return $this->respond('00', 'accepted', 'Paiement accepte', $transaction);
    }

    /*
    |----------------------------------------------------------
    | save — Enregistrer la transaction en BDD (inchangé)
    |----------------------------------------------------------
    */
    private function save(Card $card, float $montant, string $marchand, string $code, string $statut): Transaction
    {
        return Transaction::create([
            'card_id'      => $card->id,
            'montant'      => $montant,
            'marchand'     => $marchand,
            'statut'       => $statut,
            'code_reponse' => $code,
            'otp'          => null,
            'otp_verifie'  => false,
        ]);
    }

    /*
    |----------------------------------------------------------
    | respond — Formater la réponse JSON (inchangé)
    |----------------------------------------------------------
    */
    private function respond(string $code, string $statut, string $message, ?Transaction $transaction): array
    {
        return [
            'code_reponse' => $code,
            'statut'       => $statut,
            'message'      => $message,
            'transaction'  => $transaction,
        ];
    }
}
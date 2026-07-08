<?php

namespace App\Services;

use App\Models\Card;
use App\Models\Transaction;
use App\Models\Alert;
use Illuminate\Support\Facades\Cache;

class PaymentService
{
    private FraudService $fraudService;

    public function __construct()
    {
        $this->fraudService = new FraudService();
    }

    /*
    |----------------------------------------------------------
    | initiate — Lancer un paiement + générer OTP
    |----------------------------------------------------------
    | Vérifications dans l'ordre :
    | 1. Carte existe
    | 2. Carte active
    | 3. Plafond global suffisant
    | 4. Plafond journalier suffisant
    | 5. Fraude détectée ?
    | 6. Générer OTP → Cache 5 min
    |----------------------------------------------------------
    */
    public function initiate(int $cardId, float $montant, string $marchand): array
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

        // Étape 7 : Générer OTP
        $otp      = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $cacheKey = 'otp_' . $cardId . '_' . $montant;
        Cache::put($cacheKey, [
            'otp'      => $otp,
            'card_id'  => $cardId,
            'montant'  => $montant,
            'marchand' => $marchand,
        ], 300);

        return [
            'success'   => true,
            'message'   => 'OTP genere — valide 5 minutes',
            'otp'       => $otp,
            'cache_key' => $cacheKey,
        ];
    }

    /*
    |----------------------------------------------------------
    | confirm — Confirmer le paiement avec l'OTP
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

        // Clé pour compter les tentatives
        $attemptsKey = 'otp_attempts_' . $cacheKey;
        $attempts    = Cache::get($attemptsKey, 0);

        // OTP incorrect
        if ($data['otp'] !== $otpSaisi) {
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

        // OTP correct → enregistrer la transaction
        $transaction = Transaction::create([
            'card_id'      => $data['card_id'],
            'montant'      => $data['montant'],
            'marchand'     => $data['marchand'],
            'statut'       => 'accepted',
            'code_reponse' => '00',
            'otp'          => $otpSaisi,
            'otp_verifie'  => true,
        ]);

        Cache::forget($cacheKey);
        Cache::forget($attemptsKey);

        return $this->respond('00', 'accepted', 'Paiement accepte', $transaction);
    }

    /*
    |----------------------------------------------------------
    | process — Paiement direct sans 3DS
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

        // Vérifier le plafond journalier
        $totalAujourdhui = Transaction::where('card_id', $card->id)
            ->where('statut', 'accepted')
            ->whereDate('created_at', today())
            ->sum('montant');

        if (($totalAujourdhui + $montant) > $card->plafond_journalier) {
            $transaction = $this->save($card, $montant, $marchand, '61', 'refused');
            return $this->respond('61', 'refused', 'Plafond journalier atteint', $transaction);
        }

        // Vérification fraude
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
    | save — Enregistrer la transaction en BDD
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
    | respond — Formater la réponse JSON
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
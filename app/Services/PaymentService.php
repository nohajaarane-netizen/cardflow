<?php

namespace App\Services;

use App\Models\Card;
use App\Models\Transaction;
use Illuminate\Support\Facades\Cache;

class PaymentService
{
    /*
    |----------------------------------------------------------
    | initiate — Lancer un paiement + générer OTP
    |----------------------------------------------------------
    | Reçoit : card_id, montant, marchand
    | Vérifie la carte, génère un OTP 6 chiffres
    | Stocke l'OTP en cache 5 minutes
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

        // Étape 3 : Le montant respecte le plafond ?
        if ($montant > $card->plafond) {
            return ['success' => false, 'message' => 'Plafond insuffisant', 'code' => '51'];
        }

        // Étape 4 : Tout OK → générer OTP 6 chiffres
        $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        // Stocker l'OTP en cache pendant 5 minutes
        // Clé unique par carte et montant
        $cacheKey = 'otp_' . $cardId . '_' . $montant;
        Cache::put($cacheKey, [
            'otp'      => $otp,
            'card_id'  => $cardId,
            'montant'  => $montant,
            'marchand' => $marchand,
        ], 300); // 300 secondes = 5 minutes

        return [
            'success'   => true,
            'message'   => 'OTP genere — valide 5 minutes',
            'otp'       => $otp,        // en vrai, ce serait envoyé par SMS
            'cache_key' => $cacheKey,
        ];
    }

    /*
    |----------------------------------------------------------
    | confirm — Confirmer le paiement avec l'OTP
    |----------------------------------------------------------
    | Reçoit : cache_key, otp saisi par le client
    | Vérifie l'OTP → enregistre la transaction
    |----------------------------------------------------------
    */
    public function confirm(string $cacheKey, string $otpSaisi): array
    {
        // Récupérer les données stockées en cache
        $data = Cache::get($cacheKey);

        // OTP expiré ou introuvable
        if (!$data) {
            return $this->respond('05', 'refused', 'OTP expire ou invalide', null);
        }

        // OTP incorrect
        if ($data['otp'] !== $otpSaisi) {
            return $this->respond('05', 'refused', 'Code SMS incorrect', null);
        }

        // OTP correct → enregistrer la transaction
        $card = Card::find($data['card_id']);
        $transaction = Transaction::create([
            'card_id'      => $data['card_id'],
            'montant'      => $data['montant'],
            'marchand'     => $data['marchand'],
            'statut'       => 'accepted',
            'code_reponse' => '00',
            'otp'          => $otpSaisi,
            'otp_verifie'  => true,
        ]);

        // Supprimer l'OTP du cache après utilisation
        Cache::forget($cacheKey);

        return $this->respond('00', 'accepted', 'Paiement accepte', $transaction);
    }

    /*
    |----------------------------------------------------------
    | process — Paiement direct sans 3DS (utilisé avant)
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
        $transaction = $this->save($card, $montant, $marchand, '00', 'accepted');
        return $this->respond('00', 'accepted', 'Paiement accepte', $transaction);
    }

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
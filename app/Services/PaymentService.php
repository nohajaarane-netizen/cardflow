<?php

namespace App\Services;

use App\Models\Card;
use App\Models\Transaction;
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
    */
    public function initiate(int $cardId, float $montant, string $marchand): array
    {
        $card = Card::find($cardId);
        if (!$card) {
            return ['success' => false, 'message' => 'Carte introuvable', 'code' => '14'];
        }

        if ($card->statut === 'blocked') {
            return ['success' => false, 'message' => 'Carte bloquee', 'code' => '62'];
        }

        if ($montant > $card->plafond) {
            return ['success' => false, 'message' => 'Plafond insuffisant', 'code' => '51'];
        }

        // Vérification fraude avant de générer l'OTP
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

        // Générer OTP
        $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
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
    */
    public function confirm(string $cacheKey, string $otpSaisi): array
    {
        $data = Cache::get($cacheKey);

        if (!$data) {
            return $this->respond('05', 'refused', 'OTP expire ou invalide', null);
        }

        if ($data['otp'] !== $otpSaisi) {
            return $this->respond('05', 'refused', 'Code SMS incorrect', null);
        }

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

        Cache::forget($cacheKey);

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

        // Vérification fraude
        $fraud = $this->fraudService->analyze($card, $montant, $marchand);
        if ($fraud['is_fraud']) {
            $transaction = $this->save($card, $montant, $marchand, '59', 'refused');
            return $this->respond('59', 'refused', 'Transaction suspecte', $transaction);
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
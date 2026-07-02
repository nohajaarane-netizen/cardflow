<?php

namespace App\Services;

use App\Models\Card;
use App\Models\Transaction;

class PaymentService
{
    /*
    |----------------------------------------------------------
    | process — Traiter un paiement
    |----------------------------------------------------------
    | Reçoit : card_id, montant, marchand
    | Vérifie dans l'ordre : carte existe → active → plafond
    | Retourne : code réponse + statut + message
    |----------------------------------------------------------
    */
    public function process(int $cardId, float $montant, string $marchand): array
    {
        // Étape 1 : La carte existe ?
        $card = Card::find($cardId);
        if (!$card) {
            return $this->respond('14', 'refused', 'Carte introuvable', null);
        }

        // Étape 2 : La carte est bloquée ?
        if ($card->statut === 'blocked') {
            $transaction = $this->save($card, $montant, $marchand, '62', 'refused');
            return $this->respond('62', 'refused', 'Carte bloquee', $transaction);
        }

        // Etape 3 : La carte est expiree ?
        if ($card->statut === 'expired') {
            $transaction = $this->save($card, $montant, $marchand, '54', 'refused');
            return $this->respond('54', 'refused', 'Carte expiree', $transaction);
        }

        // Etape 4 : Le montant respecte le plafond ?
        if ($montant > $card->plafond) {
            $transaction = $this->save($card, $montant, $marchand, '51', 'refused');
            return $this->respond('51', 'refused', 'Plafond insuffisant', $transaction);
        }

        // Etape 5 : Tout OK, paiement accepte
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
    | respond — Formater la reponse JSON
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
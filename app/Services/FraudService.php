<?php

namespace App\Services;

use App\Models\Card;
use App\Models\Transaction;
use App\Models\Alert;

class FraudService
{
    /*
    |----------------------------------------------------------
    | analyze — Analyser une transaction pour détecter la fraude
    |----------------------------------------------------------
    | Règles métier :
    | 1. Montant > 5000 MAD → suspect
    | 2. Plus de 3 transactions en 1 heure → suspect
    | 3. Marchand dans la liste noire → suspect
    |----------------------------------------------------------
    */
    public function analyze(Card $card, float $montant, string $marchand): array
    {
        $reasons = [];

        // Règle 1 : Montant élevé
        if ($montant > 5000) {
            $reasons[] = 'Montant inhabituel : ' . $montant . ' MAD';
        }

        // Règle 2 : Trop de transactions en 1 heure
        $recentCount = Transaction::where('card_id', $card->id)
            ->where('created_at', '>=', now()->subHour())
            ->count();

        if ($recentCount >= 3) {
            $reasons[] = 'Fréquence élevée : ' . $recentCount . ' transactions en 1 heure';
        }

        // Règle 3 : Marchand dans la liste noire
        $blacklist = ['Unknown', 'Test Fraud', 'Suspicious Shop'];
        foreach ($blacklist as $banned) {
            if (stripos($marchand, $banned) !== false) {
                $reasons[] = 'Marchand suspect : ' . $marchand;
                break;
            }
        }

        // Résultat
        $isFraud = count($reasons) > 0;

        // Si fraude détectée → créer une alerte en BDD
        if ($isFraud) {
            Alert::create([
                'card_id' => $card->id,
                'type'    => 'fraud',
                'message' => implode(' | ', $reasons),
                'lue'     => false,
            ]);
        }

        return [
            'is_fraud' => $isFraud,
            'reasons'  => $reasons,
        ];
    }
}
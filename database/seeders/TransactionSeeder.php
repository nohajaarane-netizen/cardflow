<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;

class TransactionSeeder extends Seeder
{
    /*
    |----------------------------------------------------------
    | TransactionSeeder — Remplir la table transactions
    |----------------------------------------------------------
    | Ce fichier crée des transactions fictives pour tester.
    | On crée 5 transactions par carte (10 cartes × 5 = 50).
    | Les statuts varient : acceptée, refusée, suspecte.
    |----------------------------------------------------------
    */

    public function run(): void
    {
        $marchands = ['Jumia Maroc', 'Carrefour', 'Netflix', 'Marjane', 'Amazon'];

        // On boucle sur les 10 cartes (card_id 1 à 10)
        for ($cardId = 1; $cardId <= 10; $cardId++) {

            // 5 transactions par carte
            for ($i = 0; $i < 5; $i++) {

                // On choisit un scénario aléatoire
                $scenario = rand(1, 3);

                if ($scenario === 1) {
                    // ── Transaction acceptée ──
                    Transaction::create([
                        'card_id'      => $cardId,
                        'montant'      => rand(50, 500),
                        'marchand'     => $marchands[array_rand($marchands)],
                        'statut'       => 'accepted',
                        'code_reponse' => '00',        // 00 = accepté
                        'otp'          => rand(100000, 999999),
                        'otp_verifie'  => true,
                    ]);

                } elseif ($scenario === 2) {
                    // ── Transaction refusée (fonds insuffisants) ──
                    Transaction::create([
                        'card_id'      => $cardId,
                        'montant'      => rand(5000, 9000),
                        'marchand'     => $marchands[array_rand($marchands)],
                        'statut'       => 'refused',
                        'code_reponse' => '51',        // 51 = fonds insuffisants
                        'otp'          => null,
                        'otp_verifie'  => false,
                    ]);

                } else {
                    // ── Transaction suspecte (fraude) ──
                    Transaction::create([
                        'card_id'      => $cardId,
                        'montant'      => rand(8000, 15000),
                        'marchand'     => 'Unknown Vendor',
                        'statut'       => 'suspicious',
                        'code_reponse' => '59',        // 59 = fraude détectée
                        'otp'          => null,
                        'otp_verifie'  => false,
                    ]);
                }
            }
        }

        // Résultat : 50 transactions créées (5 par carte × 10 cartes)
    }
}
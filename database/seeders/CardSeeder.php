<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Card;
use Carbon\Carbon;

class CardSeeder extends Seeder
{
    /*
    |----------------------------------------------------------
    | CardSeeder — Remplir la table cards avec des fausses données
    |----------------------------------------------------------
    | Ce fichier crée des cartes bancaires fictives pour tester.
    | On crée 2 cartes par client : une Visa + une Mastercard.
    | Les user_id de 2 à 6 correspondent aux 5 clients créés.
    |----------------------------------------------------------
    */

    public function run(): void
    {
        // On boucle sur les 5 clients (user_id 2 à 6)
        // user_id 1 = admin, il n'a pas de carte
        for ($userId = 2; $userId <= 6; $userId++) {

            // ── Carte Visa ──
            Card::create([
                'user_id'    => $userId,
                'pan'        => '4532' . rand(100000000000, 999999999999), // numéro Visa commence par 4
                'cvv'        => bcrypt((string) rand(100, 999)),           // CVV hashé pour la sécurité
                'type'       => 'visa',
                'statut'     => 'active',
                'plafond'    => 5000,                                      // plafond 5000 MAD
                'expiration' => Carbon::now()->addYears(3),                // expire dans 3 ans
            ]);

            // ── Carte Mastercard ──
            Card::create([
                'user_id'    => $userId,
                'pan'        => '5412' . rand(100000000000, 999999999999), // numéro Mastercard commence par 5
                'cvv'        => bcrypt((string) rand(100, 999)),           // CVV hashé pour la sécurité
                'type'       => 'mastercard',
                'statut'     => 'active',
                'plafond'    => 3000,                                      // plafond 3000 MAD
                'expiration' => Carbon::now()->addYears(2),                // expire dans 2 ans
            ]);
        }

        // Résultat : 10 cartes créées (2 par client × 5 clients)
    }
}
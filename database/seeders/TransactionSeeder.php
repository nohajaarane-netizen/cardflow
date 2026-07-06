<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Card;
use App\Models\Transaction;
use App\Models\Alert;
use Carbon\Carbon;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $marchands = [
            'Marjane',        'Jumia Maroc',     'Carrefour Maroc',
            'Netflix',        'Amazon',           'INWI',
            'Maroc Telecom',  'ONEE',             'Shell Maroc',
            'Starbucks',      'McDonald\'s',      'Pizza Hut Maroc',
            'Fnac Maroc',     'Vinted',           'Booking.com',
            'Airbnb',         'Uber Maroc',       'InDrive',
            'Glovo Maroc',    'Noon',             'AliExpress',
            'PlayStation',    'Apple Store',      'Google Play',
            'Zara Maroc',     'H&M Maroc',        'Decathlon',
        ];;

        $cards = Card::all();

        foreach ($cards as $card) {
            // Nombre de transactions par carte : 8 à 20
            $nbTx = rand(8, 20);

            for ($i = 0; $i < $nbTx; $i++) {
                $marchand = $marchands[array_rand($marchands)];
                $montant  = rand(5, 450) * 10; // 50 → 4500 MAD

                // Déterminer le statut
                $rand = rand(1, 100);
                if ($card->statut === 'blocked') {
                    $statut       = 'refused';
                    $codeReponse  = '62';
                } elseif ($card->statut === 'expired') {
                    $statut       = 'refused';
                    $codeReponse  = '54';
                } elseif ($montant > $card->plafond) {
                    $statut       = 'refused';
                    $codeReponse  = '51';
                } elseif ($rand <= 70) {
                    $statut       = 'accepted';
                    $codeReponse  = '00';
                } elseif ($rand <= 85) {
                    $statut       = 'refused';
                    $codeReponse  = '05';
                } else {
                    // Transaction suspecte → code 59
                    $statut       = 'refused';
                    $codeReponse  = '59';
                }

                // Date étalée sur les 6 derniers mois
                $createdAt = Carbon::now()->subDays(rand(1, 180))->subHours(rand(0, 23));

                $tx = Transaction::create([
                    'card_id'      => $card->id,
                    'montant'      => $montant,
                    'marchand'     => $marchand,
                    'statut'       => $statut,
                    'code_reponse' => $codeReponse,
                    'otp'          => $statut === 'accepted' ? str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT) : null,
                    'otp_verifie'  => $statut === 'accepted',
                    'created_at'   => $createdAt,
                    'updated_at'   => $createdAt,
                ]);

                // Si code 59 → créer une alerte fraude
                if ($codeReponse === '59') {
                    Alert::create([
                        'card_id'    => $card->id,
                        'type'       => 'fraud',
                        'message'    => 'Transaction suspecte détectée chez ' . $marchand . ' pour ' . $montant . ' MAD',
                        'lue'        => rand(0, 1) === 1,
                        'created_at' => $createdAt,
                        'updated_at' => $createdAt,
                    ]);
                }
            }
        }
    }
}
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Card;
use App\Services\LuhnService;
use Carbon\Carbon;

class CardSeeder extends Seeder
{
    public function run(): void
    {
        // Récupérer tous les clients
        $clients = User::where('role', 'client')->get();

        // Types et plafonds possibles
        $types    = ['visa', 'mastercard'];
        $plafonds = [2000, 3000, 5000, 8000, 10000, 15000, 20000];

        foreach ($clients as $index => $client) {
            // Chaque client a 1, 2 ou 3 cartes
            $nbCartes = ($index % 3) + 1;

            for ($i = 0; $i < $nbCartes; $i++) {
                $type    = $types[($index + $i) % 2];
                $prefix  = $type === 'visa' ? '4532' : '5412';
                $plafond = $plafonds[($index + $i) % count($plafonds)];

                // Statut : 80% active, 15% blocked, 5% expired
                $rand = rand(1, 100);
                if ($rand <= 80)       $statut = 'active';
                elseif ($rand <= 95)   $statut = 'blocked';
                else                   $statut = 'expired';

                // Date de création étalée sur les 6 derniers mois
                $createdAt = Carbon::now()->subDays(rand(1, 180));

                // Expiration : +3 ans depuis la création
                $expiration = $createdAt->copy()->addYears(3);

                // Si statut expired → expiration dans le passé
                if ($statut === 'expired') {
                    $expiration = Carbon::now()->subDays(rand(10, 90));
                }

                Card::create([
                    'user_id'    => $client->id,
                    'pan'        => LuhnService::generate($prefix),
                    'cvv'        => str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT),
                    'type'       => $type,
                    'statut'     => $statut,
                    'plafond'    => $plafond,
                    'expiration' => $expiration,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);
            }
        }
    }
}
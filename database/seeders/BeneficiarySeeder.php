<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Beneficiary;

class BeneficiarySeeder extends Seeder
{
    public function run(): void
    {
        // Quelques bénéficiaires marocains réalistes (prénom, nom, banque)
        $samples = [
            ['prenom' => 'Youssef',  'nom' => 'Alaoui',    'banque' => 'Attijariwafa Bank'],
            ['prenom' => 'Salma',    'nom' => 'Bennani',   'banque' => 'Banque Populaire'],
            ['prenom' => 'Reda',     'nom' => 'El Fassi',  'banque' => 'BMCE Bank'],
            ['prenom' => 'Ghita',    'nom' => 'Sqalli',    'banque' => 'CIH Bank'],
            ['prenom' => 'Karim',    'nom' => 'Naciri',    'banque' => 'Société Générale Maroc'],
        ];

        $clients = User::where('role', 'client')->get();

        foreach ($clients as $index => $client) {
            // Chaque client reçoit 2 ou 3 bénéficiaires
            $count = ($index % 2) + 2;

            for ($i = 0; $i < $count; $i++) {
                $sample = $samples[($index + $i) % count($samples)];

                // RIB marocain fictif mais valide (24 chiffres), unique par client
                $rib = str_pad((string) (($client->id * 100) + $i), 24, '0', STR_PAD_LEFT);

                Beneficiary::updateOrCreate(
                    ['user_id' => $client->id, 'rib' => $rib],
                    [
                        'prenom' => $sample['prenom'],
                        'nom'    => $sample['nom'],
                        'banque' => $sample['banque'],
                    ]
                );
            }
        }
    }
}

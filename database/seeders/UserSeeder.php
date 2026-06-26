<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{  /*
    |----------------------------------------------------------
    | UserSeeder — Remplir la table users avec des fausses données
    |----------------------------------------------------------
    | Ce fichier crée des utilisateurs fictifs pour tester l'app.
    | On crée 1 admin + 5 clients.
    | Le mot de passe est hashé avec Hash::make() pour la sécurité.
    |----------------------------------------------------------
    */ 
    public function run(): void
    {
        // ── ADMIN ──
        // L'admin peut gérer tous les clients et toutes les cartes
        User::create([
            'name'     => 'Admin CardFlow',
            'email'    => 'admin@cardflow.com',
            'password' => Hash::make('password123'), // hashé, jamais en clair
        ]);

        // ── CLIENTS ──
        // Chaque client peut voir ses propres cartes et faire des paiements
        $clients = [
            ['name' => 'Noha Jaarane',  'email' => 'noha@cardflow.com'],
            ['name' => 'Yassine Alami', 'email' => 'yassine@cardflow.com'],
            ['name' => 'Fatima Zahra',  'email' => 'fatima@cardflow.com'],
            ['name' => 'Mohamed Amine', 'email' => 'amine@cardflow.com'],
            ['name' => 'Sara Benali',   'email' => 'sara@cardflow.com'],
        ];

        // On boucle sur la liste et on crée chaque client
        foreach ($clients as $client) {
            User::create([
                'name'     => $client['name'],
                'email'    => $client['email'],
                'password' => Hash::make('password123'),
            ]);
        }

    }
}
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{  
    public function run(): void
    {
        // ── ADMIN ──
        // role = admin → peut gérer tous les clients et toutes les cartes
        User::create([
            'name'     => 'Admin CardFlow',
            'email'    => 'admin@cardflow.com',
            'password' => Hash::make('password123'), // hashé, jamais en clair
            'role'     => 'admin'
        ]);

        // ── CLIENTS ──
        // role = client → peut voir ses cartes et faire des paiements
        $clients = [
            ['name' => 'Noha Jaarane',  'email' => 'noha@cardflow.com', 'role' => 'client'],
            ['name' => 'Yassine Alami', 'email' => 'yassine@cardflow.com', 'role' => 'client'],
            ['name' => 'Fatima Zahra',  'email' => 'fatima@cardflow.com', 'role' => 'client'],
            ['name' => 'Mohamed Amine', 'email' => 'amine@cardflow.com', 'role' => 'client'],
            ['name' => 'Sara Benali',   'email' => 'sara@cardflow.com', 'role' => 'client'],
        ];

        // On boucle sur la liste et on crée chaque client
        foreach ($clients as $client) {
            User::create([
                'name'     => $client['name'],
                'email'    => $client['email'],
                'password' => Hash::make('password123'),
                'role'     => $client['role']
            ]);
        }

    }
}
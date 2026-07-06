<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── 2 Admins ──
        $admins = [
            ['name' => 'Admin CardFlow',    'email' => 'admin@cardflow.com'],
            ['name' => 'Karim Bensouda',    'email' => 'karim.admin@cardflow.com'],
        ];

        foreach ($admins as $admin) {
            User::updateOrCreate(
                ['email' => $admin['email']],
                [
                    'name'     => $admin['name'],
                    'password' => Hash::make('password123'),
                    'role'     => 'admin',
                ]
            );
        }

        // ── 25 Clients marocains ──
        $clients = [
            ['name' => 'Noha Jaarane',       'email' => 'noha@cardflow.com'],
            ['name' => 'Yassine Alami',      'email' => 'yassine@cardflow.com'],
            ['name' => 'Fatima Zahra Idrissi','email' => 'fatima@cardflow.com'],
            ['name' => 'Mohamed Amine Tazi', 'email' => 'amine@cardflow.com'],
            ['name' => 'Sara Benali',        'email' => 'sara@cardflow.com'],
            ['name' => 'Hamza Chakir',       'email' => 'hamza@cardflow.com'],
            ['name' => 'Imane Bousfiha',     'email' => 'imane@cardflow.com'],
            ['name' => 'Rachid Ouali',       'email' => 'rachid@cardflow.com'],
            ['name' => 'Zineb Mansouri',     'email' => 'zineb@cardflow.com'],
            ['name' => 'Khalid Berrada',     'email' => 'khalid@cardflow.com'],
            ['name' => 'Samira Lahlou',      'email' => 'samira@cardflow.com'],
            ['name' => 'Omar Benkirane',     'email' => 'omar@cardflow.com'],
            ['name' => 'Nadia Filali',       'email' => 'nadia@cardflow.com'],
            ['name' => 'Anas El Amrani',     'email' => 'anas@cardflow.com'],
            ['name' => 'Houda Tahiri',       'email' => 'houda@cardflow.com'],
            ['name' => 'Mehdi Bouazzaoui',   'email' => 'mehdi@cardflow.com'],
            ['name' => 'Kenza Chraibi',      'email' => 'kenza@cardflow.com'],
            ['name' => 'Tariq Mountassir',   'email' => 'tariq@cardflow.com'],
            ['name' => 'Hajar Bennouna',     'email' => 'hajar@cardflow.com'],
            ['name' => 'Soufiane Kettani',   'email' => 'soufiane@cardflow.com'],
            ['name' => 'Rim Alaoui',         'email' => 'rim@cardflow.com'],
            ['name' => 'Bilal Cherkaoui',    'email' => 'bilal@cardflow.com'],
            ['name' => 'Meryem Tlemcani',    'email' => 'meryem@cardflow.com'],
            ['name' => 'Adil Benjelloun',    'email' => 'adil@cardflow.com'],
            ['name' => 'Loubna Saidi',       'email' => 'loubna@cardflow.com'],
        ];

        foreach ($clients as $client) {
            User::updateOrCreate(
                ['email' => $client['email']],
                [
                    'name'     => $client['name'],
                    'password' => Hash::make('password123'),
                    'role'     => 'client',
                ]
            );
        }
    }
}
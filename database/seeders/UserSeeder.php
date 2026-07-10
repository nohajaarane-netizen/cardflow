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
            ['name' => 'Admin CardFlow',    'email' => 'admin@cardflow.com',       'telephone' => '+212700663085'],
            ['name' => 'Karim Bensouda',    'email' => 'karim.admin@cardflow.com', 'telephone' => '+212700663085'],
        ];

        foreach ($admins as $admin) {
            User::updateOrCreate(
                ['email' => $admin['email']],
                [
                    'name'      => $admin['name'],
                    'password'  => Hash::make('password123'),
                    'role'      => 'admin',
                    'telephone' => $admin['telephone'],
                ]
            );
        }

        // ── 25 Clients marocains ──
        $clients = [
            ['name' => 'Noha Jaarane',       'email' => 'noha@cardflow.com',      'telephone' => '+212700663085'],
            ['name' => 'Yassine Alami',      'email' => 'yassine@cardflow.com',   'telephone' => '+212700663085'],
            ['name' => 'Fatima Zahra Idrissi','email' => 'fatima@cardflow.com',   'telephone' => '+212700663085'],
            ['name' => 'Mohamed Amine Tazi', 'email' => 'amine@cardflow.com',     'telephone' => '+212700663085'],
            ['name' => 'Sara Benali',        'email' => 'sara@cardflow.com',      'telephone' => '+212700663085'],
            ['name' => 'Hamza Chakir',       'email' => 'hamza@cardflow.com',     'telephone' => '+212700663085'],
            ['name' => 'Imane Bousfiha',     'email' => 'imane@cardflow.com',     'telephone' => '+212700663085'],
            ['name' => 'Rachid Ouali',       'email' => 'rachid@cardflow.com',    'telephone' => '+212700663085'],
            ['name' => 'Zineb Mansouri',     'email' => 'zineb@cardflow.com',     'telephone' => '+212700663085'],
            ['name' => 'Khalid Berrada',     'email' => 'khalid@cardflow.com',    'telephone' => '+212700663085'],
            ['name' => 'Samira Lahlou',      'email' => 'samira@cardflow.com',    'telephone' => '+212700663085'],
            ['name' => 'Omar Benkirane',     'email' => 'omar@cardflow.com',      'telephone' => '+212700663085'],
            ['name' => 'Nadia Filali',       'email' => 'nadia@cardflow.com',     'telephone' => '+212700663085'],
            ['name' => 'Anas El Amrani',     'email' => 'anas@cardflow.com',      'telephone' => '+212700663085'],
            ['name' => 'Houda Tahiri',       'email' => 'houda@cardflow.com',     'telephone' => '+212700663085'],
            ['name' => 'Mehdi Bouazzaoui',   'email' => 'mehdi@cardflow.com',     'telephone' => '+212700663085'],
            ['name' => 'Kenza Chraibi',      'email' => 'kenza@cardflow.com',     'telephone' => '+212700663085'],
            ['name' => 'Tariq Mountassir',   'email' => 'tariq@cardflow.com',     'telephone' => '+212700663085'],
            ['name' => 'Hajar Bennouna',     'email' => 'hajar@cardflow.com',     'telephone' => '+212700663085'],
            ['name' => 'Soufiane Kettani',   'email' => 'soufiane@cardflow.com',  'telephone' => '+212700663085'],
            ['name' => 'Rim Alaoui',         'email' => 'rim@cardflow.com',       'telephone' => '+212700663085'],
            ['name' => 'Bilal Cherkaoui',    'email' => 'bilal@cardflow.com',     'telephone' => '+212700663085'],
            ['name' => 'Meryem Tlemcani',    'email' => 'meryem@cardflow.com',    'telephone' => '+212700663085'],
            ['name' => 'Adil Benjelloun',    'email' => 'adil@cardflow.com',      'telephone' => '+212700663085'],
            ['name' => 'Loubna Saidi',       'email' => 'loubna@cardflow.com',    'telephone' => '+212700663085'],
        ];

        foreach ($clients as $client) {
            User::updateOrCreate(
                ['email' => $client['email']],
                [
                    'name'      => $client['name'],
                    'password'  => Hash::make('password123'),
                    'role'      => 'client',
                    'telephone' => $client['telephone'],
                ]
            );
        }
    }
}
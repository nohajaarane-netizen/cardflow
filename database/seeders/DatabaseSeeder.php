<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /*
    |----------------------------------------------------------
    | DatabaseSeeder — Chef d'orchestre des Seeders
    |----------------------------------------------------------
    | Ce fichier appelle les Seeders dans le bon ordre.
    | L'ordre est important :
    | 1. Users d'abord (les cartes ont besoin des users)
    | 2. Cards ensuite (les transactions ont besoin des cartes)
    | 3. Transactions en dernier
    |----------------------------------------------------------
    */

    public function run(): void
    {
        $this->call([
            UserSeeder::class,        // 1. Créer les utilisateurs
            CardSeeder::class,        // 2. Créer les cartes
            TransactionSeeder::class, // 3. Créer les transactions
        ]);
    }
}
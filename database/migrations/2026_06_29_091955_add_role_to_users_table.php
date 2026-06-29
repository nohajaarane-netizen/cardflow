<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Ajouter le champ role après le champ name
            // admin = peut tout gérer
            // client = peut voir ses cartes et payer
            $table->enum('role', ['admin', 'client'])->default('client')->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');

        });
    }
};

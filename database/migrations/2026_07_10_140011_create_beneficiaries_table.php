<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('beneficiaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // propriétaire — chaque client a ses propres bénéficiaires
            $table->string('prenom');
            $table->string('nom');
            $table->string('rib', 24); // RIB marocain — 24 chiffres
            $table->string('banque');
            $table->timestamps();

            // Un même client ne peut pas enregistrer deux fois le même RIB
            $table->unique(['user_id', 'rib']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beneficiaries');
    }
};

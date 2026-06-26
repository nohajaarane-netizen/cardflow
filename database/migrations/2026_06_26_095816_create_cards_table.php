<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cards', function (Blueprint $table) {
            $table->id();  // id auto (1, 2, 3...)
            $table->foreignId('user_id')->constrained()->onDelete('cascade');  // lien vers la table users
            $table->string('pan');  // numéro de carte
            $table->string('cvv'); // code CVV hashé
            $table->enum('type', ['visa', 'mastercard']); // type de carte
            $table->enum('statut', ['active', 'blocked', 'expired'])->default('active');  // statut de la carte
            $table->decimal('plafond', 10, 2)->default(5000); // plafond en MAD
            $table->date('expiration'); // date d'expiration
            $table->timestamps(); // created_at et updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cards'); // supprime la table si on annule
    }
};

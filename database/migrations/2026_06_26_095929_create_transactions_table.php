<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id(); // id auto
            $table->foreignId('card_id')->constrained()->onDelete('cascade'); // lien vers la table cards
            $table->decimal('montant', 10, 2); // montant du paiement en MAD
            $table->string('marchand'); // nom du marchand (ex: Jumia)
            $table->enum('statut', ['accepted', 'refused', 'suspicious']); // résultat du paiement
            $table->string('code_reponse', 10); // code bancaire (00, 51, 62...)
            $table->string('otp', 6)->nullable(); // code SMS 3DS (peut être vide)
            $table->boolean('otp_verifie')->default(false); // est-ce que le code SMS a été confirmé ?
            $table->timestamps();  // created_at et updated_at 

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions'); // supprime la table si on annule
    }
};

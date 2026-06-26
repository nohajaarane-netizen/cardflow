<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alerts', function (Blueprint $table) {
            $table->id(); // id auto
            $table->foreignId('card_id')->constrained()->onDelete('cascade'); // lien vers la table cards
            $table->foreignId('transaction_id')->nullable()->constrained()->onDelete('cascade'); // lien vers la transaction
            $table->enum('type', ['fraud', 'blocked', 'expiration']); // type d'alerte
            $table->string('message'); // message de l'alerte
            $table->boolean('lue')->default(false); // alerte lue ou pas
            $table->timestamps(); // created_at et updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAuditLogsTable extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('action');           // ex: login, logout, block_card, payment
            $table->string('model')->nullable(); // ex: Card, Transaction
            $table->unsignedBigInteger('model_id')->nullable(); // id de l'objet concerné
            $table->json('details')->nullable(); // infos supplémentaires
            $table->string('ip')->nullable();    // adresse IP
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
}
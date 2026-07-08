<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddSecurityTypeToAlertsTable extends Migration
{
    public function up(): void
    {
        Schema::table('alerts', function (Blueprint $table) {
            // Modifier l'enum pour accepter 'fraud' et 'security'
            $table->enum('type', ['fraud', 'security'])->change();
        });
    }

    public function down(): void
    {
        Schema::table('alerts', function (Blueprint $table) {
            $table->enum('type', ['fraud'])->change();
        });
    }
}
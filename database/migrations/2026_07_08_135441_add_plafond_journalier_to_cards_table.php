<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPlafondJournalierToCardsTable extends Migration
{
    public function up(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            // Plafond journalier — par défaut 1000 MAD par jour
            $table->decimal('plafond_journalier', 10, 2)->default(1000)->after('plafond');
        });
    }

    public function down(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            $table->dropColumn('plafond_journalier');
        });
    }
}
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Card;
use App\Models\Alert;
use App\Services\AuditService;
use Carbon\Carbon;

class ExpireCards extends Command
{
    protected $signature = 'cards:expire';

    protected $description = "Expire automatiquement les cartes dont la date d'expiration est dépassée";

    public function handle(): int
    {
        $cards = Card::where('expiration', '<', now())
            ->where('statut', '!=', 'expired')
            ->get();

        foreach ($cards as $card) {
            $card->statut = 'expired';
            $card->save();

            Alert::create([
                'card_id' => $card->id,
                'type'    => 'security',
                'message' => 'Carte expirée automatiquement le ' . Carbon::now()->format('d/m/Y'),
                'lue'     => false,
            ]);

            AuditService::log(null, 'card_expired', 'Card', $card->id);
        }

        $count = $cards->count();
        $this->info("{$count} carte(s) expirée(s)");

        return self::SUCCESS;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alert extends Model
{
    // Champs qu'on peut remplir
    protected $fillable = [
        'card_id', 'transaction_id',
        'type', 'message', 'lue'
    ];

    // Une alerte appartient à une carte
    public function card()
    {
        return $this->belongsTo(Card::class);
    }

    // Une alerte appartient à une transaction
    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
    
}

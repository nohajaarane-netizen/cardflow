<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    // Champs qu'on peut remplir
    protected $fillable = [
        'card_id', 'beneficiary_id', 'montant', 'marchand',
        'statut', 'code_reponse', 'otp', 'otp_verifie'
    ];

    // Une transaction appartient à une carte
    public function card()
    {
        return $this->belongsTo(Card::class);
    }

    // Une transaction peut cibler un bénéficiaire (virement)
    public function beneficiary()
    {
        return $this->belongsTo(Beneficiary::class);
    }

    // Une transaction peut avoir une alerte
    public function alert()
    {
        return $this->hasOne(Alert::class);
    }
}

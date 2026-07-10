<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Beneficiary extends Model
{
    // Table (pluriel irrégulier — on le précise pour éviter "beneficiarys")
    protected $table = 'beneficiaries';

    // Champs qu'on peut remplir
    protected $fillable = [
        'user_id', 'prenom', 'nom', 'rib', 'banque',
    ];

    // Un bénéficiaire appartient à un client
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Nom complet du bénéficiaire (prénom + nom)
    public function getNomCompletAttribute(): string
    {
        return trim($this->prenom . ' ' . $this->nom);
    }
}

<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    // Champs qu'on peut remplir

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',       // admin ou client
        'telephone',

    ];

     // Champs cachés (jamais affichés dans les réponses)
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Une carte appartient à un utilisateur
    public function cards()
    {
        return $this->hasMany(Card::class);
    }

    // Un client possède ses propres bénéficiaires
    public function beneficiaries()
    {
        return $this->hasMany(Beneficiary::class);
    }
}
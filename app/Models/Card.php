<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    // Champs qu'on peut remplir
    protected $fillable = [
        'user_id', 'pan', 'cvv', 'type',
        'statut', 'plafond', 'expiration'
    ];
    
    // Une carte appartient à un utilisateur
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Une carte a plusieurs transactions
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    // Une carte a plusieurs alertes
    public function alerts()
    {
        return $this->hasMany(Alert::class);
    }

}

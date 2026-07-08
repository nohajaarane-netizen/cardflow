<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'model',
        'model_id',
        'details',
        'ip',
    ];

    protected $casts = [
        'details' => 'array', // JSON → tableau PHP automatiquement
    ];

    // Un log appartient à un utilisateur
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
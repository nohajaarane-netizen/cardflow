<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditService
{
    /*
    |----------------------------------------------------------
    | log — Enregistrer une action en BDD
    |----------------------------------------------------------
    | $userId  → qui a fait l'action
    | $action  → ce qu'il a fait (login, block_card...)
    | $model   → sur quel objet (Card, Transaction...)
    | $modelId → l'id de l'objet
    | $details → infos supplémentaires (tableau)
    | $ip      → adresse IP de l'utilisateur
    |----------------------------------------------------------
    */
    public static function log(
        ?int    $userId,
        string  $action,
        ?string $model   = null,
        ?int    $modelId = null,
        array   $details = [],
        ?string $ip      = null
    ): void {
        AuditLog::create([
            'user_id'  => $userId,
            'action'   => $action,
            'model'    => $model,
            'model_id' => $modelId,
            'details'  => $details,
            'ip'       => $ip,
        ]);
    }

    /*
    |----------------------------------------------------------
    | logRequest — Log depuis une requête HTTP
    |----------------------------------------------------------
    | Récupère automatiquement l'IP depuis la requête
    |----------------------------------------------------------
    */
    public static function logRequest(
        Request $request,
        string  $action,
        ?string $model   = null,
        ?int    $modelId = null,
        array   $details = []
    ): void {
        $userId = $request->user()?->id;
        $ip     = $request->ip();

        self::log($userId, $action, $model, $modelId, $details, $ip);
    }
}
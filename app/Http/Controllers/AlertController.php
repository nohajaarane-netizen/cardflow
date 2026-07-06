<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Alert;

class AlertController extends Controller
{
    /*
    |----------------------------------------------------------
    | index — Liste toutes les alertes (Admin seulement)
    |----------------------------------------------------------
    | GET /api/alerts
    |----------------------------------------------------------
    */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $alerts = Alert::with('card.user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($alert) {
                return [
                    'id'         => $alert->id,
                    'type'       => $alert->type,
                    'message'    => $alert->message,
                    'lue'        => $alert->lue,
                    'created_at' => $alert->created_at,
                    'card'       => [
                        'id'   => $alert->card->id,
                        'pan'  => substr($alert->card->pan, 0, 4) . ' **** **** ' . substr($alert->card->pan, -4),
                        'type' => $alert->card->type,
                    ],
                    'client' => [
                        'id'    => $alert->card->user->id,
                        'name'  => $alert->card->user->name,
                        'email' => $alert->card->user->email,
                    ],
                ];
            });

        return response()->json($alerts);
    }

    /*
    |----------------------------------------------------------
    | markAsRead — Marquer une alerte comme lue
    |----------------------------------------------------------
    | PATCH /api/alerts/{id}/read
    |----------------------------------------------------------
    */
    public function markAsRead(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $alert = Alert::findOrFail($id);
        $alert->update(['lue' => true]);

        return response()->json(['message' => 'Alerte marquée comme lue']);
    }
}
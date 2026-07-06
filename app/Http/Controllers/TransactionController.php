<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;

class TransactionController extends Controller
{
    /*
    |----------------------------------------------------------
    | index — Historique de toutes les transactions
    |----------------------------------------------------------
    | GET /api/transactions
    | Admin → toutes les transactions
    | Client → seulement ses transactions
    |----------------------------------------------------------
    */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            // Admin voit tout avec les infos de la carte et du client
            $transactions = Transaction::with(['card.user'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($tx) {
                    return [
                        'id'           => $tx->id,
                        'montant'      => $tx->montant,
                        'marchand'     => $tx->marchand,
                        'statut'       => $tx->statut,
                        'code_reponse' => $tx->code_reponse,
                        'created_at'   => $tx->created_at,
                        'card' => [
                            'id'   => $tx->card->id,
                            'pan'  => substr($tx->card->pan, 0, 4) . ' **** **** ' . substr($tx->card->pan, -4),
                            'type' => $tx->card->type,
                        ],
                        'client' => [
                            'id'    => $tx->card->user->id,
                            'name'  => $tx->card->user->name,
                            'email' => $tx->card->user->email,
                        ],
                    ];
                });
        } else {
            // Client voit seulement ses transactions
            $transactions = Transaction::whereHas('card', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->with('card')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($tx) {
                    return [
                        'id'           => $tx->id,
                        'montant'      => $tx->montant,
                        'marchand'     => $tx->marchand,
                        'statut'       => $tx->statut,
                        'code_reponse' => $tx->code_reponse,
                        'created_at'   => $tx->created_at,
                        'card' => [
                            'id'   => $tx->card->id,
                            'pan'  => substr($tx->card->pan, 0, 4) . ' **** **** ' . substr($tx->card->pan, -4),
                            'type' => $tx->card->type,
                        ],
                    ];
                });
        }

        return response()->json($transactions);
    }
}
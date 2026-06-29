<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Card;
use App\Models\User;
use Carbon\Carbon;

class CardController extends Controller
{
    /*
    |----------------------------------------------------------
    | index — Voir toutes les cartes
    |----------------------------------------------------------
    | Admin → voit toutes les cartes de tous les clients
    | Client → voit seulement ses propres cartes
    |----------------------------------------------------------
    */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            // Admin voit tout
            $cards = Card::with('user')->get();
        } else {
            // Client voit seulement ses cartes
            $cards = Card::where('user_id', $user->id)->get();
        }

        return response()->json($cards);
    }

    /*
    |----------------------------------------------------------
    | store — Créer une nouvelle carte (Admin seulement)
    |----------------------------------------------------------
    */
    public function store(Request $request)
    {
        // Valider les données
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'type'    => 'required|in:visa,mastercard',
            'plafond' => 'required|numeric|min:100',
        ]);

        // Générer le numéro de carte selon le type
        $prefix = $request->type === 'visa' ? '4532' : '5412';
        $pan    = $prefix . rand(100000000000, 999999999999);

        // Créer la carte
        $card = Card::create([
            'user_id'    => $request->user_id,
            'pan'        => $pan,
            'cvv'        => bcrypt((string) rand(100, 999)),
            'type'       => $request->type,
            'statut'     => 'active',
            'plafond'    => $request->plafond,
            'expiration' => Carbon::now()->addYears(3),
        ]);

        return response()->json([
            'message' => 'Carte créée avec succès',
            'card'    => $card,
        ], 201);
    }

    /*
    |----------------------------------------------------------
    | show — Voir une carte spécifique
    |----------------------------------------------------------
    */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $card = Card::findOrFail($id);

        // Un client ne peut voir que ses propres cartes
        if ($user->role === 'client' && $card->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        return response()->json($card);
    }

    /*
    |----------------------------------------------------------
    | block — Bloquer une carte (Admin seulement)
    |----------------------------------------------------------
    */
    public function block($id)
    {
        $card = Card::findOrFail($id);
        $card->update(['statut' => 'blocked']);

        return response()->json(['message' => 'Carte bloquée']);
    }

    /*
    |----------------------------------------------------------
    | unblock — Débloquer une carte (Admin seulement)
    |----------------------------------------------------------
    */
    public function unblock($id)
    {
        $card = Card::findOrFail($id);
        $card->update(['statut' => 'active']);

        return response()->json(['message' => 'Carte débloquée']);
    }
}
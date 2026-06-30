<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Card;
use App\Models\User;
use Carbon\Carbon;
use App\Http\Resources\CardResource;


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
             $cards = Card::with('user')->get();
              } else {
               $cards = Card::where('user_id', $user->id)->get();
                }
            return CardResource::collection($cards);
    }
    /*
    |----------------------------------------------------------
    | store — Créer une nouvelle carte (Admin seulement)
    |----------------------------------------------------------
    */
   public function store(Request $request)
    {
        // Validation avec messages personnalisés
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'type'    => 'required|in:visa,mastercard',
            'plafond' => 'required|numeric|min:100|max:50000',
        ], [
            'user_id.required' => 'Le client est obligatoire',
            'user_id.exists'   => 'Ce client n\'existe pas',
            'type.required'    => 'Le type de carte est obligatoire',
            'type.in'          => 'Le type doit être visa ou mastercard',
            'plafond.required' => 'Le plafond est obligatoire',
            'plafond.numeric'  => 'Le plafond doit être un nombre',
            'plafond.min'      => 'Le plafond minimum est 100 MAD',
            'plafond.max'      => 'Le plafond maximum est 50 000 MAD',
        ]);

        // Vérifier que le user n'est pas un admin
        $targetUser = User::findOrFail($request->user_id);
        if ($targetUser->role === 'admin') {
            return response()->json([
                'message' => 'Impossible de créer une carte pour un admin'
            ], 422);
        }

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
            'card'    => new CardResource($card),
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

        if ($user->role === 'client' && $card->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        return new CardResource($card);
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
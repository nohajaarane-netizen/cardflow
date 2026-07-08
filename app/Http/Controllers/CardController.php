<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Card;
use App\Http\Resources\CardResource;
use App\Services\LuhnService;
use App\Services\AuditService;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class CardController extends Controller
{
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

    public function store(Request $request)
    {
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
            'plafond.min'      => 'Le plafond minimum est 100 MAD',
            'plafond.max'      => 'Le plafond maximum est 50 000 MAD',
        ]);

        $prefix = $request->type === 'visa' ? '4532' : '5412';
        $pan    = LuhnService::generate($prefix);

        $card = Card::create([
            'user_id'    => $request->user_id,
            'pan'        => $pan,
            'cvv'        => str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT),
            'type'       => $request->type,
            'statut'     => 'active',
            'plafond'    => $request->plafond,
            'expiration' => Carbon::now()->addYears(3),
        ]);

        AuditService::logRequest($request, 'create_card', 'Card', $card->id, [
            'type'    => $card->type,
            'plafond' => $card->plafond,
            'user_id' => $card->user_id,
        ]);

        return response()->json([
            'message' => 'Carte créée avec succès',
            'card'    => new CardResource($card),
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $card = Card::findOrFail($id);

        if ($user->role !== 'admin' && $card->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        return new CardResource($card);
    }

    public function block(Request $request, $id)
    {
        $card = Card::findOrFail($id);
        $card->update(['statut' => 'blocked']);

        AuditService::logRequest($request, 'block_card', 'Card', $card->id, [
            'user_id' => $card->user_id,
        ]);

        return response()->json(['message' => 'Carte bloquée avec succès']);
    }

    public function unblock(Request $request, $id)
    {
        $card = Card::findOrFail($id);
        $card->update(['statut' => 'active']);

        AuditService::logRequest($request, 'unblock_card', 'Card', $card->id, [
            'user_id' => $card->user_id,
        ]);

        return response()->json(['message' => 'Carte débloquée avec succès']);
    }
}
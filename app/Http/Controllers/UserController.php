<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    /*
    |----------------------------------------------------------
    | index — Liste des clients (Admin seulement)
    |----------------------------------------------------------
    | Renvoie tous les utilisateurs avec leur nombre de cartes
    |----------------------------------------------------------
    */
    public function index(Request $request)
    {
        $user = $request->user();

        // Seul l'admin peut voir la liste des clients
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        // On récupère seulement les clients (pas les admins)
        $clients = User::where('role', 'client')
            ->withCount('cards')
            ->get(['id', 'name', 'email', 'role']);

        return response()->json($clients);
    }
}
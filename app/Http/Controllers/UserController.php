<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    /*
    |----------------------------------------------------------
    | index — Liste des clients seulement (Admin)
    |----------------------------------------------------------
    */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $clients = User::where('role', 'client')
            ->withCount('cards')
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        return response()->json($clients);
    }

    /*
    |----------------------------------------------------------
    | all — Liste tous les users admin + clients (Admin)
    |----------------------------------------------------------
    | GET /api/users/all
    |----------------------------------------------------------
    */
    public function all(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $users = User::withCount('cards')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        return response()->json($users);
    }
}
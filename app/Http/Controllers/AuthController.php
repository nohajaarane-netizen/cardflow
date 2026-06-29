<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /*
    Register — Créer un nouveau compte
    Reçoit : name, email, password, role
    Retourne : les infos de l'utilisateur + son token
    */
    public function register(Request $request)
    {
        // Valider les données reçues
        $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role'     => 'in:admin,client',
        ]);

        // Créer l'utilisateur
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role ?? 'client', // client par défaut
        ]);

        // Créer le token de connexion
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Compte créé avec succès',
            'user'    => $user,
            'token'   => $token,
        ], 201);
    }

    /*
    Login — Se connecter
    Reçoit : email, password
    Retourne : les infos de l'utilisateur + son token
   
    */
    public function login(Request $request)
    {
        // Valider les données reçues
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        // Vérifier si l'utilisateur existe
        $user = User::where('email', $request->email)->first();

        // Vérifier le mot de passe
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect',
            ], 401);
        }

        // Créer le token de connexion
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'user'    => $user,
            'token'   => $token,
            'role'    => $user->role, // admin ou client
        ], 200);
    }

    /*
    Logout — Se déconnecter
    Supprime le token de l'utilisateur connecté
    */

    public function logout(Request $request)
    {
        // Supprimer le token actuel
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie',
        ], 200);
    }

    /*
    Me — Voir mon profil
    Retourne les infos de l'utilisateur connecté
    */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
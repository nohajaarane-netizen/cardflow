<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    /*
    |----------------------------------------------------------
    | register — Créer un nouveau compte
    |----------------------------------------------------------
    | POST /api/register
    | Body : { name, email, password }
    | Le rôle est forcé à "client" côté serveur
    |----------------------------------------------------------
    */
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'client', // forcé côté serveur
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Compte créé avec succès',
            'user'    => $user,
            'token'   => $token,
            'role'    => $user->role,
        ], 201);
    }

    /*
    |----------------------------------------------------------
    | login — Se connecter
    |----------------------------------------------------------
    | POST /api/login
    | Body : { email, password }
    |----------------------------------------------------------
    */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'user'    => $user,
            'token'   => $token,
            'role'    => $user->role,
        ]);
    }

    /*
    |----------------------------------------------------------
    | logout — Se déconnecter
    |----------------------------------------------------------
    | POST /api/logout
    | Supprime le token actuel
    |----------------------------------------------------------
    */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie',
        ]);
    }

    /*
    |----------------------------------------------------------
    | me — Voir son propre profil
    |----------------------------------------------------------
    | GET /api/me
    |----------------------------------------------------------
    */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /*
    |----------------------------------------------------------
    | updateProfile — Modifier son propre profil
    |----------------------------------------------------------
    | PATCH /api/me
    | Body : { name?, email? }
    |----------------------------------------------------------
    */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'  => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
        ], [
            'name.string'  => 'Le nom doit être une chaîne de caractères',
            'email.email'  => 'L\'adresse email n\'est pas valide',
            'email.unique' => 'Cet email est déjà utilisé',
        ]);

        if ($request->has('name'))  $user->name  = $request->name;
        if ($request->has('email')) $user->email = $request->email;

        $user->save();

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'user'    => $user,
        ]);
    }
}
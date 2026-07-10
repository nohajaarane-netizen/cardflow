<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Services\AuditService;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email',
            'password'  => 'required|string|min:6',
            'telephone' => ['required', 'string', 'regex:/^\+212[5-7][0-9]{8}$/'],
        ], [
            'telephone.regex' => 'Le numéro de téléphone doit être un numéro marocain valide au format +212XXXXXXXXX.',
        ]);

        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'role'      => 'client',
            'telephone' => $request->telephone,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        AuditService::logRequest($request, 'register', 'User', $user->id, [
            'email' => $user->email,
        ]);

        return response()->json([
            'message' => 'Compte créé avec succès',
            'user'    => $user,
            'token'   => $token,
            'role'    => $user->role,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            // Log tentative échouée
            AuditService::log(null, 'login_failed', 'User', null, [
                'email' => $request->email,
            ], $request->ip());

            return response()->json([
                'message' => 'Email ou mot de passe incorrect',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Log connexion réussie
        AuditService::log($user->id, 'login', 'User', $user->id, [
            'email' => $user->email,
            'role'  => $user->role,
        ], $request->ip());

        return response()->json([
            'message' => 'Connexion réussie',
            'user'    => $user,
            'token'   => $token,
            'role'    => $user->role,
        ]);
    }

    public function logout(Request $request)
    {
        // Log déconnexion
        AuditService::log(
            $request->user()->id,
            'logout',
            'User',
            $request->user()->id,
            [],
            $request->ip()
        );

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'      => 'sometimes|string|max:255',
            'email'     => 'sometimes|email|unique:users,email,' . $user->id,
            'telephone' => ['sometimes', 'string', 'regex:/^\+212[5-7][0-9]{8}$/'],
        ], [
            'telephone.regex' => 'Le numéro de téléphone doit être un numéro marocain valide au format +212XXXXXXXXX.',
        ]);

        if ($request->has('name'))      $user->name      = $request->name;
        if ($request->has('email'))     $user->email     = $request->email;
        if ($request->has('telephone')) $user->telephone = $request->telephone;

        $user->save();

        AuditService::logRequest($request, 'update_profile', 'User', $user->id, [
            'name'      => $user->name,
            'email'     => $user->email,
            'telephone' => $user->telephone,
        ]);

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'user'    => $user,
        ]);
    }
}
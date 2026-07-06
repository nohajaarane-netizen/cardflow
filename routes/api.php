<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AlertController;


/*
|----------------------------------------------------------
| Routes publiques — sans token
|----------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']); // créer un compte
Route::post('/login',    [AuthController::class, 'login']);    // se connecter

/*
|----------------------------------------------------------
| Routes protégées — token obligatoire
|----------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']); // se déconnecter
    Route::get('/me',      [AuthController::class, 'me']);     // voir mon profil

    // Cartes
    Route::get('/cards',                [CardController::class, 'index']);   // voir toutes les cartes
    Route::post('/cards',               [CardController::class, 'store']);   // créer une carte
    Route::get('/cards/{id}',           [CardController::class, 'show']);    // voir une carte
    Route::patch('/cards/{id}/block',   [CardController::class, 'block']);   // bloquer
    Route::patch('/cards/{id}/unblock', [CardController::class, 'unblock']); // débloquer
    // Paiement
    Route::post('/payment', [PaymentController::class, 'pay']); // simuler un paiement
    Route::post('/payment/initiate', [PaymentController::class, 'initiate']); // étape 1 — générer OTP
    Route::post('/payment/confirm',  [PaymentController::class, 'confirm']);  // étape 2 — vérifier OTP

    // Utilisateurs
    Route::get('/users', [UserController::class, 'index']); // voir la liste des clients

    // Alertes
    Route::get('/alerts',              [AlertController::class, 'index']);       // liste alertes
    Route::patch('/alerts/{id}/read',  [AlertController::class, 'markAsRead']); // marquer lue

});
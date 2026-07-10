<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\BeneficiaryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\AuditLogController;

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
    Route::patch('/me',    [AuthController::class, 'updateProfile']); // modifier mon profil

    // Cartes
    Route::get('/cards',                [CardController::class, 'index']);   // voir toutes les cartes
    Route::post('/cards',               [CardController::class, 'store']);   // créer une carte
    Route::get('/cards/{id}',           [CardController::class, 'show']);    // voir une carte
    Route::patch('/cards/{id}/block',   [CardController::class, 'block']);   // bloquer
    Route::patch('/cards/{id}/unblock', [CardController::class, 'unblock']); // débloquer
    // Bénéficiaires (propres à chaque client)
    Route::get('/beneficiaries',         [BeneficiaryController::class, 'index']);   // mes bénéficiaires
    Route::post('/beneficiaries',        [BeneficiaryController::class, 'store']);   // ajouter un bénéficiaire
    Route::delete('/beneficiaries/{id}', [BeneficiaryController::class, 'destroy']); // supprimer

    // Paiement
    Route::post('/payment', [PaymentController::class, 'pay']); // simuler un paiement
    Route::post('/payment/initiate', [PaymentController::class, 'initiate']); // étape 1 — générer OTP
    Route::post('/payment/confirm',  [PaymentController::class, 'confirm']);  // étape 2 — vérifier OTP

    // Utilisateurs
    Route::get('/users',     [UserController::class, 'index']); // voir la liste des clients
    Route::get('/users/all', [UserController::class, 'all']);   // voir tous les utilisateurs (admin + clients)

    // Alertes
    Route::get('/alerts',              [AlertController::class, 'index']);       // liste alertes
    Route::patch('/alerts/{id}/read',  [AlertController::class, 'markAsRead']); // marquer lue

    // Profil — modifier
    Route::patch('/me', [AuthController::class, 'updateProfile']);

    // Transactions
    Route::get('/transactions', [TransactionController::class, 'index']); // liste des transactions
    Route::get('/audit-logs', [AuditLogController::class, 'index']);

}); 
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;



/*
|----------------------------------------------------------
| Routes publiques — accessibles sans token
|----------------------------------------------------------
*/ 

Route::post('/register', [AuthController::class, 'register']); // créer un compte
Route::post('/login',    [AuthController::class, 'login']);    // se connecter


/*
|----------------------------------------------------------
| Routes protégées — token obligatoire
|----------------------------------------------------------
| Pour accéder à ces routes, il faut envoyer le token
| dans le header : Authorization: Bearer TON_TOKEN
|----------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']); // se déconnecter
    Route::get('/me',      [AuthController::class, 'me']);     // voir mon profil
});

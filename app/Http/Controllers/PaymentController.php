<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\PaymentService;

class PaymentController extends Controller
{
    /*
    |----------------------------------------------------------
    | PaymentController — Gérer les paiements
    |----------------------------------------------------------
    | Reçoit la requête → appelle PaymentService → renvoie résultat
    |----------------------------------------------------------
    */

    private PaymentService $paymentService;

    // On injecte PaymentService dans le controller
    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /*
    |----------------------------------------------------------
    | pay — Traiter un paiement
    |----------------------------------------------------------
    | POST /api/payment
    | Body : { card_id, montant, marchand }
    |----------------------------------------------------------
    */
    public function pay(Request $request)
    {
        // Valider les données reçues
        $request->validate([
            'card_id' => 'required|exists:cards,id',
            'montant' => 'required|numeric|min:1',
            'marchand'=> 'required|string',
        ], [
            'card_id.required' => 'La carte est obligatoire',
            'card_id.exists'   => 'Cette carte n\'existe pas',
            'montant.required' => 'Le montant est obligatoire',
            'montant.min'      => 'Le montant minimum est 1 MAD',
            'marchand.required'=> 'Le marchand est obligatoire',
        ]);

        // Appeler le service de paiement
        $result = $this->paymentService->process(
            $request->card_id,
            $request->montant,
            $request->marchand
        );

        // Retourner le résultat avec le bon status HTTP
        $httpStatus = $result['statut'] === 'accepted' ? 200 : 422;

        return response()->json($result, $httpStatus);
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\PaymentService;

class PaymentController extends Controller
{
    private PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /*
    |----------------------------------------------------------
    | pay — Paiement direct sans 3DS
    |----------------------------------------------------------
    */
    public function pay(Request $request)
    {
        $request->validate([
            'card_id' => 'required|exists:cards,id',
            'montant' => 'required|numeric|min:1',
            'marchand'=> 'required|string',
        ]);

        $result = $this->paymentService->process(
            $request->card_id,
            $request->montant,
            $request->marchand
        );

        $httpStatus = $result['statut'] === 'accepted' ? 200 : 422;
        return response()->json($result, $httpStatus);
    }

    /*
    |----------------------------------------------------------
    | initiate — Étape 1 du 3DS : vérifier + générer OTP
    |----------------------------------------------------------
    | POST /api/payment/initiate
    | Body : { card_id, montant, marchand }
    |----------------------------------------------------------
    */
    public function initiate(Request $request)
    {
        $request->validate([
            'card_id' => 'required|exists:cards,id',
            'montant' => 'required|numeric|min:1',
            'marchand'=> 'required|string',
        ]);

        $result = $this->paymentService->initiate(
            $request->card_id,
            $request->montant,
            $request->marchand
        );

        $httpStatus = $result['success'] ? 200 : 422;
        return response()->json($result, $httpStatus);
    }

    /*
    |----------------------------------------------------------
    | confirm — Étape 2 du 3DS : vérifier OTP
    |----------------------------------------------------------
    | POST /api/payment/confirm
    | Body : { cache_key, otp }
    |----------------------------------------------------------
    */
    public function confirm(Request $request)
    {
        $request->validate([
            'cache_key' => 'required|string',
            'otp'       => 'required|string|size:6',
        ]);

        $result = $this->paymentService->confirm(
            $request->cache_key,
            $request->otp
        );

        $httpStatus = $result['statut'] === 'accepted' ? 200 : 422;
        return response()->json($result, $httpStatus);
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\PaymentService;
use App\Services\AuditService;

class PaymentController extends Controller
{
    private PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

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

        AuditService::logRequest($request, 'payment_direct', 'Transaction', null, [
            'card_id'  => $request->card_id,
            'montant'  => $request->montant,
            'marchand' => $request->marchand,
            'code'     => $result['code_reponse'],
        ]);

        $httpStatus = $result['statut'] === 'accepted' ? 200 : 422;
        return response()->json($result, $httpStatus);
    }

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

        AuditService::logRequest($request, 'payment_initiate', 'Card', $request->card_id, [
            'montant'  => $request->montant,
            'marchand' => $request->marchand,
            'success'  => $result['success'],
        ]);

        $httpStatus = $result['success'] ? 200 : 422;
        return response()->json($result, $httpStatus);
    }

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

        AuditService::logRequest($request, 'payment_confirm', 'Transaction', null, [
            'cache_key' => $request->cache_key,
            'code'      => $result['code_reponse'],
            'statut'    => $result['statut'],
        ]);

        $httpStatus = $result['statut'] === 'accepted' ? 200 : 422;
        return response()->json($result, $httpStatus);
    }
}
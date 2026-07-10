<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\PaymentService;
use App\Services\AuditService;
use App\Models\Card;
use App\Models\Beneficiary;

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
        // On nettoie le RIB (espaces éventuels) avant validation
        if ($request->filled('rib')) {
            $request->merge(['rib' => preg_replace('/\s+/', '', (string) $request->rib)]);
        }

        $request->validate([
            'card_id'        => 'required|exists:cards,id',
            'montant'        => 'required|numeric|min:1',
            // Virement vers un bénéficiaire : soit un existant, soit un nouveau (RIB + nom)
            'beneficiary_id' => 'nullable|exists:beneficiaries,id',
            'prenom'         => 'required_without:beneficiary_id|string|max:255',
            'nom'            => 'required_without:beneficiary_id|string|max:255',
            'rib'            => ['required_without:beneficiary_id', 'nullable', 'regex:/^\d{24}$/'],
            'banque'         => 'required_without:beneficiary_id|string|max:255',
        ], [
            'rib.regex' => 'Le RIB doit être un RIB marocain valide (24 chiffres).',
        ]);

        $user = $request->user();

        // Sécurité : la carte doit appartenir au client connecté
        $card = Card::find($request->card_id);
        if (!$card || ($user->role !== 'admin' && $card->user_id !== $user->id)) {
            return response()->json(['message' => 'Accès refusé à cette carte', 'success' => false], 403);
        }

        // Résoudre le bénéficiaire (existant ou nouveau) → détermine le libellé du virement
        if ($request->filled('beneficiary_id')) {
            $benef = Beneficiary::where('user_id', $user->id)->findOrFail($request->beneficiary_id);
            $beneficiary = ['id' => $benef->id];
            $marchand    = $benef->nom_complet;
        } else {
            $beneficiary = [
                'id'     => null,
                'prenom' => $request->prenom,
                'nom'    => $request->nom,
                'rib'    => $request->rib,
                'banque' => $request->banque,
            ];
            $marchand = trim($request->prenom . ' ' . $request->nom);
        }

        $result = $this->paymentService->initiate(
            $request->card_id,
            $request->montant,
            $marchand,
            $beneficiary
        );

        AuditService::logRequest($request, 'payment_initiate', 'Card', $request->card_id, [
            'montant'  => $request->montant,
            'marchand' => $marchand,
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
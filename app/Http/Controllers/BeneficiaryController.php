<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Models\Beneficiary;
use App\Services\AuditService;

class BeneficiaryController extends Controller
{
    /*
    |----------------------------------------------------------
    | index — Lister les bénéficiaires du client connecté
    |----------------------------------------------------------
    | Chaque client ne voit QUE ses propres bénéficiaires.
    |----------------------------------------------------------
    */
    public function index(Request $request)
    {
        $beneficiaries = Beneficiary::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($beneficiaries);
    }

    /*
    |----------------------------------------------------------
    | store — Enregistrer un nouveau bénéficiaire
    |----------------------------------------------------------
    | RIB marocain = 24 chiffres. On retire les espaces avant validation.
    |----------------------------------------------------------
    */
    public function store(Request $request)
    {
        // On nettoie le RIB (l'utilisateur peut saisir des espaces)
        $request->merge(['rib' => preg_replace('/\s+/', '', (string) $request->rib)]);

        $validated = $request->validate([
            'prenom' => 'required|string|max:255',
            'nom'    => 'required|string|max:255',
            'rib'    => [
                'required', 'regex:/^\d{24}$/',
                Rule::unique('beneficiaries')->where(fn ($q) => $q->where('user_id', $request->user()->id)),
            ],
            'banque' => 'required|string|max:255',
        ], [
            'rib.regex'  => 'Le RIB doit être un RIB marocain valide (24 chiffres).',
            'rib.unique' => 'Ce bénéficiaire (même RIB) est déjà enregistré.',
        ]);

        $beneficiary = Beneficiary::create([
            'user_id' => $request->user()->id,
            'prenom'  => $validated['prenom'],
            'nom'     => $validated['nom'],
            'rib'     => $validated['rib'],
            'banque'  => $validated['banque'],
        ]);

        AuditService::logRequest($request, 'create_beneficiary', 'Beneficiary', $beneficiary->id, [
            'nom_complet' => $beneficiary->nom_complet,
            'banque'      => $beneficiary->banque,
        ]);

        return response()->json([
            'message'     => 'Bénéficiaire enregistré avec succès',
            'beneficiary' => $beneficiary,
        ], 201);
    }

    /*
    |----------------------------------------------------------
    | destroy — Supprimer un bénéficiaire (uniquement le sien)
    |----------------------------------------------------------
    */
    public function destroy(Request $request, $id)
    {
        $beneficiary = Beneficiary::where('user_id', $request->user()->id)->findOrFail($id);

        AuditService::logRequest($request, 'delete_beneficiary', 'Beneficiary', $beneficiary->id, [
            'nom_complet' => $beneficiary->nom_complet,
        ]);

        $beneficiary->delete();

        return response()->json(['message' => 'Bénéficiaire supprimé']);
    }
}

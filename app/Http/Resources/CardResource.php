<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CardResource extends JsonResource
{
    /*
    |----------------------------------------------------------
    | CardResource — formater proprement les données d'une carte
    |----------------------------------------------------------
    | On masque le CVV (jamais visible) et le PAN (numéro masqué)
    | comme une vraie banque le ferait.
    |----------------------------------------------------------
    */
    public function toArray(Request $request): array
    {
        // Le titulaire peut voir le PAN complet et le CVV de SES cartes (comme
        // au dos d'une vraie carte). Pour les autres (admin listant les cartes
        // d'autrui), on ne renvoie que le numéro masqué et jamais le CVV.
        $isOwner = $request->user() && $request->user()->id === $this->user_id;

        return [
            'id'         => $this->id,
            'pan'        => $this->maskedPan(),           // numéro masqué (recto)
            'type'       => $this->type,
            'statut'     => $this->statut,
            'plafond'    => $this->plafond,
            'expiration' => $this->expiration,
            'user'       => $this->whenLoaded('user', function () {
                return [
                    'id'   => $this->user->id,
                    'name' => $this->user->name,
                ];
            }),
            // Données sensibles — uniquement pour le titulaire de la carte
            'pan_full'   => $this->when($isOwner, $this->pan),
            'cvv'        => $this->when($isOwner, $this->cvv),
            'created_at' => $this->created_at,
        ];
    }

    /*
    |----------------------------------------------------------
    | maskedPan — masque le numéro de carte
    |----------------------------------------------------------
    | Exemple : 4532196896022305 → 4532 **** **** 2305
    |----------------------------------------------------------
    */
    private function maskedPan(): string
    {
        $pan = $this->pan;
        $first4 = substr($pan, 0, 4);
        $last4  = substr($pan, -4);
        return $first4 . ' **** **** ' . $last4;
    }
}
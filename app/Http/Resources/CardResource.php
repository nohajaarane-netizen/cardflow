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
        return [
            'id'         => $this->id,
            'pan'        => $this->maskedPan(),           // numéro masqué
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
            'created_at' => $this->created_at,
            // Pas de CVV ici → jamais visible dans l'API
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
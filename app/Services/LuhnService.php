<?php

namespace App\Services;

class LuhnService
{
    /*
    |----------------------------------------------------------
    | generate — Générer un numéro de carte valide (Luhn)
    |----------------------------------------------------------
    | $prefix = "4532" pour Visa, "5412" pour Mastercard
    | On génère 15 chiffres puis on calcule le dernier
    |----------------------------------------------------------
    */
    public static function generate(string $prefix): string
    {
        $number = $prefix;
        $length = 16;

        // Compléter jusqu'à 15 chiffres
        while (strlen($number) < $length - 1) {
            $number .= rand(0, 9);
        }

        // Calculer et ajouter le chiffre de vérification
        $number .= self::calculateCheckDigit($number);

        return $number;
    }

    /*
    |----------------------------------------------------------
    | calculateCheckDigit — Calculer le dernier chiffre
    |----------------------------------------------------------
    | Ce chiffre rend le total divisible par 10
    |----------------------------------------------------------
    */
    private static function calculateCheckDigit(string $number): int
    {
        $sum = 0;
        $length = strlen($number);

        for ($i = 0; $i < $length; $i++) {
            $digit = (int) $number[$length - 1 - $i];

            // Multiplier un chiffre sur deux par 2
            if ($i % 2 === 0) {
                $digit *= 2;
                // Si résultat > 9, soustraire 9
                if ($digit > 9) {
                    $digit -= 9;
                }
            }

            $sum += $digit;
        }

        // Le chiffre qui rend le total divisible par 10
        return (10 - ($sum % 10)) % 10;
    }

    /*
    |----------------------------------------------------------
    | validate — Vérifier si un numéro est valide
    |----------------------------------------------------------
    */
    public static function validate(string $number): bool
    {
        $sum = 0;
        $length = strlen($number);

        for ($i = 0; $i < $length; $i++) {
            $digit = (int) $number[$length - 1 - $i];

            if ($i % 2 === 1) {
                $digit *= 2;
                if ($digit > 9) {
                    $digit -= 9;
                }
            }

            $sum += $digit;
        }

        return $sum % 10 === 0;
    }
}
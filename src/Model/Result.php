<?php

namespace App\Model;

include_once('ProposedCombination.php');
include_once('SecretCombination.php');

class Result
{
    /**
     * Match value and position
     * @var int
     */
    private int $white = 0;

    /**
     * Match value but not position
     * @var int
     */
    private int $black = 0;
    private array $valuesProposed;

    /**
     * @param ProposedCombination $proposedCombination
     * @param SecretCombination $secretCombination
     */
    public function __construct(ProposedCombination $proposedCombination, Combination $secretCombination)
    {
        $valuesProposed = $proposedCombination->getValues();
        $this->valuesProposed = $valuesProposed;
        $secretValues = $secretCombination->getValues();
        $unmatchedValues = $secretValues;
        $valuesProposedToReview = $valuesProposed;

        foreach ($valuesProposedToReview as $key => $value) {
            if (in_array($value, $unmatchedValues)) {
                if ($secretValues[$key] === $value) {
                    $this->white++;
                    unset($unmatchedValues[$key]);
                    unset($valuesProposedToReview[$key]);
                }
            }
        }

        foreach ($valuesProposedToReview as $value) {
            $pos = array_search($value, $unmatchedValues);
            if ($pos !== false) {
                $this->black++;
                unset($unmatchedValues[$pos]);
            }
        }
    }

    /**
     * @return array
     */
    public function getValuesProposed(): array
    {
        return $this->valuesProposed;
    }

    public function getBlack(): int
    {
        return $this->black;
    }

    public function getWhite(): int
    {
        return $this->white;
    }
}

<?php

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

    public function __construct(ProposedCombination $proposedCombination, SecretCombination $secretCombination)
    {
        $valuesProposed = $proposedCombination->getValues();
        $this->valuesProposed = $valuesProposed;
        $secretValues = $secretCombination->getValues();
        $unmatchedValues = $secretValues;

        foreach ($valuesProposed as $key => $value) {
            if (in_array($value, $secretValues)) {
                if ($secretValues[$key] === $value) {
                    unset($unmatchedValues[$key]);
                    $this->white++;
                }

                // todo fix blacks
            }
        }

        foreach ($valuesProposed as $value) {
            foreach ($unmatchedValues as $k => $v) {
                if ($value === $v) {
                    unset($unmatchedValues[$k]);
                    $this->black++;
                    break;
                }
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

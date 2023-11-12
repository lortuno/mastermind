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

    /**
     * TODO Secret YYYPP returns 3 black 2 white for GGYYP combination
     * @param ProposedCombination $proposedCombination
     * @param SecretCombination $secretCombination
     */
    public function __construct(ProposedCombination $proposedCombination, Combination $secretCombination)
    {
        $valuesProposed = $proposedCombination->getValues();
        $this->valuesProposed = $valuesProposed;
        $secretValues = $secretCombination->getValues();
        $unmatchedValues = $secretValues;

        foreach ($valuesProposed as $key => $value) {
            if (in_array($value, $secretValues)) {
                unset($unmatchedValues[$key]);
                ($secretValues[$key] === $value) ?
                    $this->white++
                    :
                    $this->black++;
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

<?php

include_once('Combination.php');
include_once('Type.php');

class SecretCombination extends Combination
{
    public function __construct()
    {
        $generatedCombination = $this->generateCombination();
        parent::__construct($generatedCombination);
    }

    private function generateCombination(): array
    {
        $list = [];
        $types = new Type();

        for ($i = 0; $i < $this->getWidth(); $i++) {
            $genValue = array_rand($types->getValidValues());
            $list[] = $types->getValidValues()[$genValue];
        }

        return $list;
    }
}
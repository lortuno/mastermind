<?php

use Level\LevelInterface;

include_once('Combination.php');
include_once('Type.php');

class SecretCombination extends Combination
{
    public function __construct(LevelInterface $difficulty)
    {
        $this->setDifficulty($difficulty);
        $generatedCombination = $this->generateCombination();
        parent::__construct($generatedCombination);
    }

    private function generateCombination(): array
    {
        $list = [];
        $types = new Type();

        for ($i = 0; $i < $this->getDifficulty()->getWidth(); $i++) {
            $genValue = array_rand($types->getValidValues());
            $list[] = $types->getValidValues()[$genValue];
        }

        return $list;
    }
}
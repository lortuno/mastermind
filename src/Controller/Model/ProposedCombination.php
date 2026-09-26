<?php

namespace App\Controller\Model;

use App\Controller\Model\Level\LevelInterface;

include_once('Combination.php');

class ProposedCombination extends Combination
{
    public function __construct(LevelInterface $difficulty, array $values)
    {
        $this->setDifficulty($difficulty);
        parent::__construct($values);
    }
}
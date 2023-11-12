<?php

use PHPUnit\Framework\TestCase;
use Level\Medium;
use Level\Hard;

include_once 'src/Model/Result.php';
include_once 'src/Model/Level/Medium.php';
include_once 'src/Model/Level/Hard.php';
include_once 'src/Model/Level/LevelInterface.php';

class ResultTest extends TestCase
{
    /**
     * @throws InvalidCombinationError
     */
    public function testResultOk()
    {
        $difficulty = new Hard();
        $combination = new ProposedCombination($difficulty, ['G', 'G', 'Y', 'Y', 'P']);
        $secret = new ProposedCombination($difficulty, ['Y', 'Y', 'Y', 'P', 'P']);
        $result = new Result($combination, $secret);
        $this->assertEquals(2, $result->getBlack());
        $this->assertEquals(3, $result->getWhite());
    }
}
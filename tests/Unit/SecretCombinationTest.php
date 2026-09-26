<?php

use App\Model\InvalidCombinationError;
use App\Model\SecretCombination;
use PHPUnit\Framework\TestCase;
use App\Model\Level\Medium;
use App\Model\Level\Hard;
use App\Model\Level\Easy;

include_once 'src/Model/Result.php';
include_once 'src/Model/Level/Medium.php';
include_once 'src/Model/Level/Hard.php';
include_once 'src/Model/Level/Easy.php';
include_once 'src/Model/Level/LevelInterface.php';

class SecretCombinationTest extends TestCase
{
    /**
     * @throws InvalidCombinationError
     */
    public function testGenerateSecretOk()
    {
        $difficulty = new Hard();
        $result = new SecretCombination($difficulty);
        $this->assertEquals('Difícil', $result->getDifficulty()->getName());
        $this->assertEquals(5, $result->getDifficulty()->getWidth());
        $this->assertEquals(5, $result->getDifficulty()->getMaxAttempts());
        $this->assertIsArray($result->getValues());
    }
}
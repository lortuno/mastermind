<?php

use PHPUnit\Framework\TestCase;
use Level\Easy;

include_once 'src/Model/Result.php';
include_once 'src/Model/Level/Easy.php';
include_once 'src/Model/Game.php';

class GameTest extends TestCase
{
    /**
     * @throws InvalidCombinationError
     * @covers Game, Combination, \Level\BaseLevel, Type
     */
    public function testCreateGameOk()
    {
        $difficulty = new Easy();
        $result = new Game($difficulty);
        $this->assertInstanceOf(SecretCombination::class, $result->getSecretCombination());
        $this->assertIsInt($result->getAttemptNumber());
        $this->assertNull($result->getLastResult());
        $this->assertFalse($result->isWinner());
        $this->assertFalse($result->isLoser());
        $this->assertFalse($result->isFinished());
    }

    /**
     * @throws InvalidCombinationError
     * @covers Game, Combination, \Level\BaseLevel, Type
     */
    public function testPlayOK()
    {
        $difficulty = new Easy();
        $result = new Game($difficulty);
        $result->play('BBP');
        $this->assertInstanceOf(Result::class, $result->getLastResult());
    }

    /**
     * @throws InvalidCombinationError
     * @covers Game, Combination, Result, Type
     */
    public function testIsLoser()
    {
        $result = new Game();
        $result->play('BBPP');
        $result->play('BBPP');
        $result->play('BBPP');
        $result->play('BBPP');
        $result->play('BBPP');
        $result->play('BBPP');
        $result->play('BBPP');
        $result->play('BBPP');
        $result->play('BBPP');
        $result->play('BBPP');
        $this->assertTrue($result->isFinished());
        $this->assertTrue($result->isLoser());
    }

    /**
     * @throws InvalidCombinationError
     * @covers Game, Combination, \Level\BaseLevel, Type
     */
    public function testPlayKO()
    {
        $difficulty = new Easy();
        $result = new Game($difficulty);
        $this->expectException(InvalidCombinationError::class);
        $this->expectExceptionMessage('Valor inválido');
        $result->play('ZZL');
    }
}
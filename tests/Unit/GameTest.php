<?php

use App\Controller\Model\Game;
use App\Controller\Model\InvalidCombinationError;
use App\Controller\Model\Level\Easy;
use App\Controller\Model\Result;
use App\Controller\Model\SecretCombination;
use PHPUnit\Framework\TestCase;

include_once 'src/Model/Result.php';
include_once 'src/Model/Level/Easy.php';
include_once 'src/Model/Game.php';

class GameTest extends TestCase
{
    /**
     * @throws InvalidCombinationError
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
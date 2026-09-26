<?php

use App\Controller\GameApiController;
use App\Model\Game;
use App\Model\InvalidCombinationError;
use PHPUnit\Framework\TestCase;

include_once 'src/Model/Difficulty.php';
include_once 'src/Model/Game.php';
include_once 'src/Controller/GameApiController.php';

class GameApiControllerTest extends TestCase
{
    public function testDifficultiesListsAllThreeLevels()
    {
        $session = [];
        $controller = new GameApiController($session);

        $result = $controller->difficulties();

        $this->assertCount(3, $result['difficulties']);
        $this->assertSame(['level' => 1, 'name' => 'Fácil', 'width' => 3, 'maxAttempts' => 15], $result['difficulties'][0]);
        $this->assertSame(['level' => 2, 'name' => 'Normal', 'width' => 4, 'maxAttempts' => 10], $result['difficulties'][1]);
        $this->assertSame(['level' => 3, 'name' => 'Difícil', 'width' => 5, 'maxAttempts' => 5], $result['difficulties'][2]);
    }

    /**
     * @throws InvalidCombinationError
     */
    public function testStartCreatesGameAndResetsHistory()
    {
        $session = [];
        $controller = new GameApiController($session);

        $state = $controller->start(2);

        $this->assertSame(0, $state['attemptNumber']);
        $this->assertSame(10, $state['maxAttempts']);
        $this->assertSame(4, $state['width']);
        $this->assertSame('Normal', $state['difficultyName']);
        $this->assertFalse($state['isFinished']);
        $this->assertSame([], $state['history']);
        $this->assertArrayNotHasKey('secretCombination', $state);
        $this->assertNotEmpty($session[GameApiController::SESSION_GAME_KEY]);
    }

    public function testStartWithInvalidDifficultyThrows()
    {
        $session = [];
        $controller = new GameApiController($session);

        $this->expectException(InvalidCombinationError::class);
        $this->expectExceptionMessage('Nivel dificultad inválido');
        $controller->start(9);
    }

    public function testGuessWithoutActiveGameThrows()
    {
        $session = [];
        $controller = new GameApiController($session);

        $this->expectException(InvalidCombinationError::class);
        $controller->guess('RGBY');
    }

    /**
     * @throws InvalidCombinationError
     */
    public function testGuessAppendsScoredAttemptToHistory()
    {
        $session = [];
        $controller = new GameApiController($session);
        $controller->start(2);

        $state = $controller->guess('RGBY');

        $this->assertSame(1, $state['attemptNumber']);
        $this->assertCount(1, $state['history']);
        $this->assertSame('RGBY', $state['history'][0]['combination']);
        $this->assertSame(1, $state['history'][0]['attempt']);
        $this->assertIsInt($state['history'][0]['black']);
        $this->assertIsInt($state['history'][0]['white']);
    }

    /**
     * @throws InvalidCombinationError
     */
    public function testInvalidGuessDoesNotConsumeAnAttempt()
    {
        $session = [];
        $controller = new GameApiController($session);
        $controller->start(2);

        try {
            $controller->guess('TOOLONG');
            $this->fail('Expected InvalidCombinationError was not thrown.');
        } catch (InvalidCombinationError $exception) {
            // expected
        }

        $state = $controller->state();
        $this->assertSame(0, $state['attemptNumber']);
        $this->assertSame([], $state['history']);
    }

    /**
     * @throws InvalidCombinationError
     */
    public function testLosingRevealsSecretCombinationAfterMaxAttempts()
    {
        $session = [];
        $controller = new GameApiController($session);
        $controller->start(1); // Easy: width 3, 15 attempts

        $state = null;
        for ($i = 0; $i < 15; $i++) {
            $state = $controller->guess('BBP');
        }

        $this->assertTrue($state['isFinished']);
        $this->assertTrue($state['isLoser']);
        $this->assertFalse($state['isWinner']);
        $this->assertArrayHasKey('secretCombination', $state);
        $this->assertCount(15, $state['history']);
    }

    /**
     * Winning depends on matching a randomly generated secret, which Game
     * intentionally never exposes before the game ends. Reflection reads it
     * from the (unmodified) session-serialized Game purely for test setup.
     *
     * @throws InvalidCombinationError
     */
    public function testWinningRevealsSecretCombination()
    {
        $session = [];
        $controller = new GameApiController($session);
        $controller->start(2);

        /** @var Game $game */
        $game = unserialize($session[GameApiController::SESSION_GAME_KEY]);
        $secretValues = $game->getSecretCombination()->getValues();

        $state = $controller->guess(implode('', $secretValues));

        $this->assertTrue($state['isFinished']);
        $this->assertTrue($state['isWinner']);
        $this->assertFalse($state['isLoser']);
        $this->assertSame($secretValues, $state['secretCombination']);
    }
}

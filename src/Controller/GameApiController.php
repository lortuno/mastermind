<?php

namespace App\Controller;

use App\Model\Difficulty;
use App\Model\Game;
use App\Model\InvalidCombinationError;
use App\Model\Level\LevelInterface;

include_once __DIR__ . '/../Model/Difficulty.php';
include_once __DIR__ . '/../Model/Game.php';
include_once __DIR__ . '/../Model/InvalidCombinationError.php';

class GameApiController
{
    public const SESSION_GAME_KEY = 'mastermind_game';
    public const SESSION_HISTORY_KEY = 'mastermind_history';

    public function __construct(private array &$session)
    {
    }

    /**
     * @throws InvalidCombinationError
     */
    public function difficulties(): array
    {
        $levels = [];
        foreach ([1, 2, 3] as $level) {
            $levels[] = $this->describeDifficulty($level, (new Difficulty($level))->getDifficultyLevel());
        }

        return ['difficulties' => $levels];
    }

    /**
     * @throws InvalidCombinationError
     */
    public function start(int $difficultyLevel): array
    {
        $difficulty = new Difficulty($difficultyLevel);
        $game = new Game($difficulty->getDifficultyLevel());

        $this->session[self::SESSION_HISTORY_KEY] = [];
        $this->session[self::SESSION_GAME_KEY] = serialize($game);

        return $this->buildState($game);
    }

    /**
     * @throws InvalidCombinationError
     */
    public function guess(string $combination): array
    {
        $game = $this->loadGame();

        $game->play($combination);
        $result = $game->getLastResult();

        $history = $this->session[self::SESSION_HISTORY_KEY] ?? [];
        $history[] = [
            'attempt' => $game->getAttemptNumber(),
            'combination' => $combination,
            'black' => $result->getBlack(),
            'white' => $result->getWhite(),
        ];

        $this->session[self::SESSION_HISTORY_KEY] = $history;
        $this->session[self::SESSION_GAME_KEY] = serialize($game);

        return $this->buildState($game);
    }

    /**
     * @throws InvalidCombinationError
     */
    public function state(): array
    {
        return $this->buildState($this->loadGame());
    }

    /**
     * @throws InvalidCombinationError
     */
    private function loadGame(): Game
    {
        if (empty($this->session[self::SESSION_GAME_KEY])) {
            throw new InvalidCombinationError('No hay ninguna partida activa. Empieza una nueva.');
        }

        return unserialize($this->session[self::SESSION_GAME_KEY]);
    }

    private function describeDifficulty(int $level, LevelInterface $difficultyLevel): array
    {
        return [
            'level' => $level,
            'name' => $difficultyLevel->getName(),
            'width' => $difficultyLevel->getWidth(),
            'maxAttempts' => $difficultyLevel->getMaxAttempts(),
        ];
    }

    private function buildState(Game $game): array
    {
        $difficultyLevel = $game->getSecretCombination()->getDifficulty();
        $isFinished = $game->isFinished();

        $state = [
            'attemptNumber' => $game->getAttemptNumber(),
            'maxAttempts' => $difficultyLevel->getMaxAttempts(),
            'width' => $difficultyLevel->getWidth(),
            'difficultyName' => $difficultyLevel->getName(),
            'isFinished' => $isFinished,
            'isWinner' => $game->isWinner(),
            'isLoser' => $game->isLoser(),
            'history' => $this->session[self::SESSION_HISTORY_KEY] ?? [],
        ];

        if ($isFinished) {
            $state['secretCombination'] = $game->getSecretCombination()->getValues();
        }

        return $state;
    }
}

<?php

use Level\LevelInterface;

class DifficultyView
{
    private LevelInterface $difficulty;

    /**
     * @throws InvalidCombinationError
     */
    public function __construct()
    {
        $difficulty = $this->promptDifficulty();
        $this->difficulty = $this->getDifficultyLevel($difficulty);
    }

    private function promptDifficulty(): int
    {
        return (int) readline('Introduce nivel dificultad: 1 (fácil) - 2 (normal) - 3 (difícil): ');
    }

    /**
     * @throws InvalidCombinationError
     */
    public function getDifficultyLevel(int $difficulty): LevelInterface
    {
        try {
            $difficultyLevel = new Difficulty($difficulty);
            $this->getDifficultyExplanation($difficultyLevel->getDifficultyLevel());
            return $difficultyLevel->getDifficultyLevel();
        } catch (Throwable $exception) {
            new ErrorView($exception);
            $newPrompt = $this->promptDifficulty();
            $this->getDifficultyLevel($newPrompt);
        }
    }

    public function getDifficulty(): LevelInterface
    {
        return $this->difficulty;
    }

    private function getDifficultyExplanation(LevelInterface $difficultyLevel)
    {
        echo "Dificultad " . $difficultyLevel->getName() . " elegida. ";
        echo "Longitud " . $difficultyLevel->getWidth() . " posiciones. ";
        echo "Número intentos máximo: " . $difficultyLevel->getMaxAttempts() . PHP_EOL;
    }
}

<?php

use Level\LevelInterface;
include_once('ProposedCombination.php');
include_once('SecretCombination.php');
include_once('InvalidCombinationError.php');
include_once('Result.php');

class Game
{
    private int $attemptNumber = 0;
    private LevelInterface $difficulty;
    private array $proposedCombinations;
    private SecretCombination $secretCombination;
    private ?Result $lastResult = null;

    /**
     * @throws InvalidCombinationError
     */
    public function __construct(?LevelInterface $difficulty)
    {
        if (!$difficulty) {
            $difficulty = new Difficulty();
        }
        $this->difficulty = $difficulty;
        $this->init();
    }

    /**
     * @throws InvalidCombinationError
     */
    public function init()
    {
        $this->secretCombination = new SecretCombination($this->difficulty);
        $this->attemptNumber = 0;
    }

    /**
     * @throws InvalidCombinationError
     */
    public function play(string $input)
    {
        $combination = str_split($input);
        $proposedCombination = new ProposedCombination($this->difficulty, $combination);
        $this->proposedCombinations[] = $proposedCombination;
        $this->attemptNumber++;
        $this->lastResult = new Result($proposedCombination, $this->secretCombination);
    }

    public function getLastResult(): Result
    {
        return $this->lastResult;
    }

    public function getAttemptNumber(): int
    {
        return $this->attemptNumber;
    }

    /**
     * @return SecretCombination
     */
    public function getSecretCombination(): SecretCombination
    {
        return $this->secretCombination;
    }

    public function isLoser(): bool
    {
      if (!$this->isFinished()) {
          return false;
      }

      return $this->lastResult->getWhite() < $this->secretCombination->getDifficulty()->getWidth();
    }

    public function isWinner(): bool
    {
        return $this->lastResult &&
            $this->lastResult->getWhite() === $this->secretCombination->getDifficulty()->getWidth() &&
            $this->lastResult->getValuesProposed() === $this->secretCombination->getValues();
    }

    public function isFinished(): bool
    {
        return !($this->attemptNumber < $this->difficulty->getMaxAttempts()) || $this->isWinner();
    }
}

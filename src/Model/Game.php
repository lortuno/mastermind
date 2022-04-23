<?php

include_once('ProposedCombination.php');
include_once('SecretCombination.php');
include_once('InvalidCombinationError.php');
include_once('Result.php');

class Game
{
    const MAX_ATTEMPTS = 10;

    private int $attemptNumber = 0;
    private array $proposedCombinations;
    private SecretCombination $secretCombination;
    private ?Result $lastResult = null;

    public function __construct()
    {
        $this->init();
    }

    public function init()
    {
        $this->secretCombination = new SecretCombination();
        $this->attemptNumber = 0;
    }

    /**
     * @throws InvalidCombinationError
     */
    public function play(string $input)
    {
        $combination = str_split($input);
        $proposedCombination = new ProposedCombination($combination);
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

      return $this->lastResult->getWhite() < $this->secretCombination->getWidth();
    }

    public function isWinner(): bool
    {
        return $this->lastResult && $this->lastResult->getWhite() === $this->secretCombination->getWidth() &&
            $this->lastResult->getValuesProposed() === $this->secretCombination->getValues();
    }

    public function isFinished(): bool
    {
        return !($this->attemptNumber < self::MAX_ATTEMPTS) || $this->isWinner();
    }
}

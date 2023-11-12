<?php

include_once('ErrorView.php');
include_once('AttemptView.php');
include_once('DifficultyView.php');

class GameView
{
    private Game $game;

    /**
     * @throws InvalidCombinationError
     */
    public function __construct()
    {
        $this->play();
        new EndGameView($this->game);
        $this->resumeGame();
    }

    /**
     * @throws InvalidCombinationError
     */
    protected function play(): void
    {
        echo ' <--MASTER MIND--> ' . PHP_EOL;
        $difficultyView = new DifficultyView();
        $this->game = new Game($difficultyView->getDifficulty());
        $this->makeAttempt();
    }

    private function resumeGame()
    {
        $resumeGame = readline(' ¿Quieres empezar una nueva partida? Y/N: ');
        $lowerCaseResponse = strtolower($resumeGame);

        if ($lowerCaseResponse !== 'y' && $lowerCaseResponse !== 'n') {
            new ErrorView(new InvalidCombinationError());
            $this->resumeGame();
        }

        if (strtolower($resumeGame) === 'n') {
            exit;
        }

        new GameView();
    }

    /**
     * @return void
     */
    public function makeAttempt(): void
    {
        while (!$this->game->isFinished()) {
            try {
                new AttemptView($this->game);
            } catch (Exception $exception) {
                new ErrorView($exception);
                $this->makeAttempt();
            }
        }
    }
}

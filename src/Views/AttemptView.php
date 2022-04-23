<?php

include_once('ErrorView.php');
include_once('EndGameView.php');

class AttemptView
{
    /**
     * @throws InvalidCombinationError
     */
    public function __construct(Game $game)
    {
        $userCombination = readline(' Introduce combinación: ');
        $game->play($userCombination);
        echo ' ' . $game->getAttemptNumber() . '. ' . $userCombination;
        echo ' Black: ' . $game->getLastResult()->getBlack();
        echo ' White: ' . $game->getLastResult()->getWhite();
    }
}

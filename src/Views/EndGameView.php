<?php

class EndGameView
{
    public function __construct(Game $game)
    {
        echo '  -- Game over -- ' . PHP_EOL;
        $endMessage = $this->getEndMessage($game);

        echo $endMessage . PHP_EOL;
    }

    /**
     * @param Game $game
     * @return string
     */
    public function getEndMessage(Game $game): string
    {
        $endMessage = 'La combinación final era: ' . implode($game->getSecretCombination()->getValues()) . ' ';

        if ($game->isWinner()) {
            $endMessage .= 'Tú ganas!';
        }

        if ($game->isLoser()) {
            $endMessage .= 'Has perdido :(';
        }

        return $endMessage;
    }
}
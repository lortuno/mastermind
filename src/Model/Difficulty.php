<?php

use Level\Easy;
use Level\Medium;
use Level\Hard;
use Level\BaseLevel;
use Level\LevelInterface;

include_once ('Level/LevelInterface.php');
include_once ('Level/Easy.php');
include_once ('Level/Medium.php');
include_once ('Level/Hard.php');

class Difficulty extends BaseLevel
{
    /**
     * @var Easy|Hard|Medium
     */
    private LevelInterface $difficulty;

    /**
     * @throws InvalidCombinationError
     */
    public function __construct($difficulty = 2)
    {
        $this->setDifficultyLevel($difficulty);
    }

    public function setDifficultyLevel($difficulty)
    {
        switch ($difficulty) {
            case 1:
                $this->difficulty = new Easy();
                break;
            case 2:
                $this->difficulty = new Medium();
                break;
            case 3:
                $this->difficulty = new Hard();
                break;
            default:
                throw new InvalidCombinationError('Nivel dificultad inválido. ');
        }
    }

    public function getDifficultyLevel(): LevelInterface
    {
        return $this->difficulty;
    }
}
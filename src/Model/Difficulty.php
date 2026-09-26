<?php

namespace App\Model;

use App\Model\Level\BaseLevel;
use App\Model\Level\Easy;
use App\Model\Level\Hard;
use App\Model\Level\LevelInterface;
use App\Model\Level\Medium;

include_once('Level/LevelInterface.php');
include_once('Level/Easy.php');
include_once('Level/Medium.php');
include_once('Level/Hard.php');

class Difficulty extends BaseLevel
{
    /**
     * @var Easy|Hard|Medium
     */
    private Medium|Hard|Easy $difficulty;

    /**
     * @throws InvalidCombinationError
     */
    public function __construct(int $difficulty = 2)
    {
        $this->setDifficultyLevel($difficulty);
    }

    public function setDifficultyLevel(int $difficulty): void
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

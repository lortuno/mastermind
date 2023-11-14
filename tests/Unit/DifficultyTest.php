<?php

use PHPUnit\Framework\TestCase;
use Level\Medium;
use Level\Hard;
use Level\Easy;

include_once 'src/Model/Difficulty.php';
include_once 'src/Model/Level/Medium.php';
include_once 'src/Model/Level/Hard.php';
include_once 'src/Model/Level/Easy.php';
include_once 'src/Model/Level/LevelInterface.php';

class DifficultyTest extends TestCase
{
    /**
     * @throws InvalidCombinationError
     */
    public function testDifficultyHardOk()
    {
        $result = new Difficulty(3);
        $this->assertInstanceOf(Hard::class, $result->getDifficultyLevel());
        $this->assertEquals('Difícil', $result->getDifficultyLevel()->getName());
    }

    /**
     */
    public function testDifficultyDefaultOk()
    {
        $result = new Difficulty();
        $this->assertInstanceOf(Medium::class, $result->getDifficultyLevel());
        $this->assertEquals('Normal', $result->getDifficultyLevel()->getName());
    }

    /**
     */
    public function testDifficultyEasyOk()
    {
        $result = new Difficulty(1);
        $this->assertInstanceOf(Easy::class, $result->getDifficultyLevel());
        $this->assertEquals('Fácil', $result->getDifficultyLevel()->getName());
    }

    /**
     */
    public function testDifficultyError()
    {
        $this->expectException(InvalidCombinationError::class);
        $this->expectExceptionMessage('Nivel dificultad inválido');
        new Difficulty(8);
    }
}
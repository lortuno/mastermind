<?php

use PHPUnit\Framework\TestCase;
use Level\Medium;
use Level\Hard;
use Level\Easy;

include_once 'src/Model/Result.php';
include_once 'src/Model/Level/Medium.php';
include_once 'src/Model/Level/Hard.php';
include_once 'src/Model/Level/Easy.php';
include_once 'src/Model/Level/LevelInterface.php';

class ResultTest extends TestCase
{
    /**
     * @throws InvalidCombinationError
     * @covers ::publicMethod
     */
    public function testResultHardOk()
    {
        $difficulty = new Hard();
        $combination = new ProposedCombination($difficulty, ['G', 'G', 'Y', 'Y', 'P']);
        $secret = new ProposedCombination($difficulty, ['Y', 'Y', 'Y', 'P', 'P']);
        $result = new Result($combination, $secret);
        $this->assertEquals(2, $result->getWhite());
        $this->assertEquals(1, $result->getBlack());
    }

    /**
     * @throws InvalidCombinationError
     * @covers ::publicMethod
     */
    public function testResultMediumOK()
    {
        $difficulty = new Medium();
        $combination = new ProposedCombination($difficulty, ['G', 'G', 'Y', 'Y']);
        $secret = new ProposedCombination($difficulty, ['Y', 'Y', 'Y', 'P']);
        $result = new Result($combination, $secret);
        $this->assertEquals(1, $result->getWhite());
        $this->assertEquals(1, $result->getBlack());
    }

    /**
     * @throws InvalidCombinationError
     * @covers ::publicMethod
     */
    public function testResultEasyOK()
    {
        $difficulty = new Easy();
        $combination = new ProposedCombination($difficulty, ['P', 'G', 'Y']);
        $secret = new ProposedCombination($difficulty, ['Y', 'Y', 'P']);
        $result = new Result($combination, $secret);
        $this->assertEquals(0, $result->getWhite());
        $this->assertEquals(2, $result->getBlack());
    }

    /**
     * @throws InvalidCombinationError
     * @covers ::publicMethod
     */
    public function testGetProposedValuesOK()
    {
        $difficulty = new Easy();
        $combination = new ProposedCombination($difficulty, ['P', 'G', 'Y']);
        $secret = new ProposedCombination($difficulty, ['Y', 'Y', 'P']);
        $result = new Result($combination, $secret);
        $this->assertIsArray($result->getValuesProposed());
    }

    /**
     * @throws InvalidCombinationError
     * @covers ::publicMethod
     */
    public function testResultInvalidOK()
    {
        $difficulty = new Easy();
        $this->expectException(InvalidCombinationError::class);
        $this->expectExceptionMessage('Longitud inválida.');
        $combination = new ProposedCombination($difficulty, ['P', 'G', 'Y', 'Y']);
        $secret = new ProposedCombination($difficulty, ['Y', 'Y', 'P']);
        new Result($combination, $secret);

        $this->expectException(InvalidCombinationError::class);
        $this->expectExceptionMessage('Valor Inválido.');
        $combination = new ProposedCombination($difficulty, ['P', 'Z', 'Y',]);
        $secret = new ProposedCombination($difficulty, ['Y', 'Y', 'P']);
        new Result($combination, $secret);
    }
}
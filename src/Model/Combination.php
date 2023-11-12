<?php

use Level\LevelInterface;

include_once('InvalidCombinationError.php');

abstract class Combination
{
    private array $values;
    private LevelInterface $difficulty;

    /**
     * @throws InvalidCombinationError
     */
    public function __construct(array $values) {
        $this->setValues($values);
    }

    /**
     * @return array
     */
    public function getValues(): array
    {
        return $this->values;
    }

    /**
     * @throws InvalidCombinationError
     */
    public function setValues(array $values): void
    {
        if (count($values) !== $this->getDifficulty()->getWidth()) {
            throw new InvalidCombinationError('Longitud inválida.');
        }

        $types = new Type();
        foreach ($values as $value) {
            if (!in_array($value, $types->getValidValues())) {
                throw new InvalidCombinationError();
            }
        }

        $this->values = $values;
    }

    public function getDifficulty(): LevelInterface
    {
        return $this->difficulty;
    }

    public function setDifficulty(LevelInterface $difficulty): void
    {
        $this->difficulty = $difficulty;
    }
}
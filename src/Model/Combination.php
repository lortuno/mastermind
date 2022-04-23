<?php

include_once('InvalidCombinationError.php');

class Combination
{
    private int $width = 4;
    private array $values;

    /**
     * @throws InvalidCombinationError
     */
    public function __construct(array $values) {
        $this->setValues($values);
    }

    /**
     * @return int
     */
    public function getWidth(): int
    {
        return $this->width;
    }

    /**
     * @return array
     */
    public function getValues(): array
    {
        return $this->values;
    }

    /**
     * @param int $width
     */
    public function setWidth(int $width): void
    {
        $this->width = $width;
    }

    /**
     * @throws InvalidCombinationError
     */
    public function setValues(array $values): void
    {
        if (count($values) !== $this->getWidth()) {
            throw new InvalidCombinationError('Invalid length');
        }

        $types = new Type();
        foreach ($values as $value) {
            if (!in_array($value, $types->getValidValues())) {
                throw new InvalidCombinationError();
            }
        }

        $this->values = $values;
    }
}
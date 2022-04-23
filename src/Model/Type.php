<?php

class Type
{
    public array $validValues = [
        'R',
        'G',
        'B',
        'P',
        'Y',
    ];

    /**
     * @return array|string[]
     */
    public function getValidValues(): array
    {
        return $this->validValues;
    }
}

<?php

namespace Level;

include_once ('LevelInterface.php');

abstract class BaseLevel implements LevelInterface
{
    protected string $name = '';
    protected int $width = 4;
    protected int $maxAttempts = 10;

    public function getWidth(): int
    {
        return $this->width;
    }

    public function getMaxAttempts(): int
    {
        return $this->maxAttempts;
    }

    public function getName(): string
    {
        return $this->name;
    }
}
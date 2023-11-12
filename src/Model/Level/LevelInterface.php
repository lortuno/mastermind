<?php

namespace Level;

interface LevelInterface
{
    public function getWidth(): int;

    public function getMaxAttempts(): int;

    public function getName(): string;
}
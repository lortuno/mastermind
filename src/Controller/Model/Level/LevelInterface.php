<?php

namespace App\Controller\Model\Level;

interface LevelInterface
{
    public function getWidth(): int;

    public function getMaxAttempts(): int;

    public function getName(): string;
}
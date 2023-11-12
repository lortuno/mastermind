<?php

namespace Level;

include_once ('BaseLevel.php');

class Hard extends BaseLevel
{
    protected string $name = 'Difícil';
    protected int $width = 5;
    protected int $maxAttempts = 5;
}
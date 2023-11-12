<?php

namespace Level;

include_once ('BaseLevel.php');

class Easy extends BaseLevel
{
    protected string $name = 'Fácil';
    protected int $width = 3;
    protected int $maxAttempts = 15;
}
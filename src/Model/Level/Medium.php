<?php

namespace App\Model\Level;

use App\Model\Level\BaseLevel;

include_once ('BaseLevel.php');

class Medium extends BaseLevel
{
    protected string $name = 'Normal';
    protected int $width = 4;
    protected int $maxAttempts = 10;
}
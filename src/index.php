<?php

include_once('Views/Console/GameView.php');
include_once('Views/Web/GameWebView.php');
include_once('Model/Game.php');
include_once('Model/Difficulty.php');
include_once('Controller/GameConsoleController.php');

use App\Controller\GameConsoleController;
use App\Controller\GameWebController;

new GameConsoleController();

//phpinfo();
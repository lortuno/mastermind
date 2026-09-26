<?php

include_once('Views/Console/GameView.php');
include_once('Views/Web/GameWebView.php');
include_once('Model/Game.php');
include_once('Model/Difficulty.php');
include_once('Controller/GameConsoleController.php');
include_once('Controller/GameWebController.php');

use App\Controller\GameConsoleController;
use App\Controller\GameWebController;
//
//new GameWebController();
new GameConsoleController();

//phpinfo();
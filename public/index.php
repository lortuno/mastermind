<?php

declare(strict_types=1);

include_once __DIR__ . '/../src/Controller/GameApiController.php';
include_once __DIR__ . '/../src/Views/Web/GameWebView.php';
include_once __DIR__ . '/../src/Controller/GameWebController.php';

use App\Controller\GameApiController;
use App\Controller\GameWebController;

$action = $_GET['action'] ?? null;

if ($action === null) {
    new GameWebController();
    return;
}

session_start();

$payload = json_decode((string)file_get_contents('php://input'), true) ?? [];
$result = (new GameApiController($_SESSION))->handle($_SERVER['REQUEST_METHOD'], $action, $payload);

header('Content-Type: application/json; charset=utf-8');
http_response_code($result['status']);
echo json_encode($result['body']);

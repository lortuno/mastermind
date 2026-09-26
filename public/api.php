<?php

declare(strict_types=1);

session_start();

include_once __DIR__ . '/../src/Controller/GameApiController.php';

use App\Controller\GameApiController;
use App\Model\InvalidCombinationError;

header('Content-Type: application/json; charset=utf-8');

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$payload = json_decode((string)file_get_contents('php://input'), true) ?? [];

$controller = new GameApiController($_SESSION);

try {
    $response = match (true) {
        $method === 'GET' && $action === 'difficulties' => $controller->difficulties(),
        $method === 'GET' && $action === 'state' => $controller->state(),
        $method === 'POST' && $action === 'start' => $controller->start((int)($payload['difficulty'] ?? 0)),
        $method === 'POST' && $action === 'guess' => $controller->guess((string)($payload['combination'] ?? '')),
        default => null,
    };
} catch (InvalidCombinationError $error) {
    http_response_code(400);
    echo json_encode(['error' => $error->getMessage()]);
    exit;
}

if ($response === null) {
    http_response_code(404);
    echo json_encode(['error' => 'Unknown action.']);
    exit;
}

echo json_encode($response);

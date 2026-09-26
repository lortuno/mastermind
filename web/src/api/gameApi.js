const BASE_URL = '/index.php';

async function request(action, { method = 'GET', body } = {}) {
  const response = await fetch(`${BASE_URL}?action=${action}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Unexpected error.');
  }

  return data;
}

export function fetchDifficulties() {
  return request('difficulties');
}

export function fetchState() {
  return request('state');
}

export function startGame(difficultyLevel) {
  return request('start', { method: 'POST', body: { difficulty: difficultyLevel } });
}

export function submitGuess(combination) {
  return request('guess', { method: 'POST', body: { combination } });
}

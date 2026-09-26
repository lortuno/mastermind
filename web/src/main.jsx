import React from 'react';
import { createRoot } from 'react-dom/client';
import { createGameApi } from '@mastermind/core';
import App from './App.jsx';
import './styles/main.scss';

// Same origin: the PHP front controller that serves this page also answers the API.
const api = createGameApi('', { connectionHint: 'Check your connection and that the game server is running.' });

const container = document.getElementById('mastermind-root');

createRoot(container).render(
  <React.StrictMode>
    <App api={api} />
  </React.StrictMode>
);

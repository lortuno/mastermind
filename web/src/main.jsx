import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/main.scss';

const container = document.getElementById('mastermind-root');

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

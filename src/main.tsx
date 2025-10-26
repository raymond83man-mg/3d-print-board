import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import './styles/board.css';

const el = document.getElementById('root');
if (el) {
  const root = createRoot(el);
  root.render(<App />);
}

// Register service worker for offline/PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swPath).catch(() => {});
  });
}

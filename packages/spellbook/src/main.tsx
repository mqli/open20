import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@open20/ui/styles.css';
import { App } from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

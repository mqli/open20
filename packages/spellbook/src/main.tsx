import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App.tsx';
import { initContent } from '@/core/content-resolver';

// Render the app shell immediately — SpellLibraryLayout handles its own loading state.
// initContent() runs in parallel so content is likely ready by the time the layout mounts.
initContent();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

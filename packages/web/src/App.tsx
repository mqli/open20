import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from '@/contexts';
import { useSettingsStore, useCharacterStore } from '@/stores';
import { GameMode } from '@/features/game-mode';
import { CharacterCreation } from '@/features/character-creation';
import { Settings } from '@/features/settings';
import '@/i18n';

function AppContent() {
  const { loadSettings, theme } = useSettingsStore();
  const { character, loadCharacter } = useCharacterStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await loadSettings();
        // Try to load last active character
        const lastCharId = localStorage.getItem('open20_last_char');
        if (lastCharId) {
          try {
            await loadCharacter(lastCharId);
          } catch (err) {
            // Character not found or error loading - just continue without it
            console.warn('Failed to load character:', err);
            localStorage.removeItem('open20_last_char');
          }
        }
      } catch (err) {
        console.warn('Failed to load settings:', err);
      }
      setIsReady(true);
    };
    init();
  }, [loadSettings, loadCharacter]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[--color-bg-primary] flex items-center justify-center">
        <div className="text-[--color-text-secondary]">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          character ? <Navigate to="/game" replace /> : <Navigate to="/create" replace />
        }
      />
      <Route path="/game" element={<GameMode />} />
      <Route path="/create" element={<CharacterCreation />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </BrowserRouter>
  );
}

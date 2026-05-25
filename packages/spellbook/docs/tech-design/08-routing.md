## 9. Routing

### 9.1 Route Definitions

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SpellLibrary } from './components/spell-library/SpellLibrary';
import { CharacterSheet } from './components/character-sheet/CharacterSheet';
import { CharacterSetup } from './components/character-setup/CharacterSetup';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SpellLibrary />} />
        <Route path="/spells" element={<SpellLibrary />} />
        <Route path="/character" element={<CharacterSheet />} />
        <Route path="/character/setup" element={<CharacterSetup />} />
        <Route path="/character/setup/:id" element={<CharacterSetup />} />
      </Routes>
    </BrowserRouter>
  );
}
```

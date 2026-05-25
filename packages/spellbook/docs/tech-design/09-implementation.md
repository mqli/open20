## 10. Implementation Phases

### Phase 1: Foundation (Week 1-2)

| Task | Description | Status |
|------|-------------|--------|
| P1-01 | Project setup (Vite + React + TypeScript + Tailwind) | ✅ |
| P1-02 | Design tokens implementation (Tailwind config) | ✅ |
| P1-03 | Core integration layer (spell-service, character-service) | ✅ |
| P1-04 | State management setup (Zustand stores) | ✅ |
| P1-05 | Persistence layer (localStorage service) | ✅ |
| P1-06 | Radix UI integration (Dialog, Tabs, Tooltip, etc.) | ✅ |

### Phase 2: Spell Library (Week 3-4)

| Task | Description | Status |
|------|-------------|--------|
| P2-01 | SpellLibrary page layout | ✅ |
| P2-02 | SearchBar component | ✅ |
| P2-03 | LevelTabs component | ✅ |
| P2-04 | FilterChips component | ✅ |
| P2-05 | SpellCard component | ✅ |
| P2-06 | SpellDetail flyout panel | ✅ |
| P2-07 | Real-time search and filtering | ✅ |

### Phase 3: Character Management (Week 5-6)

| Task | Description | Status |
|------|-------------|--------|
| P3-01 | CharacterSheet page layout | ✅ |
| P3-02 | CharacterSetup page | ✅ |
| P3-03 | ClassSelector component | ✅ |
| P3-04 | SpellSlots component | ✅ |
| P3-05 | ConcentrationIndicator component | ✅ |
| P3-06 | PreparedSpells component | ✅ |
| P3-07 | Prepare Spells modal | ✅ |

### Phase 4: Dice Rolling & Polish (Week 7-8)

| Task | Description | Status |
|------|-------------|--------|
| P4-01 | DiceRoller component | 📋 |
| P4-02 | Dice roll animation | 📋 |
| P4-03 | Roll result display | 📋 |
| P4-04 | Theme switching (dark/light) | 📋 |
| P4-05 | Responsive design (mobile) | 📋 |
| P4-06 | Performance optimization | 📋 |
| P4-07 | Testing (unit, integration) | ✅ |

---

## 11. Performance Considerations

### 11.1 Bundle Size Optimization

| Strategy | Implementation |
|----------|----------------|
| Code splitting | React.lazy() for route-based splitting |
| Tree shaking | ES modules, side-effect free imports |
| Dynamic imports | Lazy load spell data, open20-core modules |
| Asset optimization | Optimize images, use SVG icons |

### 11.2 Runtime Performance

| Strategy | Implementation |
|----------|----------------|
| Memoization | React.memo() for SpellCard, useMemo for filters |
| Virtual scrolling | For large spell lists (100+ spells) |
| Debounced search | 200ms debounce on search input |
| Immutable updates | Leverage open20-core's immutable patterns |

---

## 12. Testing Strategy

### 12.1 Unit Tests

```typescript
// tests/unit/spell-service.test.ts
import { describe, it, expect } from 'vitest';
import { SpellService } from '../../src/core/spell-service';

describe('SpellService', () => {
  it('should get spell by id', () => {
    const spell = SpellService.getSpell('fire-bolt');
    expect(spell).toBeDefined();
    expect(spell?.name).toBe('Fire Bolt');
  });

  it('should search spells by level', () => {
    const spells = SpellService.searchSpells({ level: [1] });
    expect(spells.length).toBeGreaterThan(0);
    spells.forEach(spell => {
      expect(spell.level).toBe(1);
    });
  });
});
```

### 12.2 Integration Tests

```typescript
// tests/integration/character-flow.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from '../../src/App';
import { CharacterService } from '../../src/core/character-service';

describe('Character Flow', () => {
  it('should create character and display sheet', async () => {
    render(<App />);
    
    // Navigate to character setup
    fireEvent.click(screen.getByText('Create Character'));
    
    // Fill in character details
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Gandalf' }
    });
    
    // Submit form
    fireEvent.click(screen.getByText('Create Character'));
    
    // Verify character sheet displayed
    expect(screen.getByText('Gandalf')).toBeInTheDocument();
  });
});
```

---

## 13. Accessibility

### 13.1 Accessibility Checklist

| Feature | Implementation |
|---------|----------------|
| Keyboard navigation | Tab order, focus management |
| Screen reader support | ARIA labels, roles, states |
| Color contrast | WCAG AA compliance (4.5:1) |
| Touch targets | Minimum 44px for interactive elements |
| Reduced motion | Disable animations when preferred |

---

## 14. Deployment

### 14.1 Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

### 14.2 Deployment Targets

| Platform | Configuration |
|----------|--------------|
| Static hosting (Vercel/Netlify) | `dist/` folder, SPA fallback |
| GitHub Pages | `dist/` folder, `.nojekyll` |
| PWA | Service worker, offline support |

---

## 15. Appendices

### 15.1 Design Tokens Mapping

```css
/* src/styles/tokens.css */

:root {
  /* Primary — Arcane Purple */
  --color-primary-50: #EEEDFE;
  --color-primary-100: #CECBF6;
  --color-primary-400: #7F77DD;
  --color-primary-600: #534AB7;
  --color-primary-800: #3C3489;

  /* Neutral — Stone Gray */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F5F5F0;
  --color-bg-tertiary: #ECEAE3;
  --color-text-primary: #2C2C2A;
  --color-text-secondary: #5F5E5A;
  --color-border: #D3D1C7;

  /* Semantic — Spell Schools */
  --color-school-abjuration: #378ADD;
  --color-school-evocation: #D85A30;
  /* ... etc */

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}

[data-theme='dark'] {
  --color-bg-primary: #1A1A1E;
  --color-bg-secondary: #242428;
  --color-text-primary: #F1EFE8;
  /* ... dark theme overrides */
}
```

### 15.2 Open20-Core API Reference

| Function | Module | Description |
|----------|--------|-------------|
| `createCharacter()` | `@open20-core/character` | Create new character |
| `prepareSpell()` | `@open20-core/character` | Mark spell as prepared |
| `consumeSpellSlot()` | `@open20-core/character` | Consume a spell slot |
| `longRest()` | `@open20-core/character` | Full resource recovery |
| `getSpell()` | `@open20-core/spells` | Get spell by ID |
| `searchSpells()` | `@open20-core/spells` | Search/filter spells |
| `calculateSpellSlots()` | `@open20-core/engine` | Calculate available slots |
| `getModifier()` | `@open20-core/engine` | Calculate ability modifier |

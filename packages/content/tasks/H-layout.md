# Task H: Layout & Routing

**Phase**: 2 (Rulebook UI)  
**Depends On**: Task G (Rulebook Scaffold)  
**Estimated Effort**: Medium  
**Target Package**: `@open20/rulebook`

---

## Objective

Implement `RulebookLayout` component with sidebar navigation, top bar, and React Router setup.

---

## Prerequisites

- [ ] Task G complete (`@open20/rulebook` package scaffold ready)
- [ ] `@open20/ui` components available (Button, Card, Input, etc.)

---

## Steps

### 1. Create Zustand Stores

Create `src/stores/packStore.ts`:

```typescript
import { create } from 'zustand';
import type { ContentPackMeta } from 'open20-core';

interface PackStore {
  packs: ContentPackMeta[];
  loading: boolean;
  error: string | null;
  fetchPacks: () => Promise<void>;
  addPack: (pack: ContentPackMeta) => void;
  removePack: (id: string) => void;
}

export const usePackStore = create<PackStore>((set) => ({
  packs: [],
  loading: false,
  error: null,
  fetchPacks: async () => {
    set({ loading: true, error: null });
    try {
      // TODO: call ContentPackManager.listPacks()
      set({ loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },
  addPack: (pack) => set((state) => ({ packs: [...state.packs, pack] })),
  removePack: (id) => set((state) => ({ packs: state.packs.filter((p) => p.id !== id) })),
}));
```

Create `src/stores/browserStore.ts`:

```typescript
import { create } from 'zustand';

interface BrowserStore {
  filters: {
    name?: string;
    level?: number;
    levelRange?: { min: number; max: number };
    school?: string;
    classes?: string[];
    source?: string;
  };
  setFilter: (key: string, value: unknown) => void;
  clearFilters: () => void;
}

export const useBrowserStore = create<BrowserStore>((set) => ({
  filters: {},
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  clearFilters: () => set({ filters: {} }),
}));
```

### 2. Implement Sidebar Component

Create `src/components/Sidebar.tsx`:

```typescript
import { NavLink } from 'react-router-dom';
import { usePackStore } from '../stores/packStore';

export function Sidebar() {
  const packs = usePackStore((state) => state.packs);
  const recentPacks = packs.slice(0, 5); // Top 5 recent packs

  return (
    <aside className="w-60 h-screen bg-surface-secondary border-r border-border flex flex-col">
      <div className="p-4">
        <h1 className="text-xl font-bold">Rulebook</h1>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <NavLink to="/rulebook" className="block p-3 hover:bg-muted">
          📦 Packs
        </NavLink>
        <NavLink to="/rulebook/browse" className="block p-3 hover:bg-muted">
          🔍 Browse
        </NavLink>
        {recentPacks.length > 0 && (
          <>
            <hr className="my-2" />
            <p className="px-3 text-sm text-muted-foreground">RECENT PACKS</p>
            {recentPacks.map((pack) => (
              <NavLink
                key={pack.id}
                to={`/rulebook/packs/${pack.id}`}
                className="block p-2 text-sm hover:bg-muted"
              >
                📄 {pack.name}
              </NavLink>
            ))}
          </>
        )}
      </nav>
      <div className="p-4 border-t border-border">
        <p className="text-sm text-muted-foreground">New to Rulebook?</p>
        <button className="text-sm text-primary hover:underline">Quick Start Guide</button>
      </div>
    </aside>
  );
}
```

### 3. Implement TopBar Component

Create `src/components/TopBar.tsx`:

```typescript
import { useLocation } from 'react-router-dom';

export function TopBar() {
  const location = useLocation();
  const breadcrumb = location.pathname.split('/').filter(Boolean).join(' > ');

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4">
      <div className="text-sm text-muted-foreground">{breadcrumb}</div>
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-muted rounded-md">🔍</button>
        <button className="p-2 hover:bg-muted rounded-md">⚙️</button>
      </div>
    </header>
  );
}
```

### 4. Implement RulebookLayout

Create `src/components/RulebookLayout.tsx`:

```typescript
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function RulebookLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

### 5. Configure React Router

Update `src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RulebookLayout } from './components/RulebookLayout';
import { PackList } from './pages/PackList';
import { PackDetail } from './pages/PackDetail';
import { ContentEditor } from './pages/ContentEditor';
import { ContentBrowser } from './pages/ContentBrowser';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RulebookLayout />}>
          <Route path="/rulebook" element={<PackList />} />
          <Route path="/rulebook/packs/:id" element={<PackDetail />} />
          <Route path="/rulebook/editor/:packId/:contentType/:contentId?" element={<ContentEditor />} />
          <Route path="/rulebook/browse" element={<ContentBrowser />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### 6. Create Placeholder Pages

Create `src/pages/PackList.tsx`:

```typescript
export function PackList() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Content Packs</h1>
      <p>Placeholder - will implement in Task I</p>
    </div>
  );
}
```

Create similar placeholder pages for `PackDetail.tsx`, `ContentEditor.tsx`, `ContentBrowser.tsx`.

### 7. Update `src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Acceptance Criteria

- [ ] `RulebookLayout` renders with sidebar + topbar + main content area
- [ ] Sidebar shows "Packs" and "Browse" navigation links
- [ ] Sidebar shows "RECENT PACKS" section (empty state OK)
- [ ] TopBar shows breadcrumb based on current route
- [ ] React Router works (clicking nav links changes page)
- [ ] All placeholder pages render correctly
- [ ] TypeScript compiles without errors
- [ ] ESLint passes

---

## Next Task

Proceed to **Task I** (PackList Page) after this task completes.

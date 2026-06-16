# Task G: Rulebook Package Scaffold

**Phase**: 2 (Rulebook UI)  
**Depends On**: None (first task of Phase 2)  
**Estimated Effort**: Medium  
**Target Package**: `@open20/rulebook`

---

## Objective

Create the `@open20/rulebook` package scaffold with modern web stack: React + TypeScript + Vite + Tailwind CSS + shadcn/ui.

---

## Prerequisites

- [ ] Phase 1 complete (`@open20/content` v0.1.0 implemented)
- [ ] `pnpm install` completed (workspace dependencies linked)

---

## Steps

### 1. Create Package Directory Structure

```bash
cd /home/mqli/open20/packages
mkdir rulebook
cd rulebook
```

### 2. Initialize with Vite (React + TypeScript)

```bash
npm create vite@5 rulebook -- --template react-ts
```

### 3. Install Dependencies

```bash
cd /home/mqli/open20/packages/rulebook
pnpm install
pnpm add react react-dom react-router-dom zustand
pnpm add -D typescript @types/react @types/react-dom vite @vitejs/plugin-react
pnpm add -D tailwindcss postcss autoprefixer
pnpm add -D eslint typescript-eslint
```

### 4. Configure Tailwind CSS

Create `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#3B82F6',
        },
        surface: {
          primary: '#FFFFFF',
          secondary: '#F9FAFB',
          elevated: '#FFFFFF',
        },
        dark: {
          primary: '#1E293B',
          secondary: '#0F172A',
          elevated: '#334155',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

Create `postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Update `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 217.2 91.2% 59.8%;
  }
}
```

### 5. Update `package.json`

```json
{
  "name": "@open20/rulebook",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "zustand": "^5.0.0",
    "@open20/content": "workspace:*",
    "@open20/ui": "workspace:*",
    "open20-core": "workspace:*"
  },
  "devDependencies": {
    "@open20/config": "workspace:*",
    "typescript": "catalog:",
    "vite": "catalog:",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.5.0",
    "autoprefixer": "^10.4.20",
    "eslint": "catalog:",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0"
  }
}
```

### 6. Configure `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "verbatimModuleSyntax": false,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 7. Update `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
```

### 8. Add to Monorepo

Update `/home/mqli/open20/pnpm-workspace.yaml` (if not already including `packages/*`):

```yaml
packages:
  - 'packages/*'
```

Run `pnpm install` from root to link workspace dependencies.

### 9. Initialize shadcn/ui

```bash
cd /home/mqli/open20/packages/rulebook
npx shadcn-ui@latest init
```

Select:

- Style: Default
- Base color: Slate
- CSS variables: Yes
- Tailwind config: `tailwind.config.ts`
- Components path: `@/components/ui`

### 10. Create Initial Directory Structure

```
packages/rulebook/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   └── ui/         # shadcn components
│   ├── pages/
│   ├── stores/
│   ├── hooks/
│   └── utils/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
└── eslint.config.js
```

---

## Acceptance Criteria

- [ ] `@open20/rulebook` package created
- [ ] `pnpm install` completes without errors
- [ ] `pnpm --filter @open20/rulebook dev` starts dev server
- [ ] shadcn/ui initialized with default style
- [ ] Tailwind CSS configured with custom colors
- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] ESLint passes (`pnpm lint`)

---

## Next Task

Proceed to **Task H** (Layout & Routing) after this task completes.

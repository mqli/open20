## 2. Technology Stack

### 2.1 Frontend Stack

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.20.0",
    "open20-core": "^1.0.0",
    "zustand": "^4.5.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.0",
    "@radix-ui/react-slider": "^1.2.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "lucide-react": "^0.400.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.0",
    "eslint": "^8.57.0",
    "prettier": "^3.3.0",
    "vitest": "^1.6.0",
    "@testing-library/react": "^14.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### 2.2 Development Environment

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ | Runtime |
| npm | 10+ | Package manager |
| Vite | 5+ | Dev server, build |
| TypeScript | 5.4+ | Type checking |
| ESLint | 8+ | Code quality |
| Prettier | 3+ | Code formatting |

### 2.3 Radix UI Usage Patterns

Radix UI provides unstyled, accessible primitives. Style them using Tailwind CSS classes.

| Component | Radix Primitive | Usage |
|-----------|-----------------|-------|
| Dialog (Modal/Flyout) | `@radix-ui/react-dialog` | Spell detail flyout, prepare spells modal |
| Tabs | `@radix-ui/react-tabs` | Level tabs, character sheet sections |
| Tooltip | `@radix-ui/react-tooltip` | Spell component info, roll results |
| Dropdown Menu | `@radix-ui/react-dropdown-menu` | Filter dropdowns, class selection |
| Slider | `@radix-ui/react-slider` | Ability score input |
| Switch | `@radix-ui/react-switch` | Theme toggle, filter toggles |

### 2.4 UI Component Library (Wrapped Radix)

To avoid repeating Radix UI boilerplate across the app, create a small UI library that wraps Radix primitives with custom styling and sensible defaults.

**Location**: `src/components/ui/`

| Wrapped Component | Radix Primitive | Purpose |
|-------------------|-----------------|---------|
| `Dialog` | `@radix-ui/react-dialog` | Modal dialogs, flyouts |
| `DropdownMenu` | `@radix-ui/react-dropdown-menu` | Dropdown menus, select inputs |
| `Tabs` | `@radix-ui/react-tabs` | Tab navigation |
| `Tooltip` | `@radix-ui/react-tooltip` | Hover tooltips |
| `Slider` | `@radix-ui/react-slider` | Range inputs |
| `Switch` | `@radix-ui/react-switch` | Toggle switches |
| `Badge` | Custom | Status badges, labels |
| `Button` | Custom | Button variants |
| `Input` | Custom | Form inputs |
| `Select` | `@radix-ui/react-select` | Select dropdowns |

#### Example - Wrapped Dialog Component

```typescript
// src/components/ui/Dialog.tsx
import * as RadixDialog from '@radix-ui/react-dialog';
import { cn } from '../../utils/helpers';
import type { ComponentPropsWithoutRef } from 'react';

export const Dialog = {
  Root: RadixDialog.Root,
  Trigger: RadixDialog.Trigger,
  
  Content: ({ className, children, ...props }: RadixDialog.DialogContentProps) => (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-fade-in" />
      <RadixDialog.Content
        className={cn(
          'fixed z-50 bg-slate-800 rounded-lg shadow-xl',
          'p-6 max-h-[85vh] overflow-y-auto',
          'data-[state=open]:animate-slide-in-right',
          className
        )}
        {...props}
      >
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  ),
  
  Header: ({ className, children, ...props }: ComponentPropsWithoutRef<'div'>) => (
    <div className={cn('mb-4 pb-4 border-b border-slate-700', className)} {...props}>
      {children}
    </div>
  ),
  
  Title: ({ className, ...props }: RadixDialog.DialogTitleProps) => (
    <RadixDialog.Title
      className={cn('text-xl font-bold text-slate-100', className)}
      {...props}
    />
  ),
  
  Description: ({ className, ...props }: RadixDialog.DialogDescriptionProps) => (
    <RadixDialog.Description
      className={cn('text-sm text-slate-400 mt-1', className)}
      {...props}
    />
  ),
  
  Close: ({ className, children, ...props }: RadixDialog.DialogCloseProps) => (
    <RadixDialog.Close
      className={cn(
        'absolute top-4 right-4 p-1 rounded hover:bg-slate-700',
        'text-slate-400 hover:text-slate-100 transition-colors',
        className
      )}
      {...props}
    >
      {children || '×'}
    </RadixDialog.Close>
  ),
};
```

#### Example - Wrapped Button Component

```typescript
// src/components/ui/Button.tsx
import { cn } from '../../utils/helpers';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-purple-600 hover:bg-purple-700 text-white',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
  ghost: 'hover:bg-slate-700 text-slate-300 hover:text-slate-100',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded font-medium transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

#### Example - Wrapped Tabs Component

```typescript
// src/components/ui/Tabs.tsx
import * as RadixTabs from '@radix-ui/react-tabs';
import { cn } from '../../utils/helpers';

export const Tabs = {
  Root: RadixTabs.Root,
  List: ({ className, ...props }: RadixTabs.TabsListProps) => (
    <RadixTabs.List
      className={cn(
        'flex border-b border-slate-700',
        className
      )}
      {...props}
    />
  ),
  Trigger: ({ className, ...props }: RadixTabs.TabsTriggerProps) => (
    <RadixTabs.Trigger
      className={cn(
        'px-4 py-2 -mb-[1px] border-b-2 border-transparent',
        'text-slate-400 hover:text-slate-200',
        'data-[state=active]:border-purple-500 data-[state=active]:text-purple-400',
        'transition-colors',
        className
      )}
      {...props}
    />
  ),
  Content: ({ className, ...props }: RadixTabs.TabsContentProps) => (
    <RadixTabs.Content
      className={cn('outline-none', className)}
      {...props}
    />
  ),
};
```

#### Usage in App Components

```typescript
// src/components/spell-library/SpellDetail.tsx
import { Dialog } from '../ui/Dialog';  // Wrapped component
import type { Spell } from 'open20-core';

export function SpellDetail({ spell, onClose }: SpellDetailProps) {
  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content className="w-[500px]">
        <Dialog.Header>
          <Dialog.Title>{spell.name}</Dialog.Title>
          <Dialog.Close />
        </Dialog.Header>
        
        <div className="spell-meta">
          <Badge variant="purple">{spell.school}</Badge>
          <Badge variant="slate">{spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}</Badge>
        </div>
        
        {/* Spell details... */}
      </Dialog.Content>
    </Dialog.Root>
  );
}
```

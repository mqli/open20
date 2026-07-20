import { useState } from 'react';
import { Button } from '@open20/ui';
import { Sword, Dices } from 'lucide-react';

export function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-[#1A1A1E] text-[#F1EFE8] flex flex-col items-center justify-center gap-6 p-8">
      <div className="flex items-center gap-3">
        <Sword className="w-10 h-10 text-[#7F77DD]" />
        <h1 className="text-3xl font-bold">Open20 Character Sheet</h1>
      </div>
      <p className="text-[#B4B2A9] text-lg max-w-md text-center">
        D&D 2024 Character Sheet — track HP, abilities, skills, spells, equipment, and more.
      </p>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => setCount((c) => c + 1)}>
          <Dices className="w-4 h-4 mr-2" />
          Click me: {count}
        </Button>
      </div>
      <p className="text-[#888780] text-sm">
        Edit <code className="text-[#CECBF6]">src/App.tsx</code> to get started.
      </p>
    </div>
  );
}

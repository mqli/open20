import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useSpellStore } from '@/stores/spell-store';
import { Input, Button } from '@open20/ui';
import { useTranslation } from '@/i18n';

export function SearchBar() {
  const t = useTranslation();
  const { searchQuery, setSearchQuery } = useSpellStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 200);
    return () => clearTimeout(handler);
  }, [localQuery, setSearchQuery]);

  useEffect(() => {
    if (searchQuery !== localQuery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalQuery(searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  return (
    <div className="relative flex items-center w-full">
      <Search className="absolute left-3 w-4 h-4 text-text-tertiary" />
      <Input
        type="text"
        data-testid="search-input"
        placeholder={t('searchSpells')}
        className="pl-9 pr-9 spell-search-input"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
      />
      {localQuery && (
        <Button
          variant="ghost"
          onClick={() => setLocalQuery('')}
          className="absolute right-3 p-1 rounded-full text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary focus:outline-none"
          aria-label={t('clearSearch')}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

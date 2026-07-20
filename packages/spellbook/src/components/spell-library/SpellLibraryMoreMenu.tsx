import { Button, DropdownMenu } from '@open20/ui';
import { useTranslation, useI18n } from '@/i18n';
import { useUIStore } from '@/stores/uiStore';
import { useCustomSpellStore } from '@/stores/customSpellStore';
import { exportCustomSpells } from '@/components/spell/import-export-utils';
import { storageService } from '@/core/storage-service';
import {
  Sparkles,
  Settings,
  MoreHorizontal,
  Globe,
  Sun,
  Moon,
  Download,
  Upload,
  User,
  UserPlus,
} from 'lucide-react';

export interface SpellLibraryMoreMenuProps {
  onOpenCreateSpell: () => void;
  onOpenClassManager: () => void;
  onOpenImportDialog: () => void;
  /** Export the active character with its custom spells/subclasses */
  onExportCharacter?: () => void;
  /** Open the character import dialog */
  onOpenCharacterImportDialog?: () => void;
  /** Whether the active character exists (controls disabled state) */
  hasActiveCharacter?: boolean;
}

export function SpellLibraryMoreMenu({
  onOpenCreateSpell,
  onOpenClassManager,
  onOpenImportDialog,
  onExportCharacter,
  onOpenCharacterImportDialog,
  hasActiveCharacter = false,
}: SpellLibraryMoreMenuProps) {
  const t = useTranslation();
  const { locale, setLocale } = useI18n();
  const { theme, setTheme } = useUIStore();
  const { spells: customSpells } = useCustomSpellStore();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0"
          data-testid="toolbar-more-btn"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content sideOffset={4} align="end">
        <DropdownMenu.Item onSelect={onOpenCreateSpell}>
          <Sparkles className="w-4 h-4 mr-2" />
          {t('createCustomSpell')}
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={onOpenClassManager}>
          <Settings className="w-4 h-4 mr-2" />
          {t('manageCustomClasses')}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          disabled={customSpells.length === 0}
          onSelect={() => exportCustomSpells(customSpells)}
        >
          <Download className="w-4 h-4 mr-2" />
          {t('exportCustomSpells')}
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={onOpenImportDialog}>
          <Upload className="w-4 h-4 mr-2" />
          {t('importCustomSpells')}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          disabled={!hasActiveCharacter}
          onSelect={onExportCharacter}
          className="menu-export-character"
        >
          <User className="w-4 h-4 mr-2" />
          {t('exportCharacter')}
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={onOpenCharacterImportDialog} className="menu-import-character">
          <UserPlus className="w-4 h-4 mr-2" />
          {t('importCharacter')}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onSelect={() => {
            const next = locale === 'en' ? 'zh-CN' : 'en';
            setLocale(next);
            storageService.savePreferences({ language: next });
          }}
        >
          <Globe className="w-4 h-4 mr-2" />
          {t('language')}: {locale === 'en' ? 'English' : '中文'}
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
          {t('theme')}: {theme === 'light' ? 'Light' : 'Dark'}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onSelect={() => window.open('https://x.com/open20dnd', '_blank', 'noopener,noreferrer')}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          @open20dnd
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

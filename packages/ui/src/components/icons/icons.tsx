import {
  BookMarked,
  Book,
  Star,
  Brain,
  BookOpen,
  Flame,
  Sparkles,
  Swords,
  Heart,
  Shield,
  Crosshair,
  Hand,
  MessageSquare,
  Package,
  SquarePen,
  Eraser,
} from 'lucide-react';
import { createDndIcon } from './create-icon';

// ── Spell Domain ─────────────────────────────────────────────────
export const LearnSpellIcon = createDndIcon(SquarePen);
export const UnLearnSpellIcon = createDndIcon(Eraser);
export const PrepareSpellIcon = createDndIcon(Book);
export const PreparedSpellIcon = createDndIcon(BookMarked);
export const KnownSpellIcon = createDndIcon(Star);
export const ConcentrationIcon = createDndIcon(Brain);
export const RitualIcon = createDndIcon(BookOpen);
export const SpellSlotIcon = createDndIcon(Flame);
export const MagicIcon = createDndIcon(Sparkles);

// ── Combat Domain ────────────────────────────────────────────────

export const AttackIcon = createDndIcon(Swords);
export const HealIcon = createDndIcon(Heart);
export const DefenseIcon = createDndIcon(Shield);
export const RangeIcon = createDndIcon(Crosshair);
export const DamageIcon = createDndIcon(Flame);

// ── Spell Components ─────────────────────────────────────────────

export const VerbalIcon = createDndIcon(MessageSquare);
export const SomaticIcon = createDndIcon(Hand);
export const MaterialIcon = createDndIcon(Package);

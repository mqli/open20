# Phase 1 — P0 Character Sheet UI

The core MVP. One component (with `index.ts` + test) per task. Components are **presentational**: they receive derived values as props from `characterStore` and emit callbacks; the store + rollAdapter do all core calls. Read [`README.md`](./README.md) §1 first.

**Shared conventions (apply to every task):**

- `@open20/ui` primitives (`Surface/CardSurface/Text/Badge/Button/IconButton`), `cn()`, real tokens (README §2.4), typography via `Text` variants, spacing via Tailwind. Icons from `lucide-react` — **never emoji** (wireframe emoji are placeholders).
- **NFR-01** color + redundant cue; **NFR-02** ≥44×44px targets, keyboard operable, `focus-visible:ring-2 ring-primary-600`, `aria-label` on icon-only buttons.
- Read derived values from the stored character; roll via `rollAdapter`.
- Tests: Testing Library, user-perspective, using `makeCharacter()` (T-009).
- **All tasks depend on T-004 (shell), T-005 (resolver), T-006 (rollAdapter), T-008 (store), T-009 (fixtures)** unless noted; extra deps called out. Store mutation actions listed with a task are added to `characterStore` as part of that task via `applyMutation`.
- **Wire after build:** each component is wired into the `CharacterSheet` shell immediately after its component + tests pass. The sheet is assembled incrementally — no task leaves a component unwired. T-127 handles final accordion/layout polish, not initial wiring.

Components T-101–T-126 are mutually independent for the **build and test** phase (parallelizable). After it passes, wire it into the shell before marking the task complete. **T-127 (accordion polish) and T-128 (states) come last.**

---

### T-101 — HpBar (FR-100~102) — §5.2

Current/max fill (`--color-success`; `--color-danger` <25%), temp-HP overlay band (`--color-info`), `34 / 45` + `+N Temp`, quick-adjust row `[-10 -5 -1 +1 +5 +10]`, long-press/`…` custom-value input (FR-101). 24px bar; reduced-motion disables fill anim. **Store:** `modifyHP(delta)`, `setTemporaryHP(v)` (reference pair already in T-008 — reuse). **Accept:** adjust replaces snapshot + persists; temp distinct. **Tests:** buttons call `modifyHP` with delta; temp render; danger threshold.

### T-102 — DeathSavesTracker (FR-103) — §5.3

**Depends on:** T-011 · 3 success + 3 failure toggles, 32px, **bold filled shape glyphs** (CSS/SVG, not thin Unicode — NFR-01), auto-stable at 3✓. **Store:** `toggleDeathSave(kind,index)`. Also signal concentration CON-save when HP reduced while concentrating (expose `lastDamageForConcentration` on store — consumed by T-117). **Accept:** toggles; auto-stable; HP 0→+ clears (via T-011). **Tests:** toggle; auto-stable; glyph present.

### T-103 — Ability Scores (card + grid) (FR-104~105) — §5.4

**Depends on:** T-013 · `AbilityScoreCard` (label, score, modifier badge — `--color-primary-600`/`--color-danger`/secondary) + `AbilityScoresGrid` (6-col desktop, 3×2+1 mobile). Tap → `rollAdapter.rollAbility(character,ability)`. Use total score incl. bonuses. **Accept:** 6 scores+mods; tap rolls correct ability. **Tests:** modifier formatting (neg/zero); tap → `rollAbility`.

### T-104 — SkillRow (FR-107~108) — §5.5

Single skill row: proficiency mark (○/▣/★ **icon**, NFR-01), name, right-aligned bold bonus, roll `IconButton` (`aria-label="Roll {skill}"`). Tap → `rollAdapter.rollSkill`. Read bonus + proficiency/expertise from `SkillEntry` (call `getSkillBonus` in a selector only if not precomputed — verify). **Accept:** renders the three proficiency states + bonus; tap rolls. **Tests:** icon per state; roll callback with `SkillName`.

### T-105 — SkillsList (FR-107) — §6.3 — ⏳ partial (renders grouped by ability, missing search/filter)

**Depends on:** T-104 · Composes 18 `SkillRow`s grouped by ability (dividers via `SectionHeader`/`Divider`), filter `Input` at top, legend. **Accept:** 18 skills, correct grouping, filter narrows. **Tests:** grouping; filter.

### T-106 — SavingThrows (card + grid) (FR-109~110) — §6.4 — ✅ done

`SavingThrowCard` (bonus + roll button, proficient = `--color-primary-600` border + non-color cue) + grid (ability-scores pattern). Tap → `rollAdapter.rollSave` (supplies `getClass`). **Accept:** 6 saves, proficiency non-color-only, tap rolls. **Tests:** proficiency indicator; roll per ability.

### T-107 — CombatStatCard (FR-111~115) — §6.5 — ✅ done

Single stat card: icon + label + value (`Text` variants). Optional `onTap` for rollable stats. **Accept:** renders icon/label/value; tap fires when provided. **Tests:** render + tap.

### T-108 — CombatStatsBar (FR-111~115) — §6.5 — ✅ done

**Depends on:** T-107 · Compose AC / Initiative (tap → `rollAdapter.rollInitiative`) / Speed / PP / PB cards from `character.combatStats` (do **not** call `calculateAC`). Desktop row; mobile 2×2. Leave an Inspiration slot (filled by T-219). **Accept:** values from stored combatStats; initiative taps roll. **Tests:** values render; initiative tap → adapter.

### T-109 — WeaponAttackCard (FR-116) — §6.6

**Depends on:** T-012 · Card for one `CharacterAttack`: name, attack-bonus badge (`--color-primary-600`), damage dice+type, properties, weapon-type icon, roll `IconButton`. **Accept:** renders bonus/damage/type/properties. **Tests:** render fields; roll callback fires.

### T-110 — WeaponAttacksList + dual-roll (FR-116~117) — §5.1, §6.6

**Depends on:** T-109, T-012, T-010 · List `character.combatStats.attacks`; roll → `rollAdapter.rollWeaponAttack` (adapter→Weapon, attack+damage, weapon-mode overlay; crit doubles). "+ Add Weapon" stub (opens T-203 when present). **Accept:** tap → single overlay w/ attack+damage rows. **Tests:** dual-roll callback; `isCritical` propagated.

### T-111 — SpeciesPanel (traits) (FR-118~119) — §6.7 — ✅ done

**Depends on:** T-005 · Species name+subtype (resolved) + traits from resolved species data as expandable cards (collapsed mobile, expanded desktop). Senses/languages/size slot left for T-215. **Accept:** name + traits resolve; expand toggles; fallback for unknown ID. **Tests:** resolved render; expand; fallback.

### T-112 — BackgroundPanel (FR-120) — §6.7 — ✅ done

**Depends on:** T-005 · Background name + feature (resolved). **Accept:** resolves name+feature; fallback. **Tests:** render; fallback.

### T-113 — Feats (FeatCard + list) (FR-121) — §6.7 — ✅ done

**Depends on:** T-005 · `character.feats` → cards expandable to description + granted benefits (resolve via `getFeatName` + feat data). Reuse ui `FeatCard` if props fit, else local. **Accept:** feats render; expand shows description; unknown → humanized. **Tests:** render; expand; fallback.

### T-114 — SpellcastingHeader (FR-152) — §6.12 — ✅ done

Spell DC + attack bonus side-by-side (`--color-primary-600`), from `ClassSpellData.spellSaveDC` + `getSpellAttackBonusForClass`/`getBestSpellAttackBonus` (best for MVP multiclass). **Accept:** DC + attack shown from character. **Tests:** values render.

### T-115 — SpellSlotRow (FR-153) — §5.6 — ✅ done

Reuse ui `SlotPips` (`total`,`used`), **read-only** (no manual toggle). Cantrip row = ∞; levels 1–9 remaining/max. **Accept:** pips reflect used/max; read-only. **Tests:** pip counts from character.

### T-116 — PreparedSpellList + cast (FR-154, FR-156) — §6.12

**Depends on:** T-010, T-005 · Prepared spells (resolved names) w/ level badge + roll button; Prepared/Known toggle; "+ Prepare More Spells" stub (T-217). Tap spell → **Store `castSpell`** → core `castSpell(char,spell,slotLevel)` (consumes slot) → `rollAdapter.rollSpellCast` overlay (attack/damage/heal). `success===false` → toast, no roll. **Accept:** cast consumes slot + rolls; no-slot blocked gracefully. **Tests:** cast success consumes + overlay; failure shows message, no consume.

### T-117 — ConcentrationBanner + CON save (FR-131) — §6.10

**Depends on:** T-102 (damage signal), T-005 · Amber banner when `character.concentration` set: resolved spell name (**prop-injected**, don't call a service inside), dismiss → **Store `endConcentration`**; also `startConcentration`. On damage-while-concentrating: show `DC {max(10,⌊½dmg⌋)} CON save` + `[Roll CON Save]` → `rollAdapter.rollSave('CON')`; auto-end on fail is manual. `calcConcentrationDC(dmg)` helper. **Accept:** banner from state; prompt w/ correct DC; roll opens overlay. **Tests:** visibility; `calcConcentrationDC` (8→10, 30→15); roll callback.

### T-118 — RestActions + LongRestDialog (FR-138~139) — §6.13, §7.3 — ✅ done

**Depends on:** T-005 · Two full-width buttons. Long Rest → confirm dialog (§7.3 checklist) → **Store `longRest(char,deps)`**. Short Rest → simple total-HD prompt (rich per-class selector is T-206) → **Store `shortRest(char,total,deps,restRng)`** using the **rest RNG `{d(max)}`** shape (README §2.1). **Accept:** rests apply + persist; correct rng shape. **Tests:** store actions call core w/ deps + rng shape.

### T-119 — CharacterSelector (FR-143) — §7.1 — ✅ done

**Depends on:** T-005 · List saved characters (resolved name + `Lvl N Class`, HP/AC/PP), active highlighted (`--color-primary-600` left border), Edit per card, `+ New`. **Store:** `setActiveCharacter`. **Accept:** lists + highlights active; switch works. **Tests:** highlight active; select callback.

### T-120 — CharacterCreateWizard (FR-144) — §7.4 — ✅ done

**Depends on:** T-005 · Multi-step: (1) name/species/background/alignment, (2) class(es)+level (multiclass add), (3) ability scores w/ method toggle **Point Buy / Standard Array / Manual** (point-buy budget = 27). Finish → `buildDepsForCreate` → **Store `createCharacter`** (core `createCharacter` + `recomputeDerivedStats`) → persist + set active. **Accept:** produces valid recomputed persisted active character; point-buy enforced. **Tests:** create calls core w/ deps + persists; point-buy validation.

**Deviations:**

- **Alignment omitted.** Neither core's `Character` nor `CreateCharacterParams` has an alignment field, and T-120 does not change the publishable core package. Species **subtype** (lineage) takes its place on step 1 — real SRD data, but display-only (`RecomputeDerivedStatsDeps` has no subtype slot).
- **3 steps, not the wireframe's "Step 1 of 5".** §7.4 only ever specifies three.
- **No spell selection.** The demo spell injection in the old `createNewCharacter()` is gone; wizard-created casters start with empty spell lists until the Spell Browser (T-217, §7.6) lands.
- **`buildDepsForCreate` fixed** — it accepted `subclassId` but never populated `deps.subclasses`, so subclass features and always-prepared spells were silently dropped at creation.
- **Demo factories deleted.** `createSampleCharacter` / `createMonkCharacter` are gone from `AppShell`; the empty state now opens the wizard. Point-buy tables live in the new `src/lib/point-buy.ts`.

### T-121 — CharacterEditDialog (FR-145) — §4.16

**Depends on:** T-005 · Edit any field → **Store `updateCharacter`** → `recomputeDerivedStats`. **Accept:** edits recompute + persist. **Tests:** edit recomputes derived stats.

### T-122 — DeleteConfirm (FR-146) — §7.1 ✅ done

Confirmation dialog ("Are you sure? This cannot be undone.") → **Store `deleteCharacter`**. **Accept:** confirmed delete removes + persists; cancel no-ops. **Tests:** confirm deletes; cancel no-ops.

### T-123 — HeroCard (desktop) (FR-140) — §4.1

**Depends on:** T-005 · Sidebar identity card: resolved name, `Lvl N Class`, HP + AC/Init/Speed/PP/PB (read-only). **Accept:** shows resolved identity + stats. **Tests:** render from fixture.

### T-124 — HeroStrip (mobile) (FR-141) — §4.2

**Depends on:** T-005 · Sticky compact strip: **HP + AC + PB only**; tap expands full combat overlay. **Accept:** compact strip; tap expands. **Tests:** compact render; expand toggle.

### T-125 — Sidebar + nav tabs (desktop) (FR-140, FR-142) — §4.1

**Depends on:** T-123 · Fixed 250px sidebar: HeroCard + vertical nav tabs (Combat/Abil/Skills/Spells/Equip/Feat/Notes) + rest-buttons slot + char-mgmt slot. Nav selects active section. **Accept:** nav switches section (no state mutation); sticky rest area. **Tests:** nav selection.

### T-126 — BottomTabBar + MoreMenu (mobile) (FR-141) — §4.2

56px bottom bar: Combat/Skills/Spells/More; active = `--color-primary-600`. "More" → Equipment/Features/Notes/Settings/Rest overflow. **Accept:** tab selects/scrolls to section; More opens overflow. **Tests:** tab selection; More menu.

### T-127 — Accordion + layout polish (FR-142) — §4, §6 — ✅ done

**Depends on:** T-101–T-126 · All components are already wired into the shell. This task adds accordion behavior and final layout tuning: desktop sidebar + stacked accordion main; mobile hero strip + accordion (one open at a time) + bottom tabs. Combat always visible; optional sections collapsed by default on mobile. **Accept:** full sheet usable at all breakpoints; tap-to-roll end-to-end; character switch within NFR-06 budget; offline works. **Tests:** breakpoint structure; accordion single-open mobile; end-to-end roll.

### T-128 — App states (empty / loading / error) (§10)

**Depends on:** T-127 · Empty (no character → create/import CTA), loading skeleton while `!isLoaded`, error toast for core/storage failures (never crash), reduced-motion global. **Accept:** each state renders; errors don't crash the sheet. **Tests:** empty/loading/error rendering.

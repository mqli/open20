# Agent Guidance: UI Design Tokens (@open20/ui)

Use this guide when editing tokenized styles in:

- `packages/ui/src/styles/design-tokens.ts`
- `packages/ui/src/styles/index.css`
- Any UI component consuming those tokens.

## Goal

Keep design tokens consistent, semantic, and fully backed by theme variables so classes compile and render correctly in light and dark themes.

## Repository Context

- Theme source of truth: `packages/ui/src/styles/index.css` (`@theme` + dark overrides).
- Variant/class source of truth: `packages/ui/src/styles/design-tokens.ts`.
- Components should consume tokens through `cva` + `cn`, not inline class maps.

## Hard Rules

1. Token/theme parity is mandatory.

- If `design-tokens.ts` uses `primary-700`, `primary-700` must exist in theme.
- If theme does not define a shade/token, do not reference it.

2. Prefer semantic tokens over raw palette utilities in shared tokens.

- Prefer `bg-danger`, `border-warning/50` over `bg-red-700`, `border-amber-600`.
- Keep shared UI tokens app-agnostic and stable.

3. Use one color-token strategy consistently.

- If theme exposes hex vars (`--color-primary-600`), use `var(--color-primary-600)` in exported token maps.
- Do not mix in `--color-*-rgb` references unless those vars are explicitly defined and maintained.

4. Preserve Radix state patterns.

- Keep and extend `data-[state=...]` and `focus-visible` styles.
- Do not remove keyboard-visible focus behavior.

5. Avoid variant API bloat.

- Do not add duplicate aliases unless needed for backward compatibility.
- If aliases exist (`slate`/`secondary`, `purple`/`primary`), document intent or deprecate deliberately.

## Tailwind/Radix/shadcn Checklist

Before finalizing changes:

- Classes in token maps are valid under Tailwind v4 scanning setup (`@source '../';`).
- Shared variants stay semantic and composable.
- Interactive states exist for hover, focus-visible, disabled, and active/on states where relevant.
- Light/dark contrast remains acceptable after color changes.
- No component-specific business logic is moved into token files.

## Change Workflow

1. Read current values in `index.css` and `design-tokens.ts`.
2. Identify mismatches (missing shades, unsupported vars, raw palette leakage).
3. Update tokens to match existing theme first (lowest risk).
4. Add new theme shades only when there is a concrete design need.
5. Run verification:

- `pnpm --filter @open20/ui typecheck`
- `pnpm --filter @open20/ui build`
- `pnpm --filter @open20/ui lint` (for broad style changes)

## Decision Guidance

- Need `primary-700`?
  - Add only if multiple components need an intermediate tone between `600` and `800`.
  - Otherwise use the existing `600` + `800` pair for default/hover.

- Need opacity variants?
  - Prefer Tailwind alpha syntax on semantic classes (`bg-primary-500/15`).
  - Introduce rgb-channel CSS vars only when dynamic alpha via CSS var is a hard requirement.

## Reporting Expectations

When done, report:

- What token/theme mismatches were fixed.
- Which files changed.
- Verification command results.
- Any optional follow-up cleanup (for example alias de-duplication).

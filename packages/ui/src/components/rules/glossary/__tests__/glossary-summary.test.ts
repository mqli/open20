import { describe, it, expect } from 'vitest';
import type { GlossaryEntry } from 'open20-core';
import { getGlossaryTooltipSummary, shouldUseFlyoutForEntry } from '../glossary-summary';

const shortEntry: GlossaryEntry = {
  id: 'advantage',
  source: 'SRD 5.2',
  name: 'Advantage',
  content: ['If you have Advantage on a D20 Test, roll two d20s.'],
};

const richEntry: GlossaryEntry = {
  id: 'blinded',
  source: 'SRD 5.2',
  name: 'Blinded',
  tag: 'Condition',
  content: ['While you have the Blinded condition, you experience the following effects.'],
  subsections: [
    {
      title: "Can't See.",
      content: ["You can't see and automatically fail any ability check that requires sight."],
    },
  ],
  seeAlso: [{ type: 'entry', id: 'advantage' }],
};

describe('glossary-summary', () => {
  it('summarizes the first useful paragraph for tooltips', () => {
    expect(getGlossaryTooltipSummary(shortEntry)).toBe(
      'If you have Advantage on a D20 Test, roll two d20s.',
    );
  });

  it('truncates long tooltip summaries', () => {
    const longEntry: GlossaryEntry = {
      ...shortEntry,
      content: ['A'.repeat(250)],
    };
    expect(getGlossaryTooltipSummary(longEntry)).toMatch(/\.\.\.$/);
    expect(getGlossaryTooltipSummary(longEntry).length).toBeLessThanOrEqual(220);
  });

  it('prefers flyout for rich glossary entries', () => {
    expect(shouldUseFlyoutForEntry(shortEntry)).toBe(false);
    expect(shouldUseFlyoutForEntry(richEntry)).toBe(true);
  });
});

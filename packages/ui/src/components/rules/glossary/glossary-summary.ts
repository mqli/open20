import type { GlossaryEntry } from 'open20-core';

const TOOLTIP_SUMMARY_MAX_LENGTH = 220;

export function getGlossaryTooltipSummary(entry: GlossaryEntry): string {
  const firstParagraph =
    entry.content.find((paragraph) => paragraph.trim().length > 1) ??
    entry.subsections?.[0]?.content.find((paragraph) => paragraph.trim().length > 1) ??
    '';

  const normalized = firstParagraph.trim();
  if (normalized.length <= TOOLTIP_SUMMARY_MAX_LENGTH) return normalized;
  return `${normalized.slice(0, TOOLTIP_SUMMARY_MAX_LENGTH - 3).trimEnd()}...`;
}

export function shouldUseFlyoutForEntry(entry: GlossaryEntry): boolean {
  const paragraphCount =
    entry.content.length +
    (entry.subsections?.reduce((count, subsection) => count + subsection.content.length, 0) ?? 0);
  const hasRichContent =
    Boolean(entry.tables?.length) ||
    Boolean(entry.relatedEntryIds?.length) ||
    Boolean(entry.seeAlso?.length) ||
    Boolean(entry.subsections?.length);

  return paragraphCount > 1 || hasRichContent;
}

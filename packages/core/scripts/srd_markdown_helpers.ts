export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function stripMarkdownHeading(line: string): string {
  return line.replace(/^#+\s*/, '').trim();
}

export function stripBold(text: string): string {
  return text.replace(/\*\*/g, '');
}

export function stripItalic(text: string): string {
  return text.replace(/\*/g, '');
}

export function parseParentheticalCommaList(text: string): string[] {
  const match = text.match(/\(([^)]+)\)/);
  if (!match) return [];
  return match[1].split(',').map(v => v.trim()).filter(Boolean);
}

export function parseMarkdownTable(lines: string[], startIndex: number): { rows: string[][]; nextIndex: number } | null {
  if (!lines[startIndex]?.trim().startsWith('|')) return null;
  const rows: string[][] = [];
  let i = startIndex;
  while (i < lines.length && lines[i].trim().startsWith('|')) {
    const trimmed = lines[i].trim();
    const cells = trimmed
      .slice(1, -1)
      .split('|')
      .map(cell => cell.trim());
    rows.push(cells);
    i += 1;
  }

  // Drop markdown separator row like |---|---|
  const contentRows = rows.filter(
    r => !r.every(cell => /^:?-{2,}:?$/.test(cell) || cell === ''),
  );
  if (contentRows.length < 2) return null;

  return { rows: contentRows, nextIndex: i };
}

export function normalizeDashValue(value: string): string {
  return value.replace(/[—–]/g, '-').trim();
}

export function parsePositiveInt(value: string): number | undefined {
  const normalized = normalizeDashValue(value);
  if (!/^\d+$/.test(normalized)) return undefined;
  return Number.parseInt(normalized, 10);
}

export function splitFeatureList(value: string): string[] {
  const normalized = normalizeDashValue(value);
  if (normalized === '-' || normalized.length === 0) return [];
  return normalized
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

export function collapseParagraphLines(lines: string[]): string {
  const out: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    out.push(trimmed);
  }
  return out.join(' ');
}

export function normalizeNameKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

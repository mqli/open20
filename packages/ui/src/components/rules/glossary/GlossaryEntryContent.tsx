import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { HTMLAttributes, ReactNode } from 'react';
import type { GlossaryEntry, GlossaryReference, GlossaryTable } from 'open20-core';
import { cn } from '@/lib/cn';
import { chipBase, sectionDivider } from '@/styles/component-styles';
import { Text } from '@/components/base/Text';
import { useTranslation } from '@/i18n';

function withClassName<P extends HTMLAttributes<HTMLElement>>(fn: (props: P) => ReactNode) {
  return fn;
}

const markdownComponents = {
  p: withClassName(({ children, className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn('mb-2 last:mb-0 text-xs text-text-secondary leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  )),
  strong: withClassName(({ children, className, ...props }: HTMLAttributes<HTMLElement>) => (
    <strong className={cn('font-semibold text-text-primary', className)} {...props}>
      {children}
    </strong>
  )),
  em: withClassName(({ children, className, ...props }: HTMLAttributes<HTMLElement>) => (
    <em className={cn('italic', className)} {...props}>
      {children}
    </em>
  )),
  ul: withClassName(({ children, className, ...props }: HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={cn('list-disc pl-4 mb-2 space-y-0.5 text-xs text-text-secondary', className)}
      {...props}
    >
      {children}
    </ul>
  )),
  ol: withClassName(({ children, className, ...props }: HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn('list-decimal pl-4 mb-2 space-y-0.5 text-xs text-text-secondary', className)}
      {...props}
    >
      {children}
    </ol>
  )),
  li: withClassName(({ children, className, ...props }: HTMLAttributes<HTMLLIElement>) => (
    <li className={cn('text-xs text-text-secondary', className)} {...props}>
      {children}
    </li>
  )),
};

function visibleParagraphs(paragraphs: readonly string[]): string[] {
  return paragraphs
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 1);
}

function GlossaryParagraphs({ paragraphs }: { paragraphs: readonly string[] }) {
  const text = visibleParagraphs(paragraphs).join('\n\n');
  if (!text) return null;

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {text}
    </ReactMarkdown>
  );
}

function GlossaryDataTable({ table }: { table: GlossaryTable }) {
  return (
    <div className="overflow-x-auto my-2">
      {table.title && (
        <Text variant="caption" as="p" className="mb-1 font-medium text-text-primary">
          {table.title}
        </Text>
      )}
      <table className="w-full text-xs text-text-secondary border-collapse">
        <thead className="bg-surface-2">
          <tr>
            {table.headers.map((header: string) => (
              <th
                key={header}
                className="border border-border px-2 py-1 text-left text-xs font-medium text-text-primary"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row: readonly string[], rowIndex: number) => (
            <tr key={rowIndex}>
              {row.map((cell: string, cellIndex: number) => (
                <td key={cellIndex} className="border border-border px-2 py-1 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatSeeAlsoReference(reference: GlossaryReference): string {
  if (reference.type === 'entry') return reference.id;
  if (reference.sections?.length) {
    return `${reference.document} (${reference.sections.join(', ')})`;
  }
  return reference.document;
}

export interface GlossaryEntryContentProps {
  entry: GlossaryEntry;
  /** Called when the user selects a linked glossary entry */
  onTermClick?: (entryId: string) => void;
  /** Map related entry ids to display labels (defaults to id) */
  resolveTermLabel?: (entryId: string) => string | undefined;
  className?: string;
}

export function GlossaryEntryContent({
  entry,
  onTermClick,
  resolveTermLabel,
  className,
}: GlossaryEntryContentProps) {
  const t = useTranslation();

  const renderTermChip = (entryId: string, label?: string) => {
    const displayLabel = label ?? resolveTermLabel?.(entryId) ?? entryId;
    if (onTermClick) {
      return (
        <button
          key={entryId}
          type="button"
          onClick={() => onTermClick(entryId)}
          className={cn(
            chipBase,
            'bg-primary-500/10 text-primary-600 dark:text-primary-300 border border-primary-500/20 hover:bg-primary-500/20 transition-colors',
          )}
        >
          {displayLabel}
        </button>
      );
    }

    return (
      <span
        key={entryId}
        className={cn(chipBase, 'bg-surface-2 text-text-secondary border border-border/60')}
      >
        {displayLabel}
      </span>
    );
  };

  return (
    <div className={cn('space-y-3', className)}>
      <GlossaryParagraphs paragraphs={entry.content} />

      {entry.subsections?.map((subsection) => (
        <div key={subsection.title} className="space-y-1">
          <Text variant="caption" as="p" className="font-semibold text-text-primary">
            {subsection.title}
          </Text>
          <GlossaryParagraphs paragraphs={subsection.content} />
        </div>
      ))}

      {entry.tables?.map((table, index) => (
        <GlossaryDataTable key={table.title ?? `table-${index}`} table={table} />
      ))}

      {entry.relatedEntryIds && entry.relatedEntryIds.length > 0 && (
        <div className={sectionDivider}>
          <Text variant="caption" as="p" className="mb-2 text-text-tertiary">
            {t('glossary.relatedEntries')}
          </Text>
          <div className="flex flex-wrap gap-1.5">
            {entry.relatedEntryIds.map((entryId) => renderTermChip(entryId))}
          </div>
        </div>
      )}

      {entry.seeAlso && entry.seeAlso.length > 0 && (
        <div className={sectionDivider}>
          <Text variant="caption" as="p" className="mb-2 text-text-tertiary">
            {t('glossary.seeAlso')}
          </Text>
          <div className="flex flex-wrap gap-1.5">
            {entry.seeAlso.map((reference, index) => {
              if (reference.type === 'entry') {
                return renderTermChip(reference.id);
              }

              return (
                <span
                  key={`${reference.document}-${index}`}
                  className={cn(
                    chipBase,
                    'bg-surface-2 text-text-secondary border border-border/60',
                  )}
                >
                  {formatSeeAlsoReference(reference)}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

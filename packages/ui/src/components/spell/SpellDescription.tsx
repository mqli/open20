import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { HTMLAttributes, ReactNode } from 'react';
import type { Spell } from 'open20-core';
import { cn } from '@/lib/cn';

function withClassName<P extends HTMLAttributes<HTMLElement>>(fn: (props: P) => ReactNode) {
  return fn;
}

const markdownComponents = {
  table: withClassName(({ children, className, ...props }: HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-2">
      <table
        className={cn('w-full text-xs text-text-secondary border-collapse', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )),
  thead: withClassName(
    ({ children, className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
      <thead className={cn('bg-surface-2', className)} {...props}>
        {children}
      </thead>
    ),
  ),
  th: withClassName(({ children, className, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={cn(
        'border border-border px-2 py-1 text-left text-xs font-medium text-text-primary',
        className,
      )}
      {...props}
    >
      {children}
    </th>
  )),
  td: withClassName(({ children, className, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={cn('border border-border px-2 py-1 text-xs text-text-secondary', className)}
      {...props}
    >
      {children}
    </td>
  )),
  p: withClassName(({ children, className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn('mb-2 last:mb-0 text-xs text-text-secondary leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  )),
  strong: withClassName(({ children, className, ...props }: HTMLAttributes<HTMLElement>) => (
    <strong className={cn('font-semibold', className)} {...props}>
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
  blockquote: withClassName(({ children, className, ...props }: HTMLAttributes<HTMLElement>) => (
    <blockquote
      className={cn('border-l-4 border-primary-500/30 pl-4 my-2 italic', className)}
      {...props}
    >
      {children}
    </blockquote>
  )),
};

interface SpellDescriptionProps {
  description: Spell['description'];
}

export function SpellDescription({ description }: SpellDescriptionProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {description.join('\n')}
    </ReactMarkdown>
  );
}

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { HTMLAttributes, ReactNode } from 'react';
import type { Spell } from 'open20-core';

function withClassName<P extends HTMLAttributes<HTMLElement>>(fn: (props: P) => ReactNode) {
  return fn;
}

const markdownComponents = {
  table: withClassName(({ children, ...props }: HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-sm border-collapse" {...props}>
        {children}
      </table>
    </div>
  )),
  thead: withClassName(({ children, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-surface-2" {...props}>
      {children}
    </thead>
  )),
  th: withClassName(({ children, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
    <th className="border border-border px-2 py-1 text-left font-medium" {...props}>
      {children}
    </th>
  )),
  td: withClassName(({ children, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border border-border px-2 py-1" {...props}>
      {children}
    </td>
  )),
  p: withClassName(({ children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-2 last:mb-0 leading-relaxed" {...props}>
      {children}
    </p>
  )),
  strong: withClassName(({ children, ...props }: HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold" {...props}>
      {children}
    </strong>
  )),
  em: withClassName(({ children, ...props }: HTMLAttributes<HTMLElement>) => (
    <em className="italic" {...props}>
      {children}
    </em>
  )),
  ul: withClassName(({ children, ...props }: HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-4 mb-2 space-y-0.5" {...props}>
      {children}
    </ul>
  )),
  ol: withClassName(({ children, ...props }: HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-4 mb-2 space-y-0.5" {...props}>
      {children}
    </ol>
  )),
  li: withClassName(({ children, ...props }: HTMLAttributes<HTMLLIElement>) => (
    <li {...props}>{children}</li>
  )),
  blockquote: withClassName(({ children, ...props }: HTMLAttributes<HTMLElement>) => (
    <blockquote className="border-l-4 border-primary/30 pl-4 my-2 italic" {...props}>
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

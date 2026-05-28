import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const distDir = new URL('../dist', import.meta.url).pathname;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function toPosix(p) {
  return p.replaceAll('\\', '/');
}

function rewriteAlias(specifier, filePath) {
  if (specifier === '@') {
    const target = join(distDir, 'index');
    const fromDir = dirname(filePath);
    let rel = toPosix(relative(fromDir, target));
    if (!rel.startsWith('.')) rel = `./${rel}`;
    return rel;
  }
  if (!specifier.startsWith('@/')) return specifier;
  const target = join(distDir, specifier.slice(2));
  const fromDir = dirname(filePath);
  let rel = toPosix(relative(fromDir, target));
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel;
}

function rewriteFile(filePath) {
  const original = readFileSync(filePath, 'utf8');
  const rewrite = (_m, head, specifier, tail) =>
    `${head}${rewriteAlias(specifier, filePath)}${tail}`;
  const updated = original
    .replace(/(\bfrom\s*["'])(@(?:\/[^"']*)?)(["'])/g, rewrite)
    .replace(/(\bimport\s*\(\s*["'])(@(?:\/[^"']*)?)(["']\s*\))/g, rewrite);
  if (updated !== original) writeFileSync(filePath, updated, 'utf8');
}

const files = walk(distDir).filter((p) => {
  return p.endsWith('.js') || p.endsWith('.d.ts');
});

for (const file of files) rewriteFile(file);

console.log(`Rewrote local alias imports in ${files.length} dist files`);

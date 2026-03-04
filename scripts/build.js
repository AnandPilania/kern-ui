/**
 * Simple build script — concatenates CSS modules in import order,
 * then minifies both CSS and JS using available tools.
 *
 * Run: node scripts/build.js
 *
 * Outputs:
 *   dist/kern.css       — concatenated, readable
 *   dist/kern.min.css   — minified
 *   dist/kern.js        — bundled ESM (via rollup if available)
 *   dist/kern.min.js    — minified
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, '..');
const distDir = resolve(root, 'dist');

mkdirSync(distDir, { recursive: true });

const seen = new Set();

function resolveCSS(filePath) {
    const abs = resolve(filePath);
    if (seen.has(abs)) return `/* already imported: ${relative(root, abs)} */\n`;
    seen.add(abs);
    const src = readFileSync(abs, 'utf8');
    return src.replace(/@import\s+['"](.+?)['"]\s*;/g, (_, rel) => {
        return resolveCSS(resolve(dirname(abs), rel));
    });
}

const fullCSS = resolveCSS(resolve(root, 'src/kern.css'));
writeFileSync(resolve(distDir, 'kern.css'), fullCSS, 'utf8');

const minCSS = fullCSS
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*([{};:,>~+])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();

writeFileSync(resolve(distDir, 'kern.min.css'), minCSS, 'utf8');

console.log(`kern.css      ${(fullCSS.length / 1024).toFixed(1)} KB`);
console.log(`kern.min.css  ${(minCSS.length / 1024).toFixed(1)} KB`);
console.log('CSS build complete ✓');

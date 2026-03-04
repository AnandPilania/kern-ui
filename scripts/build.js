import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { resolve, dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';

// --- Setup Paths ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');
const srcJs = resolve(root, 'src-js');
const srcCss = resolve(root, 'src/kern.css');
const distDir = resolve(root, 'dist');

mkdirSync(distDir, { recursive: true });

// --- JS Configuration ---
const MODULE_ORDER = [
    "utils.js",
    "behaviors/accordion.js",
    "behaviors/toggle.js",
    "behaviors/table-sort.js",
    "components/tabs.js",
    "components/dropdown.js",
    "components/dialog.js",
    "components/drawer.js",
    "components/toaster.js",
    "api.js",
    "boot.js",
];

// --- 1. CSS BUILD (Recursive Resolver) ---
const seenCss = new Set();

function resolveCSS(filePath) {
    const abs = resolve(filePath);
    if (seenCss.has(abs)) {
        return `/* already imported: ${relative(root, abs)} */\n`;
    }

    try {
        let src = readFileSync(abs, 'utf8');
        seenCss.add(abs);
        const currentDir = dirname(abs);

        // Recursively replace @import statements with file content
        return src.replace(/@import\s+['"](.+?)['"]\s*;/g, (_, rel) => {
            const nextPath = resolve(currentDir, rel);
            return resolveCSS(nextPath);
        });
    } catch (err) {
        console.error(`[CSS Error] Could not find: ${abs}`);
        return `/* Error: file not found ${relative(root, abs)} */\n`;
    }
}

console.log('Building CSS...');
const fullCSS = resolveCSS(srcCss);
const minCSS = fullCSS
    .replace(/\/\*[\s\S]*?\*\//g, '')        // Strip comments
    .replace(/\s{2,}/g, ' ')                // Collapse whitespace
    .replace(/\s*([{};:,>~+])\s*/g, '$1')    // Remove spaces around symbols
    .replace(/;}/g, '}')                    // Remove trailing semicolons
    .trim();

writeFileSync(resolve(distDir, 'kern.css'), fullCSS);
writeFileSync(resolve(distDir, 'kern.min.css'), minCSS);

// --- 2. JS BUILD (Topological Inline Bundle) ---
console.log('Building JS...');
let jsParts = ['(function(window){"use strict";\n'];

MODULE_ORDER.forEach(mod => {
    const filePath = join(srcJs, mod);
    if (!existsSync(filePath)) {
        console.warn(`[JS Warning] File missing: ${mod}`);
        return;
    }

    let src = readFileSync(filePath, 'utf8');

    // Strip JSDoc, Imports, and Exports (Match Python logic)
    src = src.replace(/\/\*\*[\s\S]*?\*\//g, '')
        .replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
        .replace(/^import\s+['"].*?['"];?\s*$/gm, '')
        .replace(/\bexport\s+(class|function|const|let|var)\b/g, '$1')
        .replace(/^export\s*\{[^}]*\}\s*;?\s*$/gm, '')
        .replace(/\bexport\s+default\s+/g, '')
        .replace(/\n{3,}/g, '\n\n');

    jsParts.push(`\n/* === ${mod} === */\n`);
    jsParts.push(src.trim());
    jsParts.push('\n');
});

jsParts.push('\nif(typeof window!=="undefined")window.Kern=Kern;\n');
jsParts.push('})(window);\n');

const fullJS = jsParts.join('');
const minJS = fullJS
    .replace(/\/\/[^\n]*/g, '')          // Line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')    // Block comments
    .replace(/\s{2,}/g, ' ')             // Collapse whitespace
    .trim();

writeFileSync(resolve(distDir, 'kern.js'), fullJS);
writeFileSync(resolve(distDir, 'kern.min.js'), minJS);

// --- 3. FINAL REPORT ---
console.log('\nBuild complete ✓');
console.log('-------------------------------------------');
const files = ['kern.css', 'kern.min.css', 'kern.js', 'kern.min.js'];
files.forEach(f => {
    const path = resolve(distDir, f);
    if (existsSync(path)) {
        const sz = statSync(path).size;
        console.log(`${f.padEnd(15)} ${(sz / 1024).toFixed(2).padStart(6)} KB`);
    }
});

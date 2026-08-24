#!/usr/bin/env node
// P2 sheet layerizer (tw4-css-modularization, 2026-08-24).
//
// Wraps a hand-authored component css sheet into the layer law
// (design D2, tasks 2.1):
//   1. canonical ORDER LAW prologue: `@layer theme, base, components, utilities;`
//   2. every style rule moves into `@layer components`;
//   3. every selector is zeroed via full-selector `:where(...)`
//      (pseudo-element subject stays inside the :where — valid and
//      keeps the transform purely mechanical);
//   4. `:root` custom-property blocks move to `@layer theme` (tokens,
//      not paint); `@keyframes` pass through unchanged (layers do not
//      affect them); @media/@container/@supports recurse.
//
// Usage: node scripts/layerize-sheet.mjs <file.css> [more.css …]
// Idempotent: a file already carrying the prologue is skipped.

import { readFileSync, writeFileSync } from 'node:fs';

const PROLOGUE = '@layer theme, base, components, utilities;';

const layerize = (css) => {
  // split into (selector, body) top-level chunks, keeping at-rule wrappers
  const out = [];
  let i = 0;
  const n = css.length;

  const parseBlock = () => {
    // from '{' to its matching '}' (depth starts 0: the opening brace
    // itself brings it to 1)
    let depth = 0;
    const start = i; // at '{'
    while (i < n) {
      if (css[i] === '{') depth += 1;
      else if (css[i] === '}') {
        depth -= 1;
        if (depth === 0) { i += 1; break; }
      }
      i += 1;
    }
    return css.slice(start, i); // includes braces
  };

  while (i < n) {
    // consume comments/whitespace verbatim
    if (/\s/.test(css[i])) { out.push(css[i]); i += 1; continue; }
    if (css.startsWith('/*', i)) {
      const end = css.indexOf('*/', i) + 2;
      out.push(css.slice(i, end)); i = end; continue;
    }
    // read selector/at-rule prelude until '{' or ';'
    let j = i;
    while (j < n && css[j] !== '{' && css[j] !== ';') j += 1;
    const prelude = css.slice(i, j).trim();
    if (css[j] === ';') { out.push(prelude + ';'); i = j + 1; continue; }
    if (css[j] === undefined) break;
    // block starts here
    i = j; // at '{'
    const body = parseBlock();
    const inner = body.slice(1, -1);

    if (prelude.startsWith('@keyframes')) {
      out.push(prelude + body); // pass through
    } else if (prelude.startsWith('@media') || prelude.startsWith('@container') || prelude.startsWith('@supports')) {
      out.push(prelude + ' {' + layerizeInner(inner) + '\n}');
    } else if (prelude === ':root' || prelude === ':root,') {
      out.push(`@layer theme {\n${prelude}${body}\n}`);
    } else {
      // style rule: zero the whole selector list
      const zeroed = prelude
        .split(/,(?![^(]*\))/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => `:where(${s})`)
        .join(',\n');
      out.push(zeroed + body);
    }
  }
  return out.join('');
};

// like layerize but for the INSIDE of an at-rule wrapper (already inside
// the components layer) — same selector zeroing, no prologue/layering
const layerizeInner = (css) => {
  const out = [];
  let i = 0;
  const n = css.length;
  while (i < n) {
    if (/\s/.test(css[i])) { out.push(css[i]); i += 1; continue; }
    if (css.startsWith('/*', i)) {
      const end = css.indexOf('*/', i) + 2;
      out.push(css.slice(i, end)); i = end; continue;
    }
    let j = i;
    while (j < n && css[j] !== '{' && css[j] !== ';') j += 1;
    const prelude = css.slice(i, j).trim();
    if (css[j] === ';') { out.push(prelude + ';'); i = j + 1; continue; }
    if (j >= n) break;
    i = j;
    let depth = 0;
    const start = i;
    while (i < n) {
      if (css[i] === '{') depth += 1;
      else if (css[i] === '}') {
        depth -= 1;
        if (depth === 0) { i += 1; break; }
      }
      i += 1;
    }
    const body = css.slice(start, i);
    if (prelude.startsWith('@keyframes')) {
      out.push(prelude + body);
    } else if (prelude.startsWith('@media') || prelude.startsWith('@container') || prelude.startsWith('@supports')) {
      out.push(prelude + ' {' + layerizeInner(body.slice(1, -1)) + '\n}');
    } else {
      const zeroed = prelude
        .split(/,(?![^(]*\))/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => `:where(${s})`)
        .join(',\n');
      out.push(zeroed + body);
    }
  }
  return out.join('');
};

for (const file of process.argv.slice(2)) {
  const css = readFileSync(file, 'utf8');
  if (css.includes(PROLOGUE)) {
    console.log(`skip (already layerized): ${file}`);
    continue;
  }
  const layered = `${PROLOGUE}\n\n@layer components {\n${layerize(css).trim()}\n}\n`;
  writeFileSync(file, layered);
  console.log(`layerized: ${file}`);
}

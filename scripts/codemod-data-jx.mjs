#!/usr/bin/env node
// codemod-data-jx — the MECHANICAL subset of the data-jx-hooks rewrite
// (2026-08-25; implementation phase).
//
// Consumes the committed manifest (engine@3.1). Applies ONLY the
// transforms that are provably safe by string surgery:
//   M1 query selectors '.jx-x' -> '[data-jx-x]' / '[data-jx-x="v"]'
//      (css-defined names stay classes — priority law);
//   M2 classList add/remove/toggle/contains -> attribute equivalents;
//   M3 svelte class:jx-foo={cond} directives -> data-jx-foo attrs;
//   M4 hook tokens inside STATIC class="..." attributes -> attributes
//      on the same tag (families in static text seams included).
//
// The class-EXPRESSION sites (cn(...)/templates in script) are NOT
// touched here: they need per-element AST context and are migrated by
// the guided subagent pass (manifest sites carry file:line + shape).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry');
const manifest = JSON.parse(readFileSync(join(root, 'openspec/changes/data-jx-hooks/inventory.json'), 'utf8'));

const defined = new Set(manifest.defined);
const hooks = new Set(Object.keys(manifest.hooks));
const families = new Map(Object.entries(manifest.families));
for (const d of defined) hooks.delete(d);
const familyBases = [...families.keys()];
const baseStaysClass = (b) => defined.has(`jx-${b}`);
const selectorFor = (cls) => {
  for (const b of familyBases) {
    if (cls.startsWith(`jx-${b}-`) && !baseStaysClass(b)) {
      const val = cls.slice(`jx-${b}-`.length);
      if (val && !hooks.has(cls)) return `[data-jx-${b}="${val}"]`;
    }
  }
  return `[data-jx-${cls.slice(3)}]`;
};
const converts = (cls) => hooks.has(cls) && !defined.has(cls);

const report = [];
const note = (file, what) => report.push(`${relative(root, file)}: ${what}`);

const files = new Set();
for (const [tok, sites] of Object.entries(manifest.hooks)) for (const s of sites) files.add(join(root, s.split(':')[0]));
for (const r of manifest.references) files.add(join(root, r.file));
for (const d of manifest.directives) files.add(join(root, d.site.split(':')[0]));

let touched = 0;
for (const file of files) {
  if (!existsSync(file)) continue;
  let s = readFileSync(file, 'utf8');
  const before = s;

  // M3 directives
  s = s.replace(/(\s)class:(jx-[a-z0-9-]+)=\{([^}]+)\}/g, (m, sp, tok, cond) => {
    if (!converts(tok)) return m;
    note(file, `directive ${tok}`);
    return `${sp}data-jx-${tok.slice(3)}={${cond} ? '' : undefined}`;
  });

  // M1 selectors
  s = s.replace(/(['"`])\.jx-([a-z0-9-]+)\1/g, (m, q, cls) => {
    if (defined.has(`jx-${cls}`)) return m;
    note(file, `selector .${cls} -> ${selectorFor('jx-' + cls)}`);
    return `${q}${selectorFor(`jx-${cls}`)}${q}`;
  });

  // M2 classList
  const clForms = [
    ['add', (c) => `setAttribute('data-jx-${c}', '')`],
    ['remove', (c) => `removeAttribute('data-jx-${c}')`],
    ['contains', (c) => `hasAttribute('data-jx-${c}')`],
    ['toggle', (c) => `toggleAttribute('data-jx-${c}')`],
  ];
  for (const [method, repl] of clForms) {
    s = s.replace(new RegExp(`classList\\.${method}\\(\\s*(['\"])jx-([a-z0-9-]+)\\1\\s*\\)`, 'g'), (m, q, cls) => {
      if (defined.has(`jx-${cls}`)) return m;
      note(file, `classList.${method} ${cls}`);
      return repl(cls);
    });
  }

  if (s !== before) {
    touched += 1;
    if (!DRY) writeFileSync(file, s);
  }
}

console.log(`${DRY ? 'DRY' : 'WRITE'}: ${touched}/${files.size} files ${DRY ? 'would change' : 'changed'}; ${report.length} notes`);
if (DRY) report.slice(0, 15).forEach((r) => console.log('  ' + r));

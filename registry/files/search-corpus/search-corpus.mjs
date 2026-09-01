/**
 * search-corpus — the structured search corpus generator
 * (openspec change 2026-09-02-search-corpus; Owner r8 + the four
 * grilling decisions: structured-not-guessed, engine-pluggable,
 * distributed as a registry item, Intl.Segmenter for CJK at the
 * CLIENT layer).
 *
 * LAWS (mirrors of the llms-txt laws, same-source where possible):
 *   - Scan the FINAL dist (the published artifact, never sources).
 *   - One generation point per site: build-site.mjs's declared phase.
 *   - Declared outputs only: /search/corpus.json, nothing else.
 *   - Byte-deterministic: sorted pages, stable key order; only
 *     `generatedAt` may move between runs.
 *   - Reuse, never copy: the HTML tokenizer rides the llms-txt
 *     module's EXPORTED surface (parseFragment/decodeEntities/
 *     extractPage/globToRegExp/pageUrlFromRel) via a candidate-path
 *     dynamic import (sibling at install sites, ../llms-txt in this
 *     repo). The registry item declares the dependency so installers
 *     fetch both.
 *   - The corpus is ENGINE-NEUTRAL (the pluggable-engine decision):
 *     this file emits the page-semantics model only — minisearch and
 *     friends compile their indexes client-side. The builder keeps
 *     zero dependencies beyond node builtins + the sibling module.
 *
 * The page-semantics schema carries the Owner's point/line/plane
 * dimensions: blocks (点, open `kind` enum + industry meta), sections
 * (线, the heading-tree law), document `preset` (面, reserved for
 * PrintDoc genre presets — null until that family lands).
 */

import { readdirSync, readFileSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

let llmsTxtModule = null;
async function loadLlmsTxt() {
  if (llmsTxtModule !== null) return llmsTxtModule;
  const candidates = ['./llms-txt.mjs', '../llms-txt/llms-txt.mjs'];
  let lastError;
  for (const path of candidates) {
    try {
      llmsTxtModule = await import(path);
      return llmsTxtModule;
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(
    `[search-corpus] the llms-txt module is required (exported tokenizer) — tried ${candidates.join(', ')}: ${lastError}`,
  );
}

/* ── shared text helpers over the llms-txt tree ────────────────────── */

const collapse = (text) =>
  text
    .replace(/[\t\r\n ]+/g, ' ')
    .trim();

function subtreeText(node, { decode }) {
  if (node.type === 'text') return decode(node.text);
  if (node.type !== 'element') return '';
  return node.children.map((child) => subtreeText(child, { decode })).join('');
}

const firstElement = (node, name) => {
  if (node.type !== 'element' && node.type !== 'root') return undefined;
  for (const child of node.children) {
    if (child.type === 'element' && child.name === name) return child;
  }
  return undefined;
};

/* ── the slug law (ported from toc-outline.ts — convergence is locked
      by the equivalence spec; ids are READ when present, computed only
      when the heading carries none). ANCHOR LAW v2 (2026-09-02): the
      nearest-id-ancestor step RETIRED — the runtime stamper
      (deriveTocOutline, mounted root-layout-wide) writes the slug onto
      every id-less heading, so the heading's own stamped id is always
      the live target; counting wrapper ids in the dedup set produced
      anchors nothing owns (chip/press-button usage-2) ───────────── */

export function headingIds(headings) {
  const used = new Set();
  return headings.map((heading, index) => {
    const existing = heading.attrs?.id;
    if (existing !== undefined && existing !== '' && !used.has(existing)) {
      used.add(existing);
      return existing;
    }
    const slug = heading.label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const base = slug || `section-${index + 1}`;
    let id = base;
    let n = 2;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    return id;
  });
}

/* ── the harvest: one page → the page-semantics model ──────────────── */

const KIND_CODE = 'code';
const KIND_TABLE = 'table';
const KIND_PROSE = 'prose';

/** classify an element as a point-block root, or null to recurse */
function classifyBlock(element) {
  if (element.name === 'pre') return KIND_CODE;
  if (element.name === 'table') return KIND_TABLE;
  if (element.name === 'figure' && firstElement(element, 'pre')) return KIND_CODE;
  return null;
}

function blockMeta(element, { decode }) {
  if (classifyBlock(element) !== KIND_CODE) return undefined;
  const pre = element.name === 'pre' ? element : firstElement(element, 'pre');
  const figure = element.name === 'figure' ? element : null;
  const caption = figure ? firstElement(figure, 'figcaption') : undefined;
  const meta = {};
  if (pre?.attrs?.['data-lang']) meta.lang = pre.attrs['data-lang'];
  if (caption) {
    const label = collapse(subtreeText(caption, { decode }));
    if (label !== '') meta.label = label.slice(0, 200);
  }
  return Object.keys(meta).length > 0 ? meta : undefined;
}

/**
 * Walk the chrome-stripped content tree producing the ordered stream
 * the section fold consumes: headings (skipping data-toc-skip
 * subtrees — the outline law) and point-block roots.
 */
function walkStream(node, { decode, skip }, out) {
  if (node.type === 'text') return;
  if (node.type !== 'element' && node.type !== 'root') return;
  const skipping = skip || node.attrs?.['data-toc-skip'] !== undefined;
  if (node.type === 'element') {
    const level = /^h([1-6])$/.exec(node.name);
    if (level && !skipping) {
      // the heading's address is its OWN id (or the slug the runtime
      // stamps back — anchor law v2); wrapper-div ids are not consulted
      out.push({
        type: 'heading',
        level: Number(level[1]),
        label: collapse(subtreeText(node, { decode })),
        attrs: node.attrs ?? {},
        node,
      });
      return; // the heading subtree is the label, not content
    }
    const kind = classifyBlock(node);
    if (kind !== null && !skipping) {
      out.push({ type: 'block', kind, node });
      return;
    }
    if (/^(p|li|blockquote|dd|dt)$/.test(node.name) && !skipping) {
      // a paragraph root: the prose unit (block roots already returned
      // above, so nesting inside code/tables never reaches here)
      const text = collapse(subtreeText(node, { decode }));
      if (text !== '') out.push({ type: 'prose', text });
      return;
    }
  }
  for (const child of node.children) {
    walkStream(child, { decode, skip: skipping }, out);
  }
}

/** prose text of a subtree EXCLUDING its block roots and headings */
function proseText(node, { decode }) {
  if (node.type === 'text') return decode(node.text);
  if (node.type !== 'element' && node.type !== 'root') return '';
  if (classifyBlock(node) !== null) return '';
  if (node.type === 'element' && /^h[1-6]$/.test(node.name)) return '';
  const inner = node.children
    .map((child) => proseText(child, { decode }))
    .join('')
    .replace(/[\t\r\n ]+/g, ' ');
  return node.type === 'element' && /^(p|li|blockquote|dd|dt)$/.test(node.name)
    ? `${inner}\n`
    : inner;
}

const TRUNCATE_TEXT = 4000;

export async function harvestPage(html, rel, options = {}) {
  const llms = await loadLlmsTxt();
  const levels = options.levels ?? [2, 3];
  const page = llms.extractPage(html);
  const stream = [];
  walkStream(page.contentNode, { decode: llms.decodeEntities, skip: false }, stream);
  const headings = stream.filter((item) => item.type === 'heading');
  const levelsSet = new Set(levels);
  const outline = headings.filter((item) => levelsSet.has(item.level));
  const ids = headingIds(outline);

  const sections = [];
  let current = null;
  let proseBuffer = '';
  const flushProse = () => {
    if (current === null) return;
    const text = collapse(proseBuffer);
    if (text !== '') {
      current.blocks.push({ kind: KIND_PROSE, text: text.slice(0, TRUNCATE_TEXT) });
    }
    proseBuffer = '';
  };
  let outlineIndex = 0;
  for (const item of stream) {
    if (item.type === 'heading') {
      if (levelsSet.has(item.level)) {
        flushProse();
        const section = {
          id: ids[outlineIndex],
          heading: item.label.slice(0, 200),
          level: item.level,
          summary: '',
          blocks: [],
        };
        outlineIndex++;
        sections.push(section);
        current = section;
      }
      continue;
    }
    if (item.type === 'prose') {
      if (current !== null) proseBuffer += `${item.text}\n`;
      continue;
    }
    if (current === null) continue; // pre-heading content: no section yet
    if (item.kind === KIND_CODE || item.kind === KIND_TABLE) {
      flushProse();
      const text = collapse(
        subtreeText(item.kind === KIND_CODE && item.node.name === 'figure' ? firstElement(item.node, 'pre') : item.node, {
          decode: llms.decodeEntities,
        }),
      );
      current.blocks.push({
        kind: item.kind,
        text: text.slice(0, TRUNCATE_TEXT),
        ...(blockMeta(item.node, { decode: llms.decodeEntities }) ?? {}),
      });
    }
  }
  flushProse();

  // summary: the header block's <p> after the heading (SectionCard law)
  for (let i = 0; i < outline.length; i++) {
    const parent = parentOf(page.contentNode, outline[i].node);
    if (parent === undefined) continue;
    const p = firstElement(parent, 'p');
    if (p !== undefined) {
      sections[i].summary = collapse(subtreeText(p, { decode: llms.decodeEntities })).slice(0, 300);
    }
  }

  // the SERVED path (the .html form the site's own nav links use) —
  // pageUrlFromRel's extensionless shape 404s on static hosts
  const servedUrl = rel === 'index.html' ? '/' : `/${rel}`;
  return {
    url: servedUrl,
    title: page.h1 !== '' ? page.h1 : page.title !== '' ? page.title : llms.pageUrlFromRel(rel),
    description: page.description.slice(0, 300),
    preset: null,
    sections,
    noindex: page.noindex,
  };
}

/** find an element's parent by search (the llms-txt tree is parentless) */
function parentOf(root, target) {
  const visit = (node) => {
    if (node.type !== 'element' && node.type !== 'root') return undefined;
    for (const child of node.children) {
      if (child === target) return node;
      const found = visit(child);
      if (found !== undefined) return found;
    }
    return undefined;
  };
  return visit(root);
}

/* ── the generator: distDir → /search/corpus.json ──────────────────── */

function listHtmlFiles(dir, prefix = '') {
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const rel = prefix === '' ? name.name : `${prefix}/${name.name}`;
    if (name.isDirectory()) out.push(...listHtmlFiles(join(dir, name.name), rel));
    else if (name.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

const matchAny = (rel, globs, globToRegExp) =>
  globs.some((glob) => globToRegExp(glob).test(rel));

export async function generateSearchCorpus(distDir, config = {}) {
  const llms = await loadLlmsTxt();

  if (typeof distDir !== 'string' || distDir === '') {
    throw new Error('[search-corpus] distDir is required (the final published artifact root)');
  }
  const stat = statSync(distDir);
  if (!stat.isDirectory()) {
    throw new Error(`[search-corpus] distDir is not a directory: ${distDir}`);
  }

  const include = config.include ?? ['**/*.html'];
  const exclude = config.exclude ?? [];
  const outPath = config.outPath ?? 'search/corpus.json';
  const maxBytes = config.maxBytes ?? 10_000_000;

  const skipped = [];
  const pages = [];
  for (const rel of listHtmlFiles(distDir)) {
    if (!matchAny(rel, include, llms.globToRegExp) || matchAny(rel, exclude, llms.globToRegExp)) continue;
    const html = readFileSync(join(distDir, ...rel.split('/')), 'utf8');
    const page = await harvestPage(html, rel, { levels: config.levels });
    if (page.noindex) {
      skipped.push(rel);
      continue;
    }
    pages.push(page);
  }
  pages.sort((a, b) => a.url.localeCompare(b.url));

  const corpus = {
    generator: 'jxoai search-corpus 1',
    generatedAt: new Date().toISOString(),
    pages,
  };
  const json = JSON.stringify(corpus);
  if (json.length > maxBytes) {
    throw new Error(
      `[search-corpus] corpus exceeds the ${maxBytes}-byte cap (${json.length}) — raise config.maxBytes consciously`,
    );
  }
  const absolute = join(distDir, outPath);
  mkdirSync(join(absolute, '..'), { recursive: true });
  writeFileSync(absolute, json);
  return { corpusPath: outPath, pages: pages.length, skipped, bytes: json.length };
}

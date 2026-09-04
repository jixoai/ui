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
 * Ontology R2 (2026-09-05, document-ontology-r2-float-reference §4):
 * the harvest consumes the float/reference emissions additively —
 * data-number → block.number/section.number, data-ref-to →
 * block.refids[] (two-pass pre-scan: referenceable-target index first,
 * edge projection second), data-cited-in → block.citedIn. Unmarked
 * pages stay byte-identical; every projected field is optional and
 * omitted (never null) when absent.
 *
 * The page-semantics schema carries the Owner's point/line/plane
 * dimensions: blocks (点, open `kind` enum + industry meta), sections
 * (线, the heading-tree law), document `preset` (面, reserved for
 * PrintDoc genre presets — null until that family lands).
 */

import { readdirSync, readFileSync, mkdirSync, writeFileSync, statSync, existsSync } from 'node:fs';
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

/* ── ontology R1 (2026-09-03): DECLARED MARKERS WIN over shape guesses.
   Line components stamp data-role/data-ordering on the [data-jx-section]
   host; point blocks stamp data-kind (open registry, 'code' first).
   The harvester READS declarations and falls back to tag shapes only
   for unmarked pages — heuristics retire page by page (contract law 3:
   the harvester never computes what the DOM declares). ─────────────── */

/** classify an element as a point-block root, or null to recurse */
function classifyBlock(element) {
  const declared = element.attrs?.['data-kind'];
  if (declared !== undefined && declared !== '') return declared;
  if (element.name === 'pre') return KIND_CODE;
  if (element.name === 'table') return KIND_TABLE;
  // the tag-shape fallback covers the LEGACY CodeCard shape (a bare
  // figure + direct pre) only — an R2 Figure wrapper ([data-jx-figure])
  // is NEVER a block of its own: the wrapped point keeps its own
  // marker (taxonomy priority — the line marks structure, the point
  // keeps semantics; design §4)
  if (
    element.name === 'figure' &&
    element.attrs?.['data-jx-figure'] === undefined &&
    firstElement(element, 'pre')
  ) {
    return KIND_CODE;
  }
  return null;
}

/** all descendant elements matching pred, in document order */
function descendants(node, pred, out = []) {
  if (node.type !== 'element' && node.type !== 'root') return out;
  for (const child of node.children) {
    if (child.type === 'element' && pred(child)) out.push(child);
    descendants(child, pred, out);
  }
  return out;
}

/** the nearest ancestor element carrying attr (the llms-txt tree is
    parentless, so ancestry is re-derived by search from the root) */
function nearestAncestorWith(root, node, attr) {
  let parent = parentOf(root, node);
  while (parent !== undefined && parent.type === 'element') {
    if (parent.attrs?.[attr] !== undefined) return parent;
    parent = parentOf(root, parent);
  }
  return undefined;
}

function blockMeta(element, { decode }) {
  if (classifyBlock(element) !== KIND_CODE) return undefined;
  // descendant lookups, not direct children: the real CodeCard nests its
  // pre inside a wrapper div (the old direct-child search never saw the
  // caption from the figure root — labels were silently missed on every
  // built page until the declared figure root made the fix obvious)
  const pre = descendants(element, (el) => el.name === 'pre')[0];
  const caption = descendants(element, (el) => el.name === 'figcaption')[0];
  const meta = {};
  if (pre?.attrs?.['data-lang']) meta.lang = pre.attrs['data-lang'];
  if (caption) {
    const label = collapse(subtreeText(caption, { decode }));
    if (label !== '') meta.label = label.slice(0, 200);
  }
  return Object.keys(meta).length > 0 ? meta : undefined;
}

/* ── ontology R2 (2026-09-05): the TWO-PASS pre-scan + number/edge
   projection (additive — pre-R2 corpora parse unchanged, unmarked
   pages stay byte-identical). Pass one builds the document-wide
   REFERENCEABLE-TARGET index: every [data-jx-section][id] (numbered
   OR NOT — an unnumbered Section is a legal target) ∪ every
   [data-jx-figure][id][data-number] (an unnumbered Figure is not
   referenceable and stays out); bare ids are never indexed. Pass two
   projects the edges — a forward reference whose SSR form is the
   ??(to) fallback anchor still carries data-ref-to, so its refids[]
   edge harvests (not-yet is not missing); an edge whose target is
   absent from the index is filtered — the harvester is the
   static-completeness authority (design §4, Owner ruling P1-4=A). ── */

/** a present non-empty attribute value, or undefined */
const attr = (element, name) => {
  const value = element.attrs?.[name];
  return value !== undefined && value !== '' ? value : undefined;
};

/** the referenceable-target index (pass one) over the whole content tree */
function buildReferenceableIndex(root) {
  const ids = new Set();
  for (const el of descendants(root, (node) => {
    if (attr(node, 'id') === undefined) return false;
    return (
      node.attrs?.['data-jx-section'] !== undefined ||
      (node.attrs?.['data-jx-figure'] !== undefined && attr(node, 'data-number') !== undefined)
    );
  })) {
    ids.add(attr(el, 'id'));
  }
  return ids;
}

/** pass two's edge filter: the live target id, or null when the
    reference's target never exists in the index (a dead edge) */
const edgeTarget = (element, index) => {
  const to = attr(element, 'data-ref-to');
  return to !== undefined && index.has(to) ? to : null;
};

/** append with FIRST-OCCURRENCE dedup (stable order per block) */
const pushRefid = (list, id) => {
  if (!list.includes(id)) list.push(id);
};

/** gather the INLINE reference edges inside a stream item's subtree */
function collectInlineRefs(node, index, sink) {
  for (const el of descendants(node, (n) => n.attrs?.['data-ref-to'] !== undefined)) {
    const id = edgeTarget(el, index);
    if (id !== null) sink(id);
  }
}

/** data-cited-in is a JSON array payload (design §1.1c) — fail loud on
    malformed emission (a component-layer bug, never a corpus guess) */
function parseCitedIn(raw) {
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error(`[search-corpus] data-cited-in is not valid JSON: ${raw}`);
  }
  if (!Array.isArray(value)) {
    throw new Error(`[search-corpus] data-cited-in payload is not an array: ${raw}`);
  }
  return value;
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
      // above, so nesting inside code/tables never reaches here). The
      // node rides along so the fold can gather INLINE data-ref-to
      // edges (ontology R2) — text alone cannot carry an edge.
      const text = collapse(subtreeText(node, { decode }));
      if (text !== '') out.push({ type: 'prose', text, node });
      return;
    }
    // a BARE reference (R2): data-ref-to surfacing at stream level =
    // inside a section body but under NO block root and no paragraph
    // (heading/block/prose interceptions above guarantee exactly that
    // reading). The anchor's label is not stream content — the fold
    // hangs the edge on the nearest PRECEDING stream item.
    if (!skipping && node.attrs?.['data-ref-to'] !== undefined) {
      out.push({ type: 'bare-ref', node });
      return;
    }
  }
  for (const child of node.children) {
    walkStream(child, { decode, skip: skipping }, out);
  }
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

  // pass one (R2): the document-wide referenceable-target index —
  // every edge projection below resolves against THIS set, so a
  // forward SSR fallback edge harvests while a dead edge cannot
  const referenceable = buildReferenceableIndex(page.contentNode);

  const sections = [];
  let current = null;
  let proseBuffer = '';
  // the R2 edge window: refids belonging to the not-yet-flushed prose
  // aggregation (inline edges from its paragraphs + bare edges that
  // landed while it was open — the aggregation IS their host block)
  let pendingRefids = [];
  // the nearest preceding FLUSHED stream item of the current section —
  // the host for a bare edge arriving after the prose window closed
  let lastStreamBlock = null;
  // one number/citedIn per Figure wrapper: the FIRST point block only
  const claimedFigures = new Set();
  const flushProse = () => {
    if (current === null) {
      proseBuffer = '';
      pendingRefids = [];
      return;
    }
    const text = collapse(proseBuffer);
    if (text !== '') {
      const block = { kind: KIND_PROSE, text: text.slice(0, TRUNCATE_TEXT) };
      if (pendingRefids.length > 0) block.refids = pendingRefids;
      current.blocks.push(block);
      lastStreamBlock = block;
    }
    proseBuffer = '';
    pendingRefids = [];
  };
  let outlineIndex = 0;
  for (const item of stream) {
    if (item.type === 'heading') {
      if (levelsSet.has(item.level)) {
        flushProse();
        lastStreamBlock = null; // the new section has no stream items yet
        const section = {
          id: ids[outlineIndex],
          heading: item.label.slice(0, 200),
          level: item.level,
          role: 'section',
          ordering: null,
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
      if (current !== null) {
        proseBuffer += `${item.text}\n`;
        collectInlineRefs(item.node, referenceable, (id) => pushRefid(pendingRefids, id));
      }
      continue;
    }
    if (item.type === 'bare-ref') {
      // a dead edge filters silently here (the component layer already
      // warns on settle); only a hostless edge is the harvester's warn
      const id = edgeTarget(item.node, referenceable);
      if (id === null) continue;
      if (proseBuffer !== '') {
        // the open prose window is the nearest preceding stream item
        pushRefid(pendingRefids, id);
      } else if (lastStreamBlock !== null) {
        if (lastStreamBlock.refids === undefined) lastStreamBlock.refids = [];
        pushRefid(lastStreamBlock.refids, id);
      } else {
        console.warn(
          `[search-corpus] bare data-ref-to="${id}" has no preceding stream item in its section — the edge is skipped (never silently dropped)`,
        );
      }
      continue;
    }
    if (current === null) continue; // pre-heading content: no section yet
    if (item.type === 'block') {
      // every classified block enters the fold — the kind registry is
      // OPEN (ontology R1): declared kinds ride through untouched, the
      // tag-shape fallback still yields code/table for unmarked roots
      flushProse();
      const pre =
        item.kind === KIND_CODE ? descendants(item.node, (el) => el.name === 'pre')[0] : undefined;
      const text = collapse(
        subtreeText(pre ?? item.node, {
          decode: llms.decodeEntities,
        }),
      );
      const block = {
        kind: item.kind,
        text: text.slice(0, TRUNCATE_TEXT),
        ...(blockMeta(item.node, { decode: llms.decodeEntities }) ?? {}),
      };
      // R2 number/citedIn projection: the Figure WRAPPER never becomes
      // a block — its data-number/data-cited-in land on the wrapped
      // point (first point block only; a Figure with no projectable
      // child block projects nothing)
      const figureHost = nearestAncestorWith(page.contentNode, item.node, 'data-jx-figure');
      if (figureHost !== undefined && !claimedFigures.has(figureHost)) {
        claimedFigures.add(figureHost);
        const number = attr(figureHost, 'data-number');
        if (number !== undefined) block.number = number;
        const citedIn = attr(figureHost, 'data-cited-in');
        if (citedIn !== undefined) block.citedIn = parseCitedIn(citedIn);
      }
      current.blocks.push(block);
      lastStreamBlock = block;
      collectInlineRefs(item.node, referenceable, (id) => {
        if (block.refids === undefined) block.refids = [];
        pushRefid(block.refids, id);
      });
    }
  }
  flushProse();

  // role / ordering / summary — DECLARED when the heading sits inside a
  // [data-jx-section] host (ontology R1): identity and summary are READ
  // from the component's own zones (the header zone's title block — its
  // LAST <p> is the summary; the eyebrow <p> above is never mistaken for
  // one). The parent's-first-<p> shape guess survives ONLY for headings
  // with no host — the page-by-page heuristic retirement.
  for (let i = 0; i < outline.length; i++) {
    const host = nearestAncestorWith(page.contentNode, outline[i].node, 'data-jx-section');
    if (host !== undefined) {
      sections[i].role = host.attrs?.['data-role'] ?? 'section';
      sections[i].ordering = host.attrs?.['data-ordering'] ?? null;
      // R2: the section's own number rides the SAME host element the
      // identity does (optional — an unnumbered section omits the field)
      const sectionNumber = attr(host, 'data-number');
      if (sectionNumber !== undefined) sections[i].number = sectionNumber;
      const header = descendants(host, (el) => el.attrs?.['data-jx-section-header'] !== undefined)[0];
      const titleBlock =
        header?.children.find((child) => child.type === 'element' && child.name === 'div') ?? undefined;
      const ps = titleBlock !== undefined ? descendants(titleBlock, (el) => el.name === 'p') : [];
      const p = ps[ps.length - 1];
    if (p !== undefined) {
      sections[i].summary = collapse(subtreeText(p, { decode: llms.decodeEntities })).slice(0, 300);
    }
      continue;
    }
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

/** the one-generation-point law (delta spec): /search/ holds ONLY the
 *  declared outputs — any other file there is a stray writer and fails
 *  the build NAMING the offender */
export function assertNoStraySearchWrites(distDir, declared = ['search/corpus.json']) {
  const searchDir = join(distDir, 'search');
  if (!existsSync(searchDir)) return;
  const allowed = new Set(declared.map((d) => d.split('/').pop()));
  const offenders = readdirSync(searchDir).filter((name) => !allowed.has(name));
  if (offenders.length > 0) {
    throw new Error(
      `[search-corpus] stray writer(s) in public/search/ — declared: ${declared.join(', ')}; offenders: ${offenders
        .map((name) => `search/${name}`)
        .join(', ')}`,
    );
  }
}

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
    generator: 'jxoai search-corpus 2',
    generatedAt: new Date().toISOString(),
    pages,
  };
  const json = JSON.stringify(corpus);
  if (json.length > maxBytes) {
    throw new Error(
      `[search-corpus] corpus exceeds the ${maxBytes}-byte cap (${json.length}) — raise config.maxBytes consciously`,
    );
  }
  assertNoStraySearchWrites(distDir, [outPath]);
  const absolute = join(distDir, outPath);
  mkdirSync(join(absolute, '..'), { recursive: true });
  writeFileSync(absolute, json);
  return { corpusPath: outPath, pages: pages.length, skipped, bytes: json.length };
}

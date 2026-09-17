/**
 * presence-tree-panel tests — the presence-visuals task-group-2 wiring
 * as SOURCE LAWS (the chrome-items/panel-retired-chrome house style:
 * node, no DOM — the .svelte surfaces are pinned as facts about their
 * sources, the pure math is imported directly):
 *
 *   1. the TREE ribbon (2.2): remoteAttentions match rows by the
 *      protocol componentId, one player keeps the plain single
 *      border-color, N players switch to the border-image ribbon in
 *      the LOCAL order (playerId-stable), absent prop = today's tree.
 *   2. the PANEL focusWithIn + caret (2.3): remote foci resolve rows
 *      by the #<field> → prop-<field> law, ring = one box-shadow
 *      layer per player, caret bars ride the mirror measurement, and
 *      the UP lane reports throttled {kind:'panel', field, digest,
 *      caret} attention (null on blur).
 *   3. the remote-caret DOM half (the mirror span's font-copy law).
 *
 * Original need: presence-visuals task group 2 (2026-09-17).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const tree = readFileSync(join(here, 'component-tree.svelte'), 'utf8');
const panel = readFileSync(join(here, 'property-panel.svelte'), 'utf8');
const caretSource = readFileSync(join(here, 'remote-caret.ts'), 'utf8');

/* ── 2.2: the tree ribbon ────────────────────────────────────────────── */

test('the tree consumes remoteAttentions + selfHue with the contract shapes', () => {
  assert.match(tree, /remoteAttentions = \[\]/, 'the prop defaults empty (absent = current tree)');
  assert.match(tree, /remoteAttentions\?: readonly RemoteTreeAttention\[\]/, 'the prop is the named shape');
  const shape = tree.match(/interface RemoteTreeAttention \{[\s\S]*?\}/)?.[0] ?? '';
  for (const member of ['playerId: string', 'colorHue: number', 'componentId: string | null', 'online: boolean']) {
    assert.ok(shape.includes(member), `RemoteTreeAttention carries ${member}`);
  }
  assert.match(tree, /selfHue\?: number \| null/, 'selfHue rides the local-order contract');
});

test('row ownership: the online remote entry whose componentId matches the row lights it', () => {
  // the index: online + addressed entries only
  assert.match(tree, /if \(!entry\.online \|\| entry\.componentId === null\) continue;/);
  assert.match(tree, /byComponent\.set\(entry\.componentId/, 'keyed by componentId');
  // the lookup: a row without a componentId can never light
  assert.match(tree, /node\.componentId === null \? undefined : litRows\.get\(node\.componentId\)/);
});

test('the ribbon rides ribbonOf — the local order is the stable playerId sort', () => {
  assert.match(tree, /import \{ ribbonOf, type RibbonStyle \} from '\.\/presence-visuals\.ts';/);
  assert.match(tree, /ribbonOf\(ordered\.map\(\(entry\) => entry\.colorHue\)\)/, 'hues come from ribbonOf, never hand-rolled');
  assert.match(
    tree,
    /\.sort\(\(a, b\) => \(a\.playerId < b\.playerId \? -1 : a\.playerId > b\.playerId \? 1 : 0\)\)/,
    'self first is the contract anchor; remote rows sort by playerId',
  );
});

test('single player keeps the plain border-color path; N players switch to border-image', () => {
  // the single path: today's look (one solid color)
  assert.match(tree, /ribbon\.single\) return `border-inline-start: 3px solid \$\{ribbon\.color\};`/);
  // the multi path: border-image REPLACES border-color — transparent + `1` slice
  assert.match(
    tree,
    /return `border-inline-start: 3px solid transparent; border-image: \$\{ribbon\.image\} 1;`;/,
  );
  // the unlit row is the empty string — byte-identical current markup path
  assert.match(tree, /if \(ribbon === null\) return '';/);
});

test('the lit row is inspectable: data-jx-remote-ribbon carries the playerIds', () => {
  assert.match(tree, /data-jx-remote-ribbon=\{lighting\.players\.length > 0 \? lighting\.players\.join\(' '\) : undefined\}/);
});

test('the walk gate reads the componentId tail — ingest-written ids refresh the rows', () => {
  assert.match(
    tree,
    /`\$\{recordsSignature\(next\)\}\|\$\{JSON\.stringify\(next\.map\(\(record\) => record\.componentId\)\)\}`/,
    'the signature extends with the componentId list',
  );
});

/* ── 2.3: the panel's DOWN lane ──────────────────────────────────────── */

test('the panel consumes presenceFoci + onPresenceAttention with the contract shapes', () => {
  assert.match(panel, /presenceFoci = \[\]/, 'the prop defaults empty (absent = current panel)');
  assert.match(panel, /presenceFoci\?: readonly RemotePanelFocus\[\]/, 'the prop is the named shape');
  const shape = panel.match(/interface RemotePanelFocus \{[\s\S]*?\}/)?.[0] ?? '';
  for (const member of ['playerId: string', 'name: string', 'colorHue: number', 'field: string', 'caret?: number']) {
    assert.ok(shape.includes(member), `RemotePanelFocus carries ${member}`);
  }
  const payload = panel.match(/export interface PanelAttentionFocus \{[\s\S]*?\}/)?.[0] ?? '';
  for (const member of ["kind: 'panel'", 'field: string', 'digest: string', 'caret?: number']) {
    assert.ok(payload.includes(member), `PanelAttentionFocus carries ${member}`);
  }
  assert.match(
    panel,
    /onPresenceAttention\?: \(focus: PanelAttentionFocus \| null\) => void/,
    'onPresenceAttention: the PanelCaretFocus payload or null',
  );
});

test('focusWithIn resolves the row by the retired shell law: #<field> then prop-<field>', () => {
  assert.match(
    panel,
    /document\.getElementById\(field\) \?\? document\.getElementById\(`prop-\$\{field\}`\)/,
  );
  // the panel-zone fallback died with the overlay — an unresolved field lights nothing
  assert.doesNotMatch(panel, /studio-panel-zone/);
});

test('the ring stacks one box-shadow layer per player, the caret bar is a 2px mirror-measured stripe', () => {
  assert.match(panel, /`0 0 0 \$\{2 \* \(index \+ 1\)\}px \$\{playerHueCss\(player\.colorHue\)\}`/);
  assert.match(panel, /import \{ measureCaretMetrics \} from '\.\/remote-caret\.ts';/);
  assert.match(panel, /measureCaretMetrics\(field, player\.caret\)/, 'the caret geometry is mirror-measured');
  assert.match(panel, /'width:2px'/);
  assert.match(panel, /metrics\.x \+ ordinal \* 2/, 'concurrent bars on one input stagger 2px apart');
  assert.match(panel, /data-jx-remote-caret/, playerMark('caret bar'));
  assert.match(panel, /data-jx-remote-chip/, playerMark('name chip'));
  // the ring row is discoverable by playerId
  assert.match(panel, /data-jx-remote-focus/);
});

function playerMark(what: string): RegExp {
  return new RegExp(`the ${what} carries its player`);
}

test('a caret on a non-text control degrades to the ring only', () => {
  assert.match(panel, /a caret on a non-text control lights the ring only/);
});

test('decorations are INERT — pointer-events none, aria-hidden, and undone on change', () => {
  assert.match(panel, /'pointer-events:none'/);
  assert.match(panel, /element\.setAttribute\('aria-hidden', 'true'\)/);
  assert.match(panel, /row\.style\.boxShadow = '';/, 'teardown clears the ring');
});

/* ── 2.3: the panel's UP lane ────────────────────────────────────────── */

test('the report lane rides delegated events on the panel root', () => {
  const section = panel.match(/<section[\s\S]{0,400}?>/)?.[0] ?? '';
  for (const event of ['onfocusin', 'onfocusout', 'oninput', 'onselect', 'onkeyup']) {
    assert.ok(section.includes(event), `the panel root carries ${event}`);
  }
});

test('the payload: kind panel, the field id, a ≤40-char digest, and selectionStart as the caret', () => {
  assert.match(panel, /export const ATTENTION_DIGEST_MAX = 40;/);
  assert.match(panel, /value\.slice\(0, ATTENTION_DIGEST_MAX\)/);
  assert.match(panel, /typeof selectionStart === 'number' \? \{ caret: selectionStart \} : \{\}/);
  assert.match(panel, /kind: 'panel',\s*\n\s*field: target\.id,/);
});

test('the report vocabulary: only prop-/slot-text- control ids report (family auto-ids are noise)', () => {
  assert.match(panel, /id\.startsWith\('prop-'\) \|\| id\.startsWith\('slot-text-'\)/);
});

test('the throttle: leading fire + trailing flush of the last payload at 120ms', () => {
  assert.match(panel, /export const ATTENTION_REPORT_THROTTLE_MS = 120;/);
  assert.match(panel, /setTimeout\(\(\) => \{\s*\n\s*attentionTimer = undefined;\s*\n\s*flushPanelAttention\(\);/, 'the trailing edge');
});

test('blur reports null — but a move WITHIN the panel re-reports instead of flashing', () => {
  assert.match(panel, /function onPresenceFieldBlur\(event: FocusEvent\)/);
  assert.match(panel, /reportPanelAttention\(null\);/);
  assert.match(panel, /isReportableFieldId\(event\.relatedTarget\.id\)/, 'the sibling-move guard');
});

test('unmount clears the throttle tail (no report after teardown)', () => {
  assert.match(panel, /clearTimeout\(attentionTimer\)/);
});

/* ── the remote-caret DOM half (source-law) ──────────────────────────── */

test('the mirror span replicates the font metrics — white-space:pre, letter-spacing, tab-size', () => {
  assert.match(caretSource, /white-space:pre/);
  for (const property of ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'tab-size']) {
    assert.ok(caretSource.includes(`'${property}'`), `the mirror copies ${property}`);
  }
});

test('the DOM seams: measureCaretX is the brief-named export, scroll offsets are compensated', () => {
  assert.match(
    caretSource,
    /export function measureCaretX\(input: HTMLInputElement \| HTMLTextAreaElement, offset: number\): number/,
  );
  assert.match(caretSource, /- input\.scrollLeft/);
  assert.match(caretSource, /- input\.scrollTop/);
  // v1's recorded approximation: explicit \\n only, soft wraps read on their line
  assert.match(caretSource, /SOFT wraps/);
});

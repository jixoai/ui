/**
 * presence-tree-panel tests — the presence-visuals task-group-2 wiring
 * as SOURCE LAWS (the chrome-items/panel-retired-chrome house style:
 * node, no DOM — the .svelte surfaces are pinned as facts about their
 * sources, the pure math is imported directly):
 *
 *   1. the TREE ribbon (2.2 → presence-liveness P6): remoteAttentions
 *      match rows by the protocol componentId, the own selection joins
 *      as the self-first segment, one player keeps the plain single
 *      2px color, N players switch to the Owner's vertical border-image
 *      ribbon (`… 0 0 0 1 / 0 0 0 2px`) in the LOCAL order (self,
 *      then joining ordinal) — carried ROW-LEVEL on li[data-path],
 *      absent prop = today's tree.
 *   2. the PANEL focusWithIn + caret/selection (2.3 + presence-liveness
 *      P3/P4): remote foci resolve rows by the #<field> → prop-<field>
 *      law, ring = one box-shadow layer per player, caret bars ride
 *      the zero-width-span mirror measurement, a RANGE adds the
 *      selection highlight, and the UP lane reports throttled
 *      {kind:'panel', field, digest, selection} attention (null on
 *      blur; selectionchange is the main event, live typing admits at
 *      300ms).
 *   3. the remote-caret DOM half (the mirror div's MIRROR_PROPS copy
 *      law + the zero-width marker).
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
const shell = readFileSync(join(here, 'shell.svelte'), 'utf8');
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

test('the ribbon rides ribbonOf — self selection first, then the joining ordinal', () => {
  assert.match(tree, /import \{ ribbonOf, type RibbonStyle \} from '\.\/presence-visuals\.ts';/);
  assert.match(tree, /const ribbon = ribbonOf\(rowAttendeeHues\(path, node\)\)/, 'hues come from ribbonOf, never hand-rolled');
  // P6: the own selection is one's own ribbon segment — self first
  assert.match(tree, /if \(selfHue !== null && path === selectedPath\) hues\.push\(selfHue\)/, 'self leads the attendee hues');
  assert.match(tree, /for \(const entry of attendees\) hues\.push\(entry\.colorHue\)/, 'remotes follow in the roster (joining) order');
  // the hand-rolled border forms are retired — ribbonOf owns the syntax
  assert.ok(!/border-inline-start: 3px/.test(tree), 'no 3px border form remains');
  assert.ok(!/border-image: \$\{ribbon\.image\} 1;/.test(tree), 'no `1`-slice shorthand remains');
});

test('the ribbon map is derived over the usage rows, typed by RibbonStyle', () => {
  assert.match(tree, /const rowRibbons = \$derived\.by\(\(\) => \{/, 'the path→ribbon map is derived');
  assert.match(tree, /new Map<string, RibbonStyle>\(\)/, 'typed by RibbonStyle');
});

test('the lit row is inspectable at ROW level: data-jx-remote-ribbon lands on the li[data-path] itself', () => {
  assert.match(tree, /root\.querySelectorAll\('li\[data-path\]'\)/, 'the sync walks the rendered rows');
  assert.match(
    tree,
    /li\.setAttribute\('data-jx-remote-ribbon', ribbon\.single \? 'single' : 'multi'\)/,
    "the row carries the mode ('single' | 'multi')",
  );
  assert.match(tree, /li\.setAttribute\('style', ribbon\.style\)/, 'the row carries the complete Owner-syntax style');
  assert.match(tree, /li\.removeAttribute\('data-jx-remote-ribbon'\)/, 'an unlit row reverts clean');
  // the label span no longer carries the ribbon (the P6 row-level law)
  assert.ok(!/data-jx-remote-ribbon=\{lighting\.players/.test(tree), 'the span carry is retired');
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
  for (const member of ['playerId: string', 'name: string', 'colorHue: number', 'field: string', 'selection?: { readonly start: number; readonly end: number }']) {
    assert.ok(shape.includes(member), `RemotePanelFocus carries ${member}`);
  }
  const payload = panel.match(/export interface PanelAttentionFocus \{[\s\S]*?\}/)?.[0] ?? '';
  for (const member of ["kind: 'panel'", 'field: string', 'digest: string', 'selection?: { readonly start: number; readonly end: number }']) {
    assert.ok(payload.includes(member), `PanelAttentionFocus carries ${member}`);
  }
  assert.match(
    panel,
    /onPresenceAttention\?: \(focus: PanelAttentionFocus \| null\) => void/,
    'onPresenceAttention: the PanelCaretFocus payload or null',
  );
  assert.match(panel, /collabTail\?: number;/, 'the journal-tail pull counter (P3) is a primitive prop');
});

test('focusWithIn resolves the row by the retired shell law: #<field> then prop-<field>', () => {
  assert.match(
    panel,
    /document\.getElementById\(field\) \?\? document\.getElementById\(`prop-\$\{field\}`\)/,
  );
  // the panel-zone fallback died with the overlay — an unresolved field lights nothing
  assert.doesNotMatch(panel, /studio-panel-zone/);
});

test('the ring stacks one box-shadow layer per player, the caret bar is a 2px zero-width-mirror stripe, a range adds the highlight', () => {
  assert.match(panel, /`0 0 0 \$\{2 \* \(index \+ 1\)\}px \$\{playerHueCss\(player\.colorHue\)\}`/);
  assert.match(panel, /import \{ measureCaretMetrics, measureSelectionMetrics, selectionRects, trackFieldSelection \} from '\.\/remote-caret\.ts';/);
  assert.match(panel, /measureCaretMetrics\(field, sel\.end\)/, 'the caret geometry rides the selection end, zero-width-mirror-measured');
  assert.match(panel, /'width:2px'/);
  assert.match(panel, /metrics\.x \+ ordinal \* 2/, 'concurrent bars on one input stagger 2px apart');
  assert.match(panel, /data-jx-remote-caret/, playerMark('caret bar'));
  assert.match(panel, /data-jx-remote-chip/, playerMark('name chip'));
  // P4③: start≠end renders the highlight segment(s)
  assert.match(panel, /sel\.start !== sel\.end/, 'the range branch');
  assert.match(panel, /measureSelectionMetrics\(field, sel\.start, sel\.end\)/);
  assert.match(panel, /selectionRects\(range\.from, range\.to, metrics\.height, range\.contentWidth\)/, 'the pure segmentation drives the rects');
  assert.match(panel, /data-jx-remote-selection/, playerMark('selection highlight'));
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

test('the payload: kind panel, the field id, a ≤40-char digest, and the selection pair as {start, end}', () => {
  assert.match(panel, /export const ATTENTION_DIGEST_MAX = 40;/);
  assert.match(panel, /value\.slice\(0, ATTENTION_DIGEST_MAX\)/);
  assert.match(
    panel,
    /typeof selectionStart === 'number' && typeof selectionEnd === 'number'\s*\n\s*\? \{ selection: \{ start: selectionStart, end: selectionEnd \} \}/,
    'selectionStart AND selectionEnd both report (a range, not a lone offset)',
  );
  assert.match(panel, /kind: 'panel',\s*\n\s*field: target\.id,/);
});

test('the report vocabulary: only prop-/slot-text- control ids report (family auto-ids are noise)', () => {
  assert.match(panel, /id\.startsWith\('prop-'\) \|\| id\.startsWith\('slot-text-'\)/);
});

test('the throttle: leading fire + trailing flush of the last payload at 32ms (the P7 caret budget)', () => {
  assert.match(panel, /export const ATTENTION_REPORT_THROTTLE_MS = 32;/);
  assert.match(panel, /setTimeout\(\(\) => \{\s*\n\s*attentionTimer = undefined;\s*\n\s*flushPanelAttention\(\);/, 'the trailing edge');
});

test('selectionchange is the MAIN uplink event — rAF-coalesced by the tracker, stopped on teardown', () => {
  assert.match(panel, /trackFieldSelection\(/, 'the tracker mounts');
  assert.match(panel, /isReportableFieldId\(active\.id\) \? active : null/, 'the active-element gate is the reportable-field law');
  assert.match(panel, /selectionTracker\?\.stop\(\);/, 'unmount stops the document listener');
});

/* ── P3: the live input admit lane ───────────────────────────────────── */

test('live typing admits at a 300ms debounce — Enter is an accelerator, never the only path', () => {
  assert.match(panel, /export const LIVE_INPUT_DEBOUNCE_MS = 300;/);
  assert.match(panel, /debounceMs: LIVE_INPUT_DEBOUNCE_MS/, 'the client rides the live window');
  assert.match(panel, /function onLiveInput\(/, 'the input-event edit lane exists');
  assert.match(panel, /oninput=\{onPanelInput\}/, 'the delegated input drives both lanes');
  assert.match(panel, /client\.setDesired\(buffer, target\.value\);/, 'a slot-text keystroke setDesires immediately');
  assert.match(panel, /void commitRow\(row, target\.value\);/, 'a prop-text keystroke commits immediately');
});

test('peer materialize reseeds: the subscribe probes unseeded mirror buffers (finding A)', () => {
  // the walkthrough's finding A root: a peer's materialize lands as a NEW
  // mirror container the seed-time buffer list never knew — the subscribe
  // must probe the schema's prop names via mirrorCarriesUnseededBuffer and
  // reseed so the remote row becomes representable
  assert.match(panel, /mirrorCarriesUnseededBuffer\(prop\)/, 'the subscribe probes unseeded mirror buffers');
  assert.match(panel, /if \(grew\) void reseedAfterMaterialize\(\)/, 'growth triggers the reseed');
  assert.match(panel, /const known = new Set\(\(usageState\.buffers \?\? \[\]\)\.map/, 'the known-buffer guard precedes the probe');
});

test('the journal-tail pull: the shell bumps a counter, the panel syncs its mirror on every bump', () => {
  assert.match(panel, /collabTail/, 'the prop is read');
  assert.match(panel, /void collabTail;\s*\n\s*if \(client !== null\) void client\.syncNow\(\)/, 'each bump pulls the mirror');
  assert.match(shell, /let collabTailSeq = \$state\(0\);/, 'the shell holds the counter as $state');
  assert.match(shell, /collabTailSeq \+= 1;/, 'the journal-tail rebase bumps it');
  assert.match(shell, /collabTail=\{collabTailSeq\}/, 'the counter feeds the panel');
});

test('blur reports null — but a move WITHIN the panel re-reports instead of flashing', () => {
  assert.match(panel, /function onPresenceFieldBlur\(event: FocusEvent\)/);
  assert.match(panel, /reportPanelAttention\(null\);/);
  assert.match(panel, /isReportableFieldId\(event\.relatedTarget\.id\)/, 'the sibling-move guard');
});

test('unmount clears the throttle tail (no report after teardown)', () => {
  assert.match(panel, /clearTimeout\(attentionTimer\)/);
});

/* ── the remote-caret DOM half (source-law, the zero-width span mirror) ─ */

test('the mirror div copies the full MIRROR_PROPS list and wraps like the field (pre / pre-wrap)', () => {
  // the marker: SOURCE-ESCAPED six-ASCII-character form, never a literal
  assert.match(caretSource, /ZERO_WIDTH_MARKER = '\\u200b';/);
  assert.doesNotMatch(caretSource, /ZERO_WIDTH_MARKER = '[^']';/, 'no literal invisible char in the source');
  // the whitespace law: INPUT never wraps (pre), a textarea wraps (pre-wrap)
  assert.match(caretSource, /whiteSpace = input instanceof HTMLInputElement \? 'pre' : 'pre-wrap'/);
  assert.match(caretSource, /overflowWrap = 'break-word'/);
  // the copy list is the exported const the DOM half iterates
  assert.match(caretSource, /for \(const prop of MIRROR_PROPS\) mirror\.style\[prop\] = computed\[prop\];/);
  for (const property of ['fontFamily', 'letterSpacing', 'lineHeight', 'tabSize', 'paddingLeft', 'borderLeftWidth']) {
    assert.ok(caretSource.includes(`'${property}',`), `MIRROR_PROPS carries ${property}`);
  }
});

test('the DOM seams: measureCaretX is the brief-named export, scroll offsets are compensated, soft wraps are HONEST', () => {
  assert.match(
    caretSource,
    /export function measureCaretX\(input: HTMLInputElement \| HTMLTextAreaElement, offset: number\): number/,
  );
  assert.match(caretSource, /- input\.scrollLeft/);
  assert.match(caretSource, /- input\.scrollTop/);
  // v2's honesty: SOFT wraps read on the wrapped line (the mirror wraps identically)
  assert.match(caretSource, /SOFT wraps are HONEST/);
  // the single-line input's vertical CENTERING (the reference's law)
  assert.match(caretSource, /\(inputRect\.height - height\) \/ 2/);
});

test('the selectionchange tracker: document host, per-tick coalesce, dual-track scheduler, stop lane', () => {
  assert.match(caretSource, /host\.addEventListener\('selectionchange', onSelectionChange\);/);
  assert.match(caretSource, /export function trackFieldSelection\(/);
  assert.match(caretSource, /if \(pending\) return; \/\/ one read per scheduler tick/);
  assert.match(caretSource, /host\.removeEventListener\('selectionchange', onSelectionChange\);/);
  // the dual-track law (Codex R1 B3): a bare rAF hop is unbounded under
  // rAF starvation — the 8ms net caps the long tail, single-fire
  assert.match(caretSource, /export function dualTrackSchedule\(fn: \(\) => void\): void \{/);
  assert.match(caretSource, /setTimeout\(run, 8\);/);
  assert.match(caretSource, /if \(done\) return;/);
  assert.match(caretSource, /typeof requestAnimationFrame === 'function'\) requestAnimationFrame\(run\)/);
});

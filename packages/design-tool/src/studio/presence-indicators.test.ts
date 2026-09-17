/**
 * presence-indicators.test.ts — the collab-presence §4 SOURCE-LAW
 * battery on the indicator wiring (the stage-loading.test.ts style —
 * node, no DOM): each law of the three indicator families is pinned
 * as facts about the sources, so a regression (a dropped forward, a
 * renamed namespace, a lost fallback) fails HERE, at the package
 * gate, without a browser.
 *
 * Laws under test (design.md §4):
 *   1. the shell wires the store: connect with ?name= + the
 *      sessionStorage token, dispose on teardown
 *   2. the cursor surfaces split exactly: shell pointermove →
 *      'shell' (viewport coords); the canvas overlay's
 *      jx-design:local-cursor report → 'canvas' (canvas-document
 *      coords, verbatim — no lens math on the shell road)
 *   3. the canvas roster forwards through the lens-broadcast pattern
 *      (one rAF-coalesced postMessage per change)
 *   4. journal-tail owes an immediate /sync pull (serialized — a
 *      burst collapses), and the editing lane never rides the ws
 *   5. the namespace grammar `[data-jx-remote="<playerId>:<kind>"]`
 *      with kind ∈ cursor|canvas-focus|panel-focus, in BOTH documents
 *   6. the transition family: boxes 240ms classic curve (the picker
 *      INDICATOR_CSS law), cursors 60ms linear (a ~50ms stream)
 *   7. the ghost ring: player hue at opacity .55, badge
 *      `<name> · <component>#<n>`, frame targets resolve through the
 *      kit iframe + its offset
 *   8. the panel focus: `#<field>` row → `prop-<field>` → the panel
 *      zone fallback; 2px player-hue outline, badge + digest
 *   9. the chips: hue dot (85%, 45%), self first with (you), the
 *      online count
 *  10. degradation: an empty roster retires every overlay element;
 *      AI players never show cursors (hasMouse flips visibility, the
 *      element never rebuilds)
 *
 * Original need: collab-presence task group 2 (2026-09-16).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const shell = readFileSync(join(here, 'shell.svelte'), 'utf8');
const overlayPath = join(here, '..', 'server', 'entries', 'presence-overlay.js');
const overlay = readFileSync(overlayPath, 'utf8');
const canvasEntry = readFileSync(join(here, '..', 'server', 'entries', 'canvas-entry.js'), 'utf8');

/* ── law 1: the shell wires the store ────────────────────────────────── */

test('shell: the store is constructed with the browser socket, ?name= and the sessionStorage seam', () => {
  assert.match(shell, /import \{\s*PresenceStore,\s*browserPresenceSocket,/, 'the store + factory import');
  const wiring = shell.match(/const store = new PresenceStore\(\{[\s\S]*?\}\);/);
  assert.ok(wiring !== null, 'the PresenceStore construction must be found');
  assert.match(wiring[0], /socketFactory: browserPresenceSocket\(window\.location\)/, 'the browser ws factory');
  assert.match(wiring[0], /storage: sessionStorage/, 'the token lives in sessionStorage');
  const nameRead = shell.match(/new URLSearchParams\(window\.location\.search\)\.get\('name'\)/);
  assert.ok(nameRead !== null, 'the studio page ?name= parameter is read');
  assert.match(wiring[0], /name: urlName \?\? undefined/, 'the url name falls through to human-<rand4>');
});

test('shell: connect on mount, dispose on teardown — the effect owns the whole lifecycle', () => {
  const effect = shell.match(/\$effect\(\(\) => \{\s*\n\s*if \(typeof window === 'undefined'\) return;[\s\S]*?store\.connect\(\);[\s\S]*?\n  \}\);/);
  assert.ok(effect !== null, 'the presence lifecycle effect must exist and connect');
  const cleanup = effect[0].match(/return \(\) => \{[\s\S]*?store\.dispose\(\);[\s\S]*?\};/);
  assert.ok(cleanup !== null, 'the teardown disposes the store (no reconnect after unmount)');
});

/* ── law 2: the cursor surface split ─────────────────────────────────── */

test('shell: shell-surface pointermove reports viewport coords, throttled by the store', () => {
  assert.match(shell, /store\.reportCursor\('shell', event\.clientX, event\.clientY\)/, 'the chrome reports shell cursors');
  assert.match(shell, /window\.addEventListener\('pointermove', onPointerMove, \{ capture: true, passive: true \}\)/, 'the listener is capture-passive');
});

test('shell: the canvas overlay\'s local-cursor report becomes surface canvas, coordinates verbatim', () => {
  const listener = shell.match(/data\.type !== 'jx-design:local-cursor'[\s\S]{0,400}store\.reportCursor\('canvas', data\.x, data\.y\)/);
  assert.ok(listener !== null, 'the local-cursor message forwards as surface canvas with its own coordinates');
  assert.match(shell, /event\.source !== \(canvasIframe\?\.contentWindow \?\? null\)/, 'only the live canvas iframe\'s reports count');
});

/* ── law 3: the canvas roster forward (lens-broadcast pattern) ───────── */

test('shell: presence snapshots forward to the canvas as one rAF-coalesced postMessage', () => {
  const forward = shell.match(/function forwardPresenceToCanvas\(snapshot: PresenceSnapshot\): void \{[\s\S]*?\n  \}/);
  assert.ok(forward !== null, 'forwardPresenceToCanvas must exist');
  const body = forward[0];
  assert.match(body, /requestAnimationFrame/, 'the flush rides requestAnimationFrame');
  assert.match(body, /type: 'jx-design:presence'/, 'the message type rides the jx-design channel grammar');
  assert.match(body, /window\.location\.origin/, 'same-origin targeting');
  assert.match(body, /player\.playerId !== snapshot\.self\?\.playerId/, 'self never renders on remote documents');
});

/* ── law 4: journal-tail → /sync ─────────────────────────────────────── */

test('shell: journal-tail owes an immediate serialized /sync pull', () => {
  const seam = shell.match(/store\.on\('journal-tail', \(\) => rebaseAfterJournalTail\(\)\)/);
  assert.ok(seam !== null, 'the journal-tail event seam is subscribed');
  const fn = shell.match(/function rebaseAfterJournalTail\(\): void \{[\s\S]*?\n  \}/);
  assert.ok(fn !== null, 'rebaseAfterJournalTail must exist');
  assert.match(fn[0], /fetch\(COLLAB_SYNC_URL/, 'the rebase posts /sync');
  assert.match(shell, /const COLLAB_SYNC_URL = '\/__design__\/api\/collab\/sync'/, 'the collab sync endpoint');
  // serialized: a burst collapses to the last queued pass
  assert.match(fn[0], /collabSyncQueued = true/, 'in-flight tail requests queue');
  assert.match(fn[0], /\.finally\(\(\) => \{[\s\S]*?collabSyncQueued = false;[\s\S]*?rebaseAfterJournalTail\(\);/, 'the finally lane drains the queue');
});

/* ── laws 5–8: the overlay document ──────────────────────────────────── */

test('overlay: the namespace grammar — <playerId>:cursor and <playerId>:canvas-focus', () => {
  assert.match(overlay, /`\$\{player\.playerId\}:cursor`/, 'the cursor namespace builds from the playerId');
  assert.match(overlay, /`\$\{player\.playerId\}:canvas-focus`/, 'the ring namespace builds from the playerId');
  assert.match(overlay, /\[data-jx-remote\$=":cursor"\]/, 'the cursor CSS subclass');
  assert.match(overlay, /\[data-jx-remote\$=":canvas-focus"\]/, 'the ring CSS subclass');
});

test('overlay: the transition family — boxes 240ms classic curve, cursors 60ms linear', () => {
  assert.match(
    overlay,
    /transition: transform 240ms cubic-bezier\(0\.25, 0\.1, 0\.25, 1\), width 240ms cubic-bezier\(0\.25, 0\.1, 0\.25, 1\)/,
    'the shared box glide (picker INDICATOR_CSS verbatim)',
  );
  assert.match(overlay, /transition: transform 60ms linear, opacity 140ms ease/, 'the cursor tracks the ~50ms presence stream');
});

test('overlay: the ghost ring — player hue, .55 opacity, the component badge', () => {
  assert.match(overlay, /ring\.style\.borderColor = `hsl\(\$\{hue\}, 70%, 55%\)`/, 'the ring speaks the player hue');
  assert.match(overlay, /ring\.style\.opacity = '0\.55'/, '§4\'s .55 ring opacity');
  // the badge carries the componentId; a null instance drops the #n
  // (the matrix caught the hardcoded #1 pinning every ring to usage #1)
  assert.match(
    overlay,
    /entry\.badge\.textContent = attention\.instance === null \|\| attention\.instance === undefined/,
    'the badge branches on a null instance',
  );
  assert.match(overlay, /`\$\{name\} · \$\{attention\.component\}`/, 'the null-instance badge reads <name> · <component>');
});

test('overlay: attention resolves by componentId ACROSS documents (own doc first, then kit iframes)', () => {
  const resolve = overlay.match(/export function resolveAttentionBox\(attention\) \{[\s\S]*?\n\}/);
  assert.ok(resolve !== null, 'resolveAttentionBox must exist (exported — the report pattern)');
  const body = resolve[0];
  assert.match(body, /CSS\.escape\(attention\.component\)/, 'the componentId is selector-escaped (the injection guard)');
  assert.match(body, /\[id="\$\{CSS\.escape\(attention\.component\)\}"\]/, 'the protocol componentId resolves by the native id attribute');
  assert.match(body, /for \(const frame of document\.querySelectorAll\('iframe'\)\)/, 'kit iframes are searched in order');
  assert.match(body, /frame\.contentDocument/, 'same-origin document query');
  assert.match(body, /rect\.left \+ box\.left \+ window\.scrollX/, 'the frame offset + scroll land in canvas-document coords');
  assert.match(body, /continue; \/\/ cross-origin — not ours/, 'cross-origin frames are skipped');
  assert.match(overlay, /never a wrong-element ring/, 'unresolvable ids fade out, never a wrong-element ring (the law comment)');
});

test('overlay: the local cursor reports UP in canvas-document coordinates, ~50ms throttled', () => {
  const up = overlay.match(/document\.addEventListener\(\s*'pointermove',[\s\S]*?\{ capture: true, passive: true \},\s*\);/);
  assert.ok(up !== null, 'the pointermove listener must exist');
  assert.match(up[0], /event\.clientX \+ window\.scrollX/, 'canvas-document coordinates (the picker emit law)');
  assert.match(overlay, /LOCAL_CURSOR_THROTTLE_MS = 50/, 'the ~50ms throttle constant');
  assert.match(overlay, /type: 'jx-design:local-cursor'/, 'the up-channel message type');
});

test('overlay: the lens broadcast compensates chrome sizes only (the picker k law)', () => {
  assert.match(overlay, /data\.type === 'jx-design:lens'/, 'the overlay hears the existing lens broadcast');
  assert.match(overlay, /1 \/ Math\.min\(Math\.max\(lensScale, 0\.05\), 10\)/, 'the inverse-scale k law');
});

test('overlay: hasMouse flips VISIBILITY — the element never rebuilds; an empty roster retires everything', () => {
  assert.match(overlay, /entry\.cursor\.style\.opacity = entry\.hasMouse \? '1' : '0'/, 'the virtual-mouse law: show/hide, not destroy');
  assert.match(overlay, /if \(!live\.has\(playerId\)\) retireEntry\(playerId\)/, 'departed players retire');
  assert.match(overlay, /entry\.cursor\.remove\(\)/, 'retirement removes the DOM pair');
});

test('canvas-entry: the overlay mounts alongside the picker — one import, one call', () => {
  assert.match(canvasEntry, /import \{ initPresenceOverlay \} from '\.\/presence-overlay\.js'/, 'the import');
  assert.match(canvasEntry, /initPresenceOverlay\(\)/, 'the call');
  // the picker stays untouched — both families own the same document
  assert.match(canvasEntry, /import \{ initDesignPicker \} from '\.\/picker\.js'/, 'the picker import survives');
});

/* ── laws 8–9: the shell document's own indicators ───────────────────── */

test('shell: the panel focus resolves #<field>, falls back prop-<field>, then the panel zone', () => {
  const fn = shell.match(/function panelFocusRect\(field: string\)[\s\S]*?\n  \}/);
  assert.ok(fn !== null, 'panelFocusRect must exist');
  assert.match(fn[0], /document\.getElementById\(field\)/, '§1\'s field vocabulary addresses the row directly');
  assert.match(fn[0], /document\.getElementById\(`prop-\$\{field\}`\)/, 'the prop-prefixed row is the second try');
  assert.match(fn[0], /querySelector\('\.studio-panel-zone'\)/, 'the panel zone is the honest fallback');
});

test('shell: the panel-focus outline — 2px player hue, badge + digest, the 240ms handover curve', () => {
  assert.match(shell, /data-jx-remote=\{`\$\{view\.playerId\}:panel-focus`\}/, 'the shell-side namespace kind');
  assert.match(shell, /style:border-color=\{`hsl\(\$\{view\.colorHue\}, 85%, 45%\)`\}/, 'the 2px outline speaks the player hue');
  assert.match(shell, /\{view\.digest\}/, 'the digest text renders');
  const rule = shell.match(/\.studio-remote-panel-focus \{[\s\S]*?\}/);
  assert.ok(rule !== null, 'the outline rule must exist');
  assert.match(rule[0], /border: 2px solid/, '§4\'s 2px outline');
  assert.match(rule[0], /transform 240ms cubic-bezier\(0\.25, 0\.1, 0\.25, 1\)/, 'target handovers glide on the family curve');
  // a panel SCROLL re-reads the rects in place
  assert.match(shell, /addEventListener\('scroll', onScroll, \{ capture: true, passive: true \}\)/, 'the scroll follow keeps the outline honest');
});

test('shell: the shell-surface cursor speaks the same 60ms family', () => {
  assert.match(shell, /data-jx-remote={`\$\{player\.playerId\}:cursor`}/, 'the shell cursor namespace');
  const rule = shell.match(/\.studio-remote-cursor \{[\s\S]*?\}/);
  assert.ok(rule !== null);
  assert.match(rule[0], /transition: transform 60ms linear/, 'the ~50ms stream tracker');
  assert.match(shell, /style:opacity=\{player\.hasMouse \? '1' : '0'\}/, 'mouseless players hide, not destroy');
});

test('shell: the chips — hue dot, self first with (you), the online count', () => {
  assert.match(shell, /data-presence-chips/, 'the probe hook');
  assert.match(shell, /style:background=\{`hsl\(\$\{chip\.colorHue\}, 85%, 45%\)`\}/, "§4's chip dot");
  assert.match(shell, /\{chip\.isSelf \? ' \(you\)' : ''\}/, 'the self mark');
  assert.match(shell, /data-presence-online>\{presenceOnlineCount\} online/, 'the online count');
  // self is FIRST in the derived list
  const chips = shell.match(/const presenceChips = \$derived\.by\(\(\) => \{[\s\S]*?\n  \}\);/);
  assert.ok(chips !== null);
  assert.match(chips[0], /return \[\s*\n\s*\{\s*\n\s*playerId: presenceSelf\.playerId/, 'the self chip leads the list');
});

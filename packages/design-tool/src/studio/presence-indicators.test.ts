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

test('shell: cursors are canvas-scoped — the chrome lane is RETIRED (ruling 2)', () => {
  // nothing tracks the studio chrome anymore; cursors never spill onto the panels
  assert.ok(!/reportCursor\('shell'/.test(shell), 'no shell-surface cursor uplink remains');
  assert.ok(!/studio-remote-cursor[{\s]/.test(shell), 'no shell cursor overlay remains');
});

test('shell: the canvas overlay\'s local-cursor forwards WITH its canvas name', () => {
  // presence-liveness P2: the surface rides the report verbatim — a kit
  // frame's relay arrives as surface 'frame:<id>' and must survive the
  // forward (the stale-bundle red taught this: 'canvas'-hardcoding breaks
  // the frame offset on every remote renderer). Codex R1 N3: the forward
  // narrows surface at runtime (no `as never`) — 'canvas' or 'frame:<id>'
  const listener = shell.match(/data\.type !== 'jx-design:local-cursor'[\s\S]{0,900}store\.reportCursor\(data\.canvas, surface, data\.x, data\.y\)/);
  assert.ok(listener !== null, 'the report forwards canvas-scoped: name + surface + coords');
  assert.ok(!/surface as never/.test(shell), 'the `as never` cast is retired');
  assert.match(shell, /rawSurface !== 'canvas' && !rawSurface\.startsWith\('frame:'\)/, 'off-vocabulary surfaces die at the seam');
  assert.match(shell, /const rawSurface = typeof data\.surface === 'string' && data\.surface\.length > 0 \? data\.surface : 'canvas'/, 'absent surface falls back to canvas, present surfaces pass through');
  assert.match(shell, /typeof data\.canvas !== 'string' \|\| data\.canvas\.length === 0/, 'a nameless report is rejected');
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
  // presence-liveness P2's coordinate law: kit CSS px → canvas-doc px
  // through the measured lens scale k (pre/post-lens spaces meet only via k)
  assert.match(body, /const k = kitW > 0 && rect\.width > 0 \? rect\.width \/ kitW : 1;/, 'the measured lens scale');
  assert.match(body, /rect\.left \+ box\.left \* k \+ window\.scrollX/, 'the frame offset × k + scroll land in canvas-document coords');
  assert.match(body, /continue; \/\/ cross-origin — not ours/, 'cross-origin frames are skipped');
  assert.match(overlay, /never a wrong-element ring/, 'unresolvable ids fade out, never a wrong-element ring (the law comment)');
});

test('overlay: the local cursor reports UP in canvas-document coordinates, rAF-coalesced (P7)', () => {
  const up = overlay.match(/document\.addEventListener\(\s*'pointermove',[\s\S]*?\{ capture: true, passive: true \},\s*\);/);
  assert.ok(up !== null, 'the pointermove listener must exist');
  assert.match(up[0], /event\.clientX \+ window\.scrollX/, 'canvas-document coordinates (the picker emit law)');
  // presence-liveness P7: the report rides the frame cadence — one
  // postMessage per rAF, the 50ms trailing throttle is retired
  assert.match(up[0], /requestAnimationFrame/, 'rAF-coalesced (the game-grade latency budget)');
  assert.ok(!/LOCAL_CURSOR_THROTTLE_MS = 50/.test(overlay), 'the 50ms throttle constant is gone');
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

test('shell: the panel focus lives IN the panel now — the shell overlay is RETIRED (ruling 4)', () => {
  assert.ok(!/panelFocusRect/.test(shell), 'the shell-side rect machinery is gone');
  assert.ok(!/:panel-focus`/.test(shell), 'no shell-side panel-focus namespace remains');
  // the feed hands the property panel the foci (focusWithIn + caret render there)
  assert.match(shell, /presenceFoci=\{panelFoci\}/, 'the panel receives the foci feed');
  assert.match(shell, /onPresenceAttention=\{\(focus\) => reportOwnAttention/, 'the attention uplink reaches the store');
});

test('shell: the primary law — the local player re-hues the studio chrome', () => {
  assert.match(shell, /applyBrandHue\(document, snapshotNow\.self\.colorHue\)/, 'welcome/self-change applies the brand hue to the shell document');
  assert.match(shell, /hslHueToOklchHue\(snapshot\.self\.colorHue\)/, 'the canvas broadcast carries the bridged oklch hue');
  assert.match(shell, /brandHueOklch: selfHueOklch/, 'the presence message names it brandHueOklch');
});

test('shell: the nav ribbon rides the Owner border-image syntax (P5)', () => {
  assert.match(shell, /function navRibbonStyle/, 'the one-call style helper');
  // ribbonOf owns the syntax wholesale — the shell never hand-rolls a
  // border (the 3px solid / `… 1` shorthand forms are retired)
  assert.match(shell, /return ribbon === null \? null : ribbon\.style;/, 'the row carries ribbonOf\'s complete Owner-syntax style');
  assert.ok(!/border-inline-start: 3px/.test(shell), 'the 3px ribbon form is gone');
  assert.ok(!/border-image: \$\{ribbon\.image\} 1;/.test(shell), 'the `1`-slice shorthand is gone');
  // row-level contract (Codex R1 N1): the ROW element itself carries the
  // probe hook — the child span is retired, mirroring the tree's li law
  assert.match(shell, /data-jx-remote-ribbon=\{navRibbonStyle\(entry\.name\)[\s\S]*?'multi' : 'single'\)?\}/, 'the probe hook rides the row element and discriminates the modes');
  assert.ok(!/studio-nav-ribbon/.test(shell), 'the child-span ribbon is retired');
  // self-first (P5③): the local cursor's canvas lights its own nav row
  assert.match(shell, /ownCursor !== null && presenceSelf !== null/, 'the local player counts as a nav attendee, self first');
  assert.match(shell, /ownCursor = data\.canvas;/, 'the local-cursor uplink mirrors the canvas into the nav ribbon');
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

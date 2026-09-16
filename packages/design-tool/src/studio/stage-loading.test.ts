/**
 * stage-loading.test.ts — the design-studio-acceptance §2 contract on
 * the STUDIO SHELL side: the canvas loading's TWO BEATS (stage-view)
 * and the navigator's first-pull gate (shell), plus the §1 恢复 DOWN
 * drive (task 1.4, rides this same change). Source-law tests (the
 * panel-retired-chrome.test.ts style — node, no DOM): each law is
 * pinned as facts about the stage-view/shell sources, so a regression
 * (a dropped onload, the empty state asserting again before the first
 * pull, the restore losing its ring drive) fails HERE, at the package
 * gate, without a browser.
 *
 * The laws (design.md §2, §1 恢复):
 *   1. TWO beats, both consumed from EXISTING signals: beat 1 is the
 *      iframe's own load event (onload; the {#key src} remount re-arms
 *      it), beat 2 is the first jx-design:canvas-metrics report (the
 *      `sheet` state — non-null). Between mount and beat 2 the lens
 *      paints the blueprint skeleton; beat 1 only swaps the caption.
 *   2. the skeleton never blocks the stage: pointer-events none (the
 *      grid/HUD law), and it leaves at beat 2.
 *   3. the navigator never claims "no prototypes yet" from silence:
 *      until ONE manifest fetch has completed (ok OR failed) the
 *      loading line shows; only after a completed pull can the no-data
 *      Empty appear.
 *   4. a restored selection drives DOWN: the stored record reaches its
 *      canvas document through the tree-pick seam precedent
 *      (__jixoaiDesignHighlight), riding a load-event + poll freshness
 *      bus (documents load long after bootstrap) and retiring on any
 *      selection that is not the restored record itself.
 *
 * Original need: design-studio-acceptance-fixes tasks 2.1/2.2/1.4
 * (2026-09-16).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const stage = readFileSync(join(here, 'stage-view.svelte'), 'utf8');
const shell = readFileSync(join(here, 'shell.svelte'), 'utf8');

/* ── law 1: the two beats ────────────────────────────────────────────── */

test('beat 1 rides the iframe load event — onload wires the shell-ready state', () => {
  assert.match(stage, /<iframe[^>]*onload=\{onIframeLoad\}/, 'the iframe carries the load handler');
  assert.match(stage, /let shellReady = \$state\(false\)/, 'the beat-1 state starts down');
  assert.match(
    stage,
    /function onIframeLoad\(\): void \{\s*\n\s*shellReady = true;\s*\n\s*\}/,
    'the load event lifts beat 1',
  );
});

test('the {#key src} remount re-arms BOTH beats — the iframeEl effect resets sheet and shellReady together', () => {
  const effect = stage.match(/\$effect\(\(\) => \{\s*\n\s*if \(iframeEl === null\) return;\s*\n\s*sheet = null;\s*\n\s*shellReady = false;\s*\n\s*\}\)/);
  assert.ok(effect !== null, 'the iframe-identity effect must reset sheet AND shellReady (a fresh document loads fresh)');
});

test('the skeleton lives inside the lens wrapper under {#if sheet === null} — beat 2 (metrics) removes it', () => {
  const lens = stage.match(/class="studio-stage-lens"[\s\S]*?\{\/if\}\s*\n\s*<\/div>/);
  assert.ok(lens !== null, 'the lens wrapper block must be found');
  assert.match(lens[0], /\{#key src\}/, 'the keyed iframe seam stays inside the lens wrapper');
  assert.match(lens[0], /\{#if sheet === null\}/, 'the skeleton is gated on the pre-metrics sheet');
  assert.match(lens[0], /data-stage-skeleton/, 'the skeleton root carries the probe hook');
});

test('the two captions differ per beat — "loading <canvas>" then the shell-ready line', () => {
  const caption = stage.match(/data-stage-skeleton-label>\{shellReady \? '([^']+)' : '([^']+)'\}/);
  assert.ok(caption !== null, 'the caption must be a shellReady ternary');
  assert.equal(caption[1], 'shell ready · compiling', 'beat 1 → the shell-ready caption');
  assert.equal(caption[2], 'loading <canvas>', 'beat 0 → the loading caption');
  assert.match(
    stage,
    /data-beat=\{shellReady \? 'shell' : 'loading'\}/,
    'the beat probe attribute rides the same ternary',
  );
});

/* ── law 2: the skeleton never blocks the stage ─────────────────────── */

test('the skeleton is pointer-transparent and aria-hidden — pan/zoom pass through', () => {
  const rule = stage.match(/\.studio-stage-skeleton \{[^}]*\}/);
  assert.ok(rule !== null, 'the skeleton rule must exist');
  assert.match(rule[0], /pointer-events: none/, 'the skeleton must not eat the workspace gestures');
  assert.match(
    stage,
    /class="studio-stage-skeleton"[^>]*aria-hidden="true"/,
    'the skeleton is decoration — the stage stays the a11y surface',
  );
});

test('the skeleton speaks the blueprint language — dashed white-print wireframe + pulse + reduced-motion freeze', () => {
  assert.match(stage, /\.studio-stage-sk \{[^}]*border: 1px dashed rgba\(198, 226, 255/s, 'dashed white-print linework');
  assert.match(stage, /@keyframes studio-sk-pulse/, 'the micro-glow pulse keyframes exist');
  assert.match(
    stage,
    /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\n\s*\.studio-stage-sk \{[^}]*animation: none/s,
    'reduced motion freezes the pulse (the knowledge-pack law)',
  );
});

/* ── law 3: the navigator's first-pull gate ─────────────────────────── */

test('shell: the loading line precedes the Empty — absent is not empty', () => {
  const loading = shell.match(/\{#if !manifestLoadedOnce\}[\s\S]*?data-manifest-loading[\s\S]*?\{\/if\}/);
  assert.ok(loading !== null, 'the !manifestLoadedOnce branch renders the loading line');
  assert.match(shell, /\{:else if manifest\.length === 0 && manifestError === null\}/, 'the no-data Empty rides the else — only after a completed pull');
  // order: the loading branch must come FIRST
  const loadingAt = shell.indexOf('{#if !manifestLoadedOnce}');
  const emptyAt = shell.indexOf('{:else if manifest.length === 0 && manifestError === null}');
  assert.ok(loadingAt !== -1 && emptyAt !== -1 && loadingAt < emptyAt, 'loading before no-data');
});

test('shell: BOTH fetch outcomes lift the gate — ok and failed are each a completed pull', () => {
  const fn = shell.match(/async function refreshManifest\(\)[\s\S]*?\n  \}/);
  assert.ok(fn !== null, 'refreshManifest must be found');
  const body = fn[0];
  const successLift = body.match(/manifestError = null;\s*\n\s*\/\/[^\n]*\n\s*manifestLoadedOnce = true;/);
  assert.ok(successLift !== null, 'the success path lifts the gate');
  const catchLift = body.match(/manifestError = [^;]+;\s*\n\s*\/\/[\s\S]*?\n\s*manifestLoadedOnce = true;/);
  assert.ok(catchLift !== null, 'the guarded catch path lifts the gate too');
});

/* ── law 4: the restore drives DOWN (§1 恢复, task 1.4) ─────────────── */

test('shell: the canvas-gated restore arms the DOWN drive after the echo dispatch', () => {
  // the record waits for the canvas to land (usageIndex is file-scoped —
  // a wrong-canvas record restores NOTHING, the B2 blind spot), then
  // the gate's microtask dispatches and arms the drive + identity key
  const gate = shell.match(/if \(stored\.canvas !== currentName\) return;[\s\S]{0,260}queueMicrotask\(\(\) => \{[\s\S]{0,200}window\.dispatchEvent\(new CustomEvent\('jx-design:select', \{ detail: stored\.selection \}\)\);[\s\S]{0,240}restoreDrive = stored\.selection;[\s\S]{0,80}restoreDriveKey = JSON\.stringify\(stored\.selection\);/);
  assert.ok(gate !== null, 'the canvas-gated restore microtask arms the drive + its identity key after the dispatch');
  // bootstrap only stashes — the gate effect owns the dispatch
  const stash = shell.match(/const stored = restoreStoredSelection\(\);\s*\n\s*if \(stored !== null\) pendingRestore = stored;/);
  assert.ok(stash !== null, 'bootstrap stashes the record for the gate effect');
  // the stored record rides its canvas name (persist side)
  assert.match(shell, /JSON\.stringify\(\{ canvas: currentName, selection \}\)/, 'the stored record rides the canvas it was picked on');
});

test('shell: driveHighlightDown mirrors the tree-pick seam precedent', () => {
  const fn = shell.match(/function driveHighlightDown\(target: DesignSelection\): boolean \{[\s\S]*?\n  \}/);
  assert.ok(fn !== null, 'driveHighlightDown must exist');
  const body = fn[0];
  // the tree precedent (component-tree pick): frameId null → the canvas
  // window, else the kit iframe found by FRAME_NAME_PREFIX name
  assert.match(body, /target\.frameId === null\s*\n\s*\? element\.contentWindow\s*\n\s*: \(Array\.from\(doc\.querySelectorAll\('iframe'\)\)\.find\(/);
  assert.match(body, /frame\.name === `\$\{FRAME_NAME_PREFIX\}\$\{target\.frameId\}`/);
  // the DOWN call carries the record's usage + iteration axes
  assert.match(body, /seams\.__jixoaiDesignHighlight\(\{\s*\n\s*usageIndex: target\.usageIndex,\s*\n\s*iterationIndex: target\.iterationIndex,\s*\n\s*\} satisfies DesignHighlightTarget\);/);
  // not-ready documents return false (the driver retries): no window,
  // no seam — AND no stamp yet (the seam registers at picker init,
  // BEFORE the mount renders stamps — a call into an empty document
  // would consume the drive ringless; probe-caught)
  assert.match(body, /typeof seams\.__jixoaiDesignHighlight !== 'function'[\s\S]{0,120}return false;/);
  assert.match(body, /targetDoc\.querySelector\(`\[data-jx-instance="\$\{target\.usageIndex\}"\]`\) === null/, 'the usage stamp must exist before the call');
});

test('shell: the drive rides a load + poll freshness bus and retires on a replaced selection', () => {
  const fn = shell.match(/\$effect\(\(\) => \{\s*\n\s*if \(canvasIframe === null\) return;\s*\n\s*const element = canvasIframe;[\s\S]*?\n  \}\);/);
  assert.ok(fn !== null, 'the freshness effect must exist');
  const body = fn[0];
  // the tree's GATE-0 lesson: capture the element (cleanup runs post-null)
  assert.match(body, /const element = canvasIframe;/);
  assert.match(body, /element\.addEventListener\('load', attempt\)/, 'the canvas load event re-attempts');
  assert.match(body, /const timer = setInterval\(attempt, 1000\)/, 'the light poll covers the nested frames');
  assert.match(body, /clearInterval\(timer\)/, 'the bus cleans up');
  // a selection that is not the restored record retires the drive — by
  // SERIALIZED identity ($state deep-proxies objects on assignment, so
  // object identity can never compare — the probe caught exactly that)
  assert.match(body, /untrack\(\(\) => \(selection === null \? 'null' : JSON\.stringify\(selection\)\)\)/);
  assert.match(body, /if \(liveKey !== restoreDriveKey\) \{/, 'a different record (or a clear) retires the drive');
  assert.match(body, /if \(driveHighlightDown\(restoreDrive\)\) restoreDrive = null;/, 'success consumes the drive');
});

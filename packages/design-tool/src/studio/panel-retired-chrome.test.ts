/**
 * panel-retired-chrome.test.ts — the grindstone #17 pain-trio migration
 * contract on the STUDIO CONSUMPTION side (the W2c round): the
 * hand-written chrome is GONE and the registry components own the
 * surfaces. Source-law tests (the chrome-items.test.ts style — node,
 * no DOM): each of the three retirements is pinned as facts about the
 * panel/dock sources, so a regression (a copy-pasted idiom reborn, the
 * scheduler resurrected) fails HERE, at the package gate, without a
 * browser.
 *
 * The three laws (each retiring a studio-side pain from the ledger):
 *   1. notice.ts is DEAD — the transient alert rides the component's
 *      own dismiss="auto" + a keyed remount ({#key notice}); the two
 *      PERSISTENT alerts (agent lock, unresolved frame) keep passing
 *      NO dismiss prop (byte-identical DOM, the ID7 ruling).
 *   2. the seg/stepper snippets + their CSS retired into
 *      ItemSegmented/ItemStepper (grindstone #17-3) — adapters from
 *      #jixoai/list-item, no local .seg/.stepper classes, no step()
 *      clamp helper (the NumberInput owns clamping now).
 *   3. the lucide icon mini-map is LIVE (grindstone #17-2): the glyph
 *      snippet rides EVERY row kind through the family's icon lane;
 *      the DORMANT ledger sentence is gone.
 *
 * Original need: grindstone #17 (2026-09-13); these assertions replace
 * notice.test.ts's three lifecycle cases — the 6s-clock semantics they
 * pinned now live in the alert component's own spec (the www suite's
 * alert-dismiss.spec.ts, injected clocks) and here we lock the WIRING.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const panelPath = join(here, 'property-panel.svelte');
const panel = readFileSync(panelPath, 'utf8');

/* ── law 1: the notice scheduler is retired ──────────────────────────── */

test('notice.ts is deleted and unimported — no studio-side dismissal scheduler survives', () => {
  assert.equal(existsSync(join(here, 'notice.ts')), false, 'notice.ts must be gone (alert owns the clock)');
  assert.equal(existsSync(join(here, 'notice.test.ts')), false, 'notice.test.ts retired with it');
  assert.equal(existsSync(join(here, 'notice.js')), false);
  for (const source of ['property-panel.svelte']) {
    const text = readFileSync(join(here, source), 'utf8');
    assert.match(text, /from '#jixoai\/alert'/);
    assert.doesNotMatch(text, /createNoticeDismissal|NOTICE_DISMISS_MS|noticeDismissal/);
  }
});

test('the transient notice rides dismiss="auto" inside {#key notice} — onDismiss nulls the state', () => {
  // keyed remount = a fresh clock per message (the old "new show
  // replaces the old timer" law, remount edition)
  assert.match(panel, /\{#key notice\}/);
  const keyed = panel.match(/\{#key notice\}[\s\S]{0,400}?\{\/key\}/)?.[0] ?? '';
  assert.match(keyed, /<Alert[^>]*dismiss="auto"/, 'the keyed alert must pass dismiss="auto"');
  assert.match(keyed, /onDismiss=\{\(\) => \(notice = null\)\}/, 'both dismissal paths (button/timer) null the state');
  assert.match(keyed, /jx-hue-error/, 'the transient failure hue survives the migration');
});

test('the PERSISTENT alert passes no dismiss — the ID7 byte-stability ruling', () => {
  // M7a CONTRACT UPGRADE (collab-protocol): the agent-lock alert
  // RETIRED with the SSE client decorative lock (admission is the
  // authority — a racing agent turn auto-merges or raises the §6
  // inline conflict card, never a blanket read-only). The remaining
  // persistent alert is the unresolved-frame state.
  assert.doesNotMatch(panel, /agent turn in progress/, 'the SSE decorative lock alert is retired');
  assert.doesNotMatch(panel, /\blocked\b/, 'no locked prop survives the migration');
  const unresolved = panel.match(/\{#if file === null\}[\s\S]{0,600}?<\/Alert>\s*\{\/if\}/)?.[0] ?? '';
  assert.match(unresolved, /frame file unresolved/, 'the unresolved-frame alert');
  assert.doesNotMatch(unresolved, /dismiss=/, 'persistent = no lifecycle axis');
});

/* ── law 2: seg/stepper chrome retired into the adapters ─────────────── */

test('seg/stepper rows ride ItemSegmented/ItemStepper — the hand-written chrome is gone', () => {
  assert.match(panel, /import \{[^}]*ItemSegmented[^}]*\} from '#jixoai\/list-item'/);
  assert.match(panel, /import \{[^}]*ItemStepper[^}]*\} from '#jixoai\/list-item'/);
  // the adapters carry the rows: the markup branches exist and commit
  // through the same endpoint seam as every other kind (commitRow —
  // the M8 dispatcher that routes materializable rows to /materialize
  // and ordinary rows to the admit lane)
  assert.match(panel, /<ItemStepper[\s\S]{0,700}?void commitRow\(row, /);
  assert.match(panel, /<ItemSegmented[\s\S]{0,700}?onValueChange=\{\(option\) => void commitRow\(row, option\)\}/);
  assert.match(panel, /min=\{row\.minimum\}/);
  assert.match(panel, /max=\{row\.maximum\}/);
  // the retired chrome: no seg/stepper classes, no aria-pressed button
  // rows, no local clamp helper (the NumberInput owns clamping) — the
  // tokens are the MARKUP forms (prose may still name the retired law)
  for (const forbidden of ['.seg-btn', '.stepper-btn', '.stepper-value', 'class="seg', 'class="stepper', 'aria-pressed=', 'function step(']) {
    assert.ok(!panel.includes(forbidden), `property-panel must not contain the retired chrome: ${forbidden}`);
  }
});

/* ── law 3: the icon mini-map is live ────────────────────────────────── */

test('every row kind passes the glyph — the lucide mini-map left its DORMANT ledger line', () => {
  assert.doesNotMatch(panel, /DORMANT/, 'the grindstone ledger line closed with #17-2');
  // the per-row snippet composes from the mini-map + monogram fallback
  assert.match(panel, /\{#snippet glyph\(\)\}[\s\S]*?iconPathsOf\(row\.icon\)[\s\S]*?monogramOf\(row\.label\)[\s\S]*?\{\/snippet\}/);
  // all six row branches (toggle/select/text/stepper/segmented/readonly)
  // pass the icon lane through — count the exact passthrough expression
  const passthroughs = panel.match(/icon=\{row\.icon \? glyph : undefined\}/g) ?? [];
  assert.equal(passthroughs.length, 6, `expected the glyph on all six row kinds, found ${passthroughs.length}`);
});

/* ── the dock's copy of the same idioms (same-change closure) ────────── */

test('the dock retired its seg/stepper idioms too — the "without a registry adapter yet" debt is paid', () => {
  const dockPath = join(here, '../../../../registry/files/ui/component-canvas/canvas-playground.svelte');
  const dock = readFileSync(dockPath, 'utf8');
  assert.match(dock, /import \{[^}]*ItemSegmented[^}]*\} from '\$lib\/ui\/list-item'/);
  assert.match(dock, /import \{[^}]*ItemStepper[^}]*\} from '\$lib\/ui\/list-item'/);
  for (const forbidden of ['jx-canvas-seg-btn', 'jx-canvas-step-btn', 'jx-canvas-step-value', 'function stepValue(']) {
    assert.ok(!dock.includes(forbidden), `the dock must not contain the retired idiom: ${forbidden}`);
  }
  const cssPath = join(here, '../../../../registry/files/ui/component-canvas/component-canvas.css');
  const css = readFileSync(cssPath, 'utf8');
  for (const forbidden of ['.jx-canvas-seg', '.jx-canvas-stepper', '.jx-canvas-step']) {
    assert.ok(!css.includes(forbidden), `component-canvas.css must not contain the retired rules: ${forbidden}`);
  }
  assert.doesNotMatch(css, /without a registry adapter yet/, 'the header debt sentence retired with the idioms');
});

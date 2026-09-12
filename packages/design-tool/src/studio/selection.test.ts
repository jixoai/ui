/**
 * selection tests — the studio selection model (design-studio-r2
 * T4/T5/T6): the chat formats (the T6 contract), the tree builder,
 * and the DOM-generic collectors (structural fakes — no DOM dep, per
 * the "pure split for DOM logic" discipline).
 *
 * Original need: design-studio-r2 tasks.md T4/T5/T6 (2026-09-11).
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';

import {
  buildSelectionTree,
  collectCanvasRecords,
  collectFrameRecords,
  collectStampRecords,
  frameIdFromName,
  selectionChatPrefix,
  selectionChipLabel,
  selectionMessageBody,
  selectionShareNote,
  type WalkerElement,
  type WalkerIframe,
} from './selection.ts';

/* ── hand-rolled structural DOM (the collector's whole contract) ──── */

interface FakeElementSpec {
  component?: string;
  instance?: number;
  children?: FakeElementSpec[];
}

function fakeElement(spec: FakeElementSpec): WalkerElement {
  return {
    children: (spec.children ?? []).map(fakeElement),
    getAttribute(name: string): string | null {
      if (name === 'data-jx-component' && spec.component !== undefined) return spec.component;
      if (name === 'data-jx-instance' && spec.instance !== undefined) return String(spec.instance);
      return null;
    },
  };
}

function fakeIframe(name: string, body: FakeElementSpec | null): WalkerIframe {
  return {
    name,
    contentDocument: body === null ? null : { body: fakeElement(body) },
  };
}

/* ── T6 formats ─────────────────────────────────────────────────────── */

test('chat prefix: the stable agent-readable addressing format', () => {
  const selection = {
    frameId: 'hero-desktop-1280-dark',
    usageIndex: 2,
    iterationIndex: null,
    component: 'press-button',
    instanceCount: 1,
  };
  assert.equal(selectionChatPrefix(selection), '[selected: press-button#2 in hero-desktop-1280-dark]');
  // canvas-document picks address the canvas itself
  const canvasPick = { ...selection, frameId: null };
  assert.equal(selectionChatPrefix(canvasPick), '[selected: press-button#2 in canvas]');
});

test('share note: honest only when instances share the usage', () => {
  assert.equal(selectionShareNote({ frameId: 'f', usageIndex: 1, iterationIndex: 0, component: 'badge', instanceCount: 3 }), '3 instances share this usage');
  assert.equal(selectionShareNote({ frameId: 'f', usageIndex: 1, iterationIndex: null, component: 'badge', instanceCount: 1 }), null);
  const label = selectionChipLabel({ frameId: 'f', usageIndex: 1, iterationIndex: 0, component: 'badge', instanceCount: 3 });
  assert.equal(label, 'badge #1 · f — 3 instances share this usage');
});

test('message body: prefix line + share note + draft; null selection is the bare draft', () => {
  const withSelection = selectionMessageBody(
    { frameId: 'hero', usageIndex: 2, iterationIndex: null, component: 'press-button', instanceCount: 1 },
    'make it calmer',
  );
  assert.equal(withSelection, '[selected: press-button#2 in hero]\nmake it calmer');
  const shared = selectionMessageBody(
    { frameId: 'hero', usageIndex: 3, iterationIndex: 1, component: 'badge', instanceCount: 3 },
    'tighten',
  );
  assert.equal(
    shared,
    '[selected: badge#3 in hero]\n[3 instances share this usage — edits apply once at the usage site]\ntighten',
  );
  assert.equal(selectionMessageBody(null, 'just asking'), 'just asking');
});

/* ── T5 collectors + tree builder ───────────────────────────────────── */

test('frame name parsing: the kit iframe name carries the frame id', () => {
  assert.equal(frameIdFromName('jixoai-design-frame-hero-mobile-390-light'), 'hero-mobile-390-light');
  assert.equal(frameIdFromName('jxoai-design-frame-evil'), null); // wrong prefix
  assert.equal(frameIdFromName('jixoai-design-frame-'), null); // empty id
  assert.equal(frameIdFromName(''), null);
});

test('stamp walk: nesting by stamped ancestors, {#each} iterations collapse with a count', () => {
  // one hero page: Badge(1) then Card(2) containing CardBody(3) twice
  // (the each-loop), plus a nested Badge(4) inside the first CardBody
  const records = collectStampRecords(
    fakeElement({
      children: [
        { component: 'badge', instance: 1 },
        {
          component: 'card',
          instance: 2,
          children: [
            { component: 'card', instance: 3, children: [{ component: 'badge', instance: 4 }] },
            { component: 'card', instance: 3 },
            { component: 'card', instance: 3 },
          ],
        },
      ],
    }),
    'hero-frame',
  );
  // 6 stamped ELEMENTS walked in document order (the each-loop's 3
  // card bodies are 3 DOM instances of ONE usage)
  assert.equal(records.length, 6);
  const byUsage = (index: number) => records.find((record) => record.usageIndex === index)!;
  assert.equal(byUsage(1).parentUsageIndex, null);
  assert.equal(byUsage(2).parentUsageIndex, null);
  assert.equal(byUsage(3).parentUsageIndex, 2);
  assert.equal(byUsage(4).parentUsageIndex, 3);
  // the shared usage counts its 3 DOM instances
  assert.equal(byUsage(3).instanceCount, 3);
  assert.equal(byUsage(1).instanceCount, 1);

  const tree = buildSelectionTree(records);
  // 4 NODES (usage 3's iterations collapse into one)
  assert.equal(tree.length, 2);
  const card = tree.find((node) => node.usageIndex === 2)!;
  assert.equal(card.children.length, 1);
  assert.equal(card.children[0]!.usageIndex, 3);
  assert.equal(card.children[0]!.instanceCount, 3);
  assert.equal(card.children[0]!.children[0]!.usageIndex, 4);
});

test('canvas collection: canvas-doc usages carry frameId null, frames carry theirs', () => {
  const canvasBody: FakeElementSpec = {
    children: [
      // kit usages in the canvas document itself (PrototypePage etc.)
      { component: 'prototype-page', instance: 1 },
      { component: 'prototype-page', instance: 2 },
    ],
  };
  const frame = fakeIframe('jixoai-design-frame-hero-mobile-390-light', {
    children: [{ component: 'press-button', instance: 1 }, { component: 'press-button', instance: 1 }],
  });
  const foreign = fakeIframe('some-other-iframe', null); // no/blank doc — skipped
  const records = collectCanvasRecords({ body: fakeElement(canvasBody) }, [frame, foreign]);
  assert.equal(records.filter((record) => record.frameId === null).length, 2);
  const framed = records.filter((record) => record.frameId === 'hero-mobile-390-light');
  assert.equal(framed.length, 2);
  assert.equal(framed[0]!.instanceCount, 2); // the each-rendered pair shares

  const tree = buildSelectionTree(records);
  // three roots: two canvas-doc usages + one frame root (no cross-frame nesting)
  assert.equal(tree.length, 3);
  const frameRoot = tree.find((node) => node.frameId === 'hero-mobile-390-light')!;
  assert.equal(frameRoot.children.length, 0);
});

test('tree builder: cross-frame usageIndex collisions never nest across frames', () => {
  const records = [
    { frameId: 'a', component: 'badge', usageIndex: 2, instanceCount: 1, parentUsageIndex: 1 },
    { frameId: 'b', component: 'badge', usageIndex: 1, instanceCount: 1, parentUsageIndex: null },
  ];
  const tree = buildSelectionTree(records);
  // frame a's parent (usage 1 in frame a) does not exist — its node is a
  // ROOT, never nested under frame b's usage 1
  assert.equal(tree.length, 2);
  assert.equal(tree.every((node) => node.children.length === 0), true);
});

test('degenerate documents: null body / unstamped trees walk empty, never throw', () => {
  assert.deepEqual(collectStampRecords(null, 'f'), []);
  assert.deepEqual(collectStampRecords(fakeElement({ children: [{}, { children: [{}] }] }), 'f'), []);
  assert.deepEqual(collectCanvasRecords({ body: null }, []), []);
});

/* ── the #20 lazy collector ────────────────────────────────────────── */

test('per-frame collection: ONE frame by id, its document only (the lazy walk)', () => {
  const hero = fakeIframe('jixoai-design-frame-hero-mobile-390-light', {
    children: [
      { component: 'badge', instance: 1 },
      { component: 'press-button', instance: 2 },
    ],
  });
  const press = fakeIframe('jixoai-design-frame-press-idle-light', {
    children: [{ component: 'press-button', instance: 1 }],
  });
  const records = collectFrameRecords([hero, press], 'hero-mobile-390-light');
  // hero's two usages, ALL addressed to hero — press's document untouched
  assert.equal(records.length, 2);
  assert.equal(records.every((record) => record.frameId === 'hero-mobile-390-light'), true);
  assert.deepEqual(
    records.map((record) => record.component),
    ['badge', 'press-button'],
  );
});

test('per-frame collection: unknown id / mid-load frame walks empty, never throws', () => {
  const hero = fakeIframe('jixoai-design-frame-hero', { children: [{ component: 'badge', instance: 1 }] });
  assert.deepEqual(collectFrameRecords([hero], 'not-mounted-yet'), []);
  const midLoad = fakeIframe('jixoai-design-frame-hero', null); // no body yet
  assert.deepEqual(collectFrameRecords([midLoad], 'hero'), []);
  assert.deepEqual(collectFrameRecords([], 'hero'), []);
});

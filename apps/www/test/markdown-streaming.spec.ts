/**
 * Markdown streaming suite (test/markdown-streaming.spec.ts, 2026-09-06
 * — markdown-streaming tasks 2.5, the keyed-block laws L1–L4).
 *
 * The laws govern the KEYED ITEM, never the inner subtree, so the
 * assertions here are DOM IDENTITY checks across in-place prop updates
 * (rerender updates the same component instance's props — exactly the
 * append-only consumer feeding one <Markdown> per message):
 *   L1 prefix freeze — non-tail block elements keep their DOM node
 *       across chunk arrivals (element reference equality);
 *   L2 tail in place — the tail item survives an open fence CLOSING
 *       while it stays last (no remount at fence-close);
 *   L3 bounded transition — a tail element remounts exactly once when a
 *       successor appears (key :tail → digest) or its type transitions;
 *   L4 final convergence — streaming→false settles the tail, prefix
 *       identity never breaks.
 * Plus the streaming face (cursor + data-jx-markdown-streaming stamp),
 * the deterministic non-append reset, and the SSR snapshot law in the
 * repo's source-guard form (the vitest pipeline compiles client-side —
 * svelte/server cannot execute components, the composition-a.spec.ts
 * precedent): no hydration-only lifecycle in the family sources, and
 * two independent parser instances derive identical keys for the same
 * snapshot, matching the mounted block count.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Markdown from '$lib/ui/markdown/markdown.svelte';
import { createMarkdownParser } from '$lib/ui/markdown/parse';

const FENCE = '`'.repeat(3);

const cursorCss = readFileSync(
  resolve(import.meta.dirname, '../src/lib/ui/markdown/markdown.css'),
  'utf8',
);

describe('markdown — the streaming face', () => {
  it('authors the cursor law as data hooks only (css source guard)', () => {
    // data-hook selectors behind :where(), zero invented jx-* classes
    expect(cursorCss).toContain(':where([data-jx-markdown-cursor])');
    expect(cursorCss).not.toMatch(/\.jx-[a-z-]+\s*\{/);
    // blink ONLY under prefers-reduced-motion: no-preference — the
    // animation rule must sit inside that media gate
    const motionGate = cursorCss.indexOf('@media (prefers-reduced-motion: no-preference)');
    const blink = cursorCss.indexOf('jx-markdown-cursor-blink 1s');
    expect(motionGate).toBeGreaterThan(-1);
    expect(blink).toBeGreaterThan(motionGate);
    // a printed stream is done: the cursor hides under print
    const printGate = cursorCss.indexOf('@media print');
    expect(printGate).toBeGreaterThan(-1);
    expect(cursorCss.indexOf('display: none', printGate)).toBeGreaterThan(printGate);
  });

  it('stamps data-jx-markdown-streaming and trails the last block with the cursor', () => {
    const streaming = render(Markdown, {
      props: { source: '# Title\n\nBody.', streaming: true },
    });
    const root = streaming.container.querySelector('[data-jx-markdown]')!;
    expect(root.hasAttribute('data-jx-markdown-streaming')).toBe(true);
    const cursor = root.querySelector('[data-jx-markdown-cursor]')!;
    expect(cursor).not.toBeNull();
    expect(cursor.hasAttribute('aria-hidden')).toBe(true);
    // the cursor rides AFTER the last block, never inside it
    expect(root.lastElementChild).toBe(cursor);
    streaming.unmount();

    const settled = render(Markdown, {
      props: { source: '# Title\n\nBody.', streaming: false },
    });
    const staticRoot = settled.container.querySelector('[data-jx-markdown]')!;
    expect(staticRoot.hasAttribute('data-jx-markdown-streaming')).toBe(false);
    expect(staticRoot.querySelector('[data-jx-markdown-cursor]')).toBeNull();
  });

  it('streams an open fence through CodeCard with the partial code', () => {
    const streaming = render(Markdown, {
      props: { source: `${FENCE}ts\nconst a`, streaming: true },
    });
    const figure = streaming.container.querySelector('figure[data-kind="code"]')!;
    expect(figure).not.toBeNull();
    expect(figure.querySelector('pre code')!.textContent).toContain('const a');
    streaming.unmount();

    // static face: the same unclosed fence runs FINAL semantics — still
    // CodeCard with the literal partial code, never a loading state
    const statik = render(Markdown, {
      props: { source: `${FENCE}ts\nconst a`, streaming: false },
    });
    expect(statik.container.querySelector('figure[data-kind="code"]')!.querySelector('pre code')!.textContent).toContain('const a');
  });
});

describe('markdown — keyed-block identity (L1–L4)', () => {
  it('keeps prefix block DOM nodes across five append rounds (L1) with one bounded tail transition (L3)', () => {
    const chunks = [
      '# Stream',
      '# Stream\n\nIntro paragraph.',
      '# Stream\n\nIntro paragraph.\n\nSecond.',
      '# Stream\n\nIntro paragraph.\n\nSecond.\n\nThird.',
      '# Stream\n\nIntro paragraph.\n\nSecond.\n\nThird.\n\nFourth.',
      '# Stream\n\nIntro paragraph.\n\nSecond.\n\nThird.\n\nFourth.\n\nFifth.',
    ];
    const { container, rerender } = render(Markdown, {
      props: { source: chunks[0]!, streaming: true },
    });
    const root = container.querySelector('[data-jx-markdown]')!;
    const h1AsTail = root.querySelector('h1')!;

    // round 1: the successor appears — the old tail key (:tail) swaps to
    // its digest: exactly ONE remount for the heading (L3)
    rerender({ source: chunks[1]! });
    const h1 = root.querySelector('h1')!;
    expect(h1).not.toBe(h1AsTail);
    expect(h1AsTail.isConnected).toBe(false);

    // round 2: the intro paragraph freezes into the prefix — save it
    rerender({ source: chunks[2]! });
    const frozenH1 = root.querySelector('h1')!;
    const frozenP = root.querySelector('p')!;
    expect(frozenH1).toBe(h1);

    // rounds 3–5: appends only grow the tail; the frozen prefix keeps
    // its DOM node identity (L1) and the block count grows per chunk
    for (let round = 3; round < chunks.length; round++) {
      rerender({ source: chunks[round]! });
      expect(root.querySelector('h1')).toBe(frozenH1);
      expect(root.querySelector('p')).toBe(frozenP);
      expect(root.children.length).toBe(round + 1 + 1); // blocks + cursor
    }
  });

  it('never remounts the tail when an open fence closes while staying last (L2)', () => {
    const { container, rerender } = render(Markdown, {
      props: { source: `${FENCE}ts\nconst a`, streaming: true },
    });
    const root = container.querySelector('[data-jx-markdown]')!;
    const openFigure = root.querySelector('figure[data-kind="code"]')!;

    // the fence CLOSES but the block remains the tail — same DOM node,
    // CodeCard simply re-renders its final content in place
    rerender({ source: `${FENCE}ts\nconst a\nconst b\n${FENCE}` });
    const closedFigure = root.querySelector('figure[data-kind="code"]')!;
    expect(closedFigure).toBe(openFigure);
    expect(closedFigure.querySelector('pre code')!.textContent).toContain('const b');

    // a successor appears — the bounded key transition (L3): one remount
    rerender({ source: `${FENCE}ts\nconst a\nconst b\n${FENCE}\n\nafter the fence` });
    const settledFigure = root.querySelector('figure[data-kind="code"]')!;
    expect(settledFigure).not.toBe(openFigure);
    expect(root.querySelector('p')!.textContent).toBe('after the fence');
  });

  it('remounts a tail clean when its type transitions mid-stream', () => {
    const { container, rerender } = render(Markdown, {
      props: { source: 'End.\n\n**', streaming: true },
    });
    const root = container.querySelector('[data-jx-markdown]')!;
    const prefixP = root.querySelector('p')!; // 'End.' — already digest-keyed
    const tailAsParagraph = root.children[1]!;
    expect(tailAsParagraph.tagName).toBe('P');

    // '**' → '***': the tail block becomes a thematic break — the type
    // discriminator swaps the key, the old element leaves the document
    rerender({ source: 'End.\n\n***' });
    expect(root.querySelector('hr')).not.toBeNull();
    expect(tailAsParagraph.isConnected).toBe(false);
    expect(root.querySelector('p')).toBe(prefixP); // prefix identity unbroken
  });

  it('settles the stream without breaking the frozen prefix (L4)', () => {
    const { container, rerender } = render(Markdown, {
      props: { source: '# Stream\n\nIntro paragraph.\n\nUnsettled', streaming: true },
    });
    const root = container.querySelector('[data-jx-markdown]')!;
    // streaming → false re-parses with final semantics: the tail settles,
    // the stamp and cursor vanish, the frozen prefix keeps its nodes
    rerender({ source: '# Stream\n\nIntro paragraph.\n\nSettled and final.', streaming: false });
    const frozenH1 = root.querySelector('h1')!;
    const frozenP = root.querySelector('p')!;
    expect(frozenH1.textContent).toBe('Stream');
    expect(frozenP.textContent).toBe('Intro paragraph.');

    // further static edits keep the prefix frozen too
    rerender({ source: '# Stream\n\nIntro paragraph.\n\nEdited, still final.' });
    expect(root.querySelector('h1')).toBe(frozenH1);
    expect(root.querySelector('p')).toBe(frozenP);
    expect(root.hasAttribute('data-jx-markdown-streaming')).toBe(false);
    expect(root.querySelector('[data-jx-markdown-cursor]')).toBeNull();
  });

  it('recycles the component for a new message — non-append input resets deterministically', () => {
    const { container, rerender } = render(Markdown, {
      props: { source: '# Old message\n\nold body', streaming: true },
    });
    const root = container.querySelector('[data-jx-markdown]')!;
    rerender({ source: '# New message', streaming: true });
    expect(root.textContent).not.toContain('old body'); // stale cache dropped, no throw

    // the recycled instance streams on as usual (the fresh heading text
    // arrives once its line closes)
    rerender({ source: '# New message\n\nfresh body' });
    expect(root.querySelector('h1')!.textContent).toBe('New message');
    expect(root.querySelector('p')!.textContent).toBe('fresh body');
  });
});

describe('markdown — the SSR snapshot law (source-guard form)', () => {
  const specDir = resolve(import.meta.dirname, '.');
  const familySources = ['markdown.svelte', 'markdown-node.svelte']
    .map((file) => readFileSync(resolve(specDir, '../src/lib/ui/markdown', file), 'utf8'))
    .join('\n');

  it('carries no hydration-only lifecycle in the family sources', () => {
    // identical props ⇒ identical synchronous parse ⇒ shape-identical
    // hydration; nothing may exist that only a hydrated client runs
    for (const token of [/onMount\s*\(/, /onDestroy\s*\(/, /\$effect\s*\(/, /addEventListener\s*\(/]) {
      expect(familySources.match(token), `hydration-only token ${token}`).toBeNull();
    }
  });

  it('derives identical keys from independent parser instances and matches the mounted block count', () => {
    const snapshotSource = [
      '# Snapshot',
      '',
      'A **paragraph** with `chip` and [link](https://example.com).',
      '',
      '- one',
      '- two',
      '',
      `${FENCE}ts`,
      'const half = 0.5;',
      FENCE,
      '',
      '| L | R |',
      '| --- | ---: |',
      '| a | b |',
      '',
      '> quoted',
      '',
      '---',
    ].join('\n');

    // server-side adapter vs client adapter: same snapshot, same keys
    const serverParse = createMarkdownParser()(snapshotSource, true);
    const clientParse = createMarkdownParser()(snapshotSource, true);
    expect(clientParse.blocks.map((b) => b.key)).toEqual(serverParse.blocks.map((b) => b.key));
    expect(clientParse.mode).toBe('streaming');

    // the mounted DOM renders exactly one root child per keyed block
    // (+ the streaming cursor), in block order
    const { container } = render(Markdown, {
      props: { source: snapshotSource, streaming: true },
    });
    const root = container.querySelector('[data-jx-markdown]')!;
    expect(root.children.length).toBe(serverParse.blocks.length + 1);
    expect(root.lastElementChild!.matches('[data-jx-markdown-cursor]')).toBe(true);

    // the same snapshot in final mode: same shape minus the cursor
    const finalParse = createMarkdownParser()(snapshotSource, false);
    const finalMount = render(Markdown, {
      props: { source: snapshotSource, streaming: false },
    });
    const finalRoot = finalMount.container.querySelector('[data-jx-markdown]')!;
    expect(finalRoot.children.length).toBe(finalParse.blocks.length);
    expect(finalRoot.querySelector('[data-jx-markdown-cursor]')).toBeNull();
  });
});

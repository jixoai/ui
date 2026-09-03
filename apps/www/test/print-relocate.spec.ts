/**
 * The keep-enforcement gates (print-pipeline, 2026-09-03) — the
 * pure DOM-walk logic of lib/print/relocate.ts with INJECTED
 * measurement (jsdom has no layout; the geometry truths live in the
 * real-Chromium verify-print probe):
 *
 *   - STRAND relocation: the classic mend (the carrier's own host
 *     split — prepended into its continuation) and the ended-whole
 *     shape (the carrier's wrapper ended whole — it rides into the
 *     nearest ancestor continuation before its document-order
 *     successor)
 *   - REJOIN: a cut avoid block (data-split-to) reunites with its
 *     pair on a later page when the pair's page has room; an
 *     unsatisfiable rejoin ships as the cut
 *   - the re-examine chain: one move exposes the next strand
 *   - SATISFIABILITY: no room on the target page = no move (pagedjs's
 *     least-bad break stands)
 *   - healed seams: a move that orphans a split marker quiets it
 *   - resyncStringSets: pagedjs's per-page string variables
 *     re-derived from the final DOM (first/last/start/first-except
 *     + the carry chain)
 */
import { afterEach, describe, expect, it } from 'vitest';
import {
  relocateStrandedKeeps,
  resyncStringSets,
  stampSplitDashes,
  type KeepMeasure,
} from '../src/lib/print/relocate';

// ── the fixture: synthetic pages + a rect table ────────────────────────────

interface Rect {
  top?: number;
  bottom?: number;
  height?: number;
}

const el = (tag: string, attrs: Record<string, string> = {}): HTMLElement => {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  return node;
};

/** pages built left-to-right; every element gets a rect entry so the
 * measure never reads a default mid-fixture. document-connected so
 * isConnected assertions carry meaning */
class Fixture {
  readonly output = el('div');
  readonly pages: HTMLElement[] = [];
  readonly rects = new Map<HTMLElement, Required<Rect>>();

  constructor() {
    document.body.appendChild(this.output);
  }

  dispose(): void {
    this.output.remove();
  }

  page(): { page: HTMLElement; content: HTMLElement } {
    const page = el('div', { class: 'pagedjs_page' });
    const content = el('div', { class: 'pagedjs_page_content' });
    page.appendChild(content);
    this.output.appendChild(page);
    this.pages.push(page);
    this.rects.set(page, { top: 0, bottom: 1122, height: 1122 });
    this.rects.set(content, { top: 0, bottom: 1000, height: 1000 });
    return { page, content };
  }

  /** attach with a rect; children stack under the parent's flow */
  put(parent: HTMLElement, node: HTMLElement, rect: Rect): HTMLElement {
    parent.appendChild(node);
    this.rects.set(node, {
      top: rect.top ?? 0,
      bottom: rect.bottom ?? (rect.top ?? 0) + (rect.height ?? 0),
      height: rect.height ?? 0,
    });
    return node;
  }

  get measure(): KeepMeasure {
    const rects = this.rects;
    return {
      height: (node) => rects.get(node)?.height ?? 0,
      bottom: (node) => rects.get(node)?.bottom ?? 0,
      top: (node) => rects.get(node)?.top ?? 0,
    };
  }

  run(): ReturnType<typeof relocateStrandedKeeps> {
    return relocateStrandedKeeps(this.output, this.measure);
  }
}

// each fixture attaches to the body (isConnected must mean something)
afterEach(() => {
  document.body.innerHTML = '';
});

// ── strand relocation ──────────────────────────────────────────────────────

describe('relocateStrandedKeeps — strand relocation', () => {
  it('the classic mend: the carrier prepends into its host continuation, the emptied half prunes', () => {
    const fix = new Fixture();
    const page1 = fix.page().content;
    const sectionHalf1 = fix.put(
      page1,
      el('section', { 'data-ref': 'S1', 'data-split-to': '' }),
      { top: 0, height: 120, bottom: 120 },
    );
    const header = fix.put(
      sectionHalf1,
      el('div', { 'data-ref': 'H1', 'data-break-after': 'avoid' }),
      { top: 0, height: 120, bottom: 120 },
    );
    fix.put(header, el('p'), { top: 100, height: 20, bottom: 120 });

    const page2 = fix.page().content;
    const sectionHalf2 = fix.put(
      page2,
      el('section', { 'data-ref': 'S1', 'data-split-from': '' }),
      { top: 0, height: 400, bottom: 400 },
    );
    const body = fix.put(sectionHalf2, el('div', { 'data-ref': 'B1' }), {
      top: 0,
      height: 300,
      bottom: 300,
    });
    fix.put(body, el('p'), { top: 280, height: 20, bottom: 300 });

    const outcome = fix.run();
    expect(outcome).toEqual({ relocated: 1, rejoined: 0 });
    // the header rides into the continuation, as its FIRST child
    expect(sectionHalf2.firstElementChild).toBe(header);
    // the emptied start-half pruned, its orphaned marker healed
    expect(sectionHalf1.isConnected).toBe(false);
    expect(sectionHalf2.hasAttribute('data-split-from')).toBe(false);
  });

  it('the ended-whole shape: the carrier rides into the nearest ancestor continuation before its successor', () => {
    const fix = new Fixture();
    const page1 = fix.page().content;
    const bodyA = fix.put(page1, el('div', { 'data-ref': 'A1' }), {
      top: 0,
      height: 200,
      bottom: 200,
    });
    const wrapper = fix.put(bodyA, el('div', { 'data-ref': 'W1' }), {
      top: 0,
      height: 200,
      bottom: 200,
    });
    const h3 = fix.put(
      wrapper,
      el('h3', { 'data-ref': 'H31', 'data-break-after': 'avoid' }),
      { top: 180, height: 20, bottom: 200 },
    );

    const page2 = fix.page().content;
    const bodyA2 = fix.put(
      page2,
      el('div', { 'data-ref': 'A1', 'data-split-from': '' }),
      { top: 0, height: 500, bottom: 500 },
    );
    // an empty rebuilt wrapper first — the anchor must skip it
    fix.put(bodyA2, el('div', { 'data-ref': 'E1' }), { top: 0, height: 0, bottom: 0 });
    const successor = fix.put(bodyA2, el('div', { 'data-ref': 'N1' }), {
      top: 0,
      height: 400,
      bottom: 400,
    });
    fix.put(successor, el('p'), { top: 380, height: 20, bottom: 400 });

    const outcome = fix.run();
    expect(outcome).toEqual({ relocated: 1, rejoined: 0 });
    // immediately before the successor (the empty wrapper skipped)
    expect(h3.nextElementSibling).toBe(successor);
    expect(successor.previousElementSibling).toBe(h3);
    // the emptied wrapper pruned
    expect(wrapper.isConnected).toBe(false);
  });

  it('a move re-exposes the next strand on the same page (the round chain)', () => {
    const fix = new Fixture();
    const page1 = fix.page().content;
    const fig1Half = fix.put(
      page1,
      el('figure', { 'data-ref': 'F1', 'data-split-to': '' }),
      { top: 0, height: 40, bottom: 40 },
    );
    const cap1 = fix.put(
      fig1Half,
      el('figcaption', { 'data-ref': 'C1', 'data-break-after': 'avoid' }),
      { top: 20, height: 20, bottom: 40 },
    );
    void cap1;
    const fig2Half = fix.put(
      page1,
      el('figure', { 'data-ref': 'F2', 'data-split-to': '' }),
      { top: 60, height: 40, bottom: 100 },
    );
    fix.put(
      fig2Half,
      el('figcaption', { 'data-ref': 'C2', 'data-break-after': 'avoid' }),
      { top: 80, height: 20, bottom: 100 },
    );

    const page2 = fix.page().content;
    const fig1Cont = fix.put(
      page2,
      el('figure', { 'data-ref': 'F1', 'data-split-from': '' }),
      { top: 0, height: 200, bottom: 200 },
    );
    fix.put(fig1Cont, el('pre'), { top: 180, height: 20, bottom: 200 });
    const fig2Cont = fix.put(
      page2,
      el('figure', { 'data-ref': 'F2', 'data-split-from': '' }),
      { top: 220, height: 200, bottom: 420 },
    );
    fix.put(fig2Cont, el('pre'), { top: 400, height: 20, bottom: 420 });

    const outcome = fix.run();
    expect(outcome.relocated).toBe(2);
    expect(fig1Cont.querySelector('figcaption')).not.toBeNull();
    expect(fig2Cont.querySelector('figcaption')).not.toBeNull();
  });
});

// ── rejoin ─────────────────────────────────────────────────────────────────

describe('relocateStrandedKeeps — the cut avoid block rejoins its pair', () => {
  const buildRejoin = (pairLeafBottom: number) => {
    const fix = new Fixture();
    const page1 = fix.page().content;
    const sectionHalf1 = fix.put(
      page1,
      el('section', { 'data-ref': 'S1', 'data-split-to': '' }),
      { top: 0, height: 40, bottom: 40 },
    );
    const headerHalf = fix.put(
      sectionHalf1,
      el('div', {
        'data-ref': 'H1',
        'data-break-after': 'avoid',
        'data-split-to': '',
      }),
      { top: 0, height: 40, bottom: 40 },
    );
    const eyebrow = fix.put(headerHalf, el('p'), {
      top: 20,
      height: 20,
      bottom: 40,
    });
    const page2 = fix.page().content;
    const sectionHalf2 = fix.put(
      page2,
      el('section', { 'data-ref': 'S1', 'data-split-from': '' }),
      { top: 0, height: 600, bottom: 600 },
    );
    const headerPair = fix.put(
      sectionHalf2,
      el('div', {
        'data-ref': 'H1',
        'data-break-after': 'avoid',
        'data-split-from': '',
      }),
      { top: 0, height: 200, bottom: 200 },
    );
    const summary = fix.put(headerPair, el('p'), {
      top: pairLeafBottom - 20,
      height: 20,
      bottom: pairLeafBottom,
    });
    const bodyDiv = fix.put(sectionHalf2, el('div', { 'data-ref': 'B1' }), {
      top: 220,
      height: 300,
      bottom: 520,
    });
    fix.put(bodyDiv, el('p'), { top: 500, height: 20, bottom: 520 });
    return { fix, eyebrow, headerHalf, headerPair, summary, sectionHalf1, sectionHalf2 };
  };

  it('reunites the halves on the pair page and heals the seam', () => {
    const { fix, eyebrow, headerHalf, headerPair, summary, sectionHalf1, sectionHalf2 } =
      buildRejoin(200);
    const outcome = fix.run();
    expect(outcome).toEqual({ relocated: 0, rejoined: 1 });
    // the eyebrow lands before the pair's own content, in order
    expect(summary.previousElementSibling).toBe(eyebrow);
    expect(eyebrow.parentElement).toBe(headerPair);
    // the emptied half + its wrapper pruned; the healed pair draws no seam
    expect(headerHalf.isConnected).toBe(false);
    expect(sectionHalf1.isConnected).toBe(false);
    expect(headerPair.hasAttribute('data-split-from')).toBe(false);
    expect(sectionHalf2.hasAttribute('data-split-from')).toBe(false);
  });

  it('an unsatisfiable rejoin (no room on the pair page) ships as the cut', () => {
    const { fix, headerHalf } = buildRejoin(980);
    const outcome = fix.run();
    expect(outcome).toEqual({ relocated: 0, rejoined: 0 });
    expect(headerHalf.isConnected).toBe(true);
  });

  it('nested halves below the cut carrier are reunion content, not tears (the guard is strand-only)', () => {
    const fix = new Fixture();
    const page1 = fix.page().content;
    const sectionHalf1 = fix.put(
      page1,
      el('section', { 'data-ref': 'S1', 'data-split-to': '' }),
      { top: 0, height: 60, bottom: 60 },
    );
    const headerHalf = fix.put(
      sectionHalf1,
      el('div', {
        'data-ref': 'H1',
        'data-break-after': 'avoid',
        'data-split-to': '',
      }),
      { top: 0, height: 60, bottom: 60 },
    );
    // the cut fell INSIDE the inner gap div: eyebrow+h2 stayed, the
    // summary moved — the inner half carries its own split marker
    const gapHalf = fix.put(headerHalf, el('div', { 'data-ref': 'G1', 'data-split-to': '' }), {
      top: 20,
      height: 40,
      bottom: 60,
    });
    const h2 = fix.put(gapHalf, el('h2', { 'data-break-after': 'avoid' }), {
      top: 40,
      height: 20,
      bottom: 60,
    });
    const page2 = fix.page().content;
    const sectionHalf2 = fix.put(
      page2,
      el('section', { 'data-ref': 'S1', 'data-split-from': '' }),
      { top: 0, height: 500, bottom: 500 },
    );
    const headerPair = fix.put(
      sectionHalf2,
      el('div', {
        'data-ref': 'H1',
        'data-break-after': 'avoid',
        'data-split-from': '',
      }),
      { top: 0, height: 300, bottom: 300 },
    );
    const gapPair = fix.put(headerPair, el('div', { 'data-ref': 'G1', 'data-split-from': '' }), {
      top: 0,
      height: 100,
      bottom: 100,
    });
    const summary = fix.put(gapPair, el('p'), { top: 80, height: 20, bottom: 100 });

    const outcome = fix.run();
    expect(outcome).toEqual({ relocated: 0, rejoined: 1 });
    // the whole inner half moved wholesale — the h2 rides inside it,
    // and both inner halves reunite as SIBLINGS inside the pair (the
    // block reads whole; nested seams heal)
    expect(gapHalf.parentElement).toBe(headerPair);
    expect(gapPair.parentElement).toBe(headerPair);
    expect(headerPair.contains(h2)).toBe(true);
    expect(headerPair.contains(summary)).toBe(true);
    expect(h2.isConnected).toBe(true);
    expect(headerHalf.isConnected).toBe(false);
  });
});

// ── satisfiability + defensive guards ─────────────────────────────────────

describe('relocateStrandedKeeps — the bounding laws', () => {
  it('an unsatisfiable strand (no room on the continuation page) stands', () => {
    const fix = new Fixture();
    const page1 = fix.page().content;
    const sectionHalf1 = fix.put(
      page1,
      el('section', { 'data-ref': 'S1', 'data-split-to': '' }),
      { top: 0, height: 120, bottom: 120 },
    );
    const header = fix.put(
      sectionHalf1,
      el('div', { 'data-ref': 'H1', 'data-break-after': 'avoid' }),
      { top: 0, height: 120, bottom: 120 },
    );
    fix.put(header, el('p'), { top: 100, height: 20, bottom: 120 });

    const page2 = fix.page().content;
    const sectionHalf2 = fix.put(
      page2,
      el('section', { 'data-ref': 'S1', 'data-split-from': '' }),
      { top: 0, height: 980, bottom: 980 },
    );
    fix.put(sectionHalf2, el('p'), { top: 960, height: 20, bottom: 980 });

    expect(fix.run()).toEqual({ relocated: 0, rejoined: 0 });
    expect(header.parentElement).toBe(sectionHalf1);
  });

  it('a cut strictly below an uncut carrier is defensive: no move (the r5 tear law)', () => {
    const fix = new Fixture();
    const page1 = fix.page().content;
    const host = fix.put(page1, el('section', { 'data-ref': 'S1' }), {
      top: 0,
      height: 120,
      bottom: 120,
    });
    const header = fix.put(
      host,
      el('div', { 'data-ref': 'H1', 'data-break-after': 'avoid' }),
      { top: 0, height: 120, bottom: 120 },
    );
    const inner = fix.put(header, el('div', { 'data-ref': 'G1', 'data-split-to': '' }), {
      top: 80,
      height: 40,
      bottom: 120,
    });
    fix.put(inner, el('p'), { top: 100, height: 20, bottom: 120 });

    const page2 = fix.page().content;
    const host2 = fix.put(
      page2,
      el('section', { 'data-ref': 'S1', 'data-split-from': '' }),
      { top: 0, height: 300, bottom: 300 },
    );
    fix.put(host2, el('p'), { top: 280, height: 20, bottom: 300 });

    expect(fix.run()).toEqual({ relocated: 0, rejoined: 0 });
    expect(header.parentElement).toBe(host);
  });

  it('a strand with no continuation anywhere on later pages is not our shape', () => {
    const fix = new Fixture();
    const page1 = fix.page().content;
    const host = fix.put(page1, el('section', { 'data-ref': 'S1' }), {
      top: 0,
      height: 120,
      bottom: 120,
    });
    const header = fix.put(
      host,
      el('h2', { 'data-ref': 'H1', 'data-break-after': 'avoid' }),
      { top: 100, height: 20, bottom: 120 },
    );
    const page2 = fix.page().content;
    fix.put(page2, el('p', { 'data-ref': 'X1' }), { top: 980, height: 20, bottom: 1000 });

    expect(fix.run()).toEqual({ relocated: 0, rejoined: 0 });
    expect(header.isConnected).toBe(true);
  });
});

// ── stampSplitDashes (the dash is a BLOCK judgment) ───────────────────────

describe('stampSplitDashes — only boxed-card cuts draw the continuation dash', () => {
  it('a cut code card stamps every half; the plain wrappers around it draw nothing', () => {
    const fix = new Fixture();
    const p1 = fix.page().content;
    const rootHalf = fix.put(p1, el('div', { 'data-ref': 'R', 'data-split-to': '' }), {
      top: 0, height: 800, bottom: 800,
    });
    const cardHalf = fix.put(
      rootHalf,
      el('figure', { 'data-ref': 'C', class: 'jx-code-card', 'data-split-to': '' }),
      { top: 400, height: 400, bottom: 800 },
    );
    const preHalf = fix.put(cardHalf, el('pre', { 'data-ref': 'P', 'data-split-to': '' }), {
      top: 700, height: 100, bottom: 800,
    });
    const p2 = fix.page().content;
    const rootHalf2 = fix.put(p2, el('div', { 'data-ref': 'R', 'data-split-from': '' }), {
      top: 0, height: 900, bottom: 900,
    });
    const cardHalf2 = fix.put(
      rootHalf2,
      el('figure', { 'data-ref': 'C', class: 'jx-code-card', 'data-split-from': '' }),
      { top: 0, height: 300, bottom: 300 },
    );
    fix.put(cardHalf2, el('pre', { 'data-ref': 'P', 'data-split-from': '' }), {
      top: 0, height: 200, bottom: 200,
    });

    stampSplitDashes(fix.output);

    expect(cardHalf.hasAttribute('data-jx-split-dash')).toBe(true);
    expect(cardHalf2.hasAttribute('data-jx-split-dash')).toBe(true);
    // plain flow wrappers and the pre stay unstamped — the break
    // itself is their signal
    expect(rootHalf.hasAttribute('data-jx-split-dash')).toBe(false);
    expect(rootHalf2.hasAttribute('data-jx-split-dash')).toBe(false);
    expect(preHalf.hasAttribute('data-jx-split-dash')).toBe(false);
    // the r3 outer-quiet still marks the ancestor layers (their own
    // authored borders at the cut edge are suppressed)
    expect(rootHalf.hasAttribute('data-jx-split-outer')).toBe(true);
    expect(cardHalf.hasAttribute('data-jx-split-outer')).toBe(true);
    expect(preHalf.hasAttribute('data-jx-split-outer')).toBe(false);
  });

  it('a cut through plain flow (no boxed card in the chain) draws nothing', () => {
    const fix = new Fixture();
    const p1 = fix.page().content;
    fix.put(p1, el('div', { 'data-ref': 'R', 'data-split-to': '' }), {
      top: 0, height: 800, bottom: 800,
    });
    const p2 = fix.page().content;
    fix.put(p2, el('div', { 'data-ref': 'R', 'data-split-from': '' }), {
      top: 0, height: 900, bottom: 900,
    });

    stampSplitDashes(fix.output);

    expect(fix.output.querySelectorAll('[data-jx-split-dash]')).toHaveLength(0);
  });

  it('a boxed section and a code card cut at the same page edge collapse to the innermost', () => {
    const fix = new Fixture();
    const p1 = fix.page().content;
    const sectionHalf = fix.put(
      p1,
      el('section', {
        'data-ref': 'S',
        class: 'bg-card',
        'data-jx-print': 'boxed',
        'data-split-to': '',
      }),
      { top: 0, height: 800, bottom: 800 },
    );
    const cardHalf = fix.put(
      sectionHalf,
      el('figure', { 'data-ref': 'C', class: 'jx-code-card', 'data-split-to': '' }),
      { top: 500, height: 300, bottom: 800 },
    );
    const p2 = fix.page().content;
    const sectionHalf2 = fix.put(
      p2,
      el('section', {
        'data-ref': 'S',
        class: 'bg-card',
        'data-jx-print': 'boxed',
        'data-split-from': '',
      }),
      { top: 0, height: 700, bottom: 700 },
    );
    fix.put(sectionHalf2, el('figure', { 'data-ref': 'C', class: 'jx-code-card', 'data-split-from': '' }), {
      top: 0, height: 300, bottom: 300,
    });

    stampSplitDashes(fix.output);

    // the code card is the visible object being cut — one dash
    expect(cardHalf.hasAttribute('data-jx-split-dash')).toBe(true);
    expect(sectionHalf.hasAttribute('data-jx-split-dash')).toBe(false);
  });

  it('the DEFAULT borderless section card never dashes (paper is the frame — Owner correction)', () => {
    const fix = new Fixture();
    const p1 = fix.page().content;
    const sectionHalf = fix.put(
      p1,
      el('section', { 'data-ref': 'S', class: 'bg-card', 'data-split-to': '' }),
      { top: 0, height: 800, bottom: 800 },
    );
    fix.put(sectionHalf, el('div', { 'data-ref': 'B', 'data-split-to': '' }), {
      top: 700, height: 100, bottom: 800,
    });
    const p2 = fix.page().content;
    const sectionHalf2 = fix.put(
      p2,
      el('section', { 'data-ref': 'S', class: 'bg-card', 'data-split-from': '' }),
      { top: 0, height: 700, bottom: 700 },
    );
    fix.put(sectionHalf2, el('div', { 'data-ref': 'B', 'data-split-from': '' }), {
      top: 0, height: 100, bottom: 100,
    });

    stampSplitDashes(fix.output);

    expect(fix.output.querySelectorAll('[data-jx-split-dash]')).toHaveLength(0);
  });

  it('a card spanning three pages stamps each half on its cut sides', () => {
    const fix = new Fixture();
    const p1 = fix.page().content;
    const half1 = fix.put(
      p1,
      el('figure', { 'data-ref': 'C', class: 'jx-code-card', 'data-split-to': '' }),
      { top: 0, height: 500, bottom: 500 },
    );
    const p2 = fix.page().content;
    const half2 = fix.put(
      p2,
      el('figure', {
        'data-ref': 'C',
        class: 'jx-code-card',
        'data-split-to': '',
        'data-split-from': '',
      }),
      { top: 0, height: 900, bottom: 900 },
    );
    const p3 = fix.page().content;
    const half3 = fix.put(
      p3,
      el('figure', { 'data-ref': 'C', class: 'jx-code-card', 'data-split-from': '' }),
      { top: 0, height: 300, bottom: 300 },
    );

    stampSplitDashes(fix.output);

    for (const half of [half1, half2, half3]) {
      expect(half.hasAttribute('data-jx-split-dash')).toBe(true);
    }
  });
});

// ── resyncStringSets ───────────────────────────────────────────────────────

describe('resyncStringSets — the running-head variables re-derived', () => {
  it('mirrors pagedjs first/last/start/first-except semantics across the carry chain', () => {
    const fix = new Fixture();
    // page 1: the ToC page — no h1/h2 of its own
    fix.page();
    // page 2: the doc title + a mid-page section start
    const p2 = fix.page();
    const h1 = fix.put(p2.content, el('h1'), { top: 0, height: 40, bottom: 40 });
    h1.textContent = 'the document';
    const alpha = fix.put(p2.content, el('h2'), { top: 200, height: 30, bottom: 230 });
    alpha.textContent = 'Alpha';
    // page 3: a section that OPENS the page (start = first)
    const p3 = fix.page();
    const beta = fix.put(p3.content, el('h2'), { top: 0, height: 30, bottom: 30 });
    beta.textContent = 'Beta';
    // page 4: nothing — everything carries
    fix.page();

    resyncStringSets(fix.output, fix.measure);

    const varOf = (page: HTMLElement, name: string): string =>
      page.style.getPropertyValue(`--pagedjs-string-first-${name}`);
    expect(varOf(fix.pages[0], 'sectionTitle')).toBe('""');
    expect(varOf(fix.pages[1], 'docTitle')).toBe('"the document"');
    expect(varOf(fix.pages[1], 'sectionTitle')).toBe('"Alpha"');
    // 'start' stays carried when the h2 does not sit at the content top
    expect(fix.pages[1].style.getPropertyValue('--pagedjs-string-start-sectionTitle')).toBe(
      '""',
    );
    expect(varOf(fix.pages[2], 'sectionTitle')).toBe('"Beta"');
    expect(fix.pages[2].style.getPropertyValue('--pagedjs-string-start-sectionTitle')).toBe(
      '"Beta"',
    );
    expect(fix.pages[2].style.getPropertyValue('--pagedjs-string-last-sectionTitle')).toBe(
      '"Beta"',
    );
    expect(varOf(fix.pages[3], 'sectionTitle')).toBe('"Beta"');
    expect(
      fix.pages[3].style.getPropertyValue('--pagedjs-string-first-except-sectionTitle'),
    ).toBe('"Beta"');
    // docTitle carries too
    expect(varOf(fix.pages[3], 'docTitle')).toBe('"the document"');
  });
});

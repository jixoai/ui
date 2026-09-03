/**
 * The prepareSnapshot pure-function gates (print-pipeline,
 * 2026-08-30) — verification.md's jsdom lane: path/slot resolution,
 * the delay′ math, the six diagnostic codes' classification, the
 * clone transforms (pre line splitting, ToC nav injection, id
 * preservation), and the scoped animation protocol's capture/restore
 * discipline (patched getAnimations; jsdom has no CSS animation
 * timeline — the computed-phase assertions live in verify-print's
 * real Chromium lane by contract).
 *
 * Section 7 runs the WHOLE transaction (Codex review P1-1/P1-2,
 * 2026-08-30): jsdom's visual rAF makes doubleRaf real, document.fonts
 * is optional, and captureAnimations no-ops without the Web Animations
 * API — a patched root.getAnimations is the capture ORDERING
 * observable, and the live img attributes are the reversibility one.
 */
import { describe, expect, it, vi } from 'vitest';
import { PRINT_SIM_ATTR } from '../src/lib/medium.svelte';
import {
  applyFrameTransfer,
  captureAnimations,
  classifySlot,
  elementPath,
  hashSnapshot,
  injectTocNav,
  liftImages,
  makeRestoreToken,
  parseIterationList,
  parseTimeList,
  planFrameTransfer,
  prepareSnapshot,
  resolvePath,
  retireDarkUtilities,
  slotIndexOf,
  splitPreLines,
  transferDelay,
  type CapturedAnimation,
  type ComputedAnimationInfo,
} from '../src/lib/print/freeze.svelte';

// =========================================================================
// 1 · the per-slot math (design.md's exact write rule)
// =========================================================================
describe('transferDelay — delay′ = (c < d) ? (d − c) : −((c − d) mod D)', () => {
  it('pre-delay segment → the REMAINING delay', () => {
    expect(transferDelay(400, 1000, 3000)).toBe(600);
    expect(transferDelay(0, 250, 1000)).toBe(250);
  });

  it('running segment → negative phase so t=0 sits at the source phase', () => {
    expect(transferDelay(1700, 200, 3000)).toBe(-1500 % 3000 === 0 ? 0 : -1500);
    // (1700−200) = 1500 → −1500
    expect(transferDelay(1700, 200, 3000)).toBe(-1500);
  });

  it('wraps modulo the duration (iteration-boundary crossings)', () => {
    // (3200−200) = 3000 ≡ 0 (mod 3000) → phase 0
    expect(transferDelay(3200, 200, 3000)).toBe(-0);
    // (4700−200) = 4500 ≡ 1500 (mod 3000)
    expect(transferDelay(4700, 200, 3000)).toBe(-1500);
  });

  it('c ≡ d exactly → phase 0 (−0)', () => {
    expect(transferDelay(200, 200, 3000)).toBe(-0);
    expect(Object.is(transferDelay(200, 200, 3000), -0)).toBe(true);
  });
});

describe('parseTimeList / parseIterationList', () => {
  it('parses seconds, milliseconds and comma lists', () => {
    expect(parseTimeList('-0.8s, 2.7s, 100ms')).toEqual([-800, 2700, 100]);
    expect(parseTimeList('0s')).toEqual([0]);
    expect(parseTimeList(null)).toEqual([]);
    expect(parseTimeList('')).toEqual([]);
  });

  it('parses iteration counts with infinite', () => {
    expect(parseIterationList('infinite, 3')).toEqual([Infinity, 3]);
    expect(parseIterationList('2')).toEqual([2]);
  });
});

describe('slotIndexOf — the slot key occurrence axis', () => {
  it('finds the nth occurrence of a repeated name', () => {
    expect(slotIndexOf(['a', 'b', 'a'], 'a', 0)).toBe(0);
    expect(slotIndexOf(['a', 'b', 'a'], 'a', 1)).toBe(2);
    expect(slotIndexOf(['a', 'b', 'a'], 'b', 0)).toBe(1);
  });

  it('returns -1 when the occurrence does not exist', () => {
    expect(slotIndexOf(['a', 'b'], 'a', 1)).toBe(-1);
    expect(slotIndexOf(['a'], 'zzz', 0)).toBe(-1);
  });
});

// =========================================================================
// 2 · the six diagnostic codes (continue, never reject)
// =========================================================================
describe('classifySlot', () => {
  it('FINISHED: finite N with c ≥ d + D·N', () => {
    const out = classifySlot({ c: 900, d: 100, D: 400, N: 2, direction: 'normal' });
    expect(out.diagnostic).toBe('FINISHED');
    expect(out.delayPrime).toBeNull();
  });

  it('ALTERNATE: direction contains alternate (the formula has no flip model)', () => {
    for (const direction of ['alternate', 'alternate-reverse']) {
      expect(
        classifySlot({ c: 500, d: 100, D: 400, N: Infinity, direction }).diagnostic,
      ).toBe('ALTERNATE');
    }
  });

  it('a healthy running slot transfers (no diagnostic)', () => {
    // (700−100) = 600 ≡ 200 (mod 400)
    const out = classifySlot({ c: 700, d: 100, D: 400, N: Infinity, direction: 'normal' });
    expect(out.diagnostic).toBeNull();
    expect(out.delayPrime).toBe(-200);
  });

  it('reverse direction (non-alternate) transfers normally', () => {
    expect(
      classifySlot({ c: 700, d: 100, D: 400, N: Infinity, direction: 'reverse' }).diagnostic,
    ).toBeNull();
  });
});

// =========================================================================
// 3 · element ordinal paths (the slot key's first axis)
// =========================================================================
describe('elementPath / resolvePath', () => {
  function fixture(): HTMLElement {
    const root = document.createElement('div');
    root.innerHTML = `
      <section>
        <p>one</p>
        <p>two <em>deep</em></p>
      </section>
      <aside>side</aside>`;
    document.body.appendChild(root);
    return root;
  }

  it('round-trips child-index paths through a clone (order preserved)', () => {
    const root = fixture();
    const em = root.querySelector('em')!;
    const path = elementPath(root, em);
    expect(path).toEqual([0, 1, 0]); // element children only
    const clone = root.cloneNode(true) as HTMLElement;
    expect(resolvePath(clone, path)?.tagName).toBe('EM');
    expect(resolvePath(clone, path)?.textContent).toBe('deep');
  });

  it('the root itself is the empty path; outside-root elements are unusable', () => {
    const root = fixture();
    expect(elementPath(root, root)).toEqual([]);
    const stranger = document.createElement('p');
    document.body.appendChild(stranger);
    expect(elementPath(root, stranger)).toEqual([]);
    expect(resolvePath(root, [9, 9])).toBeNull();
  });
});

// =========================================================================
// 4 · planFrameTransfer + applyFrameTransfer (injected computed reads)
// =========================================================================
const info = (over: Partial<ComputedAnimationInfo> = {}): ComputedAnimationInfo => ({
  names: ['jx-fx-a'],
  delays: [-800],
  durations: [4000],
  iterations: [Infinity],
  directions: ['normal'],
  transitionProperty: 'all',
  ...over,
});

function fakeCssAnimation(over: {
  target: Element;
  name: string;
  currentTime: number;
  running?: boolean;
}): CapturedAnimation {
  class CSSAnimationFake {
    playState = over.running === false ? 'finished' : 'running';
    currentTime = over.currentTime;
    animationName = over.name;
    effect = { target: over.target };
    pause = vi.fn();
    play = vi.fn();
  }
  (window as unknown as { CSSAnimation: unknown }).CSSAnimation ??= CSSAnimationFake;
  const anim = new CSSAnimationFake() as unknown as Animation & { animationName: string };
  return {
    anim,
    kind: 'css-animation',
    wasRunning: anim.playState === 'running',
    currentTime: over.currentTime,
    animationName: over.name,
  };
}

function fakeWaapi(target: Element, running = true): CapturedAnimation {
  class AnimationFake {
    playState = running ? 'running' : 'finished';
    currentTime = 1234;
    effect = { target };
    pause = vi.fn();
    play = vi.fn();
  }
  (window as unknown as { Animation: unknown }).Animation ??= AnimationFake;
  const anim = new AnimationFake() as unknown as Animation;
  const hasCssAnimation = 'CSSAnimation' in window;
  return {
    anim,
    // classify exactly as the real classifier would for a plain Animation
    kind: hasCssAnimation && anim instanceof (window.Animation as never) ? 'waapi' : 'js',
    wasRunning: running,
    currentTime: 1234,
  };
}

describe('planFrameTransfer', () => {
  it('transfers a running css-animation slot with the formula value', () => {
    const root = document.createElement('div');
    root.innerHTML = '<span class="fx">x</span>';
    const span = root.firstElementChild!;
    const record = fakeCssAnimation({ target: span, name: 'jx-fx-a', currentTime: 2700 });
    const plan = planFrameTransfer(root, [record], () => info());
    expect(plan.writes).toHaveLength(1);
    const write = plan.writes[0]!;
    // c=2700, d=−800 → (c−d)=3500 → −3500 (mod 4000)
    expect(write.delays[0]).toBe(-3500);
    expect(write.slots[0]!.delayPrime).toBe(-3500);
    expect(plan.diagnostics).toEqual([]);
  });

  it('emits WAAPI diagnostics and continues', () => {
    const root = document.createElement('div');
    root.innerHTML = '<i class="w">y</i>';
    const record = fakeWaapi(root.firstElementChild!);
    const plan = planFrameTransfer(root, [record], () => info());
    expect(plan.writes).toHaveLength(0);
    expect(plan.diagnostics.map((d) => d.code)).toContain('WAAPI');
  });

  it('NO_NAME when computed animation-name is none', () => {
    const root = document.createElement('div');
    root.innerHTML = '<b>z</b>';
    const record = fakeCssAnimation({ target: root.firstElementChild!, name: '', currentTime: 10 });
    const plan = planFrameTransfer(root, [record], () => info({ names: ['none'] }));
    expect(plan.diagnostics.map((d) => d.code)).toEqual(['NO_NAME']);
  });

  it('UNMATCHED_SLOT when the occurrence is absent from the name list', () => {
    const root = document.createElement('div');
    root.innerHTML = '<b>z</b>';
    const record = fakeCssAnimation({ target: root.firstElementChild!, name: 'gone', currentTime: 10 });
    const plan = planFrameTransfer(root, [record], () => info({ names: ['other'] }));
    expect(plan.diagnostics.map((d) => d.code)).toEqual(['UNMATCHED_SLOT']);
  });

  it('a DIAGNOSTIC-ONLY element emits no write (pagedjs UndisplayedFilter baits on [style])', () => {
    // walkthrough fix 2026-08-31: a scroll-driven reveal (computed
    // duration 0) classifies FINISHED — writing a pause-only inline
    // would tag the element for pagedjs's data-undisplayed filter
    const root = document.createElement('div');
    root.innerHTML = '<section class="reveal-thing"><h2>hi</h2></section>';
    const section = root.firstElementChild!;
    // 0.4s × 2 iterations, finished long ago → FINISHED, delayPrime null
    const record = fakeCssAnimation({ target: section, name: 'jx-reveal-rise', currentTime: 5000 });
    const plan = planFrameTransfer(
      root,
      [record],
      () => info({ names: ['jx-reveal-rise'], delays: [100], durations: [400], iterations: [2] }),
    );
    expect(plan.diagnostics.map((d) => d.code)).toEqual(['FINISHED']);
    expect(plan.writes).toHaveLength(0);
  });

  it('composes multi-slot lists: transferred slots get delay′, untouched slots keep computed values', () => {
    const root = document.createElement('div');
    root.innerHTML = '<span class="fx">x</span>';
    const span = root.firstElementChild!;
    const a = fakeCssAnimation({ target: span, name: 'jx-fx-a', currentTime: 1200 });
    // slot 2 is alternate — planned but not transferred
    const b = fakeCssAnimation({ target: span, name: 'jx-fx-b', currentTime: 400 });
    const computed = info({
      names: ['jx-fx-a', 'jx-fx-b'],
      delays: [-800, -2700],
      durations: [4000, 6500],
      iterations: [Infinity, Infinity],
      directions: ['normal', 'alternate'],
    });
    const plan = planFrameTransfer(root, [a, b], () => computed);
    const write = plan.writes[0]!;
    // slot 0: (1200 − (−800)) = 2000 → −2000 ; slot 1: alternate → original −2700ms
    expect(write.delays).toEqual([-2000, '-2700ms']);
    expect(plan.diagnostics.map((d) => d.code)).toEqual(['ALTERNATE']);
  });
});

describe('applyFrameTransfer', () => {
  it('writes the composed delay list + paused play-state on the CLONE only', () => {
    const root = document.createElement('div');
    root.innerHTML = '<span class="fx">x</span>';
    const span = root.firstElementChild!;
    const record = fakeCssAnimation({ target: span, name: 'jx-fx-a', currentTime: 1200 });
    const plan = planFrameTransfer(root, [record], () => info());
    const clone = root.cloneNode(true) as HTMLElement;
    const { applied, diagnostics } = applyFrameTransfer(clone, plan);
    expect(applied).toBe(1);
    expect(diagnostics).toEqual([]);
    const cloneSpan = clone.firstElementChild as HTMLElement;
    expect(cloneSpan.style.animationDelay).toBe('-2000ms');
    expect(cloneSpan.style.animationPlayState).toBe('paused');
    // the SOURCE is untouched (clone-only law)
    expect((span as HTMLElement).style.animationDelay).toBe('');
  });

  it('path/tag/class drift → UNMATCHED_SLOT, continue', () => {
    const root = document.createElement('div');
    root.innerHTML = '<span class="fx">x</span>';
    const record = fakeCssAnimation({ target: root.firstElementChild!, name: 'jx-fx-a', currentTime: 1200 });
    const plan = planFrameTransfer(root, [record], () => info());
    const clone = root.cloneNode(true) as HTMLElement;
    (clone.firstElementChild as HTMLElement).className = 'drifted';
    const { applied, diagnostics } = applyFrameTransfer(clone, plan);
    expect(applied).toBe(0);
    expect(diagnostics.map((d) => d.code)).toEqual(['UNMATCHED_SLOT']);
  });
});

// =========================================================================
// 5 · clone transforms: pre lines + the ToC nav
// =========================================================================
describe('splitPreLines', () => {
  it('splits plain-text pres into block line spans (ids/content intact)', () => {
    const host = document.createElement('div');
    host.innerHTML = '<pre><code>alpha\nbeta\n\ngamma</code></pre>';
    const count = splitPreLines(host, { lineNumbers: true });
    expect(count).toBe(1);
    const lines = [...host.querySelectorAll('.jx-print-line')];
    expect(lines.map((l) => l.textContent)).toEqual(['alpha', 'beta', ' ', 'gamma']);
    expect(lines[3]!.getAttribute('data-line')).toBe('4');
  });

  it('lineNumbers=false stamps the gutter opt-out (wrapping stays)', () => {
    const host = document.createElement('div');
    host.innerHTML = '<pre><code>a\nb</code></pre>';
    splitPreLines(host, { lineNumbers: false });
    expect(host.querySelector('pre')!.getAttribute('data-jx-print-lines')).toBe('off');
    expect(host.querySelectorAll('.jx-print-line')).toHaveLength(2);
  });

  it('marked-up pres (Shiki) keep their markup and adopt .line into the gutter class', () => {
    const host = document.createElement('div');
    host.innerHTML =
      '<pre><code><span class="line">const a = 1;</span><span class="line">const b = 2;</span></code></pre>';
    const count = splitPreLines(host, { lineNumbers: true });
    expect(count).toBe(0); // nothing re-split
    const lines = [...host.querySelectorAll('.jx-print-line')];
    expect(lines).toHaveLength(2);
    expect(lines[0]!.textContent).toBe('const a = 1;');
    // numbered by transform (attr-gutter): pagedjs's Counters handler
    // strips CSS counter rules and re-derives negative increments —
    // data-line is the counter-free carrier (walkthrough fix 2026-08-31)
    expect(lines.map((l) => l.getAttribute('data-line'))).toEqual(['1', '2']);
  });

  it('strips the pre inline style (pagedjs UndisplayedFilter marks [style] elements undisplayed)', () => {
    // vision r4: a Shiki pre's theme inline style got the code marked
    // data-undisplayed — the kernel moved it WHOLE across the break
    // (stranding the head strip over a dead half-page) and skipped it
    // as a neighbor, killing the head's keep stamp chain
    const host = document.createElement('div');
    host.innerHTML =
      '<pre style="background-color:#0d1117;color:#c9d1d9"><code>a\nb</code></pre>';
    splitPreLines(host, { lineNumbers: true });
    expect(host.querySelector('pre')!.getAttribute('style')).toBeNull();
  });

  it('lineNumbers=false keeps shiki lines as BLOCKS (the gutter goes, the line breaks stay — r7 pre-review)', () => {
    // the \n strip is unconditional, so the .jx-print-line carrier must
    // be too: gating it on the flag collapsed the code into one run-on
    // line. The opt-out attr hides the numbered ::after via the kernel
    const host = document.createElement('div');
    host.innerHTML =
      '<pre><code><span class="line">const a = 1;</span>\n<span class="line">const b = 2;</span></code></pre>';
    splitPreLines(host, { lineNumbers: false });
    expect(host.querySelector('pre')!.getAttribute('data-jx-print-lines')).toBe('off');
    const lines = [...host.querySelectorAll('.jx-print-line')];
    expect(lines).toHaveLength(2); // block carriers present
    expect(lines.every((l) => l.getAttribute('data-line') === null)).toBe(true); // no gutter data
    const textChildren = [...host.querySelector('code')!.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE);
    expect(textChildren).toHaveLength(0); // separators still stripped
  });

  it('strips the shiki \\n text nodes between line spans (the airy-line root cause, Owner r7)', () => {
    // shiki's classic structure pushes a literal "\n" between every
    // pair of span.line; the kernel lays .jx-print-line out as BLOCKS
    // and under pre-wrap each surviving newline renders an anonymous
    // empty line box — one blank line after every code line. The
    // transform removes the separators; pre-wrap (indentation, line
    // wrapping) keeps its meaning
    const host = document.createElement('div');
    host.innerHTML =
      '<pre><code><span class="line">const a = 1;</span>\n<span class="line">  const b = 2;</span>\n<span class="line"></span>\n<span class="line">const c = 3;</span></code></pre>';
    splitPreLines(host, { lineNumbers: true });
    const code = host.querySelector('code')!;
    const textChildren = [...code.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE);
    expect(textChildren).toHaveLength(0); // no separator survives
    const lines = [...code.querySelectorAll('.jx-print-line')];
    expect(lines.map((l) => l.getAttribute('data-line'))).toEqual(['1', '2', '3', '4']);
    expect(lines[1]!.textContent).toBe('  const b = 2;'); // in-line indent intact
    // an EMPTY line keeps its box: its height previously rode the \n's
    // anonymous line — the strip would collapse it to 0 without the
    // space placeholder
    expect(lines[2]!.textContent).toBe(' ');
  });

  it('chunks an oversize pre into 40-line <pre> siblings (the production-safe break plane, Owner r7)', () => {
    // the production chunker breaks BETWEEN element siblings reliably but
    // never inside one tall pre (cause not isolated — a fully replicated
    // sandbox splits fine); the transform gives it real boundaries
    const host = document.createElement('div');
    const text = Array.from({ length: 95 }, (_, i) => `line-${i}`).join('\n');
    host.innerHTML = `<pre><code></code></pre>`;
    host.querySelector('code')!.textContent = text;
    splitPreLines(host, { lineNumbers: true });
    const pres = [...host.querySelectorAll('pre')];
    expect(pres).toHaveLength(3);
    expect(pres.map((p) => p.querySelectorAll('.jx-print-line').length)).toEqual([40, 40, 15]);
    // continuation chunks carry the marker; the LINES MOVE in order
    expect(pres[0]!.classList.contains('jx-print-cont')).toBe(false);
    expect(pres[1]!.classList.contains('jx-print-cont')).toBe(true);
    expect(pres[2]!.classList.contains('jx-print-cont')).toBe(true);
    const numbers = pres.flatMap((p) =>
      [...p.querySelectorAll('.jx-print-line')].map((l) => l.getAttribute('data-line')),
    );
    expect(numbers).toEqual(Array.from({ length: 95 }, (_, i) => String(i + 1)));
  });

  it('keeps REAL text children of arbitrary marked-up pres (content, not separators)', () => {
    // a marked-up pre without shiki's span.line shape: the text nodes
    // are CONTENT (inline markup mid-code), never separators — the
    // strip is scoped to the line-span shape only
    const host = document.createElement('div');
    host.innerHTML = '<pre><code>const <em>x</em> = 1;</code></pre>';
    splitPreLines(host, { lineNumbers: true });
    const text = host.querySelector('code')!.textContent ?? '';
    expect(text).toContain('const ');
    expect(text).toContain(' = 1;');
    expect(host.querySelectorAll('.jx-print-line')).toHaveLength(0);
  });
});

describe('injectTocNav', () => {
  it('entries follow the site heading structure (own id or the nearest id-bearing wrapper), prepended', () => {
    const clone = document.createElement('article');
    clone.innerHTML =
      '<div id="a"><h2>Alpha</h2><p>1</p></div><div id="b"><h2>Beta</h2><p>2</p></div><h3 id="c">not listed</h3><h2 id="d">Delta</h2>';
    const nav = injectTocNav(clone, { label: 'contents' });
    expect(nav).not.toBeNull();
    expect(clone.firstElementChild).toBe(nav);
    const anchors = [...nav!.querySelectorAll('a')];
    expect(anchors.map((a) => a.getAttribute('href'))).toEqual(['#a', '#b', '#d']);
    expect(anchors.map((a) => a.textContent)).toEqual(['Alpha', 'Beta', 'Delta']);
    expect(nav!.getAttribute('role')).toBe('doc-toc');
  });

  it('auto-collects the section summary as the entry sub (paper has the width) + rides the dot-leader structure', () => {
    // SectionCard's ONE heading shape: the title container is the
    // h2's parent, its <p> is the summary (eyebrow sits one level up)
    const clone = document.createElement('article');
    clone.innerHTML =
      '<section class="bg-card"><div class="hdr"><p class="eyebrow">usage</p>' +
      '<div class="tc"><h2 id="s1">Usage</h2><p>The one transaction to know.</p></div></div></section>' +
      '<div id="s2"><div class="tc"><h2>Bare</h2></div></div>';
    const nav = injectTocNav(clone)!;
    const subs = [...nav.querySelectorAll('[data-jx-print-toc-sub]')];
    expect(subs).toHaveLength(1); // absent summary → no sub line
    expect(subs[0]!.textContent).toBe('The one transaction to know.');
    // the dot leader span rides inside the anchor (the folio is the
    // ::after's target-counter — no web-side number)
    const anchor = nav.querySelector('a[href="#s1"]')!;
    expect(anchor.querySelector('[data-jx-print-toc-entry]')!.textContent).toBe('Usage');
    expect(anchor.querySelector('[data-jx-print-toc-leader]')).not.toBeNull();
  });

  it('no h2s (or none addressable) → no nav', () => {
    const clone = document.createElement('article');
    clone.innerHTML = '<p>nothing</p><h3 id="x">only an h3</h3>';
    expect(injectTocNav(clone)).toBeNull();
  });

  it('the ID MOVE: wrapper-borne entry ids ride onto their h2 (pagedjs strips ids off split-across-pages wrappers)', () => {
    // walkthrough fix 2026-08-31: a long section wrapper gets its id
    // → data-id by pagedjs's rebuildAncestors, breaking the ToC's
    // target-counter resolution; the heading never splits, so the id
    // moves there (clone-only — the web tree keeps its own ids)
    const clone = document.createElement('article');
    clone.innerHTML = '<div id="long-section"><h2>Long Ones</h2><p>' + 'x'.repeat(200) + '</p></div><h2 id="own">Own</h2>';
    const nav = injectTocNav(clone)!;
    const anchors = [...nav.querySelectorAll('a')];
    expect(anchors.map((a) => a.getAttribute('href'))).toEqual(['#long-section', '#own']);
    // the wrapper's id moved onto its heading; the own-id heading stays
    expect(clone.querySelector('div#long-section')).toBeNull();
    expect(clone.querySelector('h2#long-section')!.textContent).toBe('Long Ones');
    expect(clone.querySelector('h2#own')).not.toBeNull();
  });

  it('ids survive the deep clone (the id-preservation law)', () => {
    const source = document.createElement('article');
    source.innerHTML = '<h2 id="keep">K</h2>';
    const clone = source.cloneNode(true) as HTMLElement;
    expect(clone.querySelector('#keep')!.textContent).toBe('K');
  });
});

describe('hashSnapshot', () => {
  it('moves with content and config, not with identity', () => {
    const a = document.createElement('div');
    a.innerHTML = '<p>same</p>';
    const b = document.createElement('div');
    b.innerHTML = '<p>same</p>';
    expect(hashSnapshot(a, 'cfg')).toBe(hashSnapshot(b, 'cfg'));
    b.innerHTML = '<p>other</p>';
    expect(hashSnapshot(a, 'cfg')).not.toBe(hashSnapshot(b, 'cfg'));
    expect(hashSnapshot(a, 'cfg')).not.toBe(hashSnapshot(a, 'other'));
  });
});

// =========================================================================
// 6 · the scoped animation protocol (patched getAnimations)
// =========================================================================
describe('captureAnimations + the idempotent restore token', () => {
  function withAnims(anims: unknown[]): HTMLElement {
    const root = document.createElement('div');
    root.getAnimations = () => anims as Animation[];
    return root;
  }

  it('records {wasRunning, currentTime} and pauses ONLY running items', () => {
    const running = { playState: 'running', currentTime: 500, pause: vi.fn(), effect: null };
    const pending = { playState: 'pending', currentTime: 0, pause: vi.fn(), effect: null };
    const paused = { playState: 'paused', currentTime: 777, pause: vi.fn(), effect: null };
    const finished = { playState: 'finished', currentTime: 900, pause: vi.fn(), effect: null };
    const records = captureAnimations(withAnims([running, pending, paused, finished]));
    expect(records.map((r) => [r.wasRunning, r.currentTime])).toEqual([
      [true, 500],
      [true, 0],
      [false, 777],
      [false, 900],
    ]);
    expect(running.pause).toHaveBeenCalledTimes(1);
    expect(pending.pause).toHaveBeenCalledTimes(1);
    expect(paused.pause).not.toHaveBeenCalled();
    expect(finished.pause).not.toHaveBeenCalled();
  });

  it('restore resumes only what the transaction paused — exactly once', () => {
    const wasRunning = { playState: 'running', currentTime: 5, pause: vi.fn(), play: vi.fn(), effect: null };
    const prePaused = { playState: 'paused', currentTime: 99, pause: vi.fn(), play: vi.fn(), effect: null };
    const records = captureAnimations(withAnims([wasRunning, prePaused]));
    const token = makeRestoreToken(records);
    token.restore();
    token.restore(); // idempotent
    expect(wasRunning.play).toHaveBeenCalledTimes(1);
    expect(prePaused.play).not.toHaveBeenCalled(); // pre-paused: never resumed
    expect(prePaused.currentTime).toBe(99); // and never disturbed
  });

  it('enumerates the subtree scope only (getAnimations({subtree:true}))', () => {
    const root = document.createElement('div');
    const spy = vi.fn(() => []);
    root.getAnimations = spy as unknown as typeof root.getAnimations;
    captureAnimations(root);
    expect(spy).toHaveBeenCalledWith({ subtree: true });
  });

  it('no Web Animations API → empty capture (feature-detected)', () => {
    const root = document.createElement('div');
    expect(captureAnimations(root)).toEqual([]);
  });
});

// =========================================================================
// 7 · the transaction's reversibility laws (P1-1 capture-after-barrier,
//     P1-2 raw-attribute exit) — prepareSnapshot runs WHOLE in jsdom
// =========================================================================
describe('liftImages — the reversible lazy lift (P1-2)', () => {
  it('lifts loading/decoding and restores the RAW state (absent stays absent, no fabricated defaults)', () => {
    const root = document.createElement('div');
    root.innerHTML = '<img loading="lazy"><img><img loading="eager" decoding="async">';
    const [lazy, bare, custom] = [...root.querySelectorAll('img')];
    const lift = liftImages(root);
    expect(lazy.getAttribute('loading')).toBe('eager');
    expect(bare.getAttribute('decoding')).toBe('sync');
    lift.restore();
    lift.restore(); // idempotent
    expect(lazy.getAttribute('loading')).toBe('lazy');
    expect(lazy.getAttribute('decoding')).toBeNull();
    expect(bare.getAttribute('loading')).toBeNull();
    expect(bare.getAttribute('decoding')).toBeNull();
    expect(custom.getAttribute('loading')).toBe('eager');
    expect(custom.getAttribute('decoding')).toBe('async');
  });
});

describe('prepareSnapshot — P1-2: the live tree exits on RAW image attributes', () => {
  function imageFixture(): HTMLElement {
    const root = document.createElement('div');
    root.setAttribute('data-density', 'sm');
    // the three authoring shapes: lazy / bare / non-default decoding
    root.innerHTML = '<img loading="lazy"><img><img loading="eager" decoding="async">';
    return root;
  }

  it('success: lifted in-transaction, clone keeps the lifted values, live tree restored', async () => {
    const root = imageFixture();
    const [lazy, bare, custom] = [...root.querySelectorAll('img')];
    const duringGate: string[] = [];
    const snapshot = await prepareSnapshot(root, {
      purpose: 'sim',
      onProgress: (p) => {
        if (p.phase === 'fonts' && p.done === 0) {
          // in-transaction: the lift is in force while the gate waits
          duringGate.push(lazy.getAttribute('loading')!, bare.getAttribute('decoding')!);
        }
      },
    });
    expect(duringGate).toEqual(['eager', 'sync']); // the lift really ran
    // the live tree is back to RAW — lazy returns, absent stays absent,
    // async decoding round-trips (no decoding="auto" fabrication)
    expect(lazy.getAttribute('loading')).toBe('lazy');
    expect(lazy.getAttribute('decoding')).toBeNull();
    expect(bare.getAttribute('loading')).toBeNull();
    expect(bare.getAttribute('decoding')).toBeNull();
    expect(custom.getAttribute('loading')).toBe('eager');
    expect(custom.getAttribute('decoding')).toBe('async');
    // the clone is the frozen PRODUCT — it KEEPS the lifted attributes
    expect(snapshot.clone).not.toBe(root);
    const [cLazy, cBare] = [...snapshot.clone.querySelectorAll('img')];
    expect(cLazy.getAttribute('loading')).toBe('eager');
    expect(cLazy.getAttribute('decoding')).toBe('sync');
    expect(cBare.getAttribute('decoding')).toBe('sync');
  });

  it('failure AFTER the lift (readiness timeout): the catch still restores the live tree', async () => {
    const root = imageFixture();
    const [never] = [...root.querySelectorAll('img')];
    // an image that never completes: the gate's load wait hangs until
    // the budget rejects — a failure that lands AFTER the lift
    Object.defineProperty(never, 'complete', { get: () => false });
    await expect(prepareSnapshot(root, { purpose: 'sim', timeoutMs: 20 })).rejects.toThrow(
      /readiness timeout/,
    );
    expect(never.getAttribute('loading')).toBe('lazy');
    expect(never.getAttribute('decoding')).toBeNull();
  });
});

describe('prepareSnapshot — P1-1: the capture lands AFTER the DOM-commit barrier', () => {
  it('barrier failure (density never committed): throws with NOTHING captured, planned or lifted', async () => {
    const root = document.createElement('div');
    root.setAttribute('data-density', 'md'); // the intervention's frame never landed
    root.innerHTML = '<img loading="lazy">';
    const img = root.querySelector('img')!;
    const getAnimations = vi.fn(() => [] as Animation[]);
    root.getAnimations = getAnimations as unknown as typeof root.getAnimations;
    const readComputed = vi.fn(() => info()); // planFrameTransfer's read — must never run
    await expect(
      prepareSnapshot(root, { purpose: 'print', readComputed }),
    ).rejects.toThrow(/DOM-commit barrier/);
    // no capture ATTEMPT (nothing paused → nothing to restore), no
    // computed reads (the frame transfer was never planned), no
    // live-tree rewrite, and the self-stamped ownership is released
    expect(getAnimations).not.toHaveBeenCalled();
    expect(readComputed).not.toHaveBeenCalled();
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('decoding')).toBeNull();
    expect(root.hasAttribute(PRINT_SIM_ATTR)).toBe(false);
  });

  it('success: the capture observes the COMMITTED tree (the intervention lands before the barrier closes)', async () => {
    const root = document.createElement('div');
    root.innerHTML = '<p>body</p>';
    // the reactive intervention commits on a LATER macrotask — after
    // the sync prologue, before double-rAF closes (jsdom's visual rAF
    // rides a ~16ms timer; a timeout queued now lands first either
    // way, including under the setTimeout fallback)
    setTimeout(() => root.setAttribute('data-density', 'sm'), 0);
    const observed: (string | null)[] = [];
    const getAnimations = vi.fn(() => {
      observed.push(root.getAttribute('data-density'));
      return [] as Animation[];
    });
    root.getAnimations = getAnimations as unknown as typeof root.getAnimations;
    const snapshot = await prepareSnapshot(root, { purpose: 'sim' });
    expect(snapshot.clone.querySelector('p')!.textContent).toBe('body');
    // the capture ran exactly once, subtree-scoped, and it saw the
    // committed density stamp — the pre-P1-1 order captured it here
    // while the tree was still un-committed (the cross-frame mix)
    expect(getAnimations).toHaveBeenCalledTimes(1);
    expect(getAnimations).toHaveBeenCalledWith({ subtree: true });
    expect(observed).toEqual(['sm']);
  });
});

// =========================================================================
// retireDarkUtilities — the paper-is-white clone half (Owner ruling,
// 2026-09-03): under a LIGHT print declaration every dark:-variant
// utility retires from the clone; a DARK declaration keeps them (they
// are the adaptation); the live tree is never this function's business
// =========================================================================
describe('retireDarkUtilities — the light declaration retires dark: utilities', () => {
  it('strips every dark:-prefixed class token, keeps everything else, counts what left', () => {
    const clone = document.createElement('div');
    clone.className = 'dark:bg-background dark:[--tok-token-function:oklch(1_0_0)]';
    const chip = document.createElement('code');
    chip.className = 'jx-inline-code scheme-light dark:scheme-dark [--tok-token-comment:oklch(0_0_0)]';
    clone.appendChild(chip);
    const nested = document.createElement('span');
    nested.className = 'plain-token';
    chip.appendChild(nested);
    const retired = retireDarkUtilities(clone);
    expect(retired).toBe(3);
    expect(clone.className).toBe('');
    expect(chip.className).toBe('jx-inline-code scheme-light [--tok-token-comment:oklch(0_0_0)]');
    expect(nested.className).toBe('plain-token'); // untouched rides untouched
  });

  it('non-prefixed lookalikes stay (a class CONTAINING "dark:" mid-token is not a variant)', () => {
    const clone = document.createElement('div');
    clone.className = 'my-dark:thing notdark:x dark:gone';
    expect(retireDarkUtilities(clone)).toBe(1);
    expect(clone.className).toBe('my-dark:thing notdark:x');
  });

  it('a classless tree is a zero (no [class] attr fabrication)', () => {
    const clone = document.createElement('div');
    clone.innerHTML = '<p>plain</p>';
    expect(retireDarkUtilities(clone)).toBe(0);
    expect(clone.querySelector('p')!.hasAttribute('class')).toBe(false);
  });
});

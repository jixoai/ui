/**
 * The prose scope runtime lock (typography-context-and-parts Lane A,
 * 2026-09-07 — design §1, proposals/a, review-r1 rulings A1–A3/A6/
 * A7/F3/F5/F9/F10/F12/F13). Faces:
 *   - UNIT: resolveTypoStyle's exact bag (all 11 knobs; absent → zero
 *     emission; the gradient's fill-only vars; the token maps); the
 *     ProseDefaults absentSlot coverage (every knob set/absent, the
 *     11-key audit surface, density deliberately missing); the
 *     context pair (nearest provider wins, outside-window throws the
 *     Svelte lifecycle error — the D3-C hard contract); the plugin
 *     chain AT THE PROVIDER (a strip-gradient plugin lands before CSS
 *     sees the knob).
 *   - MEASURED where jsdom is reliable (inline-style inheritance and
 *     custom-property inheritance resolve; probed 2026-09-07), and
 *     SOURCE-GUARD where it is not — jsdom applies no sheet cascade,
 *     so every cascade outcome (the ladder arithmetic, markdown
 *     sovereignty, mono code, @supports arms, print/forced restores)
 *     is asserted against the css sources, the markdown trio's own
 *     test pattern (markdown-render.spec.ts's source-guard precedent).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import { resolveTypoStyle, getTypographyScope } from '../src/lib/typography.svelte';
import { ProseDefaults } from '../src/lib/ui/prose/prose-defaults.svelte';
import Host from './fixtures/prose-scope-host.svelte';
import PluginHost from './fixtures/prose-plugin-host.svelte';
import UnitResolveHost from './fixtures/unit-resolve-host.svelte';

const repoRoot = resolve(fileURLToPath(import.meta.url), '../../../..');
const proseCss = readFileSync(resolve(repoRoot, 'registry/files/ui/prose/prose.css'), 'utf8');
const markdownCss = readFileSync(resolve(repoRoot, 'registry/files/ui/markdown/markdown.css'), 'utf8');
const faceCss = readFileSync(resolve(repoRoot, 'registry/files/theme/jx-pure.css'), 'utf8');
const headingSrc = readFileSync(resolve(repoRoot, 'registry/files/ui/heading/heading.svelte'), 'utf8');

const byTestid = (container: HTMLElement, id: string) =>
  container.querySelector(`[data-testid="${id}"]`)!;

/** the prose host inside a testid region (the [data-jx-prose] root) */
const proseOf = (container: HTMLElement, region: string) =>
  byTestid(container, region).querySelector('[data-jx-prose]')! as HTMLElement;

const styleOf = (el: Element) => el.getAttribute('style') ?? '';

/** the in-window resolve carrier (the unit-resolve-host pattern) */
const resolveInWindow = <T,>(compute: () => T): T => {
  const holder: { value?: T; error?: unknown } = {};
  render(UnitResolveHost, {
    props: {
      compute,
      onvalue: (value: T | undefined, error: unknown) => {
        holder.value = value;
        holder.error = error;
      },
    },
  });
  expect(holder.error).toBeUndefined();
  return holder.value as T;
};

// =========================================================================
// 1 · unit — the scope bag
// =========================================================================
describe('unit — resolveTypoStyle', () => {
  it('the 11-knob bag: inheritance declarations, var mirrors, presence attrs', () => {
    const bag = resolveTypoStyle({
      size: '1.125rem',
      leading: 1.9,
      family: 'serif',
      ink: 'primary',
      gradient: { from: 'A', to: 'B', angle: 90 },
      ground: 'muted',
      align: 'justify',
      indent: '2em',
      initialLetter: 3,
      wrap: 'pretty',
      hyphens: 'auto',
    });
    // the wrapper inheritance lane — EXACTLY seven declarations, and
    // deliberately NO line-height / text-indent (those are element
    // lanes the residue sheet owns behind presence attrs)
    expect(bag.declarations).toEqual({
      'font-size': '1.125rem',
      'font-family': 'var(--font-serif)',
      color: 'var(--primary)',
      'background-color': 'var(--muted)',
      'text-align': 'justify',
      'text-wrap': 'pretty',
      hyphens: 'auto',
    });
    // the var mirrors (knob names verbatim — the audit surface) + the
    // gradient parts + the solid restore token riding the explicit ink
    expect(bag.vars).toEqual({
      '--jx-ty-size': '1.125rem',
      '--jx-ty-leading': '1.9',
      '--jx-ty-family': 'var(--font-serif)',
      '--jx-ty-ink': 'var(--primary)',
      '--jx-ty-ink-solid': 'var(--primary)',
      '--jx-ty-gradient': 'linear-gradient(90deg, A, B)',
      '--jx-ty-ground': 'var(--muted)',
      '--jx-ty-align': 'justify',
      '--jx-ty-indent': '2em',
      '--jx-ty-initial': '3',
      '--jx-ty-wrap': 'pretty',
      '--jx-ty-hyphens': 'auto',
    });
    // the presence lane: leading/indent/initial as empty-valued
    // presence, the gradient as the one VALUED attr
    expect(bag.attrs).toEqual({
      'data-jx-ty-leading': '',
      'data-jx-ty-indent': '',
      'data-jx-ty-initial': '',
      'data-jx-ty-ink': 'gradient',
    });
  });

  it('the ink union resolves the four foreground tokens; raw passes through', () => {
    expect(resolveTypoStyle({ ink: 'default' }).declarations['color']).toBe('var(--foreground)');
    expect(resolveTypoStyle({ ink: 'muted' }).declarations['color']).toBe(
      'var(--muted-foreground)',
    );
    expect(resolveTypoStyle({ ink: 'destructive' }).declarations['color']).toBe(
      'var(--destructive)',
    );
    // the raw escape — the hue-law seam shape (prototype keys are
    // never token lookups: 'constructor' stays a raw value)
    expect(resolveTypoStyle({ ink: 'oklch(0.5 0.2 300)' }).declarations['color']).toBe(
      'oklch(0.5 0.2 300)',
    );
    expect(resolveTypoStyle({ ink: 'constructor' }).declarations['color']).toBe('constructor');
  });

  it('the gradient mechanism is FILL-ONLY: no color declaration, vars for the parts, default 180deg', () => {
    const bag = resolveTypoStyle({ gradient: { from: 'x', to: 'y' } });
    expect(bag.declarations).toEqual({}); // NEVER color/background on the host
    expect(bag.attrs).toEqual({ 'data-jx-ty-ink': 'gradient' });
    expect(bag.vars).toEqual({
      '--jx-ty-gradient': 'linear-gradient(180deg, x, y)',
      // the solid restore token ships even without an explicit ink
      '--jx-ty-ink-solid': 'var(--foreground)',
    });
    // a raw string is a CSS image value verbatim
    expect(resolveTypoStyle({ gradient: 'radial-gradient(red, blue)' }).vars).toEqual({
      '--jx-ty-gradient': 'radial-gradient(red, blue)',
      '--jx-ty-ink-solid': 'var(--foreground)',
    });
  });

  it('absent → zero emission (absence IS the state, ruling A2)', () => {
    expect(resolveTypoStyle({})).toEqual({ declarations: {}, vars: {}, attrs: {} });
  });
});

// =========================================================================
// 2 · unit — the Defaults audit surface
// =========================================================================
describe('unit — ProseDefaults', () => {
  it('resolve({}) — every one of the 11 knobs absent (no own, no fallback)', () => {
    expect(resolveInWindow(() => ProseDefaults.resolve({}))).toEqual({
      size: undefined,
      leading: undefined,
      family: undefined,
      ink: undefined,
      gradient: undefined,
      ground: undefined,
      align: undefined,
      indent: undefined,
      initialLetter: undefined,
      wrap: undefined,
      hyphens: undefined,
    });
  });

  it('every knob set — the absentSlot identity passthrough', () => {
    const knobs = {
      size: '2rem',
      leading: 2,
      family: 'mono' as const,
      ink: 'muted' as const,
      gradient: 'none-linear' as const,
      ground: 'card' as const,
      align: 'center' as const,
      indent: '4em',
      initialLetter: 5 as const,
      wrap: 'stable' as const,
      hyphens: 'manual' as const,
    };
    expect(resolveInWindow(() => ProseDefaults.resolve(knobs))).toEqual(knobs);
  });

  it('the slots surface is exactly the 11 knobs — density deliberately missing', () => {
    expect(Object.keys(ProseDefaults.slots).sort()).toEqual(
      [
        'align',
        'family',
        'gradient',
        'ground',
        'hyphens',
        'indent',
        'initialLetter',
        'ink',
        'leading',
        'size',
        'wrap',
      ].sort(),
    );
    // the trio's own naming argument, shared: prose has no density
    // opinion and stamps no data-density
    expect('density' in ProseDefaults.slots).toBe(false);
  });
});

// =========================================================================
// 3 · the provider — host shape, the context pair, the plugin chain
// =========================================================================
describe('the provider', () => {
  it('bare prose: jx-pure + data-jx-prose, NO style, NO attrs, NO vars', () => {
    const { container } = render(Host);
    const bare = proseOf(container, 'bare-wrap');
    expect(bare.classList.contains('jx-pure')).toBe(true);
    expect(bare.hasAttribute('data-jx-prose')).toBe(true);
    expect(bare.getAttribute('style')).toBeNull();
    for (const attr of bare.getAttributeNames()) {
      expect(attr.startsWith('data-jx-ty-')).toBe(false);
    }
  });

  it('all-knobs host: the bag mounts as the style string + presence attrs', () => {
    const { container } = render(Host);
    const full = proseOf(container, 'full-wrap');
    // NOTE: the DOM normalizes the style attribute (`prop: value; `)
    // — the assertions read the normalized truth
    const style = styleOf(full);
    expect(style).toContain('font-size: 1.125rem');
    expect(style).toContain('font-family: var(--font-serif)');
    expect(style).toContain('color: var(--primary)');
    expect(style).toContain('background-color: var(--muted)');
    expect(style).toContain('text-align: justify');
    expect(style).toContain('text-wrap: pretty');
    expect(style).toContain('hyphens: auto');
    expect(style).toContain('--jx-ty-leading: 1.9');
    expect(style).toContain('--jx-ty-indent: 2em');
    expect(style).toContain('--jx-ty-initial: 3');
    expect(style).toContain(
      '--jx-ty-gradient: linear-gradient(90deg, var(--primary), var(--info))',
    );
    // NO font-size channel for the element-lane knobs on the host
    expect(style).not.toContain('line-height');
    expect(style).not.toContain('text-indent');
    // the presence attrs
    expect(full.hasAttribute('data-jx-ty-leading')).toBe(true);
    expect(full.getAttribute('data-jx-ty-indent')).toBe('');
    expect(full.getAttribute('data-jx-ty-initial')).toBe('');
    expect(full.getAttribute('data-jx-ty-ink')).toBe('gradient');
    // the consumer class merges last
    expect(full.classList.contains('jx-pure')).toBe(true);
  });

  it('the context pair: nearest provider wins; outside a region there is NO scope', () => {
    const { container } = render(Host);
    // inside the inner prose the nearest bag is the inner provider's
    // (ink only — its other knobs are absent, absence IS the state)
    expect(byTestid(container, 'reader-inner').textContent).toBe('ink=muted');
    // the outer provider's bag reads from OUTSIDE the inner region
    // but inside its own — the nearest provider, not the outermost
    expect(byTestid(container, 'reader-outer-mid').textContent).toBe('size=16px|leading=1.8');
    // outside every prose region: no provider, no opinion
    expect(byTestid(container, 'reader-outer-after').textContent).toBe('NONE');
  });

  it('the pair is getter-endorsed: an outer knob flip re-reads in the same frame', async () => {
    const { container, rerender } = render(Host, { props: { outerLeading: 1.8 } });
    const innerP = byTestid(container, 'nested-wrap').querySelector(
      '[data-jx-text="p"]',
    )! as HTMLElement;
    expect(getComputedStyle(innerP).getPropertyValue('--jx-ty-leading')).toBe('1.8');
    await rerender({ outerLeading: 2 });
    expect(getComputedStyle(innerP).getPropertyValue('--jx-ty-leading')).toBe('2');
  });

  it('outside a component window the read propagates Svelte\'s lifecycle error (D3-C)', () => {
    expect(() => getTypographyScope()).toThrow();
  });

  it('the plugin chain lands AT THE PROVIDER: a strip-gradient plugin removes the lane pre-CSS', () => {
    const { container } = render(PluginHost);
    const host = proseOf(container, 'plugin-wrap');
    expect(host.hasAttribute('data-jx-ty-ink')).toBe(false);
    expect(styleOf(host)).not.toContain('--jx-ty-gradient');
    // untouched knobs flow through the chain untouched
    expect(styleOf(host)).toContain('color: var(--primary)');
    expect(styleOf(host)).toContain('--jx-ty-ink: var(--primary)');
  });
});

// =========================================================================
// 4 · nested regions — nearest setter wins per knob, ambient flows
// =========================================================================
describe('nested prose', () => {
  it('the inner host carries ONLY its own knobs; outer knobs flow by inheritance', () => {
    const { container } = render(Host);
    const inner = byTestid(container, 'nested-wrap').querySelectorAll('[data-jx-prose]')[1]!;
    // inner's only opinion is ink — its style carries nothing else
    // (normalized DOM spacing)
    expect(styleOf(inner)).toBe(
      'color: var(--muted-foreground); --jx-ty-ink: var(--muted-foreground); --jx-ty-ink-solid: var(--muted-foreground);',
    );
    // the outer size/leading reach the inner P by MEASURED inheritance
    const innerP = inner.querySelector('[data-jx-text="p"]')! as HTMLElement;
    expect(getComputedStyle(innerP).fontSize).toBe('16px');
    expect(getComputedStyle(innerP).getPropertyValue('--jx-ty-leading')).toBe('1.8');
  });
});

// =========================================================================
// 5 · the heading consumption seam (F5)
// =========================================================================
describe('heading ink', () => {
  it('the heading utility follows --jx-ty-ink with the foreground fallback', () => {
    const { container } = render(Host);
    const inkUtility = 'text-[var(--jx-ty-ink,var(--foreground))]';
    const scoped = byTestid(container, 'heading-wrap').querySelector('h2[data-jx-heading]')!;
    // scoped: the region ships the token the utility resolves
    expect(scoped.classList.contains(inkUtility)).toBe(true);
    const host = byTestid(container, 'heading-wrap').querySelector('[data-jx-prose]')!;
    expect(styleOf(host)).toContain('--jx-ty-ink: var(--muted-foreground)');
    expect(styleOf(host)).toContain('color: var(--muted-foreground)');
    // unscoped: the same utility, the fallback arm (no --jx-ty-ink anywhere)
    const unscoped = byTestid(container, 'heading-wrap').querySelectorAll('h2[data-jx-heading]')[1]!;
    expect(unscoped.classList.contains(inkUtility)).toBe(true);
  });

  it('the consumer text utility overrides last-wins (dedup-verified F5)', () => {
    const { container } = render(Host);
    const overridden = byTestid(container, 'heading-wrap').querySelector(
      'h3[data-jx-heading]',
    )!;
    expect(overridden.classList.contains('text-primary')).toBe(true);
    expect(
      overridden.classList.contains('text-[var(--jx-ty-ink,var(--foreground))]'),
    ).toBe(false);
  });

  it('the edit is the ONE seam: heading.svelte carries the utility and not text-foreground', () => {
    expect(headingSrc).toContain('text-[var(--jx-ty-ink,var(--foreground))]');
    expect(headingSrc).not.toMatch(/'text-foreground'|text-foreground'/);
  });
});

// =========================================================================
// 6 · the gradient lane + the mark restore (A7/F9/F12)
// =========================================================================
describe('gradient', () => {
  it('the host arms the lane: attr + parts var + solid token, NEVER a color declaration', () => {
    const { container } = render(Host);
    const host = proseOf(container, 'gradient-wrap');
    expect(host.getAttribute('data-jx-ty-ink')).toBe('gradient');
    expect(styleOf(host)).toContain(
      '--jx-ty-gradient: linear-gradient(180deg, oklch(0.7 0.2 330), oklch(0.4 0.2 260))',
    );
    expect(styleOf(host)).toContain('--jx-ty-ink-solid: var(--foreground)');
    expect(styleOf(host)).not.toMatch(/(^|;)color:/);
    // the marks are in the payload (the restore's targets)
    expect(host.querySelector('strong[data-jx-text="strong"]')).not.toBeNull();
    expect(host.querySelector('mark[data-jx-text="mark"]')).not.toBeNull();
  });

  it('the sheet assembles the fill on P/Heading hooks and restores marks solid (source guard)', () => {
    // the fill lane: hooks only, fill transparent (NEVER color transparent)
    expect(proseCss).toContain(
      "[data-jx-ty-ink='gradient'] :is([data-jx-text='p'], [data-jx-heading]) {",
    );
    expect(proseCss).toContain('background-image: var(--jx-ty-gradient);');
    expect(proseCss).toContain('-webkit-background-clip: text;');
    expect(proseCss).toContain('-webkit-text-fill-color: transparent;');
    // NEVER a bare `color: transparent` declaration (comments
    // stripped first — they DOCUMENT the law; the lookbehind then
    // excludes the fill property: the F9 trap is a COLOR declaration,
    // not a fill)
    const proseDeclarations = proseCss.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(proseDeclarations).not.toMatch(/(?<![-a-z])color:\s*transparent/);
    // the mark restore: every non-p hooked mark paints solid
    expect(proseCss).toContain(
      "[data-jx-ty-ink='gradient'] [data-jx-text]:not([data-jx-text='p']) {",
    );
    expect(proseCss).toContain('-webkit-text-fill-color: currentcolor;');
  });

  it('print restores the gradient fill to the solid token (F10 — the paged clone never re-runs the provider)', () => {
    expect(proseCss).toContain('@media print {');
    expect(proseCss).toContain('-webkit-text-fill-color: var(--jx-ty-ink-solid, currentcolor);');
    expect(proseCss).toContain('background-image: none;');
  });

  it('forced-colors restores solid ink (the engine overrides colors, never images)', () => {
    expect(proseCss).toContain('@media (forced-colors: active) {');
    // the forced restore drops the image AND the clip before the fill
    const forced = proseCss.split('@media (forced-colors: active) {')[1] ?? '';
    expect(forced).toContain('background-image: none;');
    expect(forced).toContain('-webkit-background-clip: initial;');
    expect(forced).toContain('-webkit-text-fill-color: currentcolor;');
  });
});

// =========================================================================
// 7 · the layering ladder (verified F3) — source guards
// =========================================================================
describe('the ladder', () => {
  it('the face keeps p{1.6} at (0,1,1); the prose leading rule is gated at (0,2,0)', () => {
    // the face element rule the ungated rule would have broken (F13)
    expect(faceCss).toContain(':where(.jx-pure) p:not(.no-jx-pure, .no-jx-pure *) {');
    expect(faceCss).toMatch(/p:not\(\.no-jx-pure[^)]*\)\s*\{\s*line-height: 1\.6;/);
    // the residue rule is PRESENCE-gated — no ungated P leading anywhere
    expect(proseCss).toContain("[data-jx-ty-leading] :is([data-jx-text='p']) {");
    expect(proseCss).toContain('line-height: var(--jx-ty-leading);');
    expect(proseCss).not.toMatch(/^[^@\[/]*\[data-jx-text='p'\]\s*\{/m);
    // DOM: no leading knob → no attr → the gate cannot fire outside prose
    const { container } = render(Host);
    expect(proseOf(container, 'bare-wrap').hasAttribute('data-jx-ty-leading')).toBe(false);
  });

  it('SOVEREIGNTY: the markdown sheet owns scale inside [data-jx-markdown] (§2a at (0,2,1) beats the residue (0,2,0); the trio root (0,3,0) beats inheritance)', () => {
    const { container } = render(Host);
    const region = byTestid(container, 'sovereignty-wrap');
    // the composition mounts: prose host (outer) → markdown root (inner)
    const proseHost = region.querySelector('[data-jx-prose]')! as HTMLElement;
    const mdRoot = region.querySelector('[data-jx-markdown]')!;
    const p = mdRoot.querySelector('p[data-jx-text="p"]')!;
    expect(mdRoot.getAttribute('data-jx-typography')).toBe('relaxed');
    // the prose scale IS painted on the host (inheritance lane)…
    expect(getComputedStyle(proseHost).fontSize).toBe('20px');
    expect(styleOf(proseHost)).toContain('--jx-ty-leading: 1.4');
    // …and the inner P sits under BOTH hooks whose arithmetic the
    // sheets pin: §2a line-height:inherit (0,2,1) > residue (0,2,0),
    // the trio root font-size/line-height (0,3,0) > inheritance
    expect(markdownCss).toContain(
      "[data-jx-markdown] p:not(.no-jx-pure, .no-jx-pure *) {\n    line-height: inherit;",
    );
    expect(markdownCss).toContain("[data-jx-typography='relaxed'] {\n    font-size: 1rem;");
    expect(markdownCss).toContain('.jx-pure[data-jx-markdown][data-jx-typography=\'relaxed\']');
    // the residue rules lose inside markdown BY CONSTRUCTION: every
    // prose rule is (0,2,0) gated on the attr; the §2a override is
    // (0,2,1); the trio token block is (0,3,0) — jsdom applies no
    // sheet cascade, so the trio's own source-guard pattern carries
    // the assertion (markdown-render.spec's precedent)
    expect(p.closest('[data-jx-markdown]')).toBe(mdRoot);
  });

  it('the indent lane is P-only — never a wrapper declaration, never a heading channel', () => {
    const { container } = render(Host);
    const host = proseOf(container, 'indent-wrap');
    expect(host.getAttribute('data-jx-ty-indent')).toBe('');
    expect(styleOf(host)).toContain('--jx-ty-indent: 2em');
    // NO wrapper text-indent: headings must not inherit one
    expect(styleOf(host)).not.toContain('text-indent:');
    // the sheet rule is hook-gated to P
    expect(proseCss).toContain("[data-jx-ty-indent] :is([data-jx-text='p']) {");
    expect(proseCss).toContain('text-indent: var(--jx-ty-indent);');
    // the suppression compound: drop cap + indent never double-count
    expect(proseCss).toContain(
      "[data-jx-ty-initial][data-jx-ty-indent] :is([data-jx-text='p']) {",
    );
    expect(proseCss).toContain('text-indent: 0;');
  });

  it('initialLetter ships BOTH arms (ruling A6 — no browser-class-dependent drop caps)', () => {
    // the modern path
    expect(proseCss).toContain('@supports (initial-letter: 2) {');
    expect(proseCss).toContain('initial-letter: var(--jx-ty-initial);');
    // the float fallback arm
    expect(proseCss).toContain('@supports not (initial-letter: 2) {');
    const fallback = proseCss.split('@supports not (initial-letter: 2) {')[1] ?? '';
    expect(fallback).toContain('float: inline-start;');
    expect(fallback).toContain('font-size: calc(var(--jx-ty-initial) * 1em);');
    // drop caps keep printing (the manuscript posture): the print
    // block restores the gradient ONLY, never the drop cap
    const print = proseCss.split('@media print {')[1] ?? '';
    expect(print).not.toContain('initial-letter');
  });
});

// =========================================================================
// 8 · orthogonality + the family lane (measured where jsdom allows)
// =========================================================================
describe('orthogonality + family', () => {
  it('chrome keeps its own ink beside a muted P (element declarations beat the inherited wrapper color)', () => {
    const { container } = render(Host);
    const region = byTestid(container, 'chip-wrap');
    const host = region.querySelector('[data-jx-prose]')! as HTMLElement;
    const chip = region.querySelector('[data-jx-chip]')!;
    // the region's ink is a WRAPPER declaration only — the host style
    // is the only place the muted token appears
    expect(styleOf(host)).toContain('color: var(--muted-foreground)');
    // the chip carries its OWN element-level ink utilities (the
    // cascade fact that beats inheritance in a browser); the prose
    // scope stamps nothing on it
    expect(chip.classList.contains('text-[color:var(--jx-tonal)]')).toBe(true);
    expect(styleOf(chip)).toBe(''); // no inline style leaked onto chrome
    for (const attr of chip.getAttributeNames()) {
      expect(attr.startsWith('data-jx-ty-')).toBe(false);
    }
    expect(chip.getAttribute('data-jx-prose')).toBeNull();
  });

  it('a serif region flows the family by inheritance; code keeps the face mono law (B1)', () => {
    const { container } = render(Host);
    const host = proseOf(container, 'serif-wrap') as HTMLElement;
    const code = host.querySelector('code')!;
    // MEASURED (jsdom resolves inline inheritance): the family reaches
    // the host; var() stays unresolved so the token string is the
    // assertable value
    expect(getComputedStyle(host).fontFamily).toBe('var(--font-serif)');
    // MEASURED mono face: jsdom's UA default hands code monospace —
    // the family NEVER flows code into serif, even before the face's
    // own element rule is considered
    expect(getComputedStyle(code).fontFamily).toBe('monospace');
    expect(getComputedStyle(code).fontFamily).toContain('mono');
    // SOURCE-GUARD (jsdom applies no sheet cascade): the face's code
    // element rule at (0,1,1) beats the inherited wrapper family —
    // code/kbd keep mono inside a serif region in a real engine
    expect(faceCss).toContain(':where(.jx-pure) :where(code, kbd, samp):not(');
    expect(faceCss).toMatch(/font-family:\s*var\(--font-mono\);/);
  });
});

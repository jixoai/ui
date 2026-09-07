/**
 * The reading-content family runtime lock (markdown-coverage lane C,
 * 2026-09-07 — blockquote / heading / list / link / text, the five
 * parts the markdown default map now rides). Per design §7:
 *   - valued hook stamps: data-jx-blockquote={variant},
 *     data-jx-heading={level}, data-jx-list={ol|ul},
 *     data-jx-link={external|internal}, data-jx-text={form}
 *   - Defaults semantics: blockquote's PAINT slot resolves
 *     `explicit ?? ambient(zone) ?? own 'outline'`; text's mark is a
 *     LITERAL slot the zone never moves (the kbd precedent)
 *   - composition: the alert label row + the cite footer, the
 *     ordered/start passthrough, the external target/rel pair
 *   - sugar ≡ base across all eight Raw exports (same element, same
 *     hook, same merge behavior), and the consumer class merges LAST
 *   - the ambient-scale law as a source guard: no font-size utility
 *     on any family root (the typography trio flows by inheritance)
 *
 * typography-context-and-parts (2026-09-07, §2/§3/§4) extends the
 * lock to the parts upgrades: blockquote's rule×size LITERAL slots
 * (shadow-4 bare default, the compound rule hook, the forced-colors
 * re-materialization, the tonal near-no-op), link's tri-state
 * suffix-icon lane (undefined=default glyph iff external, null=off,
 * snippet=custom), and list's marker vocabulary + nav mode (the
 * byte-parity default, the seven stamps, the wrapper contract).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';

import Blockquote from '../src/lib/ui/blockquote/blockquote.svelte';
import Heading from '../src/lib/ui/heading/heading.svelte';
import List from '../src/lib/ui/list/list.svelte';
import Link from '../src/lib/ui/link/link.svelte';
import Text from '../src/lib/ui/text/text.svelte';
import P from '../src/lib/ui/text/p.svelte';
import Strong from '../src/lib/ui/text/strong.svelte';
import Em from '../src/lib/ui/text/em.svelte';
import Del from '../src/lib/ui/text/del.svelte';
import Mark from '../src/lib/ui/text/mark.svelte';
import Ins from '../src/lib/ui/text/ins.svelte';
import Sub from '../src/lib/ui/text/sub.svelte';
import Sup from '../src/lib/ui/text/sup.svelte';
import ZoneHost from './fixtures/reading-content-zone-host.svelte';

// =========================================================================
// blockquote
// =========================================================================
describe('blockquote', () => {
  it('stamps the own outline rung and renders a native blockquote', () => {
    const { container } = render(Blockquote, {});
    const root = container.querySelector('blockquote[data-jx-blockquote]')!;
    expect(root).not.toBeNull();
    expect(root.getAttribute('data-jx-blockquote')).toBe('outline');
  });

  it('the explicit prop and the zone/own ladder resolve in order', () => {
    // bare, no providers → the frozen own 'outline'
    const bare = render(ZoneHost, { props: { zone: 'tonal' } });
    const zoned = bare.container.querySelector('[data-testid="zone"]')!;
    // zone 'tonal' beats the own — blockquote IS a paint-slot family
    expect(zoned.querySelector('blockquote')!.getAttribute('data-jx-blockquote')).toBe('tonal');
    // …while text's literal mark never reads the zone (kbd precedent)
    expect(zoned.querySelector('[data-jx-text]')!.getAttribute('data-jx-text')).toBe('p');
    // …and the rule's LITERAL slots never read the zone either: the
    // zone moves the paint family, never the rule geometry (§2)
    expect(zoned.querySelector('blockquote')!.getAttribute('data-jx-blockquote-rule')).toBe('shadow-4');
    // same-frame flip: the zone re-derives the paint family in place
    bare.rerender({ zone: 'outline' });
    expect(zoned.querySelector('blockquote')!.getAttribute('data-jx-blockquote')).toBe('outline');
    expect(zoned.querySelector('blockquote')!.getAttribute('data-jx-blockquote-rule')).toBe('shadow-4');
    // the explicit prop beats the zone
    const explicit = render(Blockquote, {
      props: { variant: 'outline' },
    });
    expect(explicit.container.querySelector('blockquote')!.getAttribute('data-jx-blockquote')).toBe(
      'outline',
    );
  });

  it('bare resolves the shadow-4 rule: the inset shadow IS the rule, outline emits no border', () => {
    const { container } = render(Blockquote, {});
    const root = container.querySelector('blockquote')!;
    expect(root.getAttribute('data-jx-blockquote-rule')).toBe('shadow-4');
    expect(root.classList.contains('shadow-[inset_4px_0_0_color-mix(in_oklab,var(--jx-outline)_55%,transparent)]')).toBe(true);
    // ps honesty: the padding stays fixed across channels and sizes
    expect(root.classList.contains('ps-[0.875rem]')).toBe(true);
    // outline in shadow mode carries NO border at all — never a mixed
    // border+shadow on one edge (the sole-source law)
    expect(root.classList.contains('border-s')).toBe(false);
    // forced-colors re-materialization rides the shadow modes (the
    // entity law's "edge is structure" generalized)
    expect(root.classList.contains('forced-colors:shadow-none')).toBe(true);
    expect(root.classList.contains('forced-colors:border-s-[4px]')).toBe(true);
    expect(root.classList.contains('forced-colors:border-[CanvasText]')).toBe(true);
  });

  it("rule='border' swaps the channel: border geometry + the rung's own border-color source", () => {
    const { container } = render(Blockquote, { props: { rule: 'border' } });
    const root = container.querySelector('blockquote')!;
    expect(root.getAttribute('data-jx-blockquote-rule')).toBe('border-4');
    expect(root.classList.contains('border-s-4')).toBe(true);
    expect(root.classList.contains('[border-color:color-mix(in_oklab,var(--jx-outline)_55%,transparent)]')).toBe(true);
    expect(root.classList.contains('ps-[0.875rem]')).toBe(true);
    // ONE channel per root — the shadow utilities never ride border mode
    expect(root.className).not.toMatch(/shadow-\[inset/);
    expect(root.className).not.toMatch(/forced-colors:shadow-none/);
  });

  it('the ruleSize ladder 1/4/8 stamps compound hooks + the literal px utilities, ps fixed', () => {
    const SHADOW_LADDER: ReadonlyArray<[1 | 4 | 8, string, string]> = [
      [1, 'shadow-[inset_1px_0_0_color-mix(in_oklab,var(--jx-outline)_55%,transparent)]', 'forced-colors:border-s'],
      [4, 'shadow-[inset_4px_0_0_color-mix(in_oklab,var(--jx-outline)_55%,transparent)]', 'forced-colors:border-s-[4px]'],
      [8, 'shadow-[inset_8px_0_0_color-mix(in_oklab,var(--jx-outline)_55%,transparent)]', 'forced-colors:border-s-[8px]'],
    ];
    for (const [size, shadowClass, widthClass] of SHADOW_LADDER) {
      const { container } = render(Blockquote, { props: { ruleSize: size } });
      const root = container.querySelector('blockquote')!;
      expect(root.getAttribute('data-jx-blockquote-rule'), String(size)).toBe(`shadow-${size}`);
      expect(root.classList.contains(shadowClass), String(size)).toBe(true);
      expect(root.classList.contains(widthClass), String(size)).toBe(true);
      expect(root.classList.contains('forced-colors:shadow-none'), String(size)).toBe(true);
      // paint never moves geometry: ps identical at every size
      expect(root.classList.contains('ps-[0.875rem]'), String(size)).toBe(true);
    }
    for (const size of [4, 8] as const) {
      const { container } = render(Blockquote, { props: { rule: 'border', ruleSize: size } });
      const root = container.querySelector('blockquote')!;
      expect(root.classList.contains(`border-s-${size}`), String(size)).toBe(true);
      expect(root.getAttribute('data-jx-blockquote-rule')).toBe(`border-${size}`);
      expect(root.classList.contains('ps-[0.875rem]'), String(size)).toBe(true);
    }
  });

  it('tonal rides the SAME hue source for box and rule (the shadow-4 near-no-op stays honest)', () => {
    const { container } = render(Blockquote, { props: { variant: 'tonal' } });
    const root = container.querySelector('blockquote')!;
    expect(root.getAttribute('data-jx-blockquote-rule')).toBe('shadow-4');
    // the alert box border STAYS (the tonal recipe) and the shadow rule
    // rides the box's own 45% mix — one hue source, jx-hue-* retunes all
    expect(root.classList.contains('border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)]')).toBe(true);
    expect(
      root.classList.contains('shadow-[inset_4px_0_0_color-mix(in_oklab,var(--jx-tonal)_45%,transparent)]'),
    ).toBe(true);
    expect(root.classList.contains('forced-colors:shadow-none')).toBe(true);
    expect(root.classList.contains('forced-colors:border-s-[4px]')).toBe(true);
    // the box padding stays fixed too
    expect(root.classList.contains('px-3.5')).toBe(true);
    // border mode on tonal: only the WIDTH joins — the box's own
    // border-color declaration is the single color source
    const border = render(Blockquote, { props: { variant: 'tonal', rule: 'border', ruleSize: 4 } });
    const bRoot = border.container.querySelector('blockquote')!;
    expect(bRoot.classList.contains('border-s-4')).toBe(true);
    expect(bRoot.className).not.toMatch(/shadow-\[inset/);
    expect(bRoot.classList.contains('border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)]')).toBe(true);
  });

  it('composes the alert label row and the cite attribution', () => {
    const { container } = render(Blockquote, {
      props: { variant: 'tonal', label: 'Note', cite: 'Dijkstra, 1968' },
    });
    const root = container.querySelector('blockquote')!;
    const label = root.querySelector('p[data-jx-blockquote-label]')!;
    expect(label.textContent).toBe('Note');
    const cite = root.querySelector('footer > cite')!;
    expect(cite.textContent).toBe('Dijkstra, 1968');
  });

  it('merges the consumer class LAST', () => {
    const { container } = render(Blockquote, {
      props: { class: 'consumer-wins' },
    });
    expect(container.querySelector('blockquote')!.classList.contains('consumer-wins')).toBe(true);
  });
});

// =========================================================================
// heading
// =========================================================================
describe('heading', () => {
  it('maps levels 1–6 onto native h1–h6 with the clamped hook', () => {
    for (const level of [1, 2, 3, 4, 5, 6]) {
      const { container } = render(Heading, { props: { level } });
      const el = container.querySelector(`h${level}`)!;
      expect(el).not.toBeNull();
      expect(el.getAttribute('data-jx-heading')).toBe(String(level));
    }
  });

  it('clamps out-of-range levels to the 1–6 band (tag and hook agree)', () => {
    const over = render(Heading, { props: { level: 9 } });
    expect(over.container.querySelector('h6[data-jx-heading="6"]')).not.toBeNull();
    const under = render(Heading, { props: { level: 0 } });
    expect(under.container.querySelector('h1[data-jx-heading="1"]')).not.toBeNull();
  });
});

// =========================================================================
// list
// =========================================================================
describe('list', () => {
  it('renders native ol/ul by `ordered` with the orientation-form hook', () => {
    const ul = render(List, {});
    expect(ul.container.querySelector('ul[data-jx-list="ul"]')).not.toBeNull();
    const ol = render(List, { props: { ordered: true } });
    expect(ol.container.querySelector('ol[data-jx-list="ol"]')).not.toBeNull();
  });

  it('marker omitted keeps today\'s B8 byte-parity: list-disc on ul, list-decimal on ol', () => {
    const ul = render(List, {});
    const ulEl = ul.container.querySelector('ul')!;
    expect(ulEl.classList.contains('list-disc')).toBe(true);
    expect(ulEl.classList.contains('ps-6')).toBe(true);
    expect(ulEl.classList.contains('[&_li::marker]:text-muted-foreground')).toBe(true);
    const ol = render(List, { props: { ordered: true } });
    expect(ol.container.querySelector('ol')!.classList.contains('list-decimal')).toBe(true);
  });

  it('each of the seven marker words stamps its utility on either root (marker overrides)', () => {
    // probed map (TW 4.2.1): circle/square have NO core utility — the
    // arbitrary [list-style:] form is the only honest spelling for them
    const STAMPS: ReadonlyArray<[string, string]> = [
      ['disc', 'list-disc'],
      ['circle', '[list-style:circle]'],
      ['square', '[list-style:square]'],
      ['decimal', 'list-decimal'],
      ['alpha', '[list-style:lower-alpha]'],
      ['roman', '[list-style:lower-roman]'],
      ['none', 'list-none'],
    ];
    for (const [marker, utility] of STAMPS) {
      const ul = render(List, { props: { marker } });
      expect(ul.container.querySelector('ul')!.classList.contains(utility), marker).toBe(true);
      // the explicit marker overrides the per-element default on ol too
      const ol = render(List, { props: { marker, ordered: true } });
      expect(ol.container.querySelector('ol')!.classList.contains(utility), marker).toBe(true);
    }
    // an explicit marker overrides ul's disc default symmetrically
    const ulDecimal = render(List, { props: { marker: 'decimal' } });
    expect(ulDecimal.container.querySelector('ul')!.classList.contains('list-decimal')).toBe(true);
    expect(ulDecimal.container.querySelector('ul')!.classList.contains('list-disc')).toBe(false);
  });

  it('nav mode wraps: nav[aria-label] > the list root, marker none + ps-0 defaults', () => {
    const { container } = render(List, { props: { nav: 'Table of contents' } });
    const wrapper = container.querySelector('nav[data-jx-list-nav]')!;
    expect(wrapper).not.toBeNull();
    expect(wrapper.getAttribute('aria-label')).toBe('Table of contents');
    const ul = wrapper.querySelector('ul[data-jx-list="ul"]')!;
    expect(ul).not.toBeNull();
    expect(ul.classList.contains('list-none')).toBe(true);
    expect(ul.classList.contains('ps-0')).toBe(true);
    expect(ul.classList.contains('ps-6')).toBe(false);
    // the class contract stays on the LIST element (the spec pin): the
    // consumer class lands there, never on the wrapper
    const withClass = render(List, { props: { nav: 'On this page', class: 'consumer-wins' } });
    expect(withClass.container.querySelector('nav')!.classList.contains('consumer-wins')).toBe(false);
    expect(
      withClass.container.querySelector('ul[data-jx-list]')!.classList.contains('consumer-wins'),
    ).toBe(true);
  });

  it('an explicit marker in nav mode overrides the none but NOT the ps-0', () => {
    const { container } = render(List, {
      props: { nav: 'Steps', marker: 'decimal', ordered: true },
    });
    const ol = container.querySelector('nav[data-jx-list-nav] ol[data-jx-list="ol"]')!;
    expect(ol.classList.contains('list-decimal')).toBe(true);
    expect(ol.classList.contains('list-none')).toBe(false);
    // ps-0 STAYS — the structural indent belongs to document flow, a
    // nav list is chrome
    expect(ol.classList.contains('ps-0')).toBe(true);
    expect(ol.classList.contains('ps-6')).toBe(false);
  });

  it('passes start/reversed through on the ordered root only', () => {
    const { container } = render(List, {
      props: { ordered: true, start: 4, reversed: true },
    });
    const ol = container.querySelector('ol')!;
    expect(ol.getAttribute('start')).toBe('4');
    expect(ol.hasAttribute('reversed')).toBe(true);
    // ul carries neither — destructured out of the rest passthrough
    const ul = render(List, { props: { reversed: true, start: 9 } });
    const ulEl = ul.container.querySelector('ul')!;
    expect(ulEl.hasAttribute('reversed')).toBe(false);
    expect(ulEl.getAttribute('start')).toBeNull();
  });
});

// =========================================================================
// link
// =========================================================================
describe('link', () => {
  it('absolute http(s) hrefs open safely; relative ones stay internal', () => {
    const ext = render(Link, {
      props: { href: 'https://example.com/x' },
    });
    const extAnchor = ext.container.querySelector('a[data-jx-link="external"]')!;
    expect(extAnchor.getAttribute('target')).toBe('_blank');
    expect(extAnchor.getAttribute('rel')).toBe('noreferrer');
    const int = render(Link, { props: { href: '/docs' } });
    const intAnchor = int.container.querySelector('a[data-jx-link="internal"]')!;
    expect(intAnchor.getAttribute('target')).toBeNull();
    expect(intAnchor.getAttribute('rel')).toBeNull();
  });

  it('tri-state icon: undefined paints the default glyph IFF external (inline-core, sync)', () => {
    const ext = render(Link, { props: { href: 'https://example.com/x' } });
    const extAnchor = ext.container.querySelector('a[data-jx-link="external"]')!;
    const lane = extAnchor.querySelector('span[data-jx-link-icon]')!;
    expect(lane).not.toBeNull();
    expect(lane.getAttribute('aria-hidden')).toBe('true');
    // inline-core name: the svg paints synchronously — no pending box
    const svg = lane.querySelector('svg[data-jx-icon]');
    expect(svg).not.toBeNull();
    expect(lane.querySelector('[data-jx-icon-pending]')).toBeNull();
    // em-sized — rides any ambient scale (the no-font-size kinship)
    expect(svg!.getAttribute('width')).toBe('0.8em');
    // internal anchors never carry the lane
    const int = render(Link, { props: { href: '/docs' } });
    expect(
      int.container.querySelector('a[data-jx-link="internal"]')!.querySelector('[data-jx-link-icon]'),
    ).toBeNull();
  });

  it('tri-state icon: null switches the lane OFF; a snippet customizes it', () => {
    const off = render(Link, { props: { href: 'https://example.com', icon: null } });
    expect(off.container.querySelector('[data-jx-link-icon]')).toBeNull();
    expect(off.container.querySelector('a')!.getAttribute('data-jx-link')).toBe('external');

    const custom = createRawSnippet(() => ({
      render: () => '<b data-testid="custom-glyph">↗</b>',
    }));
    const on = render(Link, { props: { href: 'https://example.com', icon: custom } });
    const lane = on.container.querySelector('[data-jx-link-icon]')!;
    expect(lane.querySelector('[data-testid="custom-glyph"]')).not.toBeNull();
    // the snippet REPLACES the default glyph — no double icon
    expect(lane.querySelector('svg[data-jx-icon]')).toBeNull();
    // null on an internal link changes nothing — the lane is external-only
    const intOff = render(Link, { props: { href: '/docs', icon: null } });
    expect(intOff.container.querySelector('[data-jx-link-icon]')).toBeNull();
  });
});

// =========================================================================
// text — the base, the mark matrix, sugar ≡ base
// =========================================================================
describe('text family', () => {
  const MARK_ELEMENTS: Array<[string, string, typeof Strong]> = [
    ['p', 'p', P],
    ['strong', 'strong', Strong],
    ['em', 'em', Em],
    ['del', 'del', Del],
    ['mark', 'mark', Mark],
    ['ins', 'ins', Ins],
    ['sub', 'sub', Sub],
    ['sup', 'sup', Sup],
  ];

  it('the base renders p by default; each mark switches element + hook', () => {
    const base = render(Text, {});
    expect(base.container.querySelector('p[data-jx-text="p"]')).not.toBeNull();
    const FORMS: Array<[string, string]> = [
      ['strong', 'strong'],
      ['em', 'em'],
      ['del', 'del'],
      ['mark', 'mark'],
      ['ins', 'ins'],
      ['sub', 'sub'],
      ['sup', 'sup'],
    ];
    for (const [mark, element] of FORMS) {
      const { container } = render(Text, { props: { mark } });
      expect(container.querySelector(`${element}[data-jx-text="${mark}"]`), mark).not.toBeNull();
    }
  });

  it('sugar ≡ base: every Raw export renders the same element + hook', () => {
    for (const [form, element, Sugar] of MARK_ELEMENTS) {
      const { container } = render(Sugar, {});
      expect(container.querySelector(`${element}[data-jx-text="${form}"]`), form).not.toBeNull();
    }
  });

  it('the consumer class merges LAST (tailwind-merge replaces, never stacks)', () => {
    // font-bold replaces strong's font-semibold — the layer law
    const { container } = render(Strong, { props: { class: 'font-bold' } });
    const el = container.querySelector('strong')!;
    expect(el.classList.contains('font-bold')).toBe(true);
    expect(el.classList.contains('font-semibold')).toBe(false);
  });

  it('the ambient-scale law: no font-size utility on any family root (source guard)', () => {
    const familyDir = resolve(import.meta.dirname, '../src/lib/ui/text');
    const sources = ['text.svelte', ...MARK_ELEMENTS.map(([, , Sugar]) => Sugar.name)]
      // the sugar filenames derive from the form word, not the import
      .slice(0, 1)
      .concat(['p.svelte', 'strong.svelte', 'em.svelte', 'del.svelte', 'mark.svelte', 'ins.svelte', 'sub.svelte', 'sup.svelte']);
    for (const file of sources) {
      const src = readFileSync(resolve(familyDir, file), 'utf8');
      expect(src, file).not.toMatch(/\btext-(xs|sm|base|lg|xl|\[[^\]]*font-size[^\]]*\])/);
      expect(src, file).not.toMatch(/font-size\s*:/);
    }
  });
});


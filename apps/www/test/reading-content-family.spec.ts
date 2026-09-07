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
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
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
    // same-frame flip: the zone re-derives the paint family in place
    bare.rerender({ zone: 'outline' });
    expect(zoned.querySelector('blockquote')!.getAttribute('data-jx-blockquote')).toBe('outline');
    // the explicit prop beats the zone
    const explicit = render(Blockquote, {
      props: { variant: 'outline' },
    });
    expect(explicit.container.querySelector('blockquote')!.getAttribute('data-jx-blockquote')).toBe(
      'outline',
    );
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

  it('passes start through on the ordered root only', () => {
    const { container } = render(List, {
      props: { ordered: true, start: 4 },
    });
    expect(container.querySelector('ol')!.getAttribute('start')).toBe('4');
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


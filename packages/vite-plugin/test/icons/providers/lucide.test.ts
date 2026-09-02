/**
 * lucideIconProvider unit tests (P2.2)
 *
 * Verifies the zero-I/O contract (no ctx.loadSource / ctx.watchFile
 * calls), full slot coverage, the wrapper's root-tag attributes — and
 * that the provider's bytes ARE lucide's own data: expectations are
 * DERIVED from `import { ... } from 'lucide'` via a local serializer
 * over the IconNode children, never from hand-written geometry.
 */
import { Calendar, Check, ChevronDown, CircleAlert, Clock, Mail, Palette, Search, X } from 'lucide';
import type { IconNode, IconNodeChild } from 'lucide';
import { describe, expect, it, vi } from 'vitest';
import { lucideIconProvider } from '../../../src/icons/providers/lucide.js';
import type { IconSlot, ProviderContext } from '../../../src/icons/types.js';
import { SLOT_NAMES } from '../../../src/icons/types.js';

function makeContext(): { ctx: ProviderContext; loadSource: ReturnType<typeof vi.fn>; watchFile: ReturnType<typeof vi.fn> } {
  const loadSource = vi.fn();
  const watchFile = vi.fn();
  return { ctx: { loadSource, watchFile }, loadSource, watchFile };
}

/** slot → the lucide IconNode whose geometry the provider must serve */
const SLOT_LUCIDE_ICONS: Readonly<Record<IconSlot, IconNode>> = {
  calendar: Calendar,
  clock: Clock,
  chevron: ChevronDown,
  palette: Palette,
  clear: X,
  mail: Mail,
  search: Search,
  check: Check,
  invalid: CircleAlert,
};

/** the provider's inner-SVG grammar: attrs in insertion order, self-closing, no separators */
function serializeChildren(children: readonly IconNodeChild[] | undefined): string {
  return (children ?? [])
    .map(([tag, attrs]) => {
      const attributes = Object.entries(attrs)
        .map(([name, value]) => ` ${name}="${value}"`)
        .join('');
      return `<${tag}${attributes}/>`;
    })
    .join('');
}

describe('lucideIconProvider', () => {
  it('resolves without touching context I/O (zero-I/O contract)', async () => {
    const { ctx, loadSource, watchFile } = makeContext();
    const provider = await lucideIconProvider()(ctx);
    expect(provider).toBeDefined();
    expect(loadSource).not.toHaveBeenCalled();
    expect(watchFile).not.toHaveBeenCalled();
  });

  it('serves every registered slot with a valid SvgAsset', async () => {
    const { ctx } = makeContext();
    const provider = await lucideIconProvider()(ctx);
    expect(SLOT_NAMES.length).toBe(9);
    for (const slot of SLOT_NAMES) {
      const asset = provider.getIcon(slot);
      expect(asset, `slot "${slot}" must be served`).not.toBeNull();
      expect(asset!.viewBox).toEqual({ width: 24, height: 24 });
      expect(asset!.nature).toBe('stroke');
      expect(asset!.source.kind).toBe('inline');
    }
  });

  it('returns a complete, lucide-attributed <svg> document per slot', async () => {
    const { ctx } = makeContext();
    const provider = await lucideIconProvider()(ctx);
    for (const slot of SLOT_NAMES) {
      const svg = provider.getIcon(slot)!.svg;
      expect(svg.startsWith('<svg '), `slot "${slot}"`).toBe(true);
      expect(svg.endsWith('</svg>'), `slot "${slot}"`).toBe(true);
      expect(svg).toContain('viewBox="0 0 24 24"');
      expect(svg).toContain('fill="none"');
      expect(svg).toContain('stroke="currentColor"');
      expect(svg).toContain('stroke-width="2"');
      expect(svg).toContain('stroke-linecap="round"');
      expect(svg).toContain('stroke-linejoin="round"');
      // theme owns sizing: no standalone width/height attr on the root
      // <svg> tag (lookbehind excludes hyphenated names like stroke-width)
      const openTag = /<svg\b[^>]*>/.exec(svg)![0];
      expect(openTag, `slot "${slot}" root must not set width/height`).not.toMatch(/(?<![\w-])(width|height)\s*=/);
    }
  });

  it('serializes lucide\'s own IconNode data byte-for-byte (single-source law)', async () => {
    const { ctx } = makeContext();
    const provider = await lucideIconProvider()(ctx);
    for (const slot of SLOT_NAMES) {
      const icon = SLOT_LUCIDE_ICONS[slot];
      const expected =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        serializeChildren(icon[2]) +
        '</svg>';
      expect(provider.getIcon(slot)!.svg, slot).toBe(expected);
    }
  });

  it('rejects with an install hint when the lucide package is missing', async () => {
    vi.doMock('lucide', () => {
      throw new Error('Cannot find module');
    });
    try {
      await expect(lucideIconProvider()(makeContext().ctx)).rejects.toThrow(
        /lucideIconProvider[\s\S]*npm i lucide/,
      );
    } finally {
      vi.doUnmock('lucide');
      vi.resetModules();
    }
  });
});

/**
 * lucideIconProvider unit tests (P2.2)
 *
 * Verifies the zero-I/O contract (no ctx.loadSource / ctx.watchFile
 * calls), full slot coverage, and the lucide stroke geometry embedded
 * in the provider (mirrored from registry/files/lib/icons.ts).
 */
import { describe, expect, it, vi } from 'vitest';
import { lucideIconProvider } from '../../src/providers/lucide.js';
import type { IconSlot, ProviderContext } from '../../src/types.js';
import { SLOT_NAMES } from '../../src/types.js';

function makeContext(): { ctx: ProviderContext; loadSource: ReturnType<typeof vi.fn>; watchFile: ReturnType<typeof vi.fn> } {
  const loadSource = vi.fn();
  const watchFile = vi.fn();
  return { ctx: { loadSource, watchFile }, loadSource, watchFile };
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
    expect(SLOT_NAMES.length).toBe(7);
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

  it('embeds the verified lucide path data (single-source law with icons.ts)', async () => {
    const { ctx } = makeContext();
    const provider = await lucideIconProvider()(ctx);
    const geometry: Record<IconSlot, RegExp> = {
      calendar: /<rect x="3" y="4" width="18" height="18" rx="2"\/><path d="M16 2v4"\/><path d="M8 2v4"\/><path d="M3 10h18"\/>(?=<\/svg>$)/,
      clock: /<circle cx="12" cy="12" r="10"\/><polyline points="12 6 12 12 16 14"\/>(?=<\/svg>$)/,
      chevron: /<path d="m6 9 6 6 6-6"\/>(?=<\/svg>$)/,
      pipette: /<path d="m2 22 1-1h3l9-9"\/><path d="M3 21v-3l9-9"\/>/,
      clear: /<path d="M18 6 6 18"\/><path d="m6 6 12 12"\/>(?=<\/svg>$)/,
    };
    for (const slot of SLOT_NAMES) {
      expect(provider.getIcon(slot)!.svg, slot).toMatch(geometry[slot]);
    }
  });
});

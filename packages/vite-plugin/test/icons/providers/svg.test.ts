/**
 * svgIconProvider unit tests (P2.1)
 *
 * Mocks ProviderContext (loadSource/watchFile — the provider must do
 * NO direct file I/O) and verifies: default filename resolution for
 * every slot, per-slot filename overrides + slot scoping, viewBox
 * parsing, fill/stroke nature detection, warn-and-skip failure
 * policy, watchFile HMR wiring, and source metadata.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { svgIconProvider } from '../../../src/icons/providers/svg.js';
import type { IconProvider, ProviderContext, SourceDescriptor } from '../../../src/icons/types.js';
import { SLOT_NAMES } from '../../../src/icons/types.js';

const encoder = new TextEncoder();

/** lucide-style stroke artwork */
const STROKE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';

/** fill-based artwork (font-glyph style: default fill, explicit stroke none) */
const FILL_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M2 2h12v12H2z" fill="#000" stroke="none"/></svg>';

function sourceOf(svg: string, path: string): SourceDescriptor {
  return { data: encoder.encode(svg), path, mimeType: 'image/svg+xml' };
}

/**
 * A mutable in-memory filesystem: loadSource serves (or rejects on)
 * demand; mutating `files` between calls simulates HMR file changes.
 */
function makeContext(files: Record<string, string>): {
  ctx: ProviderContext;
  loadSource: ReturnType<typeof vi.fn>;
  watchFile: ReturnType<typeof vi.fn>;
} {
  const loadSource = vi.fn(async (path: string): Promise<SourceDescriptor> => {
    const svg = files[path];
    if (svg === undefined) {
      throw new Error(`ENOENT: no such file: ${path}`);
    }
    return sourceOf(svg, path);
  });
  const watchFile = vi.fn();
  return { ctx: { loadSource, watchFile }, loadSource, watchFile };
}

/** all five default slot files present */
function fullDir(dir: string): Record<string, string> {
  const files: Record<string, string> = {};
  for (const slot of SLOT_NAMES) {
    files[`${dir}/${slot}.svg`] = STROKE_SVG;
  }
  return files;
}

describe('svgIconProvider', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('loads every registered slot via ctx.loadSource with default filenames', async () => {
    const dir = './icons';
    const { ctx, loadSource } = makeContext(fullDir(dir));
    const provider: IconProvider = await svgIconProvider({ dir })(ctx);

    expect(loadSource).toHaveBeenCalledTimes(9);
    for (const slot of SLOT_NAMES) {
      expect(loadSource).toHaveBeenCalledWith(`${dir}/${slot}.svg`);
      expect(provider.getIcon(slot), `slot "${slot}"`).not.toBeNull();
    }
  });

  it('registers every slot file for HMR via ctx.watchFile', async () => {
    const dir = 'assets/icons';
    const { ctx, watchFile } = makeContext(fullDir(dir));
    await svgIconProvider({ dir })(ctx);

    expect(watchFile).toHaveBeenCalledTimes(9);
    for (const slot of SLOT_NAMES) {
      expect(watchFile).toHaveBeenCalledWith(`${dir}/${slot}.svg`, expect.any(Function));
    }
  });

  it('parses viewBox dimensions from the svg root and preserves the svg string', async () => {
    const wide = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 36"><path d="M0 0"/></svg>';
    const { ctx } = makeContext({ './icons/chevron.svg': wide });
    const provider = await svgIconProvider({ dir: './icons', slots: { chevron: 'chevron.svg' } })(ctx);

    const asset = provider.getIcon('chevron')!;
    expect(asset.viewBox).toEqual({ width: 48, height: 36 });
    expect(asset.svg).toBe(wide);
    expect(asset.source).toEqual({ kind: 'file', path: './icons/chevron.svg' });
  });

  it('detects stroke nature for stroked artwork and fill nature for filled artwork', async () => {
    const { ctx } = makeContext({
      './icons/chevron.svg': STROKE_SVG,
      './icons/calendar.svg': FILL_SVG,
    });
    const provider = await svgIconProvider({ dir: './icons', slots: { chevron: 'chevron.svg', calendar: 'calendar.svg', mail: 'mail.svg', search: 'search.svg' } })(ctx);

    expect(provider.getIcon('chevron')!.nature).toBe('stroke');
    expect(provider.getIcon('calendar')!.nature).toBe('fill');
  });

  it('scopes to the listed slots when `slots` is provided (mixin override shape)', async () => {
    const { ctx, loadSource } = makeContext({ 'c/down.svg': STROKE_SVG });
    const provider = await svgIconProvider({ dir: 'c', slots: { chevron: 'down.svg' } })(ctx);

    expect(loadSource).toHaveBeenCalledTimes(1);
    expect(loadSource).toHaveBeenCalledWith('c/down.svg');
    expect(provider.getIcon('chevron')).not.toBeNull();
    // unlisted slots are "not my slot" → null → the mixin base serves
    expect(provider.getIcon('calendar')).toBeNull();
    expect(provider.getIcon('clear')).toBeNull();
  });

  it('warns and skips slots whose file is missing (null, not a throw)', async () => {
    const { ctx } = makeContext({ './icons/chevron.svg': STROKE_SVG });
    const provider = await svgIconProvider({ dir: './icons' })(ctx);

    expect(provider.getIcon('chevron')).not.toBeNull();
    for (const slot of ['calendar', 'clock', 'palette', 'clear'] as const) {
      expect(provider.getIcon(slot), slot).toBeNull();
    }
    expect(warnSpy).toHaveBeenCalledTimes(8);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('./icons/calendar.svg'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('falls back to the next provider'));
  });

  it('warns and skips slots whose svg is malformed (missing viewBox / no svg root)', async () => {
    const { ctx } = makeContext({
      './icons/clock.svg': '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="1" cy="1" r="1"/></svg>',
      './icons/palette.svg': '<div>not an icon</div>',
    });
    const provider = await svgIconProvider({ dir: './icons' })(ctx);

    expect(provider.getIcon('clock')).toBeNull();
    expect(provider.getIcon('palette')).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('missing viewBox'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('no <svg> root element'));
  });

  it('re-loads a slot through its watchFile callback when the file changes (HMR)', async () => {
    const files: Record<string, string> = { './icons/chevron.svg': STROKE_SVG };
    const { ctx, watchFile } = makeContext(files);
    const provider = await svgIconProvider({ dir: './icons', slots: { chevron: 'chevron.svg' } })(ctx);

    expect(provider.getIcon('chevron')!.viewBox).toEqual({ width: 24, height: 24 });

    files['./icons/chevron.svg'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M0 0"/></svg>';
    const onChange = watchFile.mock.calls[0]?.[1] as () => void;
    onChange();

    await vi.waitFor(() => {
      expect(provider.getIcon('chevron')!.viewBox).toEqual({ width: 32, height: 32 });
    });
  });

  it('drops a slot from the cache when its file becomes unreadable after a change', async () => {
    const files: Record<string, string> = { './icons/clear.svg': STROKE_SVG };
    const { ctx, watchFile } = makeContext(files);
    const provider = await svgIconProvider({ dir: './icons', slots: { clear: 'clear.svg' } })(ctx);
    expect(provider.getIcon('clear')).not.toBeNull();

    delete files['./icons/clear.svg'];
    const onChange = watchFile.mock.calls[0]?.[1] as () => void;
    onChange();

    await vi.waitFor(() => {
      expect(provider.getIcon('clear')).toBeNull();
    });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('skipping slot "clear"'));
  });
});

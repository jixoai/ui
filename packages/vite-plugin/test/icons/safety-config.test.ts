/**
 * safety-config.test.ts — follow-up C5 (2026-08-28): the `safety`
 * option on JxUIPluginOptions replaces the default warn-mode checker.
 *
 * NO serializer mock here — the real checker→serializer chain runs, so
 * these tests pin the CONSUMER-facing contract:
 *   - default (no option)   = createSafetyChecker({ mode: 'warn' })
 *   - safety { mode:'warn' } with tighter limits → icon rejected, the
 *     standard layer's inline fallback serves (comment-only module)
 *   - safety { mode:'error' } → the build FAILS (serializeIcon throws)
 */

import type { Plugin } from 'vite';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { IconProvider, SvgAsset } from '../../src/icons/types.js';
import { createIconPlugin, VIRTUAL_MODULE_ID } from '../../src/icons/vite-plugin.js';

// ── helpers ────────────────────────────────────────────────────────

interface PluginLifecycle {
  buildStart(): Promise<void>;
  resolveId(id: string, importer?: string): string | null;
  load(id: string): Promise<string | null>;
}

const lifecycle = (plugin: Plugin): PluginLifecycle =>
  plugin as unknown as PluginLifecycle;

/** an icon well over 32 bytes of svg text */
const bigIcon = (): SvgAsset => ({
  svg: '<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" stroke-width="2"/></svg>',
  viewBox: { width: 24, height: 24 },
  nature: 'stroke',
  source: { kind: 'inline' },
});

const calendarOnly = (): IconProvider => ({
  getIcon: (slot) => (slot === 'calendar' ? bigIcon() : null),
});

const loadCss = async (plugin: Plugin): Promise<string> => {
  const { buildStart, resolveId, load } = lifecycle(plugin);
  await buildStart();
  const resolved = resolveId(VIRTUAL_MODULE_ID, '/app/src/app.css');
  expect(resolved).toBeTruthy();
  const css = await load(resolved!);
  expect(css).toBeTruthy();
  return css!;
};

afterEach(() => {
  vi.restoreAllMocks();
});

// ── tests ──────────────────────────────────────────────────────────

describe('createIconPlugin() safety option (C5)', () => {
  test('default: no safety option keeps the warn-mode checker (icons pass)', async () => {
    const css = await loadCss(createIconPlugin({ icons: () => Promise.resolve(calendarOnly()) }));
    expect(css).toContain('--jx-icon-calendar: url("data:image/svg+xml,');
  });

  test("safety { mode:'warn', maxBytes } rejects oversized icons → fallback serves", async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const css = await loadCss(
      createIconPlugin({
        icons: () => Promise.resolve(calendarOnly()),
        safety: { mode: 'warn', maxBytes: 32 },
      }),
    );
    expect(css).not.toContain('--jx-icon-');
    expect(css).toContain('jixoai-icons'); // the comment-only module
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('SVG safety check rejected'),
    );
  });

  test("safety { mode:'error', maxBytes } fails the build (serializeIcon throws)", async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const plugin = createIconPlugin({
      icons: () => Promise.resolve(calendarOnly()),
      safety: { mode: 'error', maxBytes: 32 },
    });
    await expect(lifecycle(plugin).buildStart()).rejects.toThrow(
      /SVG safety check failed.*exceeds the limit/s,
    );
    expect(warn).not.toHaveBeenCalled(); // error mode throws — no warn path
  });

  test("safety { mode:'error' } with generous limits passes like warn-mode defaults", async () => {
    const css = await loadCss(
      createIconPlugin({
        icons: () => Promise.resolve(calendarOnly()),
        safety: { mode: 'error' },
      }),
    );
    expect(css).toContain('--jx-icon-calendar: url("data:image/svg+xml,');
  });
});

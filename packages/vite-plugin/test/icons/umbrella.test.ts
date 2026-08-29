/**
 * umbrella.test.ts — merge-alignment A1 (2026-08-29): the `icons`
 * option on jixoai() wires the icon plugin into the umbrella.
 *
 * Pins the feature-option contract:
 *   - default (no options / undefined): NO icon plugin is registered —
 *     nothing reads files or loads optional dependencies
 *   - `icons: false`: same opt-out
 *   - `icons: { provider }`: exactly one 'jixoai-icons' plugin is
 *     registered and serves the virtual:jixoai-icons module
 *   - safety nests inside the icons option and reaches the serializer
 *   - ghostty (default-on) and icons compose in one jixoai() call
 */

import { describe, expect, test, vi } from 'vitest';
import type { Plugin } from 'vite';
import { jixoai } from '../../src/index.ts';
import { VIRTUAL_MODULE_ID } from '../../src/icons/vite-plugin.js';
import type { IconProvider, IconProviderFactory } from '../../src/icons/types.js';

interface PluginLifecycle {
  buildStart(): Promise<void>;
  resolveId(id: string, importer?: string): string | null | undefined;
  load(id: string): Promise<string | null>;
}

/** the plugin's hooks are plain functions — narrow them for direct calls */
const lifecycle = (plugin: Plugin): PluginLifecycle => plugin as unknown as PluginLifecycle;

const fullProvider: IconProvider = {
  getIcon: () => ({
    svg: '<svg viewBox="0 0 24 24"><path d="MUMBRELLA"/></svg>',
    viewBox: { width: 24, height: 24 },
    nature: 'stroke',
    source: { kind: 'inline' },
  }),
};

const factory: IconProviderFactory = () => Promise.resolve(fullProvider);

const pluginNames = (plugins: readonly { name?: string }[]): string[] =>
  plugins.map((plugin) => plugin.name ?? '');

describe('jixoai() icons feature option (A1)', () => {
  test('default: no icon plugin is registered (the feature is opt-in)', () => {
    expect(pluginNames(jixoai()).includes('jixoai-icons')).toBe(false);
    expect(pluginNames(jixoai({})).includes('jixoai-icons')).toBe(false);
  });

  test('icons: false opts out explicitly', () => {
    expect(pluginNames(jixoai({ icons: false })).includes('jixoai-icons')).toBe(false);
  });

  test('icons: { provider } registers exactly one working icon plugin', async () => {
    const plugins = jixoai({ icons: { provider: factory } });
    const iconsPlugins = plugins.filter((plugin) => plugin.name === 'jixoai-icons');
    expect(iconsPlugins).toHaveLength(1);

    const plugin = iconsPlugins[0]!;
    const { buildStart, resolveId, load } = lifecycle(plugin);

    const resolved = resolveId(VIRTUAL_MODULE_ID, '/app/src/app.css');
    expect(resolved).toBeTruthy();
    await buildStart();
    const css = await load(resolved!);
    expect(css).toContain('--jx-icon-calendar: url("data:image/svg+xml,');
    expect(css).toContain('@layer theme {');
  });

  test('safety nests inside the icons option and reaches the serializer', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const plugins = jixoai({
      icons: {
        provider: factory,
        // every asset here exceeds 32 bytes → warn rejects, fallback serves
        safety: { mode: 'warn', maxBytes: 32 },
      },
    });
    const plugin = plugins.find((p) => p.name === 'jixoai-icons')!;
    const { buildStart, resolveId, load } = lifecycle(plugin);
    await buildStart();

    const css = await load(resolveId(VIRTUAL_MODULE_ID)!);
    expect(css).not.toContain('--jx-icon-');
    expect(css).toContain('jixoai-icons'); // the comment-only fallback module
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('SVG safety check rejected'));
    warn.mockRestore();
  });

  test('icons composes with the default-on ghostty feature', () => {
    const plugins = jixoai({ icons: { provider: factory } });
    const names = pluginNames(plugins);
    expect(names.includes('jixoai-ghostty')).toBe(true);
    expect(names.includes('jixoai-icons')).toBe(true);
  });

  test('ghostty: false + icons keeps only the icon plugin', () => {
    const names = pluginNames(jixoai({ ghostty: false, icons: { provider: factory } }));
    expect(names).toEqual(['jixoai-icons']);
  });
});

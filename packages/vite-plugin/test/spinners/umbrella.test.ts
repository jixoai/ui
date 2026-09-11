/**
 * umbrella.test.ts — the `spinners` option on jixoai() (P2/P4,
 * spin-ora-svg-lane design §5):
 *
 *   - default (no options / undefined / false): NO spinners plugin is
 *     registered — the feature is opt-in, the DEFAULT artifact is
 *     plugin-free
 *   - a bare `{}` IS a legal configuration (blocks-wave only) — the
 *     icons ≥1-of-2 matrix error deliberately does NOT apply (pinned
 *     by contrast)
 *   - config errors propagate to the jixoai() call site (startup)
 *   - spinners composes with the default-on ghostty feature and the
 *     icons feature in one call
 */

import { describe, expect, test } from 'vitest';
import { jixoai } from '../../src/index.ts';

const pluginNames = (plugins: readonly { name?: string }[]): string[] =>
  plugins.map((plugin) => plugin.name ?? '');

describe('jixoai() spinners feature option', () => {
  test('default: no spinners plugin is registered (the feature is opt-in)', () => {
    expect(pluginNames(jixoai()).includes('jixoai-spinners')).toBe(false);
    expect(pluginNames(jixoai({})).includes('jixoai-spinners')).toBe(false);
  });

  test('spinners: false opts out explicitly', () => {
    expect(pluginNames(jixoai({ spinners: false })).includes('jixoai-spinners')).toBe(false);
  });

  test('a bare {} registers exactly one spinners plugin whose buildStart runs clean', async () => {
    const plugins = jixoai({ spinners: {} });
    const spinners = plugins.filter((plugin) => plugin.name === 'jixoai-spinners');
    expect(spinners).toHaveLength(1);
    // ONE face — no matrix error, and the generation is clean
    const lifecycle = spinners[0] as unknown as {
      configResolved(config: { root: string; command?: string }): void;
      buildStart(): Promise<void>;
    };
    lifecycle.configResolved({ root: process.cwd(), command: 'build' });
    await expect(lifecycle.buildStart()).resolves.toBeUndefined();
  });

  test('the icons matrix error does NOT fire for spinners (the contrast pin)', () => {
    // icons: {} throws (neither face); spinners: {} is a configuration
    expect(() => jixoai({ icons: {} })).toThrowError(/icons option is configured/);
    expect(() => jixoai({ spinners: {} })).not.toThrow();
  });

  test('spinners config errors surface at the jixoai() call site', () => {
    expect(() => jixoai({ spinners: { spinners: { MyLoader: '<svg/>' } } })).toThrowError(
      /"MyLoader".*kebab/s,
    );
  });

  test('spinners composes with default-on ghostty and the icons feature', () => {
    const names = pluginNames(jixoai({ icons: { library: {} }, spinners: {} }));
    expect(names.includes('jixoai-ghostty')).toBe(true);
    expect(names.includes('jixoai-icons')).toBe(true);
    expect(names.includes('jixoai-spinners')).toBe(true);
  });

  test('ghostty: false + icons:false + spinners keeps only the spinners plugin', () => {
    const names = pluginNames(jixoai({ ghostty: false, icons: false, spinners: {} }));
    expect(names).toEqual(['jixoai-spinners']);
  });
});

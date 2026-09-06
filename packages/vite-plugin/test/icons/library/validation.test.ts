/**
 * validation.test.ts — the design §1 config-validation matrix + name
 * validation + the manifest migration (A1/A5,
 * icon-component-pipeline).
 *
 * The matrix rows, runtime-validated:
 *   false/undefined → the icons feature is OFF (unchanged default)
 *   {}               → STARTUP ERROR naming provider + library
 *   { provider }     → slot face only (regression-locked in
 *                      umbrella-bridge.test.ts against the golden)
 *   { library }      → library face only (no CSS module content)
 *   both             → the two faces run as independent modules
 * Plus: icon-name legality, options-shape named errors, and the
 * 38-built-in manifest in frozen GROUPS order.
 */

import { describe, expect, test } from 'vitest';
import type { Plugin } from 'vite';
import { jixoai } from '../../../src/index.ts';
import { createIconPlugin } from '../../../src/icons/vite-plugin.js';
import { MISSING_ICONS_FACES_ERROR, normalizeLibraryOptions, ICON_NAME_PATTERN } from '../../../src/icons/library/config.js';
import { DEFAULT_LIBRARY_MANIFEST, DEFAULT_LIBRARY_NAMES } from '../../../src/icons/library/manifest.js';

const factory = () => Promise.resolve({ getIcon: () => null });

const pluginNames = (plugins: readonly { name?: string }[]): string[] =>
  plugins.map((plugin) => plugin.name ?? '');

describe('the icons config matrix (design §1)', () => {
  test('undefined / false: the feature is OFF — no icon plugin registered', () => {
    expect(pluginNames(jixoai()).includes('jixoai-icons')).toBe(false);
    expect(pluginNames(jixoai({})).includes('jixoai-icons')).toBe(false);
    expect(pluginNames(jixoai({ icons: false })).includes('jixoai-icons')).toBe(false);
  });

  test('{} (neither face): named startup error naming provider + library', () => {
    expect(() => jixoai({ icons: {} })).toThrowError(MISSING_ICONS_FACES_ERROR);
    expect(() => jixoai({ icons: {} })).toThrowError(/icons\.provider.*icons\.library|provider.*library/s);
  });

  test('{ library } alone is legal (library-only row)', () => {
    const names = pluginNames(jixoai({ icons: { library: {} } }));
    expect(names.includes('jixoai-icons')).toBe(true);
  });

  test('{ provider, library } both register one composed icon plugin', () => {
    const names = pluginNames(jixoai({ icons: { provider: factory, library: {} } }));
    expect(names.filter((name) => name === 'jixoai-icons')).toHaveLength(1);
  });

  test('the standalone plugin enforces the same matrix (createIconPlugin)', () => {
    expect(() => createIconPlugin({})).toThrowError(MISSING_ICONS_FACES_ERROR);
    expect(() => createIconProviderOnly()).not.toThrow();
    expect(() => createIconPlugin({ library: {} })).not.toThrow();

    function createIconProviderOnly(): Plugin {
      return createIconPlugin({ icons: factory });
    }
  });

  test('the umbrella and the icons sub-entry carry the identical faces error (drift guard)', async () => {
    // the umbrella keeps an inline copy (its entry must stay free of
    // static icons imports — design §9); this pin keeps them one message
    const { MISSING_ICONS_FACES_ERROR: subEntryMessage } = await import(
      '../../../src/icons/library/config.js'
    );
    let umbrellaMessage = '';
    try {
      jixoai({ icons: {} });
    } catch (err) {
      umbrellaMessage = (err as Error).message;
    }
    expect(umbrellaMessage).toBe(subEntryMessage);
  });
});

describe('library options validation (A1)', () => {
  test('defaults normalize to the frozen option set', () => {
    const normalized = normalizeLibraryOptions({});
    expect(normalized).toEqual({
      includeDefaults: true,
      icons: {},
      maxChunkBytes: 20480,
      chunking: 'auto',
      inlineFirstChunk: true,
      output: 'src/lib/icon-set.gen.ts',
      write: false,
      optimize: true,
    });
  });

  test('icon names must match /^[a-z][A-Za-z0-9]*$/', () => {
    expect(() => normalizeLibraryOptions({ icons: { MyLogo: '<svg/>' } })).toThrowError(
      /"MyLogo".*\/\^\[a-z\]\[A-Za-z0-9\]\*\$\//s,
    );
    expect(() => normalizeLibraryOptions({ icons: { 'my-logo': '<svg/>' } })).toThrowError(
      /"my-logo"/,
    );
    expect(() => normalizeLibraryOptions({ icons: { _private: '<svg/>' } })).toThrowError(
      /"_private"/,
    );
    expect(() =>
      normalizeLibraryOptions({ icons: { myLogo2: '<svg/>', okThen: '<svg/>' } }),
    ).not.toThrow();
    expect(ICON_NAME_PATTERN.test('a')).toBe(true);
    expect(ICON_NAME_PATTERN.test('aB9')).toBe(true);
    expect(ICON_NAME_PATTERN.test('Aa')).toBe(false);
    expect(ICON_NAME_PATTERN.test('9a')).toBe(false);
    expect(ICON_NAME_PATTERN.test('a-b')).toBe(false);
  });

  test('illegal chunking / budgets / outputs fail with named teaching errors', () => {
    expect(() => normalizeLibraryOptions({ chunking: 'halves' as never })).toThrowError(
      /chunking "halves".*'auto'.*'single'/s,
    );
    expect(() => normalizeLibraryOptions({ maxChunkBytes: 0 })).toThrowError(/maxChunkBytes 0/);
    expect(() => normalizeLibraryOptions({ maxChunkBytes: 10.5 })).toThrowError(/maxChunkBytes/);
    expect(() => normalizeLibraryOptions({ output: '/abs/gen.ts' })).toThrowError(
      /project-root-relative/,
    );
    expect(() => normalizeLibraryOptions({ output: '../escape.ts' })).toThrowError(
      /project-root-relative/,
    );
  });
});

describe('the built-in manifest migration (GROUPS order, 38 entries)', () => {
  test('carries exactly the 38 names in the frozen GROUPS order', () => {
    expect(DEFAULT_LIBRARY_MANIFEST).toHaveLength(38);
    expect(DEFAULT_LIBRARY_NAMES).toEqual([
      'arrowRight', 'arrowLeft', 'rotateCcw', 'copy', 'chevronDown', 'chevronRight',
      'x', 'externalLink', 'check',
      'folder', 'folderOpen', 'file', 'fileCode', 'fileText', 'braces', 'palette',
      'plus', 'minus', 'ellipsis',
      'calendar', 'clock', 'pipette',
      'sun', 'moon', 'monitor', 'languages', 'image', 'fileVideo', 'fileAudio',
      'upload', 'chevronLeft',
      'eye', 'eyeOff',
      'search',
      'link', 'phone', 'mail',
      'type',
    ]);
  });

  test('every entry pairs a legal name with a real lucide export', async () => {
    const lucide = await import('lucide');
    for (const [name, lucideExport] of DEFAULT_LIBRARY_MANIFEST) {
      expect(ICON_NAME_PATTERN.test(name), name).toBe(true);
      expect(lucide[lucideExport as keyof typeof lucide], `${name} → ${lucideExport}`).toBeDefined();
    }
  });
});

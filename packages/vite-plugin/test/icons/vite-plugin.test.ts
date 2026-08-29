/**
 * vite-plugin.test.ts — P3.3 integration test (mocked vite lifecycle)
 *
 * Exercises createIconPlugin() without a real vite dev server:
 *   - the virtual module id resolves
 *   - the CSS output wraps --jx-icon-* custom properties in
 *     `@layer theme { :root { … } }`
 *   - slots the provider does not fill are omitted
 *   - the ?dom JS module exports domIcons (dom-string serialization)
 *   - the factory receives a ProviderContext whose loadSource does the
 *     file I/O (magic-byte mime normalization)
 *   - watchFile registers with the dev-server watcher and changes
 *     invalidate + regenerate the virtual modules (HMR)
 *
 * '../../src/icons/serializer.js' is MOCKED: serializeIcon is P3.1's deliverable
 * and this suite must stay decoupled from its implementation — it
 * verifies the PLUGIN, not the serializer.
 */
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import type { ViteDevServer } from 'vite';
import { describe, expect, test, vi } from 'vitest';

vi.mock('../../src/icons/serializer.js', () => ({
  // mirrors the real P3.1 contract: null = warn-mode rejection
  serializeIcon: vi.fn(
    (asset: { readonly svg: string }, mode?: 'css-var' | 'dom-string'): string | null =>
      asset.svg.includes('REJECT')
        ? null
        : mode === 'dom-string'
          ? asset.svg
          : `url("data:image/svg+xml,${encodeURIComponent(asset.svg)}")`,
  ),
}));

import { createIconPlugin, VIRTUAL_MODULE_ID } from '../../src/icons/vite-plugin.js';
import type { Plugin } from 'vite';
import { SLOT_NAMES } from '../../src/icons/types.js';
import type {
  IconProvider,
  IconProviderFactory,
  ProviderContext,
  SerializeMode,
  SourceDescriptor,
  SvgAsset,
} from '../../src/icons/types.js';

// ── helpers ────────────────────────────────────────────────────────

interface PluginLifecycle {
  buildStart(): Promise<void>;
  resolveId(id: string, importer?: string): string | null | undefined;
  load(id: string): Promise<string | null>;
  configureServer(server: ViteDevServer): void;
}

/** the plugin's hooks are plain functions — narrow them for direct calls */
const lifecycle = (plugin: Plugin): PluginLifecycle => plugin as unknown as PluginLifecycle;

/** assert + narrow a resolveId result to a string */
const mustResolve = (id: string | null | undefined): string => {
  expect(id).toBeTruthy();
  if (typeof id !== 'string') throw new Error('virtual module did not resolve');
  return id;
};

/** narrow an optional captured value (strict mode: no null-cast dances) */
const unwrap = <T>(value: T | undefined | null, label: string): T => {
  if (value === undefined || value === null) throw new Error(`missing ${label}`);
  return value;
};

const svgAsset = (marker: string): SvgAsset => ({
  svg: `<svg viewBox="0 0 24 24"><path d="${marker}"/></svg>`,
  viewBox: { width: 24, height: 24 },
  nature: 'stroke',
  source: { kind: 'inline' },
});

const fullProvider = (): IconProvider => ({ getIcon: () => svgAsset('icon') });

const factoryOf = (
  provider: IconProvider,
  onContext?: (context: ProviderContext) => void,
): IconProviderFactory => {
  return async (context) => {
    onContext?.(context);
    return provider;
  };
};

type WatchListener = (file: string) => void;

interface MockServer {
  watcher: {
    add(file: string): void;
    on(event: 'change' | 'add', listener: WatchListener): void;
  };
  moduleGraph: {
    getModuleById(id: string): object | undefined;
    invalidateModule(moduleNode: object): void;
  };
  ws: { send(payload: unknown): void };
  config: { logger: { error(message: string): void } };
  /** files passed to watcher.add */
  addedFiles: string[];
  /** ids queried on the module graph */
  queriedIds: string[];
  /** mutation counter exposed to assertions */
  stats: { invalidatedCount: number };
  /** ws payloads */
  sentMessages: unknown[];
  fire(event: 'change' | 'add', file: string): void;
}

const createMockServer = (): MockServer => {
  const listeners: Record<'change' | 'add', Set<WatchListener>> = {
    change: new Set(),
    add: new Set(),
  };
  const nodes = new Map<string, object>();
  const addedFiles: string[] = [];
  const queriedIds: string[] = [];
  const sentMessages: unknown[] = [];
  const stats = { invalidatedCount: 0 };
  return {
    watcher: {
      add: (file: string): void => {
        addedFiles.push(file);
      },
      on: (event: 'change' | 'add', listener: WatchListener): void => {
        listeners[event].add(listener);
      },
    },
    moduleGraph: {
      getModuleById: (id: string): object | undefined => {
        queriedIds.push(id);
        const existing = nodes.get(id);
        if (existing !== undefined) return existing;
        const node: object = {};
        nodes.set(id, node);
        return node;
      },
      invalidateModule: (): void => {
        stats.invalidatedCount += 1;
      },
    },
    ws: { send: (payload: unknown): void => { sentMessages.push(payload); } },
    config: { logger: { error: (): void => undefined } },
    addedFiles,
    queriedIds,
    stats,
    sentMessages,
    fire: (event: 'change' | 'add', file: string): void => {
      for (const listener of listeners[event]) listener(file);
    },
  };
};

// ── tests ──────────────────────────────────────────────────────────

describe('createIconPlugin() vite plugin', () => {
  test('resolves the virtual module id (and leaves foreign ids alone)', () => {
    const { resolveId } = lifecycle(createIconPlugin({ icons: factoryOf(fullProvider()) }));

    const cssResolved = resolveId(VIRTUAL_MODULE_ID, '/app/src/app.css');
    expect(cssResolved).toBeTruthy();
    expect(cssResolved).toContain(VIRTUAL_MODULE_ID);

    // explicit ?dom form → the JS module id
    expect(resolveId(`${VIRTUAL_MODULE_ID}?dom`, '/app/src/main.ts')).toContain('?dom');

    // foreign ids are not ours
    expect(resolveId('./app.css', '/app/src/main.ts')).toBeNull();
  });

  test('virtual CSS module wraps --jx-icon-* custom properties in @layer theme { :root { … } }', async () => {
    const { buildStart, resolveId, load } = lifecycle(createIconPlugin({ icons: factoryOf(fullProvider()) }));
    await buildStart();

    const resolved = mustResolve(resolveId(VIRTUAL_MODULE_ID, '/app/src/app.css'));
    const css = unwrap(await load(resolved), 'css module');

    expect(css).toContain('@layer theme {');
    expect(css).toContain('  :root {');
    for (const slot of SLOT_NAMES) {
      expect(css).toContain(`--jx-icon-${slot}: url("data:image/svg+xml,`);
    }
    expect(css.trimEnd().endsWith('}')).toBe(true);
  });

  test('slots the provider does not fill are omitted (standard layer fallback serves)', async () => {
    const chevronOnly: IconProvider = {
      getIcon: (slot) => (slot === 'chevron' ? svgAsset('chev') : null),
    };
    const { buildStart, resolveId, load } = lifecycle(createIconPlugin({ icons: factoryOf(chevronOnly) }));
    await buildStart();

    const css = unwrap(
      await load(mustResolve(resolveId(VIRTUAL_MODULE_ID, '/app/src/app.css'))),
      'css module',
    );
    expect(css).toContain('--jx-icon-chevron:');
    for (const slot of SLOT_NAMES) {
      if (slot !== 'chevron') expect(css).not.toContain(`--jx-icon-${slot}:`);
    }
  });

  test('a provider that fills nothing yields a comment-only module', async () => {
    const { buildStart, resolveId, load } = lifecycle(
      createIconPlugin({ icons: factoryOf({ getIcon: () => null }) }),
    );
    await buildStart();

    const css = unwrap(
      await load(mustResolve(resolveId(VIRTUAL_MODULE_ID, '/app/src/app.css'))),
      'css module',
    );
    expect(css).not.toContain('--jx-icon-');
    expect(css).toContain('jixoai-icons');
  });

  test('the ?dom module reflects the current inline-svg capability set (clear is now mask)', async () => {
    const { buildStart, resolveId, load } = lifecycle(createIconPlugin({ icons: factoryOf(fullProvider()) }));
    await buildStart();
    const domId = `${VIRTUAL_MODULE_ID}?dom`;
    const resolved = resolveId(domId, '/app/src/app.css');
    const js = unwrap(await load(resolved!), 'dom module');
    expect(js).toContain('export const domIcons');
    // clear moved to CSS mask — no longer in the ?dom export
    expect(js).not.toContain("'clear'");
  });

  test('warn-mode serializer rejections (null) are omitted — the fallback serves', async () => {
    const rejected: IconProvider = { getIcon: () => svgAsset('REJECT') };
    const { buildStart, resolveId, load } = lifecycle(createIconPlugin({ icons: factoryOf(rejected) }));
    await buildStart();

    const css = unwrap(
      await load(mustResolve(resolveId(VIRTUAL_MODULE_ID, '/app/src/app.css'))),
      'css module',
    );
    expect(css).not.toContain('--jx-icon-');
    expect(css).toContain('jixoai-icons'); // the comment-only module
  });

  test('the factory receives a ProviderContext whose loadSource does the file I/O (svg)', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'jixoai-icons-'));
    try {
      const svgPath = join(dir, 'chevron.svg');
      await writeFile(svgPath, '<svg viewBox="0 0 24 24"><path d="M1 1"/></svg>', 'utf8');

      const box: { context?: ProviderContext; received?: SourceDescriptor } = {};
      const factory: IconProviderFactory = async (ctx) => {
        box.context = ctx;
        box.received = await ctx.loadSource(svgPath);
        return fullProvider();
      };
      await lifecycle(createIconPlugin({ icons: factory })).buildStart();

      const context = unwrap(box.context, 'ProviderContext');
      expect(typeof context.loadSource).toBe('function');
      expect(typeof context.watchFile).toBe('function');

      const descriptor = unwrap(box.received, 'SourceDescriptor');
      expect(descriptor.path).toBe(resolve(svgPath)); // resolved absolute path
      expect(descriptor.mimeType).toBe('image/svg+xml'); // content-detected
      expect(Buffer.from(descriptor.data).toString('utf8')).toContain('<svg');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('loadSource normalizes TTF magic bytes to font/ttf (no decompression)', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'jixoai-icons-'));
    try {
      const fontPath = join(dir, 'icons.ttf');
      await writeFile(fontPath, new Uint8Array([0x00, 0x01, 0x00, 0x00, 0x00, 0x0a, 0x00, 0x00]));

      const box: { received?: SourceDescriptor } = {};
      const factory: IconProviderFactory = async (ctx) => {
        box.received = await ctx.loadSource(fontPath);
        return fullProvider();
      };
      await lifecycle(createIconPlugin({ icons: factory })).buildStart();

      const descriptor = unwrap(box.received, 'SourceDescriptor');
      expect(descriptor.mimeType).toBe('font/ttf');
      expect(descriptor.data.byteLength).toBe(8); // untouched bytes
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('watchFile registers with the dev-server watcher; changes invalidate + regenerate (HMR)', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'jixoai-icons-'));
    try {
      const svgPath = join(dir, 'chevron.svg');
      await writeFile(svgPath, '<svg viewBox="0 0 24 24"><path d="MOLD"/></svg>', 'utf8');

      // the provider derives its icon from the bytes loadSource returns,
      // so a factory re-run after a file change must produce new output
      let marker = 'MOLD';
      const factory: IconProviderFactory = async (ctx) => {
        const source = await ctx.loadSource(svgPath);
        marker = Buffer.from(source.data).toString('utf8').includes('MNEW') ? 'MNEW' : 'MOLD';
        ctx.watchFile(svgPath, () => undefined); // providers register interest
        return { getIcon: () => svgAsset(marker) };
      };

      const plugin = createIconPlugin({ icons: factory });
      const server = createMockServer();
      const { configureServer, buildStart, resolveId, load } = lifecycle(plugin);
      configureServer(server as unknown as ViteDevServer);
      await buildStart();

      // the watch was registered with the (absolute) file path
      expect(server.addedFiles).toContain(resolve(svgPath));

      const resolved = mustResolve(resolveId(VIRTUAL_MODULE_ID, '/app/src/app.css'));
      const cssBefore = unwrap(await load(resolved), 'css module');
      expect(cssBefore).toContain('MOLD');

      // file changes → watcher event → callbacks + refresh + invalidation
      await writeFile(svgPath, '<svg viewBox="0 0 24 24"><path d="MNEW"/></svg>', 'utf8');
      server.fire('change', resolve(svgPath));

      await vi.waitFor(() => {
        expect(server.stats.invalidatedCount).toBeGreaterThanOrEqual(1);
      });
      // the module graph was queried for our virtual ids
      expect(
        server.queriedIds.some((id) => id.includes(VIRTUAL_MODULE_ID)),
      ).toBe(true);
      // a full-reload was pushed
      expect(
        server.sentMessages.some(
          (message) => (message as { type?: string }).type === 'full-reload',
        ),
      ).toBe(true);

      const cssAfter = unwrap(await load(resolved), 'css module');
      expect(cssAfter).toContain('MNEW');
      expect(cssAfter).not.toContain('MOLD');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('HMR refreshes do not accumulate provider watch callbacks (C2 cleanup)', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'jixoai-icons-'));
    try {
      const svgPath = join(dir, 'chevron.svg');
      await writeFile(svgPath, '<svg viewBox="0 0 24 24"><path d="M0"/></svg>', 'utf8');

      let generation = 0;
      let callbackRuns = 0;
      const factory: IconProviderFactory = async (ctx) => {
        generation += 1;
        const marker = `GEN${generation}`;
        // each factory generation registers a FRESH closure — the exact
        // shape that used to accumulate in the watches Map on refresh
        ctx.watchFile(svgPath, () => {
          callbackRuns += 1;
        });
        return { getIcon: () => svgAsset(marker) };
      };

      const plugin = createIconPlugin({ icons: factory });
      const server = createMockServer();
      const { configureServer, buildStart, resolveId, load } = lifecycle(plugin);
      configureServer(server as unknown as ViteDevServer);
      await buildStart();

      const resolved = mustResolve(resolveId(VIRTUAL_MODULE_ID, '/app/src/app.css'));
      const cssAt = async (): Promise<string> => unwrap(await load(resolved), 'css module');
      expect(await cssAt()).toContain('GEN1');

      // three change events → three refresh generations; with cleanup
      // each event fires exactly ONE callback (the live generation's).
      // without cleanup the counts would be 1+2+3 = 6.
      const fullReloads = (): number =>
        server.sentMessages.filter(
          (message) => (message as { type?: string }).type === 'full-reload',
        ).length;
      for (let expectedReloads = 1; expectedReloads <= 3; expectedReloads++) {
        server.fire('change', resolve(svgPath));
        // the full-reload is pushed AFTER the stale-callback cleanup, so
        // this barrier proves the old callbacks were already dropped
        // before the next change event fires
        const target = expectedReloads;
        await vi.waitFor(() => {
          expect(fullReloads()).toBeGreaterThanOrEqual(target);
        });
      }

      expect(callbackRuns).toBe(3);
      const cssAfter = await cssAt();
      expect(cssAfter).toContain('GEN4');
      expect(cssAfter).not.toContain('GEN3');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('serializeIcon receives the configured modes (css-var for CSS)', async () => {
    const { buildStart, resolveId, load } = lifecycle(createIconPlugin({ icons: factoryOf(fullProvider()) }));
    await buildStart();
    const css = unwrap(
      await load(mustResolve(resolveId(VIRTUAL_MODULE_ID, '/app/src/app.css'))),
      'css module',
    );
    expect(css).toContain('--jx-icon-');
    // clear is mask now — dom-string mode is not invoked for it in the CSS path
  });
});

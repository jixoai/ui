/**
 * @jixoai/ui-design (stamp) — the usage-site stamp VITE PLUGIN (T0).
 *
 * A thin resolver around the pure transform (transform.ts): decides
 * WHICH modules are jixoai consumers and maps their imports to item
 * ids, then hands the pure transform the binding table.
 *
 *   enforce: 'pre'  — stamps go into the svelte SOURCE before
 *                     vite-plugin-svelte compiles it.
 *   apply: 'serve'  — DEV SURFACES ONLY (the VD3 law): the plugin
 *                     never runs in a build; it is registered solely
 *                     by createDesignViteServer (itself a dev-server
 *                     factory), so a host's normal vite build has zero
 *                     stamp attributes by construction.
 *
 * Consumer detection (design.md §3 — usage sites, never definitions):
 *   1. `.svelte` modules only (a usage tag is svelte-shaped).
 *   2. files INSIDE host.itemAliasBase are definitions — never stamped.
 *   3. an import binds a jixoai component when its specifier is
 *      `#jixoai/<item>…` (the prototype convention) OR resolves (via
 *      this.resolve — the full alias pipeline) to a path under
 *      host.itemAliasBase (consumer hosts' own alias forms). Wide
 *      matching is intentional: false-positive "consumers" simply have
 *      no matching usage tags and cost one parse.
 *
 * Original need: Owner 2026-09-11 (design-studio-r2 T0).
 */

import { relative, sep } from 'node:path';

import type { DesignHostInfo } from '../probe.ts';
import { ITEM_ALIAS_PREFIX } from '../probe.ts';
import type { Plugin } from 'vite';
import { collectImports, stampSvelteSource, USAGE_MAP_EXPORT } from './transform.ts';

/** is `file` inside `base` (or equal to it)? */
function isUnder(file: string, base: string): boolean {
  return file === base || file.startsWith(base.endsWith('/') ? base : `${base}/`);
}

/** the registry item id a resolved path carries, or null when outside the base */
function itemFromResolved(resolvedPath: string, base: string): string | null {
  if (!isUnder(resolvedPath, base)) return null;
  const relativePath = relative(base, resolvedPath);
  const firstSegment = relativePath.split(sep)[0] ?? relativePath.split('/')[0] ?? '';
  return firstSegment.length > 0 ? firstSegment : null;
}

export interface StampPluginOptions {
  /** the probe's host info — itemAliasBase anchors every decision */
  readonly host: DesignHostInfo;
}

/**
 * Build the usage-site stamp plugin. Registered by
 * createDesignViteServer BEFORE the svelte plugin (enforce pre).
 */
export function buildStampPlugin(options: StampPluginOptions): Plugin {
  const { host } = options;
  const base = host.itemAliasBase.replaceAll('\\', '/');

  return {
    name: 'jixoai-design-stamp',
    enforce: 'pre',
    apply: 'serve',

    async transform(code, id) {
      // sub-requests (?svelte&type=style&lang.css and friends) are the
      // svelte pipeline's synthetic modules — only the PLAIN module id
      // is a usage module (observed live: the style request parsed as
      // svelte broke the frame, 2026-09-11)
      if (id.includes('?')) return null;
      const file = id;
      if (!file.endsWith('.svelte')) return null;
      // definitions (the component sources themselves) are never usage
      // sites — the spec's "never the component definition files"
      const normalized = file.replaceAll('\\', '/');
      if (isUnder(normalized, base)) return null;

      // cheap gates before the parse: the prototype convention, or a
      // capitalized tag plus an import statement (the consumer-host
      // posture), or any file inside the design workspace
      const hasPrototypeImport = code.includes(ITEM_ALIAS_PREFIX);
      const maybeConsumer = /<[A-Z][A-Za-z0-9_$]*/.test(code) && /\bimport\s/.test(code);
      if (!hasPrototypeImport && !maybeConsumer && !isUnder(normalized, host.designDir.replaceAll('\\', '/'))) {
        return null;
      }

      const imports = await collectImports(code, file);
      const bindings: Record<string, string> = {};
      for (const record of imports) {
        let item: string | null = null;
        if (record.specifier.startsWith(ITEM_ALIAS_PREFIX)) {
          item = record.specifier.slice(ITEM_ALIAS_PREFIX.length).split('/')[0] ?? null;
        } else if (!record.specifier.startsWith('svelte') && !record.specifier.startsWith('node:')) {
          // resolve through the full alias pipeline — consumer hosts
          // reach the item tree by their own alias forms
          const resolved = await this.resolve(record.specifier, file);
          if (resolved !== null) {
            item = itemFromResolved(resolved.id.split('?')[0]!.replaceAll('\\', '/'), base);
          }
        }
        if (item === null || item.length === 0) continue;
        for (const localName of record.localNames) {
          bindings[localName] = item;
        }
      }
      if (Object.keys(bindings).length === 0) return null;

      const stamped = await stampSvelteSource(code, { filename: file, bindings });
      if (stamped === null) return null;
      // no sourcemap: the injected text is same-line (stamp attributes)
      // or appended at file end (the usage-map script) — line numbers
      // of the original source survive; mid-file module-script
      // injection shifts only what follows that script. Best effort,
      // per the r2 brief.
      return { code: stamped.code, map: null };
    },
  };
}

/* ── the HMR acceptance broadener (#28, 2026-09-12) ─────────────────────── */

/** svelte's compiled self-acceptance, verbatim from vite-plugin-svelte's output */
const ACCEPT_DEFAULT_EXPORTS = 'import.meta.hot.acceptExports(["default"]';
/** the broadened set: the stamp transform's second export joins the acceptance */
const ACCEPT_STAMPED_EXPORTS = 'import.meta.hot.acceptExports(["default", "__jxUsageMap"]';

/**
 * The #28 companion (Owner 2026-09-12「props 修改之后，仍然会触发整页面
 * 重载」): the stamp transform adds a SECOND export (`__jxUsageMap`) to every
 * stamped module, but vite-plugin-svelte's compiled self-acceptance covers
 * only `["default"]` — an edit changes BOTH exports, vite sees the changed
 * set exceed the accepted set, finds NO hot boundary, and broadcasts
 * full-reload: the entire studio wipes on every panel edit (server log:
 * `page reload design/prototypes/…`, probe-verified 5/6 edits).
 *
 * This post transform broadens the acceptance on the COMPILED module so
 * `__jxUsageMap` rides the same hot boundary: the frame re-renders in place
 * (svelte's callback swaps the component; the usage map flows through the
 * live binding) and no reload ever leaves the frame.
 */
export function buildStampHmrPlugin(): Plugin {
  return {
    name: 'jixoai-design-stamp-hmr',
    enforce: 'post',
    apply: 'serve',

    transform(code, id) {
      if (id.includes('?')) return null; // style/sub modules never carry the accept call
      if (!code.includes(USAGE_MAP_EXPORT)) return null; // not a stamped module
      if (!code.includes(ACCEPT_DEFAULT_EXPORTS)) return null; // svelte already broadened/no hmr
      return { code: code.replace(ACCEPT_DEFAULT_EXPORTS, ACCEPT_STAMPED_EXPORTS), map: null };
    },
  };
}

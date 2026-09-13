/**
 * @jixoai/ui-design (server/meta) — the meta endpoint (T7).
 *
 * Orthogonal intent (1): GET /__design__/api/meta/<item>.json — the
 * on-demand schema service. Item resolution rides the probe's alias
 * table (itemAliases, itself derived from itemAliasBase — never the
 * gen script's apps/www path wiring); annotations ride the vehicle
 * lane apps/www/src/lib/meta/<item>.meta.ts when it exists (a
 * FALLBACK PROBE, not a hard dependency — consumers have no apps/www
 * and simply get undecorated schemas, the H6 boundary).
 *
 * Status law:
 *   200 — { item, source, schema, warnings }
 *   400 — annotation key outside the x-ui vocabulary (names file,
 *         key, and the legal vocabulary)
 *   404 — unknown item (names the item and the itemAliasBase scanned)
 *   503 — typescript not installed (the devDependency is declared;
 *         install it to enable extraction)
 *
 * Original need: Owner 2026-09-11 (design-studio-r2 T7).
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

import { ITEM_ALIAS_PREFIX, type DesignHostInfo } from '../probe.ts';
import {
  AnnotationValidationError,
  TypescriptUnavailableError,
  XUI_KEYS,
  extractItemSchema,
  type ExtractDeps,
  type ItemSchemaResult,
} from './extract.ts';

export const META_PATH_PREFIX = '/__design__/api/meta/';

/** item names are single registry segments (kebab-case) */
const ITEM_NAME = /^[a-z0-9][a-z0-9-]*$/;

/**
 * The extraction target is the component's .svelte — the alias table
 * prefers index.ts barrels (correct for module resolution, empty for
 * AST extraction). Follow the barrel to its sibling component file:
 * the name-matching .svelte first, else the first sibling .svelte.
 */
function resolveSvelteSource(entryPath: string, item: string): string {
  if (entryPath.endsWith('.svelte')) return entryPath;
  const dir = dirname(entryPath);
  const named = join(dir, `${item}.svelte`);
  if (existsSync(named)) return named;
  const anySvelte = readdirSync(dir).find((f) => f.endsWith('.svelte'));
  return anySvelte !== undefined ? join(dir, anySvelte) : entryPath;
}

export interface MetaResponse {
  readonly status: number;
  readonly body: unknown;
}

/** the pure request resolver (unit-tested; the middleware stays thin) */
export async function resolveMetaResponse(
  host: DesignHostInfo,
  item: string,
  deps?: ExtractDeps,
): Promise<MetaResponse> {
  if (!ITEM_NAME.test(item)) {
    return { status: 400, body: { error: `malformed item name "${item}"`, itemAliasBase: host.itemAliasBase } };
  }
  const sourcePath = host.itemAliases[`${ITEM_ALIAS_PREFIX}${item}`];
  if (sourcePath === undefined) {
    return {
      status: 404,
      body: { error: `unknown item "${item}"`, itemAliasBase: host.itemAliasBase, known: Object.keys(host.itemAliases).map((k) => k.slice(ITEM_ALIAS_PREFIX.length)) },
    };
  }
  const svelteSource = resolveSvelteSource(sourcePath, item);
  try {
    const extracted: ItemSchemaResult = await extractItemSchema(svelteSource, {
      // the vehicle annotation lane — a probe, not a dependency
      annotationRoots: [`${host.root.replace(/\/$/, '')}/apps/www/src/lib/meta`],
      deps,
    });
    return {
      status: 200,
      body: {
        item,
        source: toRootRelative(host.root, extracted.source),
        schema: extracted.schema,
        warnings: extracted.warnings,
      },
    };
  } catch (cause) {
    if (cause instanceof AnnotationValidationError) {
      return {
        status: 400,
        body: {
          error: cause.message,
          file: toRootRelative(host.root, cause.file),
          key: cause.key,
          vocabulary: XUI_KEYS,
        },
      };
    }
    if (cause instanceof TypescriptUnavailableError) {
      return {
        status: 503,
        body: { error: cause.message, hint: 'npm install in the @jixoai/ui-design workspace (typescript is a declared devDependency)' },
      };
    }
    return { status: 500, body: { error: cause instanceof Error ? cause.message : String(cause) } };
  }
}

function toRootRelative(root: string, path: string): string {
  const rel = relative(root, path);
  return rel.length > 0 && !rel.startsWith('..') ? rel.replaceAll('\\', '/') : path;
}

/** the connect middleware — registered by create.ts as ONE line */
export function metaMiddleware(host: DesignHostInfo): (req: IncomingMessage, res: ServerResponse, next: () => void) => void {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();
    const pathname = (req.url ?? '').split('?')[0]!;
    if (!pathname.startsWith(META_PATH_PREFIX) || !pathname.endsWith('.json')) return next();
    const item = pathname.slice(META_PATH_PREFIX.length, -'.json'.length);
    void resolveMetaResponse(host, item)
      .then((response) => {
        res.statusCode = response.status;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(response.body));
      })
      .catch(next);
  };
}

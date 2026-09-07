/**
 * @jixoai/vite-plugin (canvas) — the standalone canvasPlugin()
 * (typography-context-and-parts §7, design F3/F5/F6/F8).
 *
 * Serves the per-page virtual module
 * `virtual:jixoai-canvas/<route-rel>/+page` carrying the page's
 * id-keyed <ComponentCanvas> children slices (the same-source
 * machinery: the drawer's usage file and the page's usage CodeBlock
 * compose from the SAME extracted markup the stage renders).
 *
 * STANDALONE BY DESIGN (F3): this is NOT a feature under the jixoai()
 * umbrella — the umbrella defaults ghostty on, and the vitest wiring
 * must never drag wasm resolution into suites that only need canvas
 * extraction. Wire it explicitly:
 *
 *   plugins: [sveltekit(), tailwindcss(), canvasPlugin(), ...jixoai()]
 *
 * NO root config option exists (F6): the page a specifier belongs to
 * is derived at resolveId from the IMPORTER — which must BE the page
 * that owns the route (`src/routes/<route-rel>/+page.svelte`), so a
 * cross-page copy-pasted import fails by name and the vite.config
 * twins stay trivially byte-identical.
 *
 * resolveId returns the `\0`-prefixed virtual id (F5, the icons
 * precedent); load() RE-DERIVES the page from the id (tolerant of
 * vite's `?t=` cache busts), re-reads and re-parses it through the
 * pure extractor, and addWatchFile()s the page so HMR re-extracts on
 * every edit. Parse failures re-throw through this.error — the
 * named-error overlay pattern (F8): a mid-edit syntax error names the
 * page instead of surfacing as vite's generic module error.
 */

import { readFile } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import type { Plugin } from 'vite';

import {
  classifyCanvasId,
  isValidRouteRel,
  CANVAS_MODULE_PREFIX,
} from './ids.js';
import { extractCanvases, emitCanvasModule } from './extract.js';

export { CANVAS_MODULE_PREFIX };

/** the SvelteKit page convention both apps in this monorepo share */
const ROUTES_DIR = 'src/routes';

/** the page file a route-rel owns */
export function pagePathFor(root: string, rel: string): string {
  return resolvePath(root, ROUTES_DIR, rel, '+page.svelte');
}

/**
 * canonical comparison form: vite hands hooks REALPATHed ids (on macOS
 * /var → /private/var), while a derived path may still carry the
 * symlink spelling — normalize both sides before comparing/reading.
 */
function canonicalPath(path: string): string {
  try {
    return realpathSync(path);
  } catch {
    return resolvePath(path);
  }
}

/**
 * The standalone canvas same-source plugin. Zero options (F6) — the
 * module id vocabulary is the whole contract (see ./ids.ts).
 */
export function canvasPlugin(): Plugin {
  let projectRoot = process.cwd();

  return {
    name: 'jixoai-canvas',
    enforce: 'pre',

    configResolved(config) {
      if (typeof config.root === 'string' && config.root.length > 0) {
        projectRoot = config.root;
      }
    },

    resolveId(id, importer) {
      const rel = classifyCanvasId(id);
      if (rel === null) return null; // not ours — never touch it
      if (!isValidRouteRel(rel)) {
        throw new Error(
          `[jixoai-canvas] invalid canvas specifier "${id}" — the form is ` +
            `${CANVAS_MODULE_PREFIX}<route-rel>/+page where <route-rel> is a ` +
            `route directory relative to ${ROUTES_DIR} (no "..", no absolute path)`,
        );
      }
      // F6: the importer must BE the page that owns the route — this
      // is the cross-page copy-paste kill. A page importing another
      // page's canvases would re-create the drift class this plugin
      // exists to kill (the extracted ids are page-local).
      const expectedPage = pagePathFor(projectRoot, rel);
      if (
        importer === undefined ||
        canonicalPath(importer.split('?')[0]!) !== canonicalPath(expectedPage)
      ) {
        throw new Error(
          `[jixoai-canvas] ${CANVAS_MODULE_PREFIX}${rel}/+page may only be ` +
            `imported by its own page (${expectedPage}) — the importer was ` +
            `${importer ?? 'nothing'}. Cross-page imports are rejected by ` +
            `design: canvas ids are page-local (the same-source law).`,
        );
      }
      return `\0${CANVAS_MODULE_PREFIX}${rel}/+page`;
    },

    async load(id) {
      const rel = classifyCanvasId(id);
      if (rel === null) return null; // not ours (includes the ?t= pass-through)
      const pagePath = canonicalPath(pagePathFor(projectRoot, rel));

      let source: string;
      try {
        source = await readFile(pagePath, 'utf8');
      } catch {
        this.error(
          `[jixoai-canvas] ${CANVAS_MODULE_PREFIX}${rel}/+page derives to ` +
            `${pagePath}, which cannot be read — the specifier's <route-rel> ` +
            `must be an existing route directory`,
        );
        return;
      }

      // HMR contract: a page edit re-runs this load (F5/F8 — the probe
      // is a priced task of this change)
      this.addWatchFile(pagePath);

      try {
        const extraction = await extractCanvases(source, { filename: pagePath });
        return emitCanvasModule(extraction);
      } catch (cause) {
        // F8: the named-error overlay pattern — mid-edit parse failures
        // (and every extractor guard) name the page, never vite's
        // generic "module failed to load"
        this.error(cause instanceof Error ? cause.message : String(cause));
        return;
      }
    },
  };
}

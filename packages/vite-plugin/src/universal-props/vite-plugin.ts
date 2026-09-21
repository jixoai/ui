/**
 * @jixoai/ui-vite-plugin (universal-props) — the query() desugar
 * vite pass (explicit-props W2 task 2.3b).
 *
 * A PRE-transform over Svelte sources (enforce: 'pre' — the pass
 * rewrites SOURCE before the svelte compiler owns it):
 *   1. scan every literal query({...}) call (desugar.ts's scanner);
 *   2. raise the four KEY DIAGNOSTICS — unknown-scale, duplicate-key
 *      and missing-container-ancestor as build WARNINGS,
 *      empty-container-name (`@md/`) as the §9 parse ERROR (the
 *      build fails naming the key and the rule);
 *   3. desugar what is provable into ladder-ordered custom-property
 *      blocks carried by a per-module VIRTUAL css module injected as
 *      an import into the component's script (Svelte prunes <style>
 *      selectors the markup never references — the attribute-keyed
 *      instance selector would not survive scoping, so the blocks
 *      ride an unscoped virtual sheet instead);
 *   4. collect the un-desugarable cases (dynamic arguments, no-axis
 *      calls, theme-axis queries — theme's carrier is the .dark
 *      class bridge, never a var) into the per-route manifest (the
 *      query-shim's import driver), written at closeBundle when
 *      manifestOut is set.
 *
 * The instance selector the blocks key on — [data-jx-q-<axis>='<id>']
 * — lands with the W3 family wiring (the families stamp the attribute
 * beside the carriers when a slot receives a query); the diagnostics
 * and the emission are this wave's deliverable, and the runtime
 * engine (kernel lib) remains the source of truth for everything
 * dynamic (the Owner's 编译期脱糖不绝对 ruling).
 *
 * Default-OFF like every jixoai() feature beyond ghostty: the site
 * does not owe this pass until the families wire the attribute.
 */

import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import type { Plugin } from 'vite';
import {
  diagnoseQueryCall,
  desugarQueryCall,
  parseLaneLiteral,
  scanQueryCalls,
  type DesugarCase,
} from './desugar.js';
import type { QueryManifestInstance, QueryRouteManifest } from './query-shim.js';

export interface UniversalPropsPluginOptions {
  /** write the per-route un-desugarable manifest to this path
   *  (relative to the vite root); unset = collect, write nothing */
  readonly manifestOut?: string;
  /** the manifest's route label — the deployment's route mapping is
   *  the consumer's concern; '<aggregate>' labels a whole-build
   *  manifest whose instances carry their module refs */
  readonly routeLabel?: string;
  /** extra id filter (beyond the default *.svelte / *.svelte.js) */
  readonly include?: readonly RegExp[];
}

const VIRTUAL_PREFIX = 'virtual:jixoai-universal-props/';
const RESOLVED_PREFIX = '\0' + VIRTUAL_PREFIX;

/** the per-module css registry the load() hook serves from */
const moduleCss = new Map<string, string>();

/** is this id a Svelte source the pass should scan? */
function isScannable(id: string, extra: readonly RegExp[]): boolean {
  const bare = id.split('?')[0] ?? id;
  if (bare.endsWith('.svelte') || /\.svelte\.[jt]s$/.test(bare)) return true;
  return extra.some((re) => re.test(bare));
}

export function createUniversalPropsPlugin(options: UniversalPropsPluginOptions = {}): Plugin {
  const extraInclude = options.include ?? [];
  const routeLabel = options.routeLabel ?? '<aggregate>';
  const manifestInstances: QueryManifestInstance[] = [];

  return {
    name: 'jixoai:universal-props',
    enforce: 'pre',

    transform(code, id) {
      if (!isScannable(id, extraInclude)) return null;
      if (id.startsWith(RESOLVED_PREFIX)) return null;

      const calls = scanQueryCalls(code);
      if (calls.length === 0) return null;

      const cssBlocks: string[] = [];
      let callIndex = 0;
      for (const call of calls) {
        callIndex += 1;
        for (const diag of diagnoseQueryCall(call, code)) {
          if (diag.fatal) {
            this.error(new Error(`[jixoai:universal-props] ${diag.message}`), call.start);
          } else {
            this.warn({ message: `[jixoai:universal-props] ${diag.message}`, id });
          }
        }
        const instanceRef = `${id}#${callIndex}`;
        if (call.dynamic) {
          manifestInstances.push({ id: instanceRef, key: '<dynamic>', reason: 'dynamic', module: id });
          continue;
        }
        const cases = collectCases(code, call.start, call.end, call.keys);
        const base = parseLaneLiteral(call.base);
        const result = desugarQueryCall(call.axis, cases, base, instanceRef);
        if (result.reason !== null) {
          manifestInstances.push({
            id: result.id,
            key: call.keys[0] ?? '<none>',
            reason: 'dynamic',
            module: id,
          });
          continue;
        }
        if (result.css !== '') cssBlocks.push(result.css);
      }

      if (cssBlocks.length === 0) return null;
      const digest = createHash('sha256').update(id).digest('hex').slice(0, 12);
      const virtualId = `${VIRTUAL_PREFIX}${digest}.css`;
      moduleCss.set(virtualId, `/* desugared query() blocks for ${id} */\n${cssBlocks.join('\n')}\n`);

      // inject the import: into the component's FIRST script block for
      // .svelte sources (or a fresh trailing block when the file has
      // none — Svelte accepts a component gaining a script after its
      // markup); as a plain top-of-module import for non-svelte ids an
      // `include` filter pulled in (a <script> tag would corrupt them)
      const importLine = `import '${virtualId}';`;
      if (!/\.svelte$/.test(id.split('?')[0] ?? id)) {
        return { code: `${importLine}\n${code}`, map: null };
      }
      const scriptOpen = /<script[^>]*>/.exec(code);
      if (scriptOpen) {
        const at = scriptOpen.index + scriptOpen[0].length;
        return { code: `${code.slice(0, at)}\n${importLine}${code.slice(at)}`, map: null };
      }
      return { code: `${code}\n<script>\n${importLine}\n</script>`, map: null };
    },

    resolveId(id) {
      if (id.startsWith(VIRTUAL_PREFIX)) return RESOLVED_PREFIX + id.slice(VIRTUAL_PREFIX.length);
      return null;
    },

    load(id) {
      if (!id.startsWith(RESOLVED_PREFIX)) return null;
      return moduleCss.get(VIRTUAL_PREFIX + id.slice(RESOLVED_PREFIX.length)) ?? undefined;
    },

    closeBundle() {
      if (!options.manifestOut || manifestInstances.length === 0) return;
      const manifest: QueryRouteManifest = { route: routeLabel, instances: manifestInstances };
      writeFileSync(options.manifestOut, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    },
  };
}

/** pair the scanner's keys with their literal lane values by re-reading
 *  the call's object text (the same balanced read the scanner did) */
function collectCases(code: string, start: number, end: number, keys: readonly string[]): DesugarCase[] {
  const text = code.slice(start, end);
  const open = text.indexOf('{');
  if (open === -1) return [];
  let depth = 0;
  let close = -1;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === '{') depth += 1;
    else if (text[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        close = i;
        break;
      }
    }
  }
  if (close === -1) return [];
  const body = text.slice(open + 1, close);
  const parts: string[] = [];
  let current = '';
  let str: string | null = null;
  let d = 0;
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i]!;
    if (str) {
      current += ch;
      if (ch === '\\') {
        current += body[i + 1] ?? '';
        i += 1;
      } else if (ch === str) str = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      str = ch;
      current += ch;
      continue;
    }
    if (ch === '{' || ch === '(' || ch === '[') d += 1;
    if (ch === '}' || ch === ')' || ch === ']') d -= 1;
    if (ch === ',' && d === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  parts.push(current);
  const lanes: (string | number | undefined)[] = [];
  for (const part of parts) {
    const colon = part.indexOf(':');
    if (colon === -1) continue;
    lanes.push(parseLaneLiteral(part.slice(colon + 1)));
  }
  const cases: DesugarCase[] = [];
  for (let i = 0; i < keys.length && i < lanes.length; i += 1) {
    const lane = lanes[i];
    if (lane !== undefined) cases.push({ key: keys[i]!, lane });
  }
  return cases;
}

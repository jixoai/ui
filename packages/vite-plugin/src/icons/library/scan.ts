/**
 * @jixoai/vite-plugin (icons library) — the source scanner (A1/A2,
 * openspec icon-prefix-compiler design §1, 2026-09-07).
 *
 * ONE pure module, TWO collection entries feeding one generator stream:
 *
 *   (a) scanProjectSources — the EAGER project walk. Generation runs at
 *       buildStart BEFORE any transform (the build promise is memoized;
 *       a transform-only collector cannot serve production builds), so
 *       build mode walks the project sources directly — and the ROOT
 *       script twin (gen:icons / verify:icons --check) runs the SAME
 *       walk so its artifact stays byte-equal to the vite artifact for
 *       the same scanned set (no scanner-less twin, no divergence).
 *   (b) collectScannedRefs — the literal matcher the DEV-INCREMENTAL
 *       vite transform drives (enforce:'pre'; a scanned-set change
 *       rides the plugin's scheduleRefresh like a config edit).
 *
 * The matcher is deliberately FAIL-SAFE (codex r1 M5/M6): a literal
 * whose prefix is not an ENABLED preset is IGNORED, never an error — a
 * doc example or comment mentioning `fa:home` can never break a build;
 * the worst case is no collection. The unknown-prefix NAMED error is a
 * CONFIG-face law (library.icons entries, presets/index.ts) and stays
 * there. The suffix grammar is permissive the same way (codex r1 B4):
 * the scanner captures the prefix + the COMPLETE literal suffix —
 * remix refs carry a second colon and hyphens (`rx:system:add-line`) —
 * and DELEGATES suffix validation to the preset resolver, which fails
 * by name on bad refs. The /^[a-z][a-z0-9_]*$/ grammar governs only
 * non-prefixed keys and ALIASES. NO expression evaluation: dynamic
 * names are intentionally unserved (the runtime lane owns them).
 *
 * Determinism is law: refs sort (preset, name, alias) and identical
 * triples dedupe — scan ORDER never affects artifact bytes.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, resolve as resolvePath } from 'node:path';

// ── the scanned-ref vocabulary ─────────────────────────────────────

/**
 * one scanned reference: the canonical prefixed name plus the optional
 * `as` alias declared in the same literal. `preset` is the ENABLED
 * preset's prefix (any of them — md/ph/rx; string-typed for forward
 * compat), `name` the COMPLETE literal suffix (`copy_all`,
 * `system:add-line`), `alias` the `as` token VERBATIM — its grammar
 * (/^[a-z][A-Za-z0-9]*$/) is validated downstream where the collision
 * matrix lives (resolve.ts).
 */
export interface ScannedRef {
  readonly preset: string;
  readonly name: string;
  readonly alias?: string;
}

/** the canonical artifact key of a scanned ref (the full prefixed name) */
export const scannedRefKey = (ref: ScannedRef): string => `${ref.preset}:${ref.name}`;

/** sort (preset, name, alias) — the byte-determinism law */
export function compareScannedRefs(a: ScannedRef, b: ScannedRef): number {
  const key = (ref: ScannedRef): string => `${ref.preset}\u0000${ref.name}\u0000${ref.alias ?? ''}`;
  const left = key(a);
  const right = key(b);
  return left < right ? -1 : left > right ? 1 : 0;
}

/** dedupe identical triples + sort — the merge law for multi-module output */
export function mergeScannedRefs(refs: readonly ScannedRef[]): ScannedRef[] {
  const byTriple = new Map<string, ScannedRef>();
  for (const ref of refs) {
    byTriple.set(`${ref.preset}\u0000${ref.name}\u0000${ref.alias ?? ''}`, ref);
  }
  return Array.from(byTriple.values()).sort(compareScannedRefs);
}

// ── the literal matcher (design §1: attribute + string-literal forms) ──

/**
 * `name=` as an OPENING-TAG ATTRIBUTE — the amended law's collection
 * policy (codex r1 M6, tightened codex r2 B1): the matcher requires
 * `<(tag) …name=…` so a bare `name = "…"` in code (`const name = …`,
 * `obj.name = …`, an `{#if name === …}` comparison) never collects,
 * and the whitespace before `name` keeps `data-name=` (a DIFFERENT
 * attribute) out. `[^<>]?` never crosses a tag boundary, so attribute
 * forms are: `name="…"` / `name='…'` and the string-literal EXPRESSION
 * forms `name={'…'}` / `name={"…"}` / `` name={`…`} `` (a hole-free
 * template literal IS a string literal; a holed one can never match
 * the value grammar below — `${` is excluded from every capture
 * class). NO expression evaluation: `name={expr}` / `name={'a' + x}`
 * don't fit the shape and are skipped — dynamic names are
 * intentionally unserved. Known limitations, documented: an attribute
 * value containing a raw `>` ends the tag scan early (no collection,
 * fail-safe), and an occurrence inside a comment still collects when
 * tag-shaped (fail-safe — worst case one extra packed icon).
 */
const NAME_LITERAL =
  /<[A-Za-z][\w.-]*[^<>]*?\sname\s*=\s*(?:"([^"\n]*)"|'([^'\n]*)'|\{\s*(?:"([^"\n]*)"|'([^'\n]*)'|`([^`\n]*)`)\s*\})/g;

/**
 * the value grammar: `prefix:suffix` with an optional `as alias`
 * clause. The prefix is a lowercase word (then checked against the
 * ENABLED set — the fail-safe filter); the suffix is the COMPLETE
 * permissive capture (colons/hyphens/underscores/dots legal — remix
 * taxonomy included), never the validating authority; the alias is a
 * single token whose camelCase grammar resolve.ts enforces. Whitespace,
 * quotes, braces, backticks and `${` are excluded everywhere so
 * multi-word junk and dynamic interpolations fail the match entirely
 * (fail-safe: no collection, no build break).
 */
const SCANNED_LITERAL = /^([a-z][a-z0-9]*):([^"'`{}$\s]+?)(?:[ \t]+as[ \t]+([^"'`{}$\s]+))?$/;

/**
 * Collect the scanned refs in ONE module's text. PURE: text in, sorted
 * deduped refs out (identical triples within the file collapse). Only
 * literals under an ENABLED prefix are returned — everything else is
 * ignored (codex r1 M5/M6: never a build break).
 */
export function collectScannedRefs(
  code: string,
  prefixes: readonly string[],
): ScannedRef[] {
  if (prefixes.length === 0) return [];
  const enabled = new Set(prefixes);
  const found = new Map<string, ScannedRef>();
  for (const match of code.matchAll(NAME_LITERAL)) {
    const raw = match[1] ?? match[2] ?? match[3] ?? match[4] ?? match[5];
    if (raw === undefined) continue;
    const parsed = SCANNED_LITERAL.exec(raw.trim());
    if (parsed === null) continue;
    const preset = parsed[1]!;
    if (!enabled.has(preset)) continue; // unknown prefix — IGNORED, never an error
    const ref: ScannedRef = {
      preset,
      name: parsed[2]!,
      ...(parsed[3] !== undefined ? { alias: parsed[3] } : {}),
    };
    found.set(`${ref.preset}\u0000${ref.name}\u0000${ref.alias ?? ''}`, ref);
  }
  return Array.from(found.values()).sort(compareScannedRefs);
}

// ── the scope laws (shared by the walk and the transform) ──────────

/** the source file extensions the scanner reads */
const SCANNABLE_EXTENSION = /\.(svelte|ts|js|html)$/;

/** directory names pruned during the eager walk (dot-dirs subsume .svelte-kit/.git) */
const PRUNED_DIRECTORIES = new Set(['node_modules', 'dist', '.svelte-kit']);

/** a scope-excluded path segment (matched on BOTH walk paths and ids) */
const EXCLUDED_SEGMENT = /(?:^|[\\/])(?:node_modules|dist|\.svelte-kit)(?:[\\/]|$)/;

/**
 * may the DEV transform collect from this vite module id? The walk's
 * scope laws applied to ids: the scannable extensions, the excluded
 * segments, VIRTUAL modules (`\0`-prefixed or `virtual:`), vite's
 * `?t=` cache-busts, and the generated artifact itself.
 */
export function isScannableModuleId(id: string, artifactPath: string | null): boolean {
  if (id.startsWith('\0') || id.startsWith('virtual:')) return false; // virtual modules
  const bare = id.split('?')[0]!;
  if (!SCANNABLE_EXTENSION.test(bare)) return false;
  if (EXCLUDED_SEGMENT.test(bare)) return false;
  if (artifactPath !== null && bare === artifactPath) return false; // the artifact itself
  return true;
}

// ── (a) the eager project walk ─────────────────────────────────────

/** scanProjectSources knobs */
export interface ScanProjectOptions {
  /** absolute file paths the walk never reads (the artifact itself) */
  readonly exclude?: readonly string[];
}

/**
 * The EAGER project walk (design §1a): the same matcher run directly
 * over the project's source files — .svelte/.ts/.js/.html, pruning
 * node_modules / dist / .svelte-kit (and dot-directories generally),
 * skipping the excluded files (the generated artifact). Build mode
 * runs this at buildStart; the root script twin runs it inside
 * buildArtifacts so gen:icons stays byte-equal to dev.
 *
 * Returns the sorted deduped union — deterministic regardless of fs
 * order. With no enabled prefixes the walk is skipped entirely (no
 * ref could ever match — and this repo's gen:icons stays walk-free).
 */
export async function scanProjectSources(
  root: string,
  prefixes: readonly string[],
  options?: ScanProjectOptions,
): Promise<ScannedRef[]> {
  if (prefixes.length === 0) return [];
  const exclude = new Set((options?.exclude ?? []).map((path) => resolvePath(path)));
  const collected: ScannedRef[] = [];

  const walk = async (directory: string): Promise<void> => {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith('.') || PRUNED_DIRECTORIES.has(entry.name)) continue;
        await walk(path);
      } else if (entry.isFile()) {
        if (!SCANNABLE_EXTENSION.test(entry.name)) continue;
        if (exclude.has(resolvePath(path))) continue;
        collected.push(...collectScannedRefs(await readFile(path, 'utf8'), prefixes));
      }
    }
  };

  await walk(resolvePath(root));
  return mergeScannedRefs(collected);
}

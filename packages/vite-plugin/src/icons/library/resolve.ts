/**
 * @jixoai/vite-plugin (icons library) — ADAPTER-side source resolution
 * (A1/A4, openspec icon-component-pipeline design §2/§5).
 *
 * resolveLibraryInputs() is the ONLY stage of the library pipeline with
 * I/O: lucide refs (a dynamic `import('lucide')` with a loud-fail
 * install hint), `{file}` sources (through a plugin-owned
 * ProviderContext — the frozen principle #4 machinery, re-used
 * INDEPENDENTLY of whether the optional provider face is configured;
 * svg files join watchFile so HMR rides the existing refresh path) and
 * inline literals. Per icon the pipeline is:
 *
 *     resolve → safety check (RAW, untrusted) → svgo optimize →
 *     structural validation → ResolvedLibraryIcon
 *
 * Safety runs BEFORE any transformation — optimization never launders
 * unvalidated content. A warn-mode rejection DROPS the icon with a
 * named warning (collected in the resolution); error-mode fails the
 * build. The output feeds the PURE generator (generate.ts) a resolved
 * asset list — never IconSource.
 */

import type { IconNode } from 'lucide';
import type { ProviderContext, SafetyChecker } from '../types.js';
import { serializeLucideIcon } from '../providers/lucide.js';
import { DEFAULT_LIBRARY_MANIFEST } from './manifest.js';
import { optimizeSvg } from './optimize.js';
import type {
  IconLibraryOptions,
  IconSource,
  ResolvedLibraryIcon,
} from './types.js';
import { normalizeLibraryOptions, type NormalizedLibraryOptions } from './config.js';

/** what resolveLibraryInputs hands back: survivors + named warnings */
export interface LibraryResolution {
  readonly icons: readonly ResolvedLibraryIcon[];
  readonly warnings: readonly string[];
}

/** one manifest entry after config merge: where the artwork comes from */
interface PendingIcon {
  readonly name: string;
  readonly source: IconSource;
}

/** load the lucide package once per generation — loud-fail install hint */
async function loadLucide(): Promise<typeof import('lucide')> {
  try {
    return await import('lucide');
  } catch (cause) {
    throw new Error(
      '[jixoai-icons] the library face needs the `lucide` package (built-ins or ' +
        'lucide: sources) but it is not installed. lucide is an optional peer ' +
        'dependency of @jixoai/vite-plugin — install it (npm i lucide), switch the ' +
        'icon to an inline/file source, or set includeDefaults:false',
      { cause },
    );
  }
}

/** runtime guard: a lucide module export that is IconNode artwork */
function isIconNode(value: unknown): value is IconNode {
  return (
    Array.isArray(value) &&
    typeof value[0] === 'string' &&
    typeof value[1] === 'object' &&
    value[1] !== null &&
    (value[2] === undefined || Array.isArray(value[2]))
  );
}

/** `lucide:circle-alert` (kebab) → the `CircleAlert` (PascalCase) export */
function lucideExportOf(slug: string): string {
  return slug
    .split('-')
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * merge the built-in manifest with the config's icons into packing
 * order: built-ins in GROUPS order first, custom icons after in config
 * insertion order; a same-name custom entry OVERRIDES the built-in in
 * place (no duplicates — Map key insertion order provides both rules).
 */
function mergeSources(normalized: NormalizedLibraryOptions): PendingIcon[] {
  const byName = new Map<string, PendingIcon>();
  if (normalized.includeDefaults) {
    for (const [name, lucideExport] of DEFAULT_LIBRARY_MANIFEST) {
      byName.set(name, { name, source: `lucide:${lucideExport}` });
    }
  }
  for (const [name, source] of Object.entries(normalized.icons)) {
    byName.set(name, { name, source });
  }
  return Array.from(byName.values());
}

// ── structural validation (post-optimize, pre-output) ─────────────

/** the root <svg …> opening tag */
const ROOT_TAG = /<svg\b[^>]*>/i;

/** a viewBox attribute inside the root tag */
const VIEWBOX_ATTRIBUTE = /\sviewBox\s*=\s*(?:"([^"]*)"|'([^']*)')/i;

/**
 * Resolve every configured library icon. All file reads and the lucide
 * import flow through `io`/lazy module state — the pure generator
 * downstream receives only resolved, safety-checked, optimized svg
 * strings.
 *
 * @param options the library face config (validated here)
 * @param io      the plugin-owned I/O context ({file} sources read +
 *                watch through it; the root-script adapter passes its
 *                own fs-backed twin)
 * @param checker the SHARED safety checker (the `safety` option serves
 *                both faces) — runs on the RAW source pre-optimization
 */
export async function resolveLibraryInputs(
  options: IconLibraryOptions,
  io: ProviderContext,
  checker: SafetyChecker,
): Promise<LibraryResolution> {
  const normalized = normalizeLibraryOptions(options);
  const warnings: string[] = [];
  const resolved: ResolvedLibraryIcon[] = [];
  const pending = mergeSources(normalized);

  // lucide loads lazily — includeDefaults:false with no lucide: sources
  // never touches the import at all
  let lucide: typeof import('lucide') | null = null;
  const needsLucide = pending.some(
    (icon) => typeof icon.source === 'string' && icon.source.startsWith('lucide:'),
  );
  if (needsLucide) lucide = await loadLucide();

  for (const { name, source } of pending) {
    const labelOf = (kind: string): string => `library icon "${name}" (${kind})`;

    // -- resolve to the RAW svg ------------------------------------
    let raw: string;
    let label: string;
    if (typeof source === 'string') {
      if (source.startsWith('lucide:')) {
        const exportName = lucideExportOf(source.slice('lucide:'.length));
        const exports: Readonly<Record<string, unknown>> = lucide ?? {};
        const icon: unknown = exports[exportName];
        if (!isIconNode(icon)) {
          throw new Error(
            `[jixoai-icons] ${labelOf(source)} — lucide exports no icon ` +
              `"${exportName}". Check the kebab slug against lucide's icon list ` +
              '(e.g. lucide:circle-alert)',
          );
        }
        raw = serializeLucideIcon(icon);
        label = labelOf(source);
      } else {
        raw = source;
        label = labelOf('inline');
      }
    } else {
      const descriptor = await io.loadSource(source.file);
      if (descriptor.mimeType !== 'image/svg+xml') {
        throw new Error(
          `[jixoai-icons] ${labelOf(`file ${source.file}`)} — the source is ` +
            `${descriptor.mimeType}, not image/svg+xml (library {file} sources ` +
            'must be .svg artwork)',
        );
      }
      // watched for HMR: a change re-runs this resolution through the
      // plugin's existing refresh path (the callback itself is a no-op —
      // registration is what joins the file to the refresh chain)
      io.watchFile(source.file, () => undefined);
      raw = Buffer.from(descriptor.data).toString('utf8');
      label = labelOf(`file ${source.file}`);
    }

    // -- safety on the RAW source (before any transformation) -------
    const verdict = checker.check(raw, label);
    if (!verdict.passed) {
      const detail = verdict.issues.map((issue) => `  - ${issue.message}`).join('\n');
      const hasErrors = verdict.issues.some((issue) => issue.severity === 'error');
      if (hasErrors) {
        throw new Error(`[jixoai-icons] SVG safety check failed (${label}):\n${detail}`);
      }
      warnings.push(
        `[jixoai-icons] SVG safety check rejected ${label} — the icon is DROPPED ` +
          `from the library:\n${detail}`,
      );
      continue;
    }

    // -- svgo optimize (after safety; never on the slot face) -------
    let svg = raw;
    if (normalized.optimize !== false) {
      svg = await optimizeSvg(
        raw,
        normalized.optimize === true ? undefined : normalized.optimize,
      );
    }

    // -- structural validation (the extractor's contract) -----------
    const root = ROOT_TAG.exec(svg);
    if (root === null || !VIEWBOX_ATTRIBUTE.test(root[0])) {
      const message =
        `[jixoai-icons] ${label} — the svg has no root <svg … viewBox="…"> ` +
        'element; the structured extract needs the viewBox (the component ' +
        're-owns the root)';
      if (checker.mode === 'error') {
        throw new Error(message);
      }
      warnings.push(message);
      continue;
    }

    resolved.push({ name, svg });
  }

  return { icons: resolved, warnings };
}

/**
 * @jixoai/ui-vite-plugin (spinners) — ADAPTER-side source resolution +
 * config validation (P1, openspec spin-ora-svg-lane design §5).
 *
 * resolveSpinnerInputs() is the ONLY stage of the spinners pipeline
 * with I/O: `{file}` sources read through the plugin-owned
 * ProviderContext (the icons' frozen I/O discipline, re-used without
 * the provider face), inline literals pass straight through. Per
 * spinner the pipeline is:
 *
 *     resolve → RAW safety check → structural validation →
 *     ResolvedSpinner
 *
 * NO svgo stage exists (design §5/§8, the byte-faithful law) and NO
 * mime gate either: both adapters read `{file}` sources as utf8 svg
 * text, so the structural validation + the RAW checker own the content
 * gate — the vite adapter and the root-script adapter produce
 * byte-identical output for the same config (the CONFIG-PARITY law's
 * precondition). Safety runs on the RAW source; a warn-mode rejection
 * DROPS the spinner with a named warning, error mode fails the build.
 * The output feeds the PURE generator (generate.ts) a resolved asset
 * list — never SpinnerSource.
 */

import type { ProviderContext, SafetyChecker } from '../icons/types.js';
import { DEFAULT_SPINNERS_MANIFEST } from './manifest.js';
import type { ResolvedSpinner, SpinnerSource, SpinnersPluginOptions } from './types.js';

/**
 * spinner names are kebab and tame (the icon channel-id grammar, NOT
 * the icons' lowerCamel): they become TS union members, object keys
 * and (for {file} sources) read paths. The unified name lane stays
 * legible against the text catalog's camelCase (design §4)
 */
export const SPINNER_NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

/** default artifact target, project-root-relative (consumer-app shape;
 *  in-repo the root gen:spins script writes its own canonical target) */
export const DEFAULT_SPIN_OUTPUT = 'src/lib/spin-set.gen.ts';

/** the normalized form every spinners code path reads */
export interface NormalizedSpinnersOptions {
  readonly includeDefaults: boolean;
  readonly spinners: Readonly<Record<string, SpinnerSource>>;
  readonly output: string;
  readonly write: boolean;
}

/**
 * Validate + normalize spinners options. Throws named, teaching
 * errors for illegal shapes (bad names, absolute/escaping output
 * paths) — misconfiguration must fail at startup, not mid-build.
 * Spinners have ONE face, so a bare `{}` normalizes cleanly to
 * "blocks-wave only" (no ≥1-of-2 matrix — design §5).
 */
export function normalizeSpinnersOptions(
  options: SpinnersPluginOptions,
): NormalizedSpinnersOptions {
  if (options.spinners !== undefined) {
    for (const name of Object.keys(options.spinners)) {
      if (!SPINNER_NAME_PATTERN.test(name)) {
        throw new Error(
          `[jixoai-spinners] spinner name "${name}" is illegal — names must match ` +
            '/^[a-z][a-z0-9-]*$/ (kebab-case, the icon channel-id grammar; they become ' +
            'TS union members), e.g. blocks-wave or my-loader',
        );
      }
    }
  }
  const output = options.output ?? DEFAULT_SPIN_OUTPUT;
  if (output.length === 0 || output.startsWith('/') || output.includes('..')) {
    throw new Error(
      `[jixoai-spinners] spinners output "${output}" must be a project-root-relative ` +
        `file path (default ${DEFAULT_SPIN_OUTPUT}) — the write target is joined ` +
        'to the vite root',
    );
  }
  return {
    includeDefaults: options.includeDefaults ?? true,
    spinners: options.spinners ?? {},
    output,
    write: options.write ?? false,
  };
}

/** what resolveSpinnerInputs hands back: survivors + named warnings */
export interface SpinnerResolution {
  readonly spinners: readonly ResolvedSpinner[];
  readonly warnings: readonly string[];
}

/** one manifest entry after config merge: where the artwork comes from */
interface PendingSpinner {
  readonly name: string;
  readonly source: SpinnerSource;
}

/**
 * merge the built-in manifest with the config's spinners into packing
 * order: the vendored blocks-wave first, custom spinners after in
 * config insertion order; a same-name custom entry OVERRIDES the
 * built-in in place (no duplicates — Map key insertion order provides
 * both rules; the icons override law, design §5).
 */
function mergeSources(normalized: NormalizedSpinnersOptions): PendingSpinner[] {
  const byName = new Map<string, PendingSpinner>();
  if (normalized.includeDefaults) {
    for (const entry of DEFAULT_SPINNERS_MANIFEST) {
      byName.set(entry.name, { name: entry.name, source: entry.svg });
    }
  }
  for (const [name, source] of Object.entries(normalized.spinners)) {
    byName.set(name, { name, source });
  }
  return Array.from(byName.values());
}

// ── structural validation (pre-output) ─────────────────────────────

/** the root <svg …> opening tag */
const ROOT_TAG = /<svg\b[^>]*>/i;

/** a viewBox attribute inside the root tag */
const VIEWBOX_ATTRIBUTE = /\sviewBox\s*=\s*(?:"([^"]*)"|'([^']*)')/i;

/**
 * Resolve every configured spinner. All file reads flow through `io` —
 * the pure generator downstream receives only resolved, safety-checked,
 * RAW svg strings (byte-faithful; svgo never runs on this lane).
 *
 * @param options the spinners face config (validated here)
 * @param io      the adapter-owned I/O context ({file} sources read
 *                through it; the root-script adapter passes its own
 *                fs-backed twin — the icons' script.ts precedent)
 * @param checker the SHARED RAW safety checker (the icons checker
 *                re-exported through safety.ts — SMIL allowed, R2)
 */
export async function resolveSpinnerInputs(
  options: SpinnersPluginOptions,
  io: ProviderContext,
  checker: SafetyChecker,
): Promise<SpinnerResolution> {
  const normalized = normalizeSpinnersOptions(options);
  const warnings: string[] = [];
  const resolved: ResolvedSpinner[] = [];
  const pending = mergeSources(normalized);

  for (const spinner of pending) {
    const { name, source } = spinner;

    // -- resolve to the RAW svg ------------------------------------
    let raw: string;
    let label: string;
    if (typeof source === 'string') {
      raw = source;
      label = `spinner "${name}" (inline)`;
    } else {
      const descriptor = await io.loadSource(source.file);
      // no mime gate BY DESIGN (the header law): utf8 svg text is the
      // contract; structural + safety checks below own the content
      io.watchFile(source.file, () => undefined);
      raw = Buffer.from(descriptor.data).toString('utf8');
      label = `spinner "${name}" (file ${source.file})`;
    }

    // -- safety on the RAW source (byte-faithful: no transform follows)
    const verdict = checker.check(raw, label);
    if (!verdict.passed) {
      const detail = verdict.issues.map((issue) => `  - ${issue.message}`).join('\n');
      const hasErrors = verdict.issues.some((issue) => issue.severity === 'error');
      if (hasErrors) {
        throw new Error(`[jixoai-spinners] SVG safety check failed (${label}):\n${detail}`);
      }
      warnings.push(
        `[jixoai-spinners] SVG safety check rejected ${label} — the spinner is ` +
          `DROPPED from the set:\n${detail}`,
      );
      continue;
    }

    // -- structural validation (the extractor's contract) -----------
    const root = ROOT_TAG.exec(raw);
    if (root === null || !VIEWBOX_ATTRIBUTE.test(root[0])) {
      const message =
        `[jixoai-spinners] ${label} — the svg has no root <svg … viewBox="…"> ` +
        'element; the structured extract needs the viewBox (the component ' +
        're-owns the root)';
      if (checker.mode === 'error') {
        throw new Error(message);
      }
      warnings.push(message);
      continue;
    }

    resolved.push({ name, svg: raw });
  }

  return { spinners: resolved, warnings };
}

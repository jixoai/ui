/**
 * @jixoai/ui-vite-plugin (spinners) — vite integration (P2,
 * openspec spin-ora-svg-lane design §5; §8 rejected the virtual
 * surface).
 *
 * createSpinnersPlugin() returns a Vite plugin that is a BUILD-START
 * generator + drift-warner, nothing more:
 *   - configResolved captures the project root (the `output` target
 *     joins to it), the command (drift-warns are DEV-only) and the
 *     logger
 *   - buildStart validates the config (startup errors), resolves every
 *     source through the adapter pipeline (RAW safety, no svgo — the
 *     byte-faithful law) and runs the pure generator
 *   - the artifact side of the single-writer law: write:false (the
 *     default) NEVER touches disk and only WARNS in dev when the
 *     on-disk artifact drifted (freshness is CI's job via verify:spins);
 *     write:true is the consumer opt-in that writes on content change
 *
 * There is deliberately NO resolveId/load (no virtual module ids —
 * nothing imports a virtual id on this lane: the artifact has no lazy
 * tier and no CSS face, the component imports the REAL generated
 * file), NO transform (no scanner — spinner names are declared in
 * config, never scanned) and NO configureServer (no virtual modules to
 * invalidate; the artifact file's own HMR is vite's native watch of an
 * imported module). Design §8 recorded the rejections.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve as resolvePath } from 'node:path';
import type { Plugin } from 'vite';
import type { ProviderContext, SafetyCheckerConfig } from '../icons/types.js';
import { createSafetyChecker } from '../icons/safety.js';
import { generateSpinSet, type GeneratedSpinSet } from './generate.js';
import { normalizeSpinnersOptions, resolveSpinnerInputs, type NormalizedSpinnersOptions } from './resolve.js';
import type { SpinnersPluginOptions } from './types.js';

/** createSpinnersPlugin() plugin options */
export interface SpinnersPluginEntryOptions extends SpinnersPluginOptions {
  /**
   * safety checker configuration — defaults to `{ mode: 'warn' }`
   * (rejected spinners drop with a named warning). pass
   * `{ mode: 'error', … }` to fail the build instead.
   */
  readonly safety?: SafetyCheckerConfig;
}

/** the resolved-config slice configResolved captures */
interface ResolvedViteConfig {
  readonly root: string;
  readonly command?: string;
  readonly logger?: { warn(message: string): void };
}

/**
 * create the spinners plugin standalone (canonical entry: the
 * `spinners` option of the `jixoai()` umbrella in
 * @jixoai/ui-vite-plugin — default false/undefined = the feature is
 * OFF; a bare `{}` = built-in blocks-wave only).
 *
 * ```ts
 * // vite.config.ts — umbrella (preferred)
 * import { jixoai } from '@jixoai/ui-vite-plugin';
 * export default { plugins: [sveltekit(), tailwindcss(), ...jixoai({ spinners: {} })] };
 *
 * // standalone (spinners feature only)
 * import { createSpinnersPlugin } from '@jixoai/ui-vite-plugin/spinners';
 * export default { plugins: [createSpinnersPlugin({ spinners: { loader: { file: './loaders/ring.svg' } } })] };
 * ```
 */
export function createSpinnersPlugin(
  options: SpinnersPluginEntryOptions = {},
): Plugin {
  // misconfiguration fails HERE (startup), not mid-build — the same
  // normalization the root-script adapter runs
  const normalized: NormalizedSpinnersOptions = normalizeSpinnersOptions(options);

  // the checker is per-plugin-instance (never a module-level singleton
  // — the icons' follow-up C5 law)
  const checker = createSafetyChecker(options.safety ?? { mode: 'warn' });

  let projectRoot = process.cwd();
  let viteCommand: string | undefined;
  let logger: ResolvedViteConfig['logger'];

  /** the configured artifact's absolute path */
  const artifactPath = (): string => resolvePath(projectRoot, normalized.output);

  const logWarn = (message: string): void => {
    if (logger !== undefined) logger.warn(`[jixoai-spinners] ${message}\n`);
    else console.warn(`[jixoai-spinners] ${message}`);
  };

  // -- ProviderContext: the ONLY path to file I/O (frozen principle #4)

  const context = (): ProviderContext => ({
    async loadSource(path: string) {
      const resolved = resolvePath(path);
      const data = new Uint8Array(await readFile(resolved));
      return { data, path: resolved, mimeType: 'image/svg+xml' };
    },
    watchFile(): void {
      /* no virtual surface to invalidate — vite's native watch of the
         imported artifact file owns HMR; source-file edits re-run on
         the next buildStart (or via the gen:spins writer) */
    },
  });

  // -- generation ----------------------------------------------------

  /** the current generation (null until built) */
  let generated: GeneratedSpinSet | null = null;

  const start = async (): Promise<void> => {
    const resolution = await resolveSpinnerInputs(normalized, context(), checker);
    for (const warning of resolution.warnings) logWarn(warning);
    generated = generateSpinSet(resolution.spinners);
    await syncArtifact();
  };

  /**
   * the artifact side of the single-writer law (the icons adapter's
   * syncArtifact, command-gated since there is no configureServer to
   * hold a server reference): with write:false (the default) the
   * adapter never writes and, in dev, WARNS when the on-disk artifact
   * drifted. A consumer opting in with write:true gets a real write —
   * only on content change, so watch tooling stays calm.
   */
  const syncArtifact = async (): Promise<void> => {
    if (generated === null) return;
    const target = artifactPath();
    let existing: string | null = null;
    try {
      existing = await readFile(target, 'utf8');
    } catch {
      /* absent on disk — write:false stays silent, write:true creates */
    }
    if (normalized.write) {
      if (existing !== generated.artifact) {
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, generated.artifact, 'utf8');
        logWarn(
          `spin-set artifact ${normalized.output} ${existing === null ? 'created' : 'rewritten'} (write:true is a consumer opt-in — in-repo apps run write:false)`,
        );
      }
      return;
    }
    if (viteCommand === 'serve' && existing !== null && existing !== generated.artifact) {
      logWarn(
        `the on-disk artifact ${normalized.output} drifted from the generator output — regenerate it through the owning writer (this adapter runs write:false by default; freshness is verify:spins' job)`,
      );
    }
  };

  let buildPromise: Promise<void> | null = null;
  const ensureBuilt = (): Promise<void> => {
    buildPromise ??= start();
    return buildPromise;
  };

  return {
    name: 'jixoai-spinners',
    enforce: 'pre',

    /** capture the project root, the command and the logger */
    configResolved(config: ResolvedViteConfig): void {
      if (typeof config.root === 'string' && config.root.length > 0) {
        projectRoot = config.root;
      }
      if (typeof config.command === 'string') {
        viteCommand = config.command;
      }
      if (config.logger !== undefined) {
        logger = config.logger;
      }
    },

    /** validate + resolve + generate; failures fail the build by design */
    async buildStart(): Promise<void> {
      await ensureBuilt();
    },
  };
}

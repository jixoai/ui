/**
 * @jixoai/ui-vite-plugin (icons library) — the svgo pass (A2, openspec
 * icon-component-pipeline design §2/§9).
 *
 * svgo v4 is the package's ONE sanctioned regular dependency, loaded
 * ONLY through a dynamic named import inside the icons sub-entry
 * (`import { optimize } from 'svgo'`) so the umbrella entry's module
 * graph stays svgo-free (the dist graph-purity gate). It runs on the
 * library face only, AFTER the raw safety check — optimization never
 * launders unvalidated content — and never on the slot/CSS face (the
 * ink-equivalence byte locks pin those URIs exactly).
 *
 * The tuned preset is LAW, pinned by a unit test as a no-op on lucide's
 * canonical serialization (the geometry-consistency law survives
 * optimization). In svgo v4 the default preset no longer ships
 * removeViewBox (viewBox survives by default — the design's
 * `removeViewBox: false` tuning intent holds vacuously); the plugins
 * disabled below are exactly the ones that rewrite canonical lucide
 * bytes: shape conversion, path-data rewriting, path merging and
 * attribute reordering. Dimension stripping rides the standalone
 * removeDimensions plugin — root width/height are dropped by law, the
 * viewBox preserved.
 */

import type { Config } from 'svgo';
import type { OptimizeConfig } from './types.js';

/** the tuned preset: compaction without canonical-byte rewrites */
const tunedSvgoConfig = (floatPrecision: number): Config => ({
  plugins: [
    {
      name: 'preset-default',
      params: {
        floatPrecision,
        overrides: {
          // rect/line/circle → path (rewrites lucide's mixed-geometry children)
          convertShapeToPath: false,
          convertEllipseToCircle: false,
          // path-data shortening (drops redundant closepaths, rewrites d)
          convertPathData: false,
          // consecutive same-attribute <path> merging
          mergePaths: false,
          // alphabetical attribute reordering
          sortAttrs: false,
        },
      },
    },
    // root width/height are dropped by law (the component owns sizing);
    // removeViewBox is NOT in v4's preset-default — the viewBox survives
    'removeDimensions',
  ],
});

/**
 * Run the tuned svgo pass over one RAW-but-safety-checked icon svg.
 * Returns the input byte-identical when it is already canonical (the
 * lucide no-op pin); compacts dirty artwork otherwise (comments,
 * doctype, editor metadata, whitespace, unit-suffixed dimensions,
 * over-precise numeric attributes).
 *
 * @throws a named error when svgo itself reports parse errors or is
 *         not installed (it is a REGULAR dependency — absence is a
 *         broken install, not an optional state)
 */
export async function optimizeSvg(
  svg: string,
  config?: OptimizeConfig,
): Promise<string> {
  const svgo = await import('svgo');
  try {
    return svgo.optimize(svg, tunedSvgoConfig(config?.floatPrecision ?? 3)).data;
  } catch (cause) {
    throw new Error(
      '[jixoai-icons] svgo failed to optimize an icon — the SVG did not parse ' +
        '(run with optimize:false to bypass and inspect the raw source)',
      { cause },
    );
  }
}

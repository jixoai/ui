/**
 * @jixoai/ui-vite-plugin (universal-props) — the universal-props.css
 * GENERATOR (explicit-props W2 tasks 2.1/2.2/2.7, design §12/§14;
 * the registry spec: "universal-props.css is GENERATED from the
 * schema").
 *
 * Pure function: schema rows in (the ONE shared artifact's
 * UNIVERSAL_AXES, transpiled and passed by the gen script — this
 * package never imports from apps/www), css text out. The gen
 * script (scripts/gen-universal-props-css.mjs) writes the
 * byte-identical mirror pair apps/www/src/lib/universal-props.css +
 * registry/files/lib/universal-props.css; its --check mode is the
 * drift gate. The emitted sheet is TOKENS ONLY (custom-property
 * definitions on :root/.dark inside @supports verdicts) — ZERO
 * class identities (§10's carrier law; the tailwindless ratchet
 * cannot move), ZERO element rules.
 *
 * Layering: unlayered, exactly like jixoai.css's own token section —
 * a consumer remap (§12: a plugin remap = redefining these vars in a
 * tiny consumer sheet) wins by cascade order without fighting any
 * @layer discipline.
 */

import {
  COLOR_ALIASES,
  COLOR_FORMULA_PROFILES,
  MOTION_ALIASES,
  RADIUS_ALIASES,
  RADIUS_FACTOR_LADDER,
  SHAPE_LADDER,
  SIZE_ALIASES,
  validateAliasTables,
} from './alias-tables.js';

/** the schema-artifact rows the generator consumes (the §17
 *  UniversalAxisDoc shape — passed in as DATA so this package keeps
 *  zero repo-tree imports; the gen script transpiles the artifact). */
export interface GeneratorAxisRow {
  readonly axis: string;
  readonly namedSteps: readonly string[];
}

export interface GenerateUniversalPropsCssInput {
  /** UNIVERSAL_AXES verbatim from universal-props.schema.ts */
  readonly axes: readonly GeneratorAxisRow[];
}

const SUPPORTED_SHAPES = Object.keys(SHAPE_LADDER) as (keyof typeof SHAPE_LADDER)[];

/** emit `  --<name>: value;` lines from a record, in key order */
function varLines(table: Record<string, string | number>, indent: string): string[] {
  return Object.entries(table).map(([name, value]) => `${indent}--${name}: ${value};`);
}

/** prefix an axis alias table's keys into full ladder var names
 *  (`--jx-<axis>-<alias>` — §12's indirection spelling) */
function withAxisPrefix(axis: string, table: Record<string, string | number>): Record<string, string | number> {
  return Object.fromEntries(Object.entries(table).map(([alias, value]) => [`jx-${axis}-${alias}`, value]));
}

/**
 * Generate the sheet. Deterministic: same input rows → byte-identical
 * output (no timestamps, no environment reads) — the golden test and
 * the --check drift gate depend on it.
 */
export function generateUniversalPropsCss(input: GenerateUniversalPropsCssInput): string {
  // task 2.1's generation-time gate: a reserved-literal remap in ANY
  // table kills the generation before a byte ships
  validateAliasTables();

  const steps = new Map(input.axes.map((row): [string, readonly string[]] => [row.axis, row.namedSteps]));
  const requireSteps = (axis: string, table: Record<string, unknown>): string[] => {
    const declared = steps.get(axis) ?? [];
    const names = Object.keys(table);
    const missing = declared.filter((name) => !names.includes(name));
    if (missing.length > 0) {
      throw new Error(
        `[universal-props] the schema's ${axis} namedSteps are not all covered by the plugin alias table (missing: ${missing.join(', ')}) — the §17 artifact and §12 tables must stay in lockstep`,
      );
    }
    return names;
  };
  requireSteps('size', SIZE_ALIASES);
  requireSteps('radius', RADIUS_ALIASES);
  requireSteps('color', COLOR_ALIASES);
  requireSteps('motion', MOTION_ALIASES);
  const shapeSteps = steps.get('shape') ?? [];
  const ladderNames = SUPPORTED_SHAPES as string[];
  const shapeMissing = shapeSteps.filter((name) => !ladderNames.includes(name));
  if (shapeMissing.length > 0) {
    throw new Error(
      `[universal-props] the schema's shape namedSteps exceed the §14 ladder (missing: ${shapeMissing.join(', ')})`,
    );
  }

  const out: string[] = [];
  out.push(
    '/* ----------------------------------------------------------------------',
    ' * jixoai universal props — the generated plugin layer',
    ' * (universal-props.css; explicit-props W2 tasks 2.1/2.2/2.7).',
    ' *',
    ' * GENERATED FILE — do not hand-edit: scripts/gen-universal-props-css.mjs',
    ' * regenerates this byte-identical mirror pair from the ONE shared',
    ' * artifact (apps/www/src/lib/universal-props.schema.ts ↔',
    ' * registry/files/lib/universal-props.schema.ts) + the plugin alias',
    ' * tables (packages/vite-plugin/src/universal-props/alias-tables.ts).',
    ' * `npm run verify:universal-props` is the drift gate.',
    ' *',
    ' * Content (design §12): the per-axis `--jx-<axis>-<alias>` definitions',
    ' * (the VAR-INDIRECTION law: a named step NEVER inlines its value at a',
    ' * use site — defaults.svelte.ts stamps var(--jx-<axis>-<alias>), a',
    ' * plugin remap = overriding the var, ZERO runtime resolver); the §5',
    ' * oklch hue-formula vars per theme profile (the number lane composes',
    ' * oklch(var(--jx-color-formula-l, …) var(--jx-color-formula-c, …)',
    ' * calc(<hue> + var(--jx-color-formula-drift, …))) — the fallbacks in',
    ' * that stamp are LOAD-BEARING per the §3 fallback law; the profile',
    ' * vars below re-point them per theme scope; and the §14 @supports',
    ' * corner-shape capability verdict stamps VARS, never classes: the',
    ' * shape alias ladder (§2 degrade table: scoop|bevel|notch → square,',
    ' * squircle → round) and the per-shape radius factors (the squircle ×2',
    ' * law and its degrade reversal ride',
    ' * --jx-radius-factor-squircle: 2 supported / 1 degraded).',
    ' *',
    ' * Density/elevation/theme are DELIBERATELY ABSENT: density resolves',
    ' * through the [data-density] rung scopes + the coefficient carrier',
    ' * (jixoai.css, W1 §4); elevation stamps exact dp numbers from the',
    ' * the schema\'s frozen table (§0.1); theme rides the .dark class bridge.',
    ' * ------------------------------------------------------------------- */',
    '',
  );

  // ── the §12 alias definitions ───────────────────────────────────
  out.push(
    ':root {',
    '  /* size (§1): root font-size px — the base ladder brackets the sheet',
    '     base; children size in em (one number moves a family) */',
    ...varLines(withAxisPrefix('size', SIZE_ALIASES), '  '),
    '',
    '  /* radius (§3): corner size px — 8px is the theme\'s bevel baseline */',
    ...varLines(withAxisPrefix('radius', RADIUS_ALIASES), '  '),
    '',
    '  /* color (§5): semantic > palette > raw is NAME resolution; the value',
    '     lane is always the theme token (warn is the lane spelling of the',
    '     theme\'s --warning) */',
    ...varLines(withAxisPrefix('color', COLOR_ALIASES), '  '),
    '',
    '  /* motion (§8): intensity coefficients — the number lane stamps the',
    '     coefficient verbatim; the per-kernel duration presets live in the',
    '     plugin motion map (alias-tables.ts MOTION_KERNEL_PRESETS) */',
    ...varLines(withAxisPrefix('motion', MOTION_ALIASES), '  '),
    '}',
    '',
  );

  // ── §5's hue formula, per theme profile ─────────────────────────
  const light = COLOR_FORMULA_PROFILES.light;
  const dark = COLOR_FORMULA_PROFILES.dark;
  out.push(
    '/* §5: the oklch hue formula per theme profile — L/C/drift verbatim',
    '   from the theme\'s own --primary declarations; a hue-degree number',
    '   lane composes the formula and follows the live profile */',
    ':root {',
    `  --jx-color-formula-l: ${light.l};`,
    `  --jx-color-formula-c: ${light.c};`,
    `  --jx-color-formula-drift: ${light.drift};`,
    '}',
    '.dark {',
    `  --jx-color-formula-l: ${dark.l};`,
    `  --jx-color-formula-c: ${dark.c};`,
    `  --jx-color-formula-drift: ${dark.drift};`,
    '}',
    '',
  );

  // ── the §14 @supports ladder (the capability verdict) ───────────
  const supportedAliases = SUPPORTED_SHAPES.map((shape) => [`jx-shape-${shape}`, SHAPE_LADDER[shape].supported] as const);
  const supportedFactors = SUPPORTED_SHAPES.map((shape) => [`jx-radius-factor-${shape}`, RADIUS_FACTOR_LADDER[shape].supported] as const);
  const degradedAliases = SUPPORTED_SHAPES.map((shape) => [`jx-shape-${shape}`, SHAPE_LADDER[shape].degraded] as const);
  const degradedFactors = SUPPORTED_SHAPES.map((shape) => [`jx-radius-factor-${shape}`, RADIUS_FACTOR_LADDER[shape].degraded] as const);

  out.push(
    '/* §14: the corner-shape capability verdict, stamped as VARS (never',
    '   classes — §10\'s zero-class-identity law). The consumption chain is',
    '   frozen: the shape lane stamps',
    '   --jx-radius-factor-effective: var(--jx-radius-factor-<resolved>)',
    '   and --jx-shape-effective: var(--jx-shape-<resolved>) as static',
    '   per-render strings; family css composes',
    '   corner-shape: var(--jx-shape-effective, round) and',
    '   border-radius: calc(var(--jx-radius-effective, 0px) *',
    '   var(--jx-radius-factor-effective, 1)). Capability verdict, alias',
    '   choice, the squircle ×2 law and its degrade reversal are pure var',
    '   composition — one auditable chain, zero branches. */',
    '@supports (corner-shape: bevel) {',
    '  :root {',
    ...varLines(Object.fromEntries(supportedAliases), '    '),
    ...varLines(Object.fromEntries(supportedFactors), '    '),
    '  }',
    '}',
    '@supports not (corner-shape: bevel) {',
    '  :root {',
    ...varLines(Object.fromEntries(degradedAliases), '    '),
    ...varLines(Object.fromEntries(degradedFactors), '    '),
    '  }',
    '}',
    '',
  );

  return out.join('\n');
}

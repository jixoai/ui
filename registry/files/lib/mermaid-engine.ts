/**
 * Mermaid engine integration for jixoai diagram surfaces
 * (registry/files/lib/mermaid-engine.ts).
 *
 * Intent list (2026-09-06, katex-mermaid, Owner: "引入开箱即用的
 * KaTeX/Mermaid 渲染组件" — 一致的 theme at minimum, 主题色
 * brand-hue/token binding, 亮暗模式, 控件):
 *  1. lazy singleton over `import('mermaid')` — the engine is ~1MB and
 *     DOM-bound, so it code-splits and loads only when a diagram actually
 *     renders (the shiki lazy-facade precedent; a failed load clears the
 *     memo so the next call retries).
 *  2. token-derived theming: `readThemeTokens()` resolves LIVE tokens
 *     through hidden color probes inside the passed root (getComputedStyle
 *     resolves the var() chains; @jixoai/color-utils converts to
 *     mermaid-safe hex), `deriveThemeVariables()` maps them onto
 *     mermaid's themeVariables through a ONE-SOURCE-PER-FIELD table, and
 *     theme 'base' + strict security + startOnLoad:false are PROTECTED
 *     fields no consumer config can override.
 *  3. engine discipline: initialize/render pairs run through ONE serial
 *     promise-chain mutex (rejection-recovering — a failed render never
 *     poisons the next), fingerprinted on the FINAL merged initialize
 *     payload so a token change inside the SAME theme mode still
 *     re-initializes, and render ids follow the collision contract
 *     (per-instance monotonic base + per-render suffix).
 *
 * This is a facade, not a wrapper: the consumer's `config` is mermaid's
 * own MermaidConfig and merges BELOW the protected fields and the derived
 * palette (user themeVariables overlay FIELD-WISE over the derived
 * defaults), so the full engine vocabulary — flowchart config, fonts,
 * gantt settings… — flows through unchanged. Errors normalize into
 * {@link MermaidRenderError} carrying a diagnostic; an SSR call to
 * renderDiagram rejects with an explicit browser-only diagnostic instead
 * of mermaid's raw ReferenceError (mermaid's render touches document.body).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * THE SAFE-HEX FALLBACK TABLE (the committed test oracle — a degraded
 * token NEVER reaches mermaid as a raw string; a var() fragment or an
 * exotic function fed to mermaid's derivation machinery breaks the
 * palette). Values are the jixoai sheet's OWN token values (theme/
 * jixoai.css, --brand-hue 330 default) run through the same Ottosson
 * conversion color-utils uses, srgb-gamut clamped:
 *
 *   token         light      dark
 *   background    #ffffff    #000000
 *   foreground    #000000    #ffffff
 *   primary       #d945d1    #d970dd     (hue 330 static / dark 326)
 *   secondary     #ffff00    #ffff33
 *   accent        #0066ff    #3399ff
 *   muted         #f0f0f0    #1a1a1a
 *   border        #000000    #ffffff
 *   error         #de3b3d    #f97770
 *   chart-1       #d945d1    #d970dd     (= primary)
 *   chart-2       #11a22f    #5bbe62     (= success)
 *   chart-3       #008cdf    #54b3fd     (= info)
 *   chart-4       #f9b800    #e9ac00     (= warning)
 *   chart-5       #de3b3d    #f97770     (= error)
 *
 * Each degraded token warns ONCE per theme root (not per render);
 * fonts degrade SILENTLY (font is optional — mermaid's default family
 * applies). See design.md §3.1.
 * ─────────────────────────────────────────────────────────────────────────
 */

import type { MermaidConfig } from 'mermaid';
import { formatColor, parseColor } from '$lib/color-utils';

/** 'auto' follows the live document theme; 'light'/'dark' pin the sheet. */
export type MermaidThemeMode = 'auto' | 'light' | 'dark';

/** The live jixoai token set read through the probe pipeline, hex-formatted. */
export interface ThemeTokens {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
  border: string;
  error: string;
  /** resolved --font-sans — ABSENT when unresolvable (mermaid default family). */
  font?: string;
  chart: [string, string, string, string, string];
}

/**
 * The derived tier of mermaid's `themeVariables` (mermaid itself types the
 * field `any`; this interface is the §3.2 one-source-per-field table's
 * shape — every field lists exactly ONE token source, so no assignment
 * order can matter). The user config's themeVariables overlay rides
 * FIELD-WISE above these defaults (see buildInitializePayload).
 */
export interface ThemeVariables {
  /** --background */
  background: string;
  mainBkg: string;
  /** --foreground */
  primaryTextColor: string;
  textColor: string;
  /** --primary */
  primaryColor: string;
  primaryBorderColor: string;
  /** --border */
  lineColor: string;
  nodeBorder: string;
  /** --muted */
  clusterBkg: string;
  clusterBorder: string;
  /** --secondary */
  secondaryColor: string;
  /** --accent */
  tertiaryColor: string;
  /** --chart-1..5 (charts OWN the cScale) */
  cScale0: string;
  cScale1: string;
  cScale2: string;
  cScale3: string;
  cScale4: string;
  /** --error */
  errorBkgColor: string;
  /** ThemeTokens.font — omitted when the fontFamily probe cannot resolve */
  fontFamily?: string;
}

/**
 * The committed per-theme safe-hex oracle (header table above). Exposed so
 * surfaces and specs assert against the SAME source instead of retyping
 * the hexes.
 */
export const SAFE_HEX: Readonly<Record<string, Readonly<{ light: string; dark: string }>>> = {
  background: { light: '#ffffff', dark: '#000000' },
  foreground: { light: '#000000', dark: '#ffffff' },
  primary: { light: '#d945d1', dark: '#d970dd' },
  secondary: { light: '#ffff00', dark: '#ffff33' },
  accent: { light: '#0066ff', dark: '#3399ff' },
  muted: { light: '#f0f0f0', dark: '#1a1a1a' },
  border: { light: '#000000', dark: '#ffffff' },
  error: { light: '#de3b3d', dark: '#f97770' },
  'chart-1': { light: '#d945d1', dark: '#d970dd' },
  'chart-2': { light: '#11a22f', dark: '#5bbe62' },
  'chart-3': { light: '#008cdf', dark: '#54b3fd' },
  'chart-4': { light: '#f9b800', dark: '#e9ac00' },
  'chart-5': { light: '#de3b3d', dark: '#f97770' },
};

/** The color tokens the probe pipeline reads, in ThemeTokens field order. */
const COLOR_TOKENS = [
  'background',
  'foreground',
  'primary',
  'secondary',
  'accent',
  'muted',
  'border',
  'error',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
] as const;

/** one console.warn per degraded token, per theme root (never per render). */
const warnedTokens = new WeakMap<HTMLElement, Set<string>>();

/** The typed render failure: `diagnostic` carries the engine's own words. */
export class MermaidRenderError extends Error {
  readonly diagnostic: string;

  constructor(diagnostic: string) {
    super(diagnostic);
    this.name = 'MermaidRenderError';
    this.diagnostic = diagnostic;
  }
}

// ── theme resolution ─────────────────────────────────────────────────────

/**
 * Mode → sheet. 'auto' reads the live document root (the `.dark` class is
 * the theme machine's single truth; a scoped `.jx-light` stage is handled
 * by the SURFACE's effective-scope observer + probe reads, not here).
 */
export function resolveTheme(mode: MermaidThemeMode): 'light' | 'dark' {
  if (mode === 'light' || mode === 'dark') return mode;
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    ? 'dark'
    : 'light';
}

/**
 * Read the live tokens for `root`'s subtree (default documentElement —
 * a scoped root reads ITS tokens, never the page's) through the probe +
 * parseColor pipeline:
 *
 *   probe (display:none, INSIDE the root) .style.color = `var(--token)`
 *     → getComputedStyle(probe).color   // browser-resolved, serialized
 *     → parseColor(resolved)            // @jixoai/color-utils (hex/hsl/
 *                                       // oklch/rgb families)
 *     → formatColor(oklch, 'hex')       // #rrggbb — mermaid-safe
 *     → null → the token's SAFE_HEX     // never a raw string; one warn
 *                                       // per token per theme root
 *
 * An EXPLICIT `resolvedTheme` (the B14 pin ruling) mounts the probes
 * inside a TEMPORARY LOCAL wrapper carrying the target theme class
 * (`.dark` / `.jx-light`) under the SAME root for the duration of the
 * read, then removes it — the sheet's `:root, .jx-light {…}` / `.dark {…}`
 * blocks resolve on that wrapper, so a light page with theme="dark"
 * reads the DARK sheet values without ever mutating the global root.
 * Omitted (auto) → probes read the live root as-is.
 *
 * The fontFamily probe is a SEPARATE element + property (a family is not
 * a color): `var(--font-sans)` resolved verbatim, ABSENT when
 * unresolvable, never a warn. Without a document (SSR) the pure
 * safe-hex table for the effective theme comes back — no probes, no DOM.
 */
export function readThemeTokens(root?: HTMLElement, resolvedTheme?: 'light' | 'dark'): ThemeTokens {
  const effective: 'light' | 'dark' = resolvedTheme ?? resolveTheme('auto');
  if (typeof document === 'undefined') return fallbackTokens(effective);

  const scope = root ?? document.documentElement;
  // the explicit pin reads through a temporary local wrapper — removed in
  // the finally below, the global root is never touched
  let host = scope;
  let wrapper: HTMLElement | undefined;
  if (resolvedTheme !== undefined) {
    wrapper = document.createElement('div');
    wrapper.className = resolvedTheme === 'dark' ? 'dark' : 'jx-light';
    wrapper.style.display = 'none';
    scope.append(wrapper);
    host = wrapper;
  }
  try {
    const readColor = (token: string): string => {
      const probe = document.createElement('div');
      probe.style.display = 'none';
      probe.style.color = `var(--${token})`;
      host.append(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();
      const parsed = parseColor(resolved);
      if (parsed) return formatColor(parsed, 'hex');
      return degrade(token, resolved, effective, scope);
    };
    const [background, foreground, primary, secondary, accent, muted, border, error, ...chart] =
      COLOR_TOKENS.map(readColor);
    // the font probe: same host, own element, own property; anything it
    // cannot resolve (empty or a still-raw var() stream) omits `font`
    const fontProbe = document.createElement('div');
    fontProbe.style.display = 'none';
    fontProbe.style.fontFamily = 'var(--font-sans)';
    host.append(fontProbe);
    const fontFamily = getComputedStyle(fontProbe).fontFamily;
    fontProbe.remove();
    const font = fontFamily.trim();
    const tokens: ThemeTokens = {
      background,
      foreground,
      primary,
      secondary,
      accent,
      muted,
      border,
      error,
      chart: [chart[0], chart[1], chart[2], chart[3], chart[4]],
    };
    if (font !== '' && !font.includes('var(')) tokens.font = font;
    return tokens;
  } finally {
    wrapper?.remove();
  }
}

/** the safe floor for a token the pipeline could not parse (one warn). */
function degrade(token: string, resolved: string, theme: 'light' | 'dark', root: HTMLElement): string {
  const key = `${theme}:${token}`;
  let warned = warnedTokens.get(root);
  if (!warned) {
    warned = new Set();
    warnedTokens.set(root, warned);
  }
  if (!warned.has(key)) {
    warned.add(key);
    console.warn(
      `[jixoai/mermaid-engine] token --${token} unparseable (${JSON.stringify(resolved)}); using the ${theme} safe hex`,
    );
  }
  return SAFE_HEX[token][theme];
}

/** the pure safe-hex table as a full ThemeTokens (SSR / documentless reads). */
function fallbackTokens(theme: 'light' | 'dark'): ThemeTokens {
  const at = (token: string): string => SAFE_HEX[token][theme];
  return {
    background: at('background'),
    foreground: at('foreground'),
    primary: at('primary'),
    secondary: at('secondary'),
    accent: at('accent'),
    muted: at('muted'),
    border: at('border'),
    error: at('error'),
    chart: [at('chart-1'), at('chart-2'), at('chart-3'), at('chart-4'), at('chart-5')],
  };
}

// ── derivation (§3.2 — one token source per themeVariables field) ────────

/**
 * Map tokens onto mermaid's themeVariables for theme 'base'. Light/dark is
 * a RE-DERIVE (tokens re-read after the flip), not a filter: the table is
 * identical for both sheets — only the token VALUES differ. `font` rides
 * only when the probe resolved it (mermaid's default family otherwise).
 */
export function deriveThemeVariables(tokens: ThemeTokens, _theme: 'light' | 'dark'): ThemeVariables {
  // _theme is intentionally unread: the mapping is theme-invariant (the
  // signature keeps the design contract — callers may re-derive per sheet)
  const variables: ThemeVariables = {
    background: tokens.background,
    mainBkg: tokens.background,
    primaryTextColor: tokens.foreground,
    textColor: tokens.foreground,
    primaryColor: tokens.primary,
    primaryBorderColor: tokens.primary,
    lineColor: tokens.border,
    nodeBorder: tokens.border,
    clusterBkg: tokens.muted,
    clusterBorder: tokens.muted,
    secondaryColor: tokens.secondary,
    tertiaryColor: tokens.accent,
    cScale0: tokens.chart[0],
    cScale1: tokens.chart[1],
    cScale2: tokens.chart[2],
    cScale3: tokens.chart[3],
    cScale4: tokens.chart[4],
    errorBkgColor: tokens.error,
  };
  if (tokens.font !== undefined) variables.fontFamily = tokens.font;
  return variables;
}

// ── the initialize payload ladder (§3.3) ─────────────────────────────────

type MergedConfig = MermaidConfig & Record<string, unknown>;

/**
 * Field-level precedence, highest first:
 *   PROTECTED    startOnLoad:false · securityLevel:'strict' · theme:'base'
 *   derived      themeVariables from §3.2's table (the token system's own)
 *   user vars    config.themeVariables — FIELD-WISE over derived
 *   user config  everything else, deep-merged at the bottom
 */
function buildInitializePayload(
  tokens: ThemeTokens,
  theme: 'light' | 'dark',
  config: MermaidConfig | undefined,
): MergedConfig {
  const merged = deepMerge({}, config ?? {}) as MergedConfig;
  merged.themeVariables = {
    ...deriveThemeVariables(tokens, theme),
    ...(config?.themeVariables ?? {}),
  };
  merged.startOnLoad = false;
  merged.securityLevel = 'strict';
  merged.theme = 'base';
  return merged;
}

/** plain-data deep merge (arrays and non-plain objects REPLACE, never splice). */
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined) continue;
    const prior = target[key];
    if (isPlainObject(prior) && isPlainObject(value)) {
      deepMerge(prior as Record<string, unknown>, value as Record<string, unknown>);
    } else if (isPlainObject(value)) {
      target[key] = deepMerge({}, value as Record<string, unknown>);
    } else {
      target[key] = value;
    }
  }
  return target;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value) as unknown;
  return proto === Object.prototype || proto === null;
}

/**
 * Fingerprint input: sorted-key JSON walk — undefined-valued keys OMITTED,
 * non-JSON values coerced via String(v), circular input a documented
 * TypeError (configs are plain data by contract). OBJECT IDENTITY never
 * participates: two structurally identical payloads fingerprint equal.
 */
export function stableStringify(value: unknown): string {
  const ancestors: object[] = [];
  const walk = (node: unknown): string => {
    if (node === null || node === undefined) return 'null';
    const kind = typeof node;
    if (kind === 'string') return JSON.stringify(node);
    if (kind === 'object') {
      if (ancestors.includes(node as object)) {
        throw new TypeError(
          '[jixoai/mermaid-engine] circular config passed to renderDiagram — configs are plain data by contract',
        );
      }
      ancestors.push(node as object);
      let out: string;
      if (Array.isArray(node)) {
        out = `[${node.map(walk).join(',')}]`;
      } else {
        const record = node as Record<string, unknown>;
        const keys = Object.keys(record)
          .filter((key) => record[key] !== undefined)
          .sort();
        out = `{${keys.map((key) => `${JSON.stringify(key)}:${walk(record[key])}`).join(',')}}`;
      }
      ancestors.pop();
      return out;
    }
    // number / boolean / bigint / symbol / function — String(v), uniformly
    return String(node);
  };
  return walk(value);
}

// ── the render-id contract (§3.4) ────────────────────────────────────────

/** module-level, monotonic — same-name instances never collide; vitest's
 *  per-file module isolation scopes it per spec file, HMR remounts draw
 *  fresh suffixes (uniqueness is all that matters). */
let instanceCounter = 0;

/**
 * `[a-z0-9-]` only, lowercased, separator-collapsed; FULLY-illegal (or
 * empty/whitespace) input sanitizes to the 'jx-mermaid' default — the
 * base is NEVER empty.
 */
export function sanitizeRenderIdBase(name: string | undefined): string {
  const cleaned = (name ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned === '' ? 'jx-mermaid' : cleaned;
}

/**
 * The render-id minter a surface OWNS per instance (design §3.4):
 * `base = sanitize(name||'jx-mermaid') + '-' + INSTANCE_COUNTER++`, and
 * each `next()` appends a per-render monotonic suffix so consecutive
 * re-renders never reuse a live id — mermaid stamps the id into the SVG
 * and its temp DOM container, and colliding ids cross-wire outputs.
 * Ids exist CLIENT-side only (the SSR floor is plain text — no svg, no id).
 */
export function createRenderIdMinter(name: string | undefined): { next(): string } {
  const base = `${sanitizeRenderIdBase(name)}-${instanceCounter++}`;
  let renderCounter = 0;
  return {
    next: () => `${base}-${renderCounter++}`,
  };
}

// ── the lazy singleton + the serial queue (§3.3) ─────────────────────────

type MermaidModule = typeof import('mermaid');

let mermaidPromise: Promise<MermaidModule> | undefined;

/**
 * The shared lazy engine — ONE dynamic import('mermaid') in flight,
 * memoized; a failed load clears the memo so the next call retries
 * instead of caching the rejection forever (the shiki r1 hardening).
 */
function loadMermaid(): Promise<MermaidModule> {
  mermaidPromise ??= import('mermaid').catch((error: unknown) => {
    mermaidPromise = undefined;
    throw error;
  });
  return mermaidPromise;
}

/** the rejection-recovering serial mutex over initialize+render pairs. */
let queue: Promise<unknown> = Promise.resolve();

/**
 * `queue = queue.then(task, task)` — a REJECTED previous task never
 * poisons the chain: each link runs whether the prior succeeded or not,
 * while the CALLER's promise (the return value) still rejects with its
 * own error. The trailing noop tail keeps the stored chain link itself
 * forever-settled (same semantics, no dangling rejected promise between
 * enqueues).
 */
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task, task);
  queue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

/** the last initialize payload fingerprint mermaid was configured with. */
let lastFingerprint = '';

export interface RenderDiagramOptions {
  /** REQUIRED — from a createRenderIdMinter().next() (the collision contract). */
  id: string;
  /** 'auto' (default) follows the live document root; explicit values pin. */
  theme?: MermaidThemeMode;
  /** mermaid's own config — merges BELOW the protected fields + derived palette. */
  config?: MermaidConfig;
  /**
   * The element whose subtree owns the tokens (the surface's own
   * container — scoped themes resolve); default documentElement.
   * Internal wiring, not a serialized prop.
   */
  themeRoot?: HTMLElement;
}

/**
 * Render `source` through the lazy engine. BROWSER-ONLY: an SSR call (no
 * document) rejects with a MermaidRenderError carrying an explicit
 * browser-only diagnostic. All initialize/render pairs serialize through
 * the queue; initialize re-runs only when the fingerprint — resolvedTheme
 * + stableStringify(final merged payload) — changes (a token or
 * brand-hue change inside the SAME theme mode flips it; stale colors are
 * impossible). Every failure normalizes into MermaidRenderError.
 */
export async function renderDiagram(
  source: string,
  options: RenderDiagramOptions,
): Promise<{ svg: string; theme: 'light' | 'dark' }> {
  if (typeof document === 'undefined') {
    throw new MermaidRenderError(
      '[jixoai/mermaid-engine] renderDiagram is browser-only — mermaid renders through document.body; call it after hydration',
    );
  }
  const { id, theme = 'auto', config, themeRoot } = options;
  const resolvedTheme = resolveTheme(theme);
  return enqueue(async () => {
    let mermaid: MermaidModule['default'];
    try {
      // the package ships its API on the default export (initialize/
      // render are not named exports in v11's runtime namespace)
      mermaid = (await loadMermaid()).default;
      const tokens = readThemeTokens(themeRoot, theme === 'auto' ? undefined : resolvedTheme);
      const payload = buildInitializePayload(tokens, resolvedTheme, config);
      const fingerprint = resolvedTheme + stableStringify(payload);
      if (fingerprint !== lastFingerprint) {
        mermaid.initialize(payload);
        lastFingerprint = fingerprint;
      }
      const { svg } = await mermaid.render(id, source);
      return { svg, theme: resolvedTheme };
    } catch (error: unknown) {
      if (error instanceof MermaidRenderError) throw error;
      const diagnostic = error instanceof Error ? error.message : String(error);
      throw new MermaidRenderError(`[jixoai/mermaid-engine] render failed: ${diagnostic}`);
    }
  });
}

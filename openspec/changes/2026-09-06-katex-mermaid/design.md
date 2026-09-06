# design — katex-mermaid

## 0. Item map (113 → 118)

```
registry/files/lib/katex.ts            ── @jixoai/katex          engines        deps: katex
registry/files/lib/mermaid-engine.ts   ── @jixoai/mermaid-engine engines        deps: mermaid
registry/files/ui/math-inline/         ── @jixoai/math-inline    general        deps: katex
registry/files/ui/math-block/          ── @jixoai/math-block     data-display   deps: katex
registry/files/ui/mermaid/             ── @jixoai/mermaid        data-display   deps: mermaid

registryDependencies (every cross-item import declared — the deps gate
fails undeclared edges and the ledger may only shrink):
  katex          → []
  mermaid-engine → [@jixoai/color-utils]                  (parseColor pipeline, §3)
  math-inline    → [@jixoai/katex, @jixoai/jixoai-theme]
  math-block     → [@jixoai/katex, @jixoai/jixoai-theme, @jixoai/scroll-run,
                    @jixoai/icons, @jixoai/utils]
  mermaid        → [@jixoai/mermaid-engine, @jixoai/jixoai-theme,
                    @jixoai/icons, @jixoai/utils]

lib meta.href (catalog demands meta on every item): katex →
/docs/components/math-block.html, mermaid-engine → /docs/components/mermaid.html
(the shiki → code-card.html precedent — the lib points at its primary surface).
```

Naming precedents: `toc`(ui) + `toc-engine`(lib); `code-card`(ui) +
`shiki`(lib). Lib items carry engine names; ui items carry user-surface
names. The Owner ruling: LaTeX is a syntax STANDARD (engine-swappable
behind the lib seam) → `math-*`; mermaid's syntax is proprietary →
`mermaid` verbatim.

## 1. The two SSR lanes (the load-bearing ruling)

```
                 engine size   isomorphic?   SSR paint            hydration
code-card        ~large        no (lazy       plain-text floor     async upgrade
(shiki)                        chunks)       (escaped sample)     (same <code>)
math-*           ~small        yes           REAL katex markup    nothing to do
                                             (sync renderToString during SSR)
mermaid          ~1MB          no (DOM-      escaped source      lazy engine →
                                bound render)floor               SVG swap (fade-in)
```

- This delta itself is the ruling's home: code-card established the
  floor→upgrade pattern for heavy/lazy engines as an ITEM contract; this
  change records the complementary lane for isomorphic-small engines —
  sync server paint, because a plain-text floor would flash on every
  math mount and buys nothing. The family-context law ("SSR output is
  semantically complete before hydration") and the native-element-first
  hydration-cost ceiling are both STRENGTHENED by the sync lane.
- Print law: both lanes emit MARKUP (katex HTML, mermaid SVG) — both
  survive the print-freeze clone (the documented limitation applies to
  range backends like microlighter, not to markup producers).

## 2. lib/katex.ts — the facade

```ts
import katex from 'katex';
import 'katex/dist/katex.min.css';   // fonts ride npm + consumer bundler

export interface RenderTexOptions {
  displayMode?: boolean;             // false default (inline)
  macros?: KatexOptions['macros'];
  strict?: KatexOptions['strict'];
  trust?: KatexOptions['trust'];
  errorColor?: string;               // default 'var(--error)' — token binding
  // …the rest of katex's renderToString options pass through untouched
}
export function renderTex(tex: string, options?: RenderTexOptions): string;
export function registerMacros(macros: NonNullable<KatexOptions['macros']>): void;
```

- Defaults: `output: 'htmlAndMathml'` (MathML is the screen-reader
  path), `throwOnError: false`, `errorColor: 'var(--error)'`. katex
  applies errorColor as an inline `color:` — a CSS var resolves at
  paint, so the token binding is live in both themes.
- `registerMacros` merges into a module-level defaults table (the
  `registerLanguage`/`registerTheme` extension-point precedent) —
  site-wide `\R`-style macros register once, per-call `macros` ride
  along per the engine's own merge.
- The css import is the ONLY side effect and it lives here (not in
  each ui item) so both math surfaces and any future markdown lane
  import fonts exactly once via `$lib/katex`.
- katex ships its own types (default export + renderToString +
  KatexOptions) — no @types package.

## 3. lib/mermaid-engine.ts — the facade

```ts
export type MermaidThemeMode = 'auto' | 'light' | 'dark';
export interface ThemeTokens { background, foreground, primary, secondary,
  accent, muted, border, error: string; chart: [string × 5] }
export function readThemeTokens(root?: HTMLElement): ThemeTokens;
export function resolveTheme(mode: MermaidThemeMode): 'light' | 'dark';
export function deriveThemeVariables(tokens: ThemeTokens, theme: 'light' | 'dark'): ThemeVariables;
export async function renderDiagram(
  source: string,
  options?: { theme?: MermaidThemeMode; config?: MermaidConfig },
): Promise<{ svg: string; theme: 'light' | 'dark' }>;
export class MermaidRenderError extends Error { diagnostic: string }
```

### 3.1 Token resolution — the probe + parseColor pipeline

`getPropertyValue('--primary')` on an UNREGISTERED custom property
returns the specified token STREAM, not a color —
`oklch(0.6489 0.237 var(--brand-hue))` with the `var()` unresolved.
Resolution pipeline:

```
probe element (attached, display:none, on documentElement)
  el.style.color = `var(${name})`
  → getComputedStyle(el).color          // browser-resolved, serialized
                                         // in origin space (oklch(…)/rgb(…))
  → parseColor(resolved)                 // @jixoai/color-utils: oklch|hsl|hex → Oklch
  → formatColor(oklch, 'hex')            // #rrggbb — mermaid-safe (its theme
                                         // machinery parses hex without deriving)
```

- `parseColor` returning null (unforeseen syntax) → the raw resolved
  string passes through + one console.warn — theming degrades, the
  diagram still renders. Theming NEVER hard-fails a render.
- mermaid's theme machinery computes DERIVED shades (border/line
  variants) by parsing provided variables; feeding hex keeps that
  machinery on its happy path, and we still provide the full explicit
  variable set (§3.2) to minimize derivation.

### 3.2 Derivation map (theme `'base'` — mermaid's parameterizable skeleton)

```
token                → themeVariables
--primary            → primaryColor / primaryBorderColor
--foreground         → primaryTextColor / textColor
--background         → mainBkg / background
--border             → lineColor / nodeBorder
--muted              → clusterBkg / clusterBorder
--secondary/--accent → cScale1/cScale2 seeds (section colors)
--chart-1..5         → cScale0..4 (pie bars / section sweeps)
--error              → errorBkgColor
fontFamily           → resolved var(--font-sans) (JetBrains Mono — mono-first)
```

Light/dark is a RE-DERIVE (tokens re-read after the `.dark` flip),
not a filter — the dark sheet already carries its own values.

- Singleton: one `import('mermaid')` in flight, memoized.
  `initialize` re-runs when the resolved theme (or a config object
  identity) changes — v11 supports repeated initialize.
- `startOnLoad: false` always (the component drives rendering);
  `securityLevel` stays the default `'strict'` — mermaid's own
  DOMPurify pass sanitizes the SVG string it hands back.
- Errors: mermaid throws UnknownDiagramError/parse errors — normalized
  into `MermaidRenderError` carrying the diagnostic; the component
  decides the paint. mermaid ships its own types (MermaidConfig).
- registryDependencies: `@jixoai/color-utils` (the probe pipeline;
  zero npm deps of its own).

## 4. ui/math-inline

```svelte
<Props>{ tex: string; macros?; strict?; trust?; class? }</Props>
<span data-jx-math-inline role="math">{@html renderTex(tex, { displayMode: false, … })}</span>
```

- No chrome. `role="math"` + katex's hidden MathML is the a11y path —
  NO `aria-label={tex}` (it would shadow the MathML for screen
  readers).
- No css file (nothing to own — katex css arrives via the lib import;
  the folder-css law only requires a file when a law needs one).

## 5. ui/math-block

```svelte
<Props>{
  tex: string;
  copyable?: boolean = true;
  labels?: { copy?: string; copied?: string };   // localization payload
  macros?; strict?; trust?; class?;
}</Props>
<figure data-kind="math" data-jx-math-block role="math">
  <div class="jx-scroll-host …">                  <!-- the scroll-run rider -->
    <div data-jx-scroll-run data-axis="horizontal" bind:this={runEl}>
      {@html renderTex(tex, { displayMode: true, … })}
    </div>
    <ScrollChrome scrollEffect={shadow()} run={runEl} />
  </div>
  {#if copyable}<foot — code-card copy control pattern (icons.copy, press physics,
  clipboard fallback, 1.6s copied feedback, labels localization)>{/if}
</figure>
```

- Sync SSR render (lane ruling, §1): `$derived` over `renderTex` —
  prerender bakes real markup; prop changes re-derive live.
- Scroll law: the wide-equation strip RIDES the shared scroll-run
  contract (`@jixoai/scroll-run` — host grid + horizontal run +
  ScrollChrome; the tabs/button-group precedent) — never a family-local
  copy of the stamp machine, law sheet, or chrome (the scroll-run
  unification requirement, 2026-09-04). Veil effect: `shadow()` edge
  treatment (the code-card edge-affordance lineage).
- Error: `throwOnError:false` paints the bad source run in
  `var(--error)` inside the same box; one `console.warn` carries the
  katex diagnostic. No error chrome.

## 6. ui/mermaid

```svelte
<Props>{
  source: string;                       // runtime prop — the code-card rule
  name?: string;                        // id prefix + head tab label
  theme?: MermaidThemeMode = 'auto';
  copyable?: boolean = true;
  zoomable?: boolean = true;
  labels?: { copy?; copied?; zoomIn?; zoomOut?; zoomReset?; renderError?: string };
  config?: MermaidConfig;               // passthrough, deep-merged OVER derived
  class?;
}</Props>
<figure data-kind="diagram" data-jx-mermaid data-state={floor|rendering|rendered|error}>
  {#if name}<figcaption — filename-tab pattern>{/if}
  <div data-jx-mermaid-viewport style="min-height reserve while floor">
    {#if svg}<div class="zoom-wrapper" style="transform:scale({scale})">{@html svg}</div>
    {:else}<pre><code>{source}</code></pre>   <!-- the floor, also the error fallback -->
    {/if}
  </div>
  {#if copyable || zoomable}<foot — copy control + zoom trio (press physics)>{/if}
</figure>
```

- The code-card effect discipline verbatim: a `generation` counter
  drops the previous paint booking, out-of-order resolutions no-op,
  and the floor shows the CURRENT source while a render is in flight.
- Theme follow: `theme='auto'` mounts a MutationObserver on
  `document.documentElement` attributes (class) → debounced
  re-render with `readThemeTokens()` re-read AFTER the flip. Explicit
  `'light'|'dark'` pins the palette (no observer).
- Zoom: `scale` state (buttons ±0.25, clamp 0.5–3, reset), applied as
  `transform: scale()` on the inner wrapper, `transform-origin: top
  left`; the viewport is the pan surface. No re-render on zoom — pure
  transform.
- **Viewport scroll ruling (recorded exemption):** the zoom-pan
  viewport is a TWO-AXIS pan surface for scaled content, not a linear
  overflow strip — the scroll-run contract models ONE axis per run
  (`data-axis` single-valued) with nudge chips for linear affordance.
  The viewport therefore rides the scrollbar-token law only (thin
  currentColor thumbs on both axes, `--scrollbar-thumb*` tokens) and
  is recorded here as a scroll-run exemption; math-block (a true
  horizontal strip) rides the full contract above. If review rules
  otherwise, the viewport gains a horizontal run + chrome.
- Fade-in on first render (`@media (prefers-reduced-motion: reduce)`
  kills it); the floor box keeps a min-height while `rendering` so the
  swap doesn't collapse the layout (CLS mitigation; a diagram's true
  height is unknowable pre-render — accepted residual shift, softened
  by the reserved floor).
- Error state: `data-state="error"` paints a summary strip
  (`labels.renderError` + the diagnostic's first line) ABOVE the
  standing source floor — the floor never disappears on failure.

## 7. Law mapping (living-spec anchors this change must satisfy)

| living requirement (openspec/specs/…) | how |
|---|---|
| scroll-run unification (component-authoring, "ONE shared system") | math-block's strip rides @jixoai/scroll-run host/run/chrome wholesale; mermaid's pan viewport is a recorded exemption (§6) |
| family-context contract — "SSR output is semantically complete before hydration" | math bakes real markup server-side; mermaid's floor is readable source (the declared-limit surfaces pattern) |
| native-element-first (hydration cost zero unless unavoidable) | math lane needs no hydration work; mermaid's engine loads off the critical path |
| the icon law (icons from the generated $lib/icons module — no hand-written svg glyphs) | copy/check/plus/minus/rotateCcw all exist in the bag; no gen-icons regen |
| localization payload (consumer-feedback-fixes, 2026-09-06) | `labels` props on math-block/mermaid; absent = shipped English verbatim |
| registry docs speak the consumer import dialect (registry spec) | docs strings show `$lib/…`; `@lib/@ui` stay TARGET vocabulary |
| registryDependencies mirror actual imports (registry spec + the deps ratchet) | §0's edge list is exhaustive; ledger unchanged |
| the CSS placement/canopy laws (css-architecture) | folder sheets carry the canonical `@layer theme, base, components, utilities;` prologue + timestamped intent comment; `:where()` paint; `data-jx-*` hooks |
| press physics + reduced-motion (component-authoring contracts) | copy/zoom controls ride `.jx-press`; the mermaid fade-in dies under the media query |

## 8. Testing strategy

- katex: REAL engine in vitest (small, sync, isomorphic) — specs
  assert `.katex` markup, MathML presence, displayMode differences,
  error paint, macro passthrough. CSS imports are inert under vitest
  (`css: false` stubbing — the code-card precedent ships `import
  './code-card.css'` and its spec runs).
- mermaid: the engine module is `vi.mock`-ed (a ~1MB ESM engine with a
  DOM-bound renderer is not a jsdom citizen) — specs assert the
  CONTRACT: initialize args (startOnLoad:false, theme 'base', derived
  hex variables), the lazy singleton (one import), the probe pipeline
  (parseColor called on resolved strings), theme re-derive on class
  flip, generation discipline (late resolution no-ops), error
  normalization, floor survival.
- Real mermaid rendering is verified by the vision lane (browser
  screenshots on the dev server, light + dark).
- End-to-end out-of-the-box: `scripts/verify-shadcn-add.mjs` gains
  CASES entries for math-block + mermaid — the probe installs them
  from the built payloads into a real fixture and asserts katex +
  mermaid land in the consumer's package.json (the fonts ride the css
  import). The registry delta's scenario cites exactly this receipt.

## 9. Risks

- mermaid v11 ESM + vitest → mock strategy above; the REAL import path
  stays exercised by the browser lane and the consumer probe.
- Computed-color serialization variance across browsers (oklch(…) vs
  rgb(…) serialization of the same probe) — parseColor handles both
  input families; null falls back to the raw string + warn (§3.1).
- registry/package.json byte-identity — both sides get identical dep
  entries; the manifest check catches drift.
- KaTeX SSR weight (~300KB min into route chunks) — acceptable: it
  loads only on routes mounting math; the alternative (floor+upgrade)
  buys nothing for a math-bearing page.
- Mermaid CLS — inherent (size unknowable pre-render); min-height
  reserve + fade-in soften it; documented as accepted residual.

# design — katex-mermaid

## 0. Item map (113 → 118)

```
registry/files/lib/katex.ts            ── @jixoai/katex          engines   deps: katex
registry/files/lib/mermaid-engine.ts   ── @jixoai/mermaid-engine engines   deps: mermaid
registry/files/ui/math-inline/         ── @jixoai/math-inline    general   deps: katex
registry/files/ui/math-block/          ── @jixoai/math-block     data-display  deps: katex
registry/files/ui/mermaid/             ── @jixoai/mermaid        data-display  deps: mermaid
       registryDependencies: math-* → [@jixoai/katex, @jixoai/jixoai-theme]
                             mermaid → [@jixoai/mermaid-engine, @jixoai/jixoai-theme]
```

Naming precedents: `toc`(ui) + `toc-engine`(lib); `code-card`(ui) +
`shiki`(lib). Lib items carry engine names; ui items carry user-surface
names. The Owner ruling: LaTeX is a syntax STANDARD (engine-swappable
behind the lib seam) → `math-*`; mermaid's syntax is proprietary →
`mermaid` verbatim.

## 1. The two SSR lanes (the load-bearing ruling)

```
                 engine size   isomorphic?   SSR paint            hydration
code-card        ~large        no (wasm-     plain-text floor     async upgrade
(shiki)                        free core)    (escaped sample)     (same <code>)
math-*           ~small        yes           REAL katex markup    nothing to do
                                             (sync renderToString during SSR)
mermaid          ~1MB          no (DOM-      escaped source      lazy engine →
                                bound render)floor               SVG swap (fade-in)
```

- The progressive-enhancement law is about WEIGHT and CAPABILITY, not
  ritual: code-card floors because shiki chunks load late; math renders
  directly because `katex.renderToString` is synchronous, isomorphic,
  and small enough to sit in a route-split chunk — a plain-text floor
  would FLASH on every math mount. Mermaid floors because the engine
  is ~1MB and needs a DOM.
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

## 3. lib/mermaid-engine.ts — the facade

```ts
export type MermaidThemeMode = 'auto' | 'light' | 'dark';
export interface ThemeTokens {
  background: string; foreground: string; primary: string; secondary: string;
  accent: string; muted: string; border: string; error: string;
  chart: [string, string, string, string, string];
}
export function readThemeTokens(root?: HTMLElement): ThemeTokens;
// getComputedStyle(document.documentElement) — resolved values, so
// oklch()/color-mix() bake into strings mermaid can write into SVG attrs
export function resolveTheme(mode: MermaidThemeMode): 'light' | 'dark';
// 'auto' → documentElement.classList.contains('dark') (the registry's
// own theme contract — theme-toggle toggles exactly this class)

export function deriveThemeVariables(tokens: ThemeTokens, theme: 'light' | 'dark'): ThemeVariables;
export async function renderDiagram(
  source: string,
  options?: { theme?: MermaidThemeMode; config?: MermaidConfig },
): Promise<{ svg: string; theme: 'light' | 'dark' }>;
export class MermaidRenderError extends Error { diagnostic: string }
```

Derivation map (theme `'base'` — mermaid's parameterizable skeleton):

```
token                → themeVariables (light)              → (dark swap)
--primary            → primaryColor / primaryBorderColor   → same vars, tokens
--foreground         → primaryTextColor / textColor          already re-read
--background         → mainBkg / background                  (light/dark is a
--border             → lineColor / primaryBorderColor         RE-DERIVE, not a
--muted              → nodeBorder / clusterBkg                filter)
--secondary/--accent → cScale0/cScale1 seeds (section colors)
--chart-1..5         → cScale0..4 (pie bars / section sweeps)
--error              → errorBkgColor
fontFamily           → resolved var(--font-sans) (JetBrains Mono — mono-first)
```

- Singleton: one `import('mermaid')` in flight, memoized. `initialize`
  re-runs when the resolved theme (or a config object identity)
  changes — v11 supports repeated initialize.
- `startOnLoad: false` always (the component drives rendering);
  `securityLevel` stays the default `'strict'` — mermaid's own
  DOMPurify pass sanitizes the SVG string it hands back.
- Errors: mermaid throws `UnknownDiagramError`/parse errors with a
  `message` — normalized into `MermaidRenderError` carrying the
  diagnostic; the component decides the paint.

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
  <div data-jx-math-scroll class="scrollport">{@html renderTex(tex, { displayMode: true, … })}</div>
  {#if copyable}<foot — code-card copy control pattern (icons.copy, press physics,
  clipboard fallback, 1.6s copied feedback, labels localization)>{/if}
</figure>
```

- Sync SSR render (lane ruling above): `$derived` over `renderTex` —
  prerender bakes real markup; prop changes re-derive live.
- Scroll law: the scrollport is the ONLY horizontal scroller (katex
  display centers; wide equations overflow right), thin currentColor
  scrollbar via the theme's scrollbar tokens, keyboard-focusable.
- Error: `throwOnError:false` paints the bad source run in
  `var(--error)` inside the same box; one `console.warn` carries the
  katex diagnostic. No error chrome.

## 6. ui/mermaid

```svelte
<Props>{
  source: string;                       // runtime prop — code-card law
  name?: string;                        // id prefix + head tab label
  theme?: MermaidThemeMode = 'auto';
  copyable?: boolean = true;
  zoomable?: boolean = true;
  labels?: { copy?: string; copied?: string; zoomIn?: string; zoomOut?: string; zoomReset?: string; renderError?: string };
  config?: MermaidConfig;               // passthrough, deep-merged OVER derived
  class?;
}</Props>
<figure data-kind="diagram" data-jx-mermaid data-state={floor|rendering|rendered|error}>
  {#if name}<figcaption — filename-tab pattern>{/if}
  <div data-jx-mermaid-viewport class="scrollport" style="min-height reserve while floor">
    {#if svg}{@html svg}               <!-- scaled wrapper: zoom -->
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
  `transform: scale()` on an inner wrapper with `transform-origin: top
  left`; the scrollport stays the pan surface (overflow auto both
  axes). No re-render on zoom — pure transform.
- Fade-in on first render (`@media (prefers-reduced-motion: reduce)`
  kills it); the floor box keeps a min-height while `rendering` so the
  swap doesn't collapse the layout (CLS mitigation; a diagram's true
  height is unknowable pre-render — accepted residual shift, softened
  by the reserved floor).
- Error state: `data-state="error"` paints a summary strip
  (`labels.renderError` + the diagnostic's first line) ABOVE the
  standing source floor — the floor never disappears on failure.

## 7. Law mapping (existing laws this change must satisfy)

| law | how |
|---|---|
| runtime-prop source | `tex`/`source` are props; engines escape/sanitize their own output |
| {@html} trust boundary | only engine-generated markup (katex string, mermaid-sanitized svg) |
| localization payload | `labels` props on math-block/mermaid; absent = shipped English verbatim |
| consumer-import dialect | docs strings show `$lib/…`; `@lib/@ui` stay TARGET vocabulary |
| scrollbar law | scrollports paint thin currentColor thumbs (theme tokens) |
| press physics | copy/zoom controls ride `.jx-press` + shadow tokens |
| reduced-motion | mermaid fade-in killed under the media query |
| print freeze | markup producers only — both engines qualify |
| folder law / pure barrel | same-name canonical main + `index.ts` barrel; `data-jx-*` hooks; css `@layer` prologue + `:where()` when a css file exists |
| deps ratchet | every cross-item import declared (`@jixoai/katex`, `@jixoai/mermaid-engine`, `@jixoai/jixoai-theme`); ledger may only shrink |
| mirror law | byte-identical both sides; `registry/package.json` ≡ `apps/www/package.json` (deps pair) |

## 8. Testing strategy

- katex: REAL engine in vitest (small, sync, isomorphic) — specs
  assert `.katex` markup, MathML presence, displayMode differences,
  error paint, macro passthrough.
- mermaid: the engine module is `vi.mock`-ed (a ~1MB ESM engine with a
  DOM-bound renderer is not a jsdom citizen) — specs assert the
  CONTRACT: initialize args (startOnLoad:false, theme 'base', derived
  variables), the lazy singleton (one import), theme re-derive on
  class flip, generation discipline (late resolution no-ops), error
  normalization, floor survival.
- Real mermaid rendering is verified by the vision lane (browser
  screenshots on the dev server, light + dark).
- End-to-end out-of-the-box: `verify:all`'s shadcn-add consumer probe
  installs `math-block` + `mermaid` from the built payloads into a real
  fixture — katex fonts + mermaid deps landing in the consumer's
  package.json is the receipt.

## 9. Risks

- mermaid v11 ESM + vitest → mock strategy above; the REAL import path
  stays exercised by the browser lane and the consumer probe.
- registry/package.json byte-identity — both sides get identical dep
  entries; the manifest check catches drift.
- KaTeX SSR weight (~300KB min into route chunks) — acceptable: it
  loads only on routes mounting math; the alternative (floor+upgrade)
  buys nothing for a math-bearing page.
- Mermaid CLS — inherent (size unknowable pre-render); min-height
  reserve + fade-in soften it; documented as accepted residual.

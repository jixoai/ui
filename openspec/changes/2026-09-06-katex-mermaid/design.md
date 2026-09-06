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
  mermaid-engine → [@jixoai/color-utils]                  (parseColor pipeline, §3.1)
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

export interface RenderTexOptions extends /* passthrough of */ KatexOptions {
  displayMode?: boolean;             // false default (inline)
  errorColor?: string;               // default 'var(--error)' — token binding
}
export function renderTex(tex: string, options?: RenderTexOptions): string;
export function registerMacros(macros: NonNullable<KatexOptions['macros']>): void;
```

- Defaults + override precedence (explicit): jixoai defaults are
  `output: 'htmlAndMathml'`, `throwOnError: false`, `errorColor:
  'var(--error)'`; EVERY default is overridable by the caller's option
  of the same key (the engine's full vocabulary is respected — a site
  that wants `output: 'mathml'` or `throwOnError: true` gets it). The
  surfaces pass consumer props through; a caller-set
  `throwOnError: true` makes renderTex THROW, and the SURFACE catches,
  paints the raw source in place + one console.warn (errors never
  escape a component boundary).
- `registerMacros` merges into a module-level defaults table (the
  `registerLanguage`/`registerTheme` extension-point precedent):
  SITE-scoped by design (register once at app boot); a repeated key
  overwrites the earlier macro (last-wins, documented); vitest's
  per-file module isolation keeps tests from cross-polluting.
- The css import is the ONLY side effect and it lives here (not in
  each ui item) so both math surfaces and any future markdown lane
  import fonts exactly once via `$lib/katex`.
- katex ships its own types (default export + renderToString +
  KatexOptions) — no @types package.

## 3. lib/mermaid-engine.ts — the facade

```ts
export type MermaidThemeMode = 'auto' | 'light' | 'dark';
export interface ThemeTokens {
  background: string; foreground: string; primary: string; secondary: string;
  accent: string; muted: string; border: string; error: string;
  font?: string;   // resolved --font-sans — ABSENT when unresolvable (mermaid default family)
  chart: [string, string, string, string, string];
}
export function readThemeTokens(root?: HTMLElement, resolvedTheme?: 'light' | 'dark'): ThemeTokens;   // browser-only
export function resolveTheme(mode: MermaidThemeMode): 'light' | 'dark';
export function deriveThemeVariables(tokens: ThemeTokens, theme: 'light' | 'dark'): ThemeVariables;
export async function renderDiagram(
  source: string,
  options: { id: string; theme?: MermaidThemeMode; config?: MermaidConfig;
             /** the element whose subtree owns the tokens (the surface's
              *  own container — scoped themes resolve); default
              *  documentElement. Internal wiring, not a serialized prop. */
             themeRoot?: HTMLElement },
): Promise<{ svg: string; theme: 'light' | 'dark' }>;
export class MermaidRenderError extends Error { diagnostic: string }
```

Everything below `readThemeTokens`/`resolveTheme` is BROWSER-ONLY
(mermaid's render touches `document.body`); an SSR call to
`renderDiagram` rejects with `MermaidRenderError` carrying an explicit
"browser-only" diagnostic instead of a raw ReferenceError.

### 3.1 Token resolution — probe + parseColor pipeline, with a safe floor

`getPropertyValue('--primary')` on an UNREGISTERED custom property
returns the specified token STREAM, not a color —
`oklch(0.6489 0.237 var(--brand-hue))` with the `var()` unresolved.
Resolution pipeline:

```
COLOR probe — attached INSIDE the passed root's subtree (default
  documentElement; a scoped root reads ITS tokens, not the page's),
  display:none, one probe per color token:
  probe.style.color = `var(${name})`
  → getComputedStyle(probe).color   // browser-resolved, serialized
                                     // (oklch(…) per origin space, or
                                     // rgb()/rgba() for legacy families)
  → parseColor(resolved)             // @jixoai/color-utils — EXTENDED in
                                      // this change to accept rgb()/rgba()
                                      // (comma AND space/slash syntaxes)
  → formatColor(oklch, 'hex')        // #rrggbb — mermaid-safe
  → parseColor null → the token's DOCUMENTED SAFE HEX (table below)
  → one console.warn per degraded token (once, not per render).

FONT probe — SEPARATE step, its own property (a font family is not a
  color; the color probe cannot carry it):
  probe.style.fontFamily = 'var(--font-sans)'
  → getComputedStyle(probe).fontFamily → ThemeTokens.font (string verbatim)
  → empty/unresolvable → font ABSENT (optional field) — mermaid's
    default family applies. Never warns (fonts degrade gracefully).
```

**The safe-hex fallback table** (per token, PER THEME — the sheet's own
values run through the same Ottosson conversion color-utils uses;
srgb-gamut clamping applies; the table is the test oracle, committed in
the engine header):

```
token         light      dark
background    #ffffff    #000000
foreground    #000000    #ffffff
primary       #d945d1    #d970dd     (hue 330 static / dark 326)
secondary     #ffff00    #ffff33
accent        #0066ff    #3399ff
muted         #f0f0f0    #1a1a1a
border        #000000    #ffffff
error         #de3b3d    #f97770
chart-1       #d945d1    #d970dd     (= primary)
chart-2       #11a22f    #5bbe62     (= success)
chart-3       #008cdf    #54b3fd     (= info)
chart-4       #f9b800    #e9ac00     (= warning)
chart-5       #de3b3d    #f97770     (= error)
```

A degraded token NEVER reaches mermaid as a raw string — a var()
fragment or an exotic function fed to its derivation machinery breaks
the palette.

**The explicit-theme read (B14 ruling):** `readThemeTokens(root,
resolvedTheme)` — when `resolvedTheme` is given and the root's live
effective theme differs, the probes mount inside a TEMPORARY LOCAL
wrapper carrying the target theme class (`.dark` for dark, `.jx-light`
for light) attached under the SAME root for the duration of the read,
then remove it — the sheet's `:root, .jx-light {…}` / `.dark {…}`
blocks resolve on that wrapper, so a light page with `theme="dark"`
reads the DARK sheet values without ever mutating the global root.
`resolvedTheme` omitted (auto) → probes read the live root as-is.

- **color-utils parseColor extension is a TASK of this change** (the
  shared lib gains rgb()/rgba() parsing — modern `rgb(1 2 3 / 0.5)`
  and legacy `rgba(1,2,3,0.5)` both funnel into the Oklch model; alpha
  is accepted and DISCARDED in hex formatting — mermaid variables are
  opaque paints). Mirrored + unit-tested both sides.
- `--font-sans` resolves through the SEPARATE fontFamily probe above
  (same root, same lifecycle — never the color probe); unresolvable →
  `font` omits from themeVariables (mermaid's default family applies).
  It rides ThemeTokens, not the color pipeline.

### 3.2 Derivation map — one source per themeVariables field (theme `'base'`)

```
token               → themeVariables                (the derived default's ONE token source)
--background        → mainBkg, background
--foreground        → primaryTextColor, textColor
--primary           → primaryColor, primaryBorderColor
--border            → lineColor, nodeBorder
--muted             → clusterBkg, clusterBorder
--secondary         → secondaryColor
--accent            → tertiaryColor
--chart-1..5        → cScale0..4                    (charts OWN the cScale)
--error             → errorBkgColor
ThemeTokens.font    → fontFamily                   (omitted when unresolved)
```

Every field has exactly ONE token source for its DERIVED DEFAULT (no
assignment-order ambiguity); the user `themeVariables` overlay (§3.3)
is the configuration layer ABOVE these defaults — one-source-per-field
governs the derived tier, user overrides ride later by design. The
table is the test oracle. Light/dark is a RE-DERIVE (tokens re-read
after the `.dark` flip), not a filter.

### 3.3 Engine discipline — the serial queue, fingerprint, protected fields

Mermaid's `initialize` writes GLOBAL config; two components rendering
concurrently could interleave initialize/render across themes. The
engine enforces:

```
fingerprint = resolvedTheme + stableStringify(FINAL merged initialize payload)
              // the merged payload INCLUDES the derived themeVariables,
              // font, and the protected fields — so a brand-hue or token
              // change inside the SAME theme mode still flips it
              // (initialize re-runs; stale colors are impossible)
stableStringify: sorted-key JSON walk — undefined-valued keys OMITTED,
              non-JSON values coerced via String(v), circular input is a
              documented TypeError (configs are plain data by contract);
              OBJECT IDENTITY never participates
ALL initialize+render pairs run through ONE promise-chain mutex:
  enqueue(task) = queue = queue.then(task, task)   // a REJECTED previous
              // task never poisons the chain — each link runs whether the
              // prior succeeded or not; the CALLER's promise still rejects
              // with its own error (MermaidRenderError)
  task = () => { const merged = buildInitializePayload(options);
                 const fp = resolvedTheme + stableStringify(merged);
                 if (fp !== lastFingerprint) { mermaid.initialize(merged); lastFingerprint = fp; }
                 return mermaid.render(renderId, source); }
```

- Config merge precedence (explicit, field-level):

```
highest   PROTECTED (always win, never overridable):
            startOnLoad: false · securityLevel: 'strict' · theme: 'base'
          derived themeVariables   (§3.2's table — the token system owns these)
          user config.themeVariables — FIELD-WISE over derived (fine-tuning
            an unbound field or overriding one derived value is allowed;
            the palette's spine stays token-driven)
lowest    user config (everything else — font, flowchart config, …deep-merged)
```

- Adversarial contract tests: a config attempting
  `securityLevel:'loose'` / `startOnLoad:true` / `theme:'dark'` still
  initializes strict/false/base; concurrent renders with different
  themes both come out correctly themed (the queue serializes).
- `securityLevel` stays `'strict'` — mermaid's own DOMPurify pass
  sanitizes the SVG string it hands back. Errors normalize into
  `MermaidRenderError` carrying the diagnostic.
- Singleton: one `import('mermaid')` in flight, memoized; v11 supports
  repeated initialize.

### 3.4 The render-id contract

`mermaid.render(id, source)` stamps the id into the SVG and its
temp DOM container — colliding ids cross-wire outputs between
instances. The contract:

```
component instance owns:  base = sanitize(name || 'jx-mermaid')   // [a-z0-9-] only;
                                                                    // fully-illegal input
                                                                    // sanitizes to the
                                                                    // 'jx-mermaid' default —
                                                                    // the base is NEVER empty
                          base += '-' + INSTANCE_COUNTER++         // module-level,
                                                                    // monotonic — same
                                                                    // names never collide;
                                                                    // vitest module isolation
                                                                    // scopes it per spec file,
                                                                    // HMR remounts draw fresh
                                                                    // suffixes (uniqueness is
                                                                    // all that matters)
each render call:         renderId = `${base}-${renderCounter++}`  // re-renders never
                                                                    // reuse a live id
```

Ids exist CLIENT-side only (the SSR floor is plain text — no svg, no
id). Tests: two instances, two same-`name` instances, and consecutive
re-renders of one instance — all produce distinct render ids and
uncrossed outputs.

## 4. ui/math-inline

```svelte
<Props extends HTMLAttributes<HTMLSpanElement>>{
  tex: string; macros?; strict?; trust?;
}</Props>
<span {...rest} data-jx-math-inline role="math" class={cn(className)}>
  {@html renderTex(tex, { displayMode: false, … })}
</span>
```

Spread order is CONTRACT (Svelte: later attributes win): `{...rest}`
FIRST, the component's own `data-jx-math-inline`/`role` stamps AFTER —
a consumer cannot override the component's semantic fields, while
`data-testid`/`title`/`aria-*`/handlers pass through untouched; `class`
merges via the destructured class prop (never a `className` prop in
Svelte). A conflict test pins it: a consumer-sent
`data-jx-math-inline="x"` loses; `data-testid="eq"` lands.

- Rest-attributes contract (the living requirement): consumer
  `data-testid`/`title`/`aria-*`/handlers land on the root; the
  component's own `data-jx-math-inline` + `role="math"` stamp AFTER
  rest (component semantics win their own fields). The span contains
  only katex output — `role="math"` here is correct (no controls
  inside to flatten).
- katex's hidden MathML is the screen-reader path — NO `aria-label`
  default (it would shadow the MathML); a consumer-provided aria-*
  rides rest and wins.
- No css file (nothing to own — katex css arrives via the lib import;
  the folder-css law only requires a file when a law needs one).

## 5. ui/math-block

```svelte
<Props extends HTMLAttributes<HTMLElement>>{
  tex: string;
  copyable?: boolean = true;
  labels?: { copy?: string; copied?: string };   // localization payload
  macros?; strict?; trust?;
  // …rest spreads onto the figure
}</Props>
<figure {...rest} data-kind="math" data-jx-math-block class={cn(className)}>
  <div class="jx-scroll-host grid [grid-template-columns:minmax(0,1fr)]" bind:this={hostEl}>
    <div data-jx-scroll-run data-axis="horizontal" bind:this={runEl} class="scrollport">
      <div role="math" bind:this={mathEl}>{@html renderTex(tex, { displayMode: true, … })}</div>
    </div>
    <ScrollChrome scrollEffect={shadow()} run={runEl} />
  </div>
  {#if copyable}<foot — code-card copy control pattern (icons.copy, press physics,
  clipboard fallback, 1.6s copied feedback, labels localization)>{/if}
</figure>
```

- **role placement (B8 ruling): the figure KEEPS figure semantics** (a
  native figure, no role override — the native-element-first law);
  `role="math"` lives on the inner wrapper that carries ONLY the katex
  output, so the copy button stays a discoverable interactive node in
  the a11y tree. Tests assert the button remains reachable.
- **The FULL scroll-run contract (B7)** — not just the DOM shape:
  `$effect` arms the shared stamp machine
  `createScrollStamp({ run: runEl, host: hostEl, members: () => mathEl ? [mathEl] : [], ramps: false })`
  and destroys it on cleanup; the machine owns the verdict
  (`data-jx-scroll-state: none | start-closed | end-closed | open` —
  the single truth the shared css keys chips and veil on); `ScrollChrome`
  mounts the shadow-veil + nudge chips from the same verdict. Tests
  drive the four verdict states + a content-growth restamp (a wider
  formula flips the verdict open).
- Sync SSR render (lane ruling, §1): `$derived` over `renderTex` —
  prerender bakes real markup; prop changes re-derive live. The stamp
  machine is client-only (hydration arms it; the floor css paints no
  chrome without a verdict — the shared law).
- Error: `throwOnError:false` default paints the bad source run in
  `var(--error)` inside the same box; one `console.warn` carries the
  katex diagnostic. No error chrome. A caller-forced throw (strict
  options) is caught by the surface: raw source paints + warn.

## 6. ui/mermaid

```svelte
<Props extends HTMLAttributes<HTMLElement>>{
  source: string;                       // runtime prop — the code-card rule
  name?: string;                        // head tab label + render-id base
  theme?: MermaidThemeMode = 'auto';
  copyable?: boolean = true;
  zoomable?: boolean = true;
  labels?: { copy?; copied?; zoomIn?; zoomOut?; zoomReset?; renderError?; diagram?: string };
  // labels.diagram: the viewport's accessible name when `name` is absent
  // (localization payload — absent = 'Diagram', shipped English)
  config?: MermaidConfig;               // §3.3's precedence ladder applies
  // …rest spreads onto the figure
}</Props>
<figure {...rest} data-kind="diagram" data-jx-mermaid data-state={floor|rendering|rendered|error} class={cn(className)}>
  {#if name}<figcaption — filename-tab pattern>{/if}
  <div data-jx-mermaid-viewport role="img" aria-label={name?.trim() || labels?.diagram?.trim() || 'Diagram'}>
    {#if svg}<div class="zoom-wrapper" style="transform:scale({scale})" bind:this={zoomEl}>{@html svg}</div>
    {:else}<pre><code>{source}</code></pre>   <!-- the floor, also the error fallback -->
    {/if}
  </div>
  {#if copyable || zoomable}<foot — copy control + zoom trio (press physics)>{/if}
</figure>
```

- The code-card effect discipline verbatim: a `generation` counter
  drops the previous paint booking, out-of-order resolutions no-op,
  and the floor shows the CURRENT source while a render is in flight.
  Render ids per §3.4; the engine's serial queue (§3.3) orders the
  actual initialize/render pairs.
- Theme follow + the themeRoot wiring (B13) + the effective-scope
  observer (B16): the surface passes its own figure as
  `renderDiagram`'s `themeRoot` (scoped containers — a `.jx-light`
  canvas stage, a dark panel — resolve THEIR tokens, not the page's).
  `theme='auto'` observes the figure's ENTIRE effective theme scope,
  not just two nodes: a class MutationObserver on the document root
  with `subtree: true`, filtered to mutations on the themeRoot/figure
  ITSELF plus elements that are CURRENT ancestors of it (a scope
  class flipping on the figure directly OR on an ancestor —
  `.jx-light`→`.dark` — re-renders even when documentElement never
  mutated) — debounced re-render with `readThemeTokens(themeRoot)`
  re-read AFTER the flip; the observer disconnects in the effect's
  cleanup. Explicit `'light'|'dark'` pins
  the palette via the explicit-theme read (§3.1's local wrapper — the
  target sheet's values even under the opposite live root; no
  observer). Tests: the figure's OWN class flip re-renders; an
  ancestor `<div class="jx-light">` flipping to
  `dark` re-initializes with changed baked fills; an unrelated
  sibling's class change triggers NO render.
- Zoom: `scale` state (buttons ±0.25, clamp 0.5–3, reset), applied as
  `transform: scale()` on the zoom wrapper, `transform-origin: top
  left`; the viewport is the pan surface. No re-render on zoom — pure
  transform.
- **Viewport scroll ruling (recorded exemption, finalized):** the
  zoom-pan viewport is a TWO-AXIS pan surface for scaled content, not
  a linear overflow strip — the scroll-run contract models ONE axis
  per run (`data-axis` single-valued) with linear nudge chips. The
  exemption is contractual, not tentative: the viewport rides the
  scrollbar-token law (thin currentColor thumbs on BOTH axes via
  `--scrollbar-thumb*`) and MUST NOT mount nudge chips or edge veils
  (a negative test asserts no `data-jx-scroll-run` inside). math-block
  (a true horizontal strip) rides the full shared contract instead.
- CLS budget: the floor box carries
  `min-height: var(--jx-mermaid-floor-min, 6rem)` while
  `data-state=rendering|floor` (a consumer-tunable token, documented);
  a diagram's true height is unknowable pre-render — the reserve
  bounds the collapse; the first render fades in
  (`prefers-reduced-motion` kills the transition).
- Error state: `data-state="error"` paints a summary strip
  (`labels.renderError` + the diagnostic's first line) ABOVE the
  standing source floor — the floor never disappears on failure.
- A11y: `role="img"` on the viewport with a NON-EMPTY accessible name
  at ALL times — the trimmed ladder `name?.trim() ||
  labels?.diagram?.trim() || 'Diagram'` (an empty-string `name` falls
  through rather than mounting a nameless img); a mermaid `title`
  inside the grammar adds its own accessible name to the rendered
  svg. Controls are real buttons (press physics, focusable,
  localized).

## 7. Law mapping (living-spec anchors this change must satisfy)

| living requirement (openspec/specs/…) | how |
|---|---|
| rest-attributes passthrough (component-authoring) | Props extend HTMLAttributes per root element; rest spreads before the component's own data-jx-*/role stamps; tests assert data-testid/title/aria/handler landing |
| scroll-run unification ("ONE shared system") | math-block rides createScrollStamp + scroll-run.css + ScrollChrome wholesale; mermaid's pan viewport is the recorded two-axis exemption with a negative no-chrome test |
| family-context contract — "SSR output is semantically complete before hydration" | math bakes real markup server-side; mermaid's floor is readable source (the declared-limit surfaces pattern) |
| native-element-first (hydration cost zero unless unavoidable; native semantics first) | math lane needs no hydration work; figure/span keep native semantics — role="math" only on content-only wrappers |
| the icon law (icons from the generated $lib/icons module — no hand-written svg glyphs) | copy/check/plus/minus/rotateCcw all exist in the bag; no gen-icons regen |
| localization payload (consumer-feedback-fixes, 2026-09-06) | `labels` props on math-block/mermaid; absent = shipped English verbatim |
| registry docs speak the consumer import dialect (registry spec) | docs strings show `$lib/…`; `@lib/@ui` stay TARGET vocabulary |
| registryDependencies mirror actual imports (registry spec + the deps ratchet) | §0's edge list is exhaustive; ledger unchanged |
| the CSS placement/canopy laws (css-architecture) | folder sheets carry the canonical `@layer theme, base, components, utilities;` prologue + timestamped intent comment; `:where()` paint; `data-jx-*` hooks; inline surface adds NO empty css file |
| press physics + reduced-motion (component-authoring contracts) | copy/zoom controls ride `.jx-press`; the mermaid fade-in dies under the media query |

## 8. Testing strategy

- katex: REAL engine in vitest (small, sync, isomorphic) — specs
  assert `.katex` markup, MathML presence, displayMode differences,
  error paint, macro passthrough, option-override precedence. CSS
  imports are inert under vitest (`css: false` stubbing — the
  code-card precedent ships `import './code-card.css'` and its spec
  runs).
- color-utils: parseColor extension unit tests — rgb()/rgba() in
  comma + space/slash serializations, alpha DISCARD with concrete
  pairs (`rgba(255, 0, 0, 0.5)` → `#ff0000`, `rgb(1 2 3 / 0.25)` →
  `#010203` — discarded, never premultiplied), round-trips against
  known pairs.
- mermaid-engine extras: the safe-hex fallback table asserted per
  theme (a probe returning garbage degrades to the documented hex, not
  a raw string); the queue-recovery test (a rejected render — parse
  error — followed by a valid render still succeeds; the chain never
  carries the poison); the fingerprint test (same theme mode, changed
  token value → initialize re-runs); the themeRoot tests (two
  containers carrying different scoped tokens render from THEIR own
  values, never the page root's); the explicit-pin tests (light root +
  `theme="dark"` and dark root + `theme="light"` — the initialize
  payload's colors come from the target sheet, read through the local
  wrapper, global root untouched); the a11y empty-string tests
  (`name="   "` and `labels={{ diagram: '' }}` both fall to the
  shipped 'Diagram').
- mermaid: the engine module is `vi.mock`-ed (a ~1MB ESM engine with a
  DOM-bound renderer is not a jsdom citizen) — specs assert the
  CONTRACT: initialize args (startOnLoad:false, theme 'base', derived
  hex variables, protected-field survival under adversarial config),
  the lazy singleton (one import), the probe pipeline (parseColor
  called on resolved strings; safe-hex fallback on null; probe inside
  the passed root), the serial queue (concurrent different-theme
  renders serialize; fingerprint skips redundant initialize), the
  render-id contract (two instances / same name / consecutive
  re-renders → distinct ids), theme re-derive on class flip,
  generation discipline (late resolution no-ops), error normalization,
  floor survival.
- Surfaces: rest-attribute passthrough, a11y assertions (copy button
  discoverable under math-block's figure; role placement), stamp
  machine four-state verdicts + content-growth restamp, the mermaid
  no-chrome negative test, min-height reserve, zoom transform without
  engine calls.
- Real mermaid rendering: the vision lane (browser screenshots, light
  + dark) PLUS a dedicated, gate-able browser probe —
  **`scripts/verify-katex-mermaid.mjs`** (NEW, standalone — the
  verify-surface.mjs bootstrap verbatim: playwright-core, the newest
  ms-playwright chromium cache then system Chrome, `--url` defaulting
  to `http://localhost:5199` against a running `pnpm dev`). The probe:
  1. open `/docs/components/mermaid.html`, wait for
     `[data-jx-mermaid] svg` — the page mounts TWO instances;
  2. assert both SVGs exist and their ids are DISTINCT (the id
     collision contract, live);
  3. `documentElement.classList.add('dark')` → wait for the re-render
     (`data-state="rendered"` stable) → assert a baked `fill` attribute
     on a themed node CHANGED between the two snapshots;
  4. open `/docs/components/math-block.html` → assert `.katex` markup
     AND the hidden MathML (`math` element) exist in the served DOM,
     and the run carries a `data-jx-scroll-state` verdict after the
     stamp arms (or `none` when the formula fits);
  5. exit non-zero on any miss with the failing selector in the
     message. Registered as `verify:km` in the root package.json and
     appended to the verify-all chain as the NEW final step, AFTER the
     existing tail `verify:shadcn-add` (verify:surface is NOT in the
     composite chain today — only its bootstrap pattern is reused
     here; verify:km joins the chain, verify:surface stays a
     standalone gate).

   **Server lifecycle ownership (B12) + the exclusive endpoint (B15):**
   standalone `npm run verify:km` keeps verify-surface's contract (the
   caller provides the server via `--url`, default :5199 dev). INSIDE
   the composite chain, `verify-all` owns the lifecycle EXCLUSIVELY:
   it starts a MANAGED STATIC server over `apps/www/dist` (a tiny node
   http static file server — no new dependency) bound to
   **127.0.0.1 on an OS-assigned port** (`listen(0)` → the child's
   real `address().port`); readiness poll AND the probe use ONLY the
   resulting throwaway URL (`--url http://127.0.0.1:<assigned>`). A
   dev server squatting on :5199 can never be mistaken for the
   composite's artifact — the probe provably hits its own child. The
   child is reaped on success, failure, AND SIGINT (no residue).
   Adversarial tests: with :5199 pre-occupied the composite still
   serves-and-probes its own static child; after all three exit
   paths no child process remains. Release gates stay decoupled from
   dev/HMR ports while the standalone default survives.
- End-to-end out-of-the-box: `scripts/verify-shadcn-add.mjs` gains
  CASES entries for math-block + mermaid — each case: install from the
  built payloads into a real fixture, assert `katex`/`mermaid` land in
  the consumer's package.json AND the consumer's vite build resolves
  the katex css font URLs (the fonts-ride-the-package receipt).

## 9. Risks

- mermaid v11 ESM + vitest → mock strategy above; the REAL import
  path stays exercised by the browser probe and the consumer case.
- Computed-color serialization variance across browsers (oklch(…) vs
  rgb(…) serialization of the same probe) — parseColor's extension
  covers both families; the safe-hex fallback bounds the rest (§3.1).
- registry/package.json byte-identity — both sides get identical dep
  entries; the manifest check catches drift. Lockfile updates
  (root + apps/www) land in the implementation commit as receipts.
- KaTeX SSR weight (~300KB min into route chunks) — acceptable: it
  loads only on routes mounting math; the alternative (floor+upgrade)
  buys nothing for a math-bearing page.
- Mermaid CLS — inherent (size unknowable pre-render); the
  floor-min token bounds the reserve; documented as accepted residual.

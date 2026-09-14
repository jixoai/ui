# Spike report — StyleX×Svelte feasibility lab (R3, lane L3)

> Execution of change 2026-09-13-stylex-kernel-research (Gate 1 PASS,
> protocol frozen). Three spikes under `spike/{minimal,coexist,ssg}/` on
> the pinned set (npm, exact versions, no ^). All timings on the
> execution machine (darwin 25.5.0 arm64, node v24.21.0, npm 11.19.0).
> Verdict vocabulary follows the manifests: PASS / FAIL / SOFT-FAIL /
> LIMITATION. Nothing was smoothed: every FAIL below carries its real
> measured value and root cause.

## 0. Verdict roll-up

| gate | roll-up |
|---|---|
| **D1** | **16 of 17 measured rows PASS** on Chromium; Firefox smoke = LIMITATION (engine not installed). No D1 row FAILs. D1-10(dev) PASSES on spike/ssg; a separate coexist-dev hazard (stylex layers inscribed before TW base on the dev virtual-css path) is recorded as evidence, not as a D1 verdict (see §5.4). |
| **D2** | **13 of 15 rows PASS; 2 core rows FAIL under the frozen protocol** (D2-01, D2-03 — one shared root cause: unplugin 0.19.0 appends stylex CSS after TW's utilities block, so `after:['utilities']` cannot deliver "consumer utility WINS" without hoisting the layer statement above the import). The O1-H diagnostic build PROVES the remedy restores both rows to the manifest's expected literals. Per the manifest's failure semantics (core rows mandatory), **D2 = FAIL as-run; D2 = all-green under the one-line hoist remedy** — Owner decision required (ledger entry). |

## 1. Fixtures — D1 (all values verbatim from probe output)

Run matrix: Chromium (system Chrome `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
discovered via the CHROME_PATH→playwright-cache→system chain) and WebKit
(playwright cache `webkit-2336`, resolved by playwright-core 1.62.1).

| id | mode | measured | expected | verdict | evidence (command → output line) |
|---|---|---|---|---|---|
| D1-01 | dev | style tag after 391ms (webkit 276ms); bg `rgb(18, 52, 86)` | tag ≤2s ∧ bg==authored | **PASS** | `node scripts/probe-dev.mjs` → `PASS D1-01 — style[data-stylex] seen after 391ms … computed bg=rgb(18, 52, 86)` |
| D1-02 | dev | #00aa33→#00bb44 in 103ms; nav entries 1→1 | ≤3s ∧ no full reload | **PASS** | `PASS D1-02 — … observed after 103ms … navigation entries before=1 after=1` |
| D1-03 dev | dev | style_ready 83.6ms ≤ FCP 96.0ms (gap −12.4ms) | style_ready ≤ FCP | **PASS** | `PASS D1-03(dev) — style_ready=83.6ms FCP_start=96.0ms gap=-12.4ms; navStart=0 observerInstall=16.5ms readyState@install=loading … settledBg=rgb(18, 52, 86)` |
| D1-03 prod | prod | style_ready 32.6ms ≤ FCP 68.0ms (gap −35.4ms) | ≤ FCP | **PASS** | `node scripts/probe-prod.mjs` → `PASS D1-03(prod) — style_ready(max responseEnd)=32.6ms FCP_start=68.0ms … links=[index-bk206ZBc.css=32.6]` |
| D1-04 | prod (ssg) | html class `x1jqbvbq x1r1tdag x1tamke2 x14vqqas` ⊇ built-CSS constant `x1jqbvbq` | string-equal member | **PASS** | `npm run probe` (ssg) → `PASS D1-04 — built CSS rule class=x1jqbvbq; prerendered class attr="x1jqbvbq …" (string-equal member check=true)` |
| D1-05 | prod (ssg) | computed `rgb(18, 52, 86)`; link bytes contain 4/4 atomic classes | both | **PASS** | `PASS D1-05 — … link bytes contain 4/4 atomic classes` |
| D1-06 dev | dev+prod | console clean (only vite connect debug); `data-style-src="…+page.svelte:32"` present post-hydrate, both modes | zero /hydrat\|mismatch/i ∧ attr | **PASS** (dev on minimal AND ssg; prod on ssg) | `PASS D1-06(dev) … PASS D1-06(prod) — console=[] pageErrors=[] data-style-src(after hydrate)="stylex-spike-ssg:src/routes/+page.svelte:32"` |
| D1-07 | prod,no-JS (ssg) | `rgb(18, 52, 86)` with `javaScriptEnabled:false` | computed==authored | **PASS** | `PASS D1-07 — javascriptEnabled:false computed=rgb(18, 52, 86)` |
| D1-08 | dev+prod | width 120→220px (minimal, inline `--x-width` custom property); 160→320px (ssg /dynamic, `style="--x-width: 320px;"`) | follows both states; mechanism recorded | **PASS** | `PASS D1-08(dev) — width 120px→220px; mechanism=inline style; style attr "--x-width: 120px;"→"--x-width: 220px;"` + `PASS D1-08(prod)` |
| D1-09 | dev+prod | hover `#0b0b0b`→`rgb(255,204,0)`; animationName `xqng64z-B`; currentTime advances; dev≡prod values equal | all four | **PASS** | `PASS D1-09(dev) … PASS D1-09(prod) — … dev≡prod=true` |
| D1-10 | dev+prod | prod (coexist O1): color `oklch(0.7044 0.1872 326)`→`oklch(0.6489 0.237 330)` ∧ padding `16px→12px` in the SAME rAF batch, restore-equal; dev (ssg): `rgb(124,92,255)→rgb(90,63,214)` ∧ `12px→16px` same-frame | color follows dark ∧ spacing follows density, same batch | **PASS** | `node scripts/probe-d2.mjs` → `PASS D1-10(prod) — same-frame batch … changed=true; restore-equal=true`; `npm run probe` (ssg) → `PASS D1-10(dev) — … changed=true` |
| D1-11 | prod (rm/fc/print) | rm: animationName→`none`; fc: `appearance:auto` ∧ `background-image:none`, control-parity true; print: display `none` / overflow `visible` / maxH `none` | all three | **PASS** | `PASS D1-11(prod) — reduced-motion: animationName→none; forced-colors: appearance=auto bg-image="none" (control parity true); print: display=none overflow=visible maxH=none` |
| D1-12 | build | typo'd token → svelte-check exit 1 naming `--probe-bgg` ("Did you mean '--probe-bg'?"); clean project exit 0 | compile FAILS naming the token; valid compiles clean | **PASS** | `node scripts/probe-check.mjs` → `PASS D1-12 — clean exit=0; typo exit=1; output names the token: true` (error text: `Property '--probe-bgg' does not exist on type 'Readonly<{ readonly '--probe-bg': StyleXVar<string>; …}>'`) |
| D1-13 | matrix | Chromium: all rows above green (minimal 6/6+5/5, ssg 9/9, coexist 16/18→D2 rows). WebKit: minimal 6/6, ssg 9/9 — superset of the smoke subset {D1-01,04,05,09} green. Firefox: **LIMITATION** — engine not installed on this machine. Verbatim error: `browserType.launch: Executable doesn't exist at /Users/kzf/Library/Caches/ms-playwright/firefox-1538/firefox/Nightly.app/Contents/MacOS/firefox` (no `firefox-*` in the playwright cache; no `/Applications/Firefox.app`) | Chromium all green; WebKit/Firefox subset green or LIMITATION | **PASS (Chromium+WebKit) / LIMITATION (Firefox)** |

D1-03 callback-delay note (manifest asks it recorded): the
MutationObserver callback timestamp is an upper bound; insertions were
observed at 83.6ms (dev) against an observer installed at 16.5ms with
`document.readyState === 'loading'` — i.e. installed pre-parse as
required. The D1-03 probe learned one implementation fact: at
`addInitScript` time `document.documentElement` can be null — the
observer must attach to `document.documentElement || document` (a null
target throws silently inside the init script and the fixture would
false-FAIL with "style_ready never observed").

## 2. Fixtures — D2 (coexist; O1 = after:['utilities'], O2 = before:['utilities'], control = TW-only)

Control baseline (recorded): `P_tw`(D2-07)=`20px 20px`; real-theme
`--jx-inset`(D2-02s)=`12px 12px`; red-500 = `oklch(0.637 0.237 25.331)`
(= #ef4444; Chromium 2026 serializes computed oklch as-authored — the
manifest's `rgb(239, 68, 68)` literal is the same color in srgb); dark
`--primary` = `oklch(0.7044 0.1872 326)` (brand-hue 330 − 4); lg padding
= `16px 16px`; print sim color = `rgba(0, 0, 0, 0)`.

| id | builds | measured (O1 / O2) | expected | verdict |
|---|---|---|---|---|
| D2-01 core-i | O1; O2-INV | **O1 `12px 12px`** / O2 `12px 12px`; O1-H `42px 42px` ✓ | O1 `42px 42px` (utility WINS); O2-INV `12px 12px` | **FAIL (O1)** / PASS (O2-INV) — conflict §5.1 |
| D2-02 core-ii | O1; O2 | `8px 12px` / `8px 12px`; SECONDARY real-theme literal O1=`12px 12px` = control (equality true) | `8px 12px` both; secondary equality | **PASS** |
| D2-03 core-iii | O1; O2 | checked `rgb(255, 0, 0)` / `rgb(255, 0, 0)` ✓; unchecked+bg-red-500 **O1 `rgb(17, 17, 17)`** (stylex #111 wins) vs control `oklch(0.637 0.237 25.331)`; O1-H restores control value ✓ | checked red; unchecked = control (= red-500) | **FAIL (unchecked sub-assertion)** — same root cause §5.1 |
| D2-04 core-iv | O1; O2 | screen `flex`/`auto`/`512px`; print `none`/`visible`/`none` (O2 identical) | as measured | **PASS** |
| D2-05 negative-v | O1 | `8px 12px` | `8px 12px` (consumer LOSES) | **PASS** |
| D2-06 !important | O1 | `42px 42px` | `42px` | **PASS** |
| D2-07 same-layer order | O1 | O1 `20px 20px` === P_tw `20px 20px` (non-initial) | control equality | **PASS** |
| D2-08 inline channel | O1; O2 | in `blur(14px)` / out `blur(10px)` both builds | 14px / 10px | **PASS** |
| D2-09 custom-prop precedence | O1 | outside `rgb(0, 0, 255)`; scoped `rgb(0, 255, 0)` | #0000ff / #00ff00 | **PASS** |
| D2-10 dark+density | O1 | color O1===control `oklch(0.7044 0.1872 326)`; padding O1===control `16px 16px`; both CHANGE from light/base (`oklch(0.6489 0.237 330)` / `12px 12px`) | control equality ∧ change | **PASS** |
| D2-11 reduced-motion | O1 | screen `pulse`; rm `none` | pulse→none | **PASS** |
| D2-12 forced-colors | O1 | coexist `appearance:auto` ∧ `background-image:none`; control identical (parity true) | frozen pair + parity | **PASS** |
| D2-13 print-sim exclusion | O1 | screen `rgb(18, 52, 86)`; print `rgba(0, 0, 0, 0)` ≠ sim ∧ === control print | as measured | **PASS** |
| D2-14 surface-kernel | O1; O2 | primary `::after` content `none`; shadow `mask-image: none` (var fallback under `@supports (anchor-name:…)`); :where variant content `""` (law paint survives — LOSES as designed); O2 primary `none` | content none; mask none; :where loses | **PASS** |
| D2-15 terminal-header | O1 | `--jx-panel-pad` `.25rem`→4px; mega `.375rem`→6px; `--jx-pop-pad`/`-inline` 4px; computed `position-area` = `span-right bottom` (normalized `bottom span-right`; beats the inline `bottom span-left` via the enumerated `!important`); `::backdrop` `rgba(0, 0, 0, 0)` | 4px/6px/4px/4px; bottom span-right; transparent | **PASS** |

Serialization notes (recorded for the ledger): custom properties
serialize as authored (`.25rem`) — normalized at the 16px root;
`position-area` serializes token-sorted (`span-right bottom`);
TW4.3.3's red-500 computes as `oklch(0.637 0.237 25.331)`, identical
in coexist and control (the row's binding criterion).

### Emitted layer statements (the @import-first probe, per the manifest)

```
dist-o1  (frozen order):  @layer components; … @layer utilities;   (stylex BLOCKS after TW's)
dist-o2  (frozen order):  @layer utilities; … (stylex BLOCKS after TW's)
dist-o1h (hoisted head):  @layer properties, theme, base, components, stylex.priority1, stylex.priority2, stylex.priority3, utilities;
```

Engine-read layer order (O1, frozen): `properties, theme, base,
components, utilities, stylex.priority1..3` — stylex LAST regardless
of the O1/O2 statement, because TW's own utilities block physically
precedes the appended stylex CSS and first-mention wins. Under O1-H
the hoisted statement inscribes `stylex.p1..3` before `utilities` →
utilities last → utility wins (D2-01 `42px`) with TW internals intact.

## 3. Toolchain choices (full configs, verbatim)

### 3.1 spike/minimal `vite.config.ts`

```ts
export default defineConfig(({ command }) => ({
  plugins: [
    svelte(),
    {
      ...stylex.vite({
        debug: true,
        propertyValidationMode: 'throw',
        dev: command === 'serve',
        runtimeInjection: command === 'serve',
        unstable_moduleResolution: { type: 'commonJS', rootDir: process.cwd() },
      }),
      enforce: undefined,
    },
  ],
}));
```

### 3.2 spike/coexist `vite.config.ts` (essence)

```ts
const layer = process.env.STYLEX_LAYER || 'after'; // after | before | off
const stylexPlugin = layer === 'off' ? [] : [{
  ...stylex.vite({
    debug: true,
    propertyValidationMode: 'throw',
    dev: false, // all D2 builds are production builds
    useCSSLayers: layer === 'after'
      ? { prefix: 'stylex', after: ['utilities'] }
      : { prefix: 'stylex', before: ['utilities'] },
    unstable_moduleResolution: { type: 'commonJS', rootDir: process.cwd() },
  }),
  enforce: undefined,
}];
export default defineConfig({
  plugins: [tailwindcss(), svelte(), ...stylexPlugin],
  build: { rollupOptions: { input: layer === 'off' ? { control: 'control.html' } : { index: 'index.html' } } },
});
```

### 3.3 spike/ssg `vite.config.ts` (essence — official example pattern)

```ts
export default defineConfig(({ command }) => ({
  plugins: [
    sveltekit(),
    {
      ...stylex.vite({
        debug: true,
        propertyValidationMode: 'throw',
        dev: command === 'serve',
        runtimeInjection: command === 'serve',
        unstable_moduleResolution: { type: 'commonJS', rootDir: process.cwd() },
      }),
      enforce: undefined,
    },
  ],
}));
```

Non-obvious choices, each load-bearing:

- **`enforce: undefined` spread** — the unplugin hardcodes
  `enforce: 'pre'`, which would babel-parse RAW `.svelte` source. This
  is the official example-sveltekit trick (docs' SvelteKit page).
- **`dev`/`runtimeInjection` explicit on `command === 'serve'`** — the
  unplugin defaults `dev` from `process.env.NODE_ENV`, which vite
  never sets. `runtimeInjection` is what produces the
  `<style data-stylex>` element (D1-01/D1-03's probe target); the
  0.19.0 default dev path instead fetches `/virtual:stylex.css` into a
  plain `<style id="__stylex_virtual__">`.
- **`propertyValidationMode: 'throw'`** — 0.19.0's default `'silent'`
  DROPS unsupported shorthands with zero diagnostics (§5.3).
- **A CSS entry (`src/app.css`) exists in minimal and ssg** — without
  one, the unplugin writes `dist/assets/stylex.css` but nothing links
  it (§5.2).
- **Relative imports for `.stylex.ts` files in ssg** — `$lib/…` breaks
  the babel-plugin's module resolution (verbatim:
  `SyntaxError: … Could not resolve the path to the imported file.`).

## 4. Version-lock receipts (`npm ls`, key packages)

```
minimal:  svelte@5.57.0  vite@8.3.0  @stylexjs/stylex@0.19.0
          @stylexjs/unplugin@0.19.0  @stylexjs/babel-plugin@0.19.0
          @sveltejs/vite-plugin-svelte@7.3.0  playwright-core@1.62.1
coexist:  (all of the above) + tailwindcss@4.3.3  @tailwindcss/vite@4.3.3
ssg:      svelte@5.57.0  @sveltejs/kit@2.70.3  @sveltejs/adapter-static@3.0.10
          vite@8.3.0  @stylexjs/{stylex,unplugin,babel-plugin}@0.19.0
          @sveltejs/vite-plugin-svelte@7.3.0 (peer-compat: kit peers vite ^8.0.0; vps 7.3.0 peers vite ^8.0.0 ∧ svelte ^5.46.4)
```

Supporting pins not fixed by the manifest (chosen for Vite-8
compatibility, recorded): `@sveltejs/vite-plugin-svelte 7.3.0`,
`@sveltejs/adapter-static 3.0.10`, `svelte-check 4.7.6`,
`typescript 5.9.3`, `playwright-core 1.62.1`. Byte-copy receipts for
app.css: `bash scripts/sync-app-css.sh` prints per-range sha256
(jx-pure:265-280 `1052505b…`, jx-pure:2255-2269 `19797b31…`, full set
in the script output; kernel-print:228-240 `3571a505…`).

## 5. Key findings (the surprises that matter)

### 5.1 THE D2 conflict: `after:['utilities']` cannot win under the frozen import order

Unplugin 0.19.0 appends collected stylex CSS to the END of the vite
CSS asset. TW's own `utilities` block is therefore always physically
FIRST, and CSS layer order follows FIRST MENTION — so the stylex
layers end up LAST and stylex beats utilities in BOTH O1 and O2
(D2-01 O1 measured `12px 12px`, expected `42px 42px`; D2-03's
unchecked consumer sub-assertion measured the stylex rail `rgb(17,17,17)`
instead of red-500). The O2 build is INDISTINGUISHABLE from O1 (the
O2-INV row passes, but only because the frozen-order value coincides
with the declared inversion). **Remedy (proven, dist-o1h):** hoist
`@layer properties, theme, base, components, stylex.priority1..3,
utilities;` above `@import 'tailwindcss'` (CSS-legal: @layer
statements may precede @import). O1-H then measures `42px 42px`,
restores D2-03's unchecked value to control-equal red-500, changes
NOTHING else (D2-02/04..15 all still green in that build), and keeps
TW's internal layer order intact. This is a one-line app.css change —
but it CONTRADICTS the manifest's frozen "tailwindcss → token vars →
layer statement" order, so the contract modification belongs to the
Owner (ledger entry required either way).

### 5.2 Vite 8 + unplugin 0.19: no-CSS-entry builds silently unstyled

With zero CSS imports (a pure-stylex app), the unplugin's writeBundle
fallback writes `dist/assets/stylex.css` but the emitted index.html
has NO stylesheet link — the prod page renders unstyled. Any adoption
MUST provide a CSS entry (even comments-only) for the unplugin to
append into the hashed, linked asset. Confirmed on vite 8.3.0
(rolldown-backed).

### 5.3 babel-plugin 0.19.0 silently drops `background`/`border` shorthands

`stylex.create({ x: { background: '#00aa33' } })` produces NO rule, NO
class, NO warning under the default `propertyValidationMode: 'silent'`
(expansion throws → swallowed → `[]`). `margin`/`padding` shorthands
work; `background`/`border`/`font`/`animation`-family
shorthandsOfShorthands do not. With `'throw'`:
`background is not supported. Use background-color, border-image etc.
instead.` Kernel consequence: our token-paint migration surface
(`background: var(--primary)`) MUST be authored longhand, and the
throw mode should be mandatory in any integration preset.

### 5.4 Dev-mode cascade divergence (coexist dev ≠ prod)

On the coexist dev server, the `/virtual:stylex.css` runtime injects
its style tag BEFORE vite injects the app.css tag → the stylex layer
statement inscribes stylex tiers BEFORE TW's `base` → TW preflight
(`*{margin:0;padding:0}`) beats the stylex layers → K padding
collapses to `0px` in dev while prod computes `16px` (D1-10(dev) FAILs
on coexist: `padding 0px 0px→0px 0px, changed=false`). spike/ssg's dev
uses `runtimeInjection` (unlayered dev rules) and does NOT hit this
(D1-10(dev) PASSES there). Any coexistence integration must pick a dev
strategy deliberately; "virtual css + layers" is prod-correct but
dev-broken on this pinned set.

### 5.5 SSG is genuinely solid (the L1 §5 predictions all confirmed)

- Prerendered HTML carries compile-time class constants + debug
  `data-style-src` (D1-04/06 strings in the report tables).
- Dynamic values prerender as `style="--x-width:160px"` + default
  classes (`build/dynamic.html` verbatim:
  `<div class="x10w6t97 x193xjwf x1f7m26b x5lhr3w" style="--x-width:160px" …>`),
  hydrate to live updates (160→320px), zero console errors — exactly
  the predicted styleq+inline degradation, SSG-safe.
- Render-blocking link beats FCP by 35–53ms margins (local server).
- no-JS renders correctly (stylesheet-only).
- Prerender cannot read `url.searchParams` (SvelteKit throws at
  prerender time) — theme/density toggles must be client state.

### 5.6 Svelte-5-specific authoring facts (would tax the migration)

- **Svelte does not merge static `class` with a spread class** — the
  later one REPLACES. Every TW+stylex mixed element needs an explicit
  merge helper (`mix()` in coexist's App.svelte); getting this wrong
  fails SILENTLY (our first D2-01 run measured the utility winning
  because the stylex classes had vanished).
- **`createTheme` yields a CompiledStyles OBJECT** — `class={theme}`
  stringifies to `"x1om9e5g $$css"` and the override never applies;
  it must go through `stylex.attrs(themeObj)`.
- **The typed dynamic idiom is the style FACTORY**
  (`stylex.create({ dyn: (w) => ({ width: `${w}px` }) })`) — a plain
  runtime object as `attrs`' 2nd arg compiles at module scope and
  fails types (`InlineStyles` is opaque). The factory compiles to a
  CSS custom property (`--x-width`) + inline style — nice degradation,
  but different from React docs' mental model of inline styles.
- **`$lib/…` aliases break the babel transform's module resolution**
  (token files must use relative imports).

### 5.7 Performance data points (single-machine, indicative only)

- Build times (this machine): minimal 136–182ms; coexist control/o1/o2
  104–246ms; ssg full (ssr+client+prerender) 1.51s — the babel
  transform cost on these toy graphs is negligible; www-scale numbers
  remain D3's job.
- Prod CSS sizes: minimal 962B (stylex rules+keyframes for 6 elements);
  coexist 24.79KB (vs control 23.83KB → stylex adds ~0.96KB for the
  fixture paints); ssg 2917B shared by both routes.
- ssg JS: 84.9KB total across 10 files on `/` (SvelteKit runtime
  dominates; styleq runtime included).

## 6. Process-recycle evidence

All servers were spawned `detached: true` and recycled by killing the
process GROUP (`kill(-pid, SIGTERM)` → verify `kill(pid, 0)` → SIGKILL
if alive). Every probe prints its recycle line; collected:

| run | pid | evidence line |
|---|---|---|
| minimal probe:dev | 80024 | `dev server pid=80024 recycled (alive after SIGTERM: false, group: false)` |
| minimal probe:prod | 82544 | `preview server pid=82544 recycled (alive after SIGTERM: false, group: false)` |
| coexist probe:d2 | — | serves via in-process http servers, `served.close()` awaited per build |
| coexist probe-d1-dev | 33799 | `recycled (alive after SIGTERM: false, group: false)` |
| ssg probe | 51904 | `dev server pid=51904 recycled (alive after SIGTERM: false, group: false)` |
| webkit minimal run | 52618 | `recycled (alive after SIGTERM: false, group: false)` |
| webkit ssg run | 53205 | `recycled (alive after SIGTERM: false, group: false)` |
| firefox attempt | 53700 | recycled via finally block (probe aborted at engine launch) |

Post-run sweep: `lsof -ti :5291..:5296` → empty; `ps aux | grep
spike/{minimal,coexist,ssg}` → empty. Zero orphans.

## 7. Friction log (brief/contract ambiguities and my resolutions)

1. **D2-01's O1 expectation vs the frozen app.css order** (§5.1) — the
   manifest simultaneously freezes "tailwindcss → token vars → layer
   statement" AND expects O1's consumer-utility to win. On the pinned
   unplugin these are incompatible. Resolution: kept the frozen build
   as the verdict-bearing O1 (FAIL recorded), added dist-o1h as a
   clearly-labeled DIAGNOSTIC proving the one-line remedy, changed no
   contract text. Owner call.
2. **D2-03's "builds: O1; O2" without an O2-INV marker** — on O2 the
   unchecked consumer sub-assertion inverts BY DESIGN (that is what a
   misconfig means). Resolution: O1 carries the PASS assertion; the O2
   value is recorded as "O2-observed (misconfig damage)" and NOT
   failed, matching the manifest's "the EXPECTED inversion is the
   assertion" doctrine for detectability rows.
3. **D2-02 secondary scope** — "real jixoai.css token blocks imported"
   would collide with the synthetic `:root` env if imported
   unscoped. Resolution: the byte-copied density-default block is
   INERT at :root (its `:where` loses to the synthetic `:root` by
   specificity) and activated per-subtree via a
   `[data-density='default']` wrapper — no selector rewriting, the
   synthetic env stands globally as frozen.
4. **D2-04 print whitelist has no file anchor** and the repo sheet
   (kernel-print.css) is loaded as `media=print` by the pipeline.
   Resolution: byte-copied rules 228–240 PROJECTED into
   `@media print { … }` in app.css; projection noted here and in the
   sync script.
5. **D2-14 :where micro-fixture impossibility** — the REAL override
   `.jx-tip.jx-surface::after` matches every such element, so a
   ":where-wrapped same override" element can never face ONLY the law.
   Resolution: the micro element uses marker `jx-tipx` (same override
   PATTERN, `:where(.jx-tipx.jx-surface)::after`), isolating law
   (0,1,1) vs :where-kill (0,0,1). Mechanism preserved verbatim;
   rename disclosed.
6. **Computed-value serialization** — Chromium 2026 keeps oklch()
   colors as-authored and serializes `position-area` token-sorted;
   custom properties serialize as authored rem. Resolution: kept raw
   values in the receipts, normalized ONLY for comparison (with the
   normalization printed); control-equality criteria are unaffected.
7. **`style[data-stylex]` premise** (D1-01/03) — unplugin 0.19.0's
   default dev path no longer produces that element. Resolution:
   `runtimeInjection: true` on the dev command (a documented
   babel-plugin option, the mechanism L1 §2 described). Not a contract
   change — the fixture's mechanism is honored exactly; the default
   behavior change is recorded (§3 choices).
8. **Brief's scripts/verify-km.mjs reference** — that file does not
   exist in this worktree; the pattern was taken from
   `scripts/verify-katex-mermaid.mjs` (same repo, same
   browser-discovery + probe conventions).
9. **D1-13 Firefox** — no engine on the machine; LIMITATION recorded
   with the verbatim launch error rather than attempting an install
   (would mutate the machine's playwright cache; OWNER can run
   `npx playwright install firefox` and re-run
   `ENGINE=firefox node scripts/probe-dev.mjs` to close the row).

## 8. Re-run map (exact commands)

```bash
# minimal
cd spike/minimal && npm install
node scripts/probe-dev.mjs && npm run build && node scripts/probe-prod.mjs && node scripts/probe-check.mjs
# coexist (builds serial; ~1s total)
cd ../coexist && npm install && npm run build:all && npm run build:o1h
node scripts/probe-d2.mjs && node scripts/probe-d1-dev.mjs
# ssg
cd ../ssg && npm install && npm run prepare && npm run build && npm run probe
# engines
ENGINE=webkit node scripts/probe-dev.mjs   (etc. per spike)
```

---

## §7 Correction — the D1 roll-up unification (Gate-2 r1 blocker 1, 2026-09-13, append-only)

This report was written BEFORE the L3b corpus run closed Firefox. Two
stale statements above (§0's "Firefox=LIMITATION" and the D1-13 row)
are superseded by research/corpus-report.md §6: the Firefox engine
was installed and the D1-13 smoke subset {01,04,05,09} measured
ALL-PASS (minimal dev 6/6, prod 5/5; ssg 9/9 incidentally green) —
raw outputs live in corpus-report.md.

**The unified D1 roll-up**: 13/13 fixtures PASS across Chromium
(full), WebKit (full), Firefox (smoke subset per the manifest —
D1-13's design). Row-count language: "13/13 fixtures" is the
manifest-unit count; "16/17 measured rows" elsewhere counts dev/prod
split-rows of D1-03 — the manifest's 13 is the contractual unit.
decision.md cites THIS section for the three-engine claim.

## §8 NODE_ENV footnote (Gate-2 r1 B-item)

§3's note "vite does not set NODE_ENV" is imprecise: what the L3c
stub falsified is vite 8's CONFIG-HOOK injection (`config()` hook
mutating mode for plugin consumers does not reach unplugin's
dev/prod branch); the vite CLI itself DOES set process.env.NODE_ENV
= production|development on `vite build`|`vite dev` at the pinned
versions (stub-verified). Both facts stand; they answer different
questions.

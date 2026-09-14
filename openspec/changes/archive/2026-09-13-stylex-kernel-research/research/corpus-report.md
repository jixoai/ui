# Corpus report — the frozen 8-family StyleX re-authoring (L3b, R3)

> Execution of change 2026-09-13-stylex-kernel-research, task R3
> `spike/corpus`. The frozen families (design §3 L3): press-button,
> range, popover, icon, code-card, prose, switch, separator. All
> authored + verified on the D1 VERSION PIN SET (svelte 5.57.0 ·
> vite 8.3.0 · @stylexjs/{stylex,unplugin,babel-plugin} 0.19.0; npm ls
> receipt in §7). Chromium verification: **43/43 assertions PASS**
> (screenshots pass the black-image non-triviality gate — programmatic
> PNG decode, zero vision-model judgment in the loop). Firefox
> closure: D1-13's smoke subset {D1-01,04,05,09} **all PASS — the
> LIMITATION is upgraded** (§6). Nothing smoothed: every FAIL
> encountered on the way to 43/43 is documented in §5 with its root
> cause; two engine-level findings (range cq coercion, popover
> span-right semantics) are recorded as PRODUCTION-relevant
> observations, not spike defects.

## 1. Engineering choice — pure vite+svelte, not SvelteKit

The corpus measures AUTHORING ergonomics (D5), not delivery: SSR/
prerender/no-JS/hydration facts are spike/ssg's job (all PASS there,
L3a). A hash-routed SPA (one entry, one mount, 8 route pages
`#/press-button` … `#/separator`) keeps the dependency surface at
exactly minimal's proven set — zero kit, zero adapter — and the
toolchain config is BYTE-EQUIVALENT to spike/minimal's (enforce:
undefined spread, dev/runtimeInjection on serve,
propertyValidationMode 'throw', debug both modes, mandatory CSS
entry). L3a conclusions are REUSED, not re-derived.

Token environment: `src/theme.css` carries a byte-copied SUBSET of
jixoai.css (:root/.dark colors, shadow+press-pose+engrave tokens,
density scale rungs sm/default/lg + `:where([data-density])` alias
blocks). StyleX styles consume `var()` refs — the same architecture
as the real theme sheet, so families read REAL tokens.

## 2. Roll-up — verdicts and the LOC ledger

Per-family verdict vocabulary: **intent-equivalent** (the frozen
visual intent carried: variant table / density / state machine / law
coupling), plus the PRICE paid (css residue share, workaround lanes).

| family | verdict | price / notes |
|---|---|---|
| press-button | **intent-equivalent** | 0 css residue; pose vars via defineVars+createTheme (the idiomatic `[--jx-press-*]` replacement); effects loop OUT of corpus scope |
| range | **intent-equivalent** (law mount carried) | css residue = the GENERATED law block (cq units on UA-shadow pseudos); scaffolding fully StyleX |
| popover | **intent-equivalent** | css residue = anchor geometry + :has caret flip; native Popover API + inline anchor wiring kept; WAAPI kernel out of scope |
| icon | **intent-equivalent** | 0 residue; factory idiom proven end-to-end (single-word keys) |
| code-card | **intent-equivalent** | css residue = --tok palette ONLY (ancestor-scoped .dark/.jx-light); card/head/foot/veils/print all StyleX; maxHeight/minHeight ride inline lane (see E8) |
| prose | **intent-equivalent** | css residue = descendant presence lanes + drop-cap @supports arms; host lane StyleX + inline declarations (the source's own two-channel law) |
| switch (toggle) | **intent-equivalent** | 0 residue; the WHOLE state machine (":checked::before" travel, :hover:not chains, :focus-visible, :disabled, reduced-motion) is StyleX-expressible |
| separator | **intent-equivalent** | 0 residue; the entire subtraction-ink law (backdrop contrast, masks incl. data-URI svg wave, blend difference) is string values to StyleX |

**LOC ledger** (original = registry family dir, all files; new =
corpus family dir: svelte + `.stylex.ts` + css residue; counts are
newline-split, `wc -l`-equivalent ±1/file):

| family | orig files/LOC | new files/LOC | Δ new-orig | split (svelte/stylex/css-residue) |
|---|---|---|---|---|
| press-button | 6 / 1620 | 2 / 416 | **−1204 (−74%)** | 171 / 245 / 0 |
| range | 5 / 823 | 3 / 409 | **−414 (−50%)** | 127 / 145 / 137 |
| popover | 4 / 458 | 3 / 266 | **−192 (−42%)** | 98 / 103 / 65 |
| icon | 3 / 189 | 2 / 85 | **−104 (−55%)** | 66 / 19 / 0 |
| code-card | 3 / 611 | 3 / 394 | **−217 (−35%)** | 140 / 198 / 56 |
| prose | 4 / 395 | 3 / 259 | **−136 (−34%)** | 139 / 57 / 63 |
| switch (toggle) | 3 / 101 | 2 / 136 | **+35 (+35%)** | 40 / 96 / 0 |
| separator | 4 / 281 | 2 / 184 | **−97 (−35%)** | 71 / 113 / 0 |
| **total** | **32 / 4478** | **20 / 2149** | **−2329 (−52%)** | 852 / 976 / 321 |

NOT an apples-to-apples equality: the originals carry machinery the
corpus deliberately scopes out (below). Counted scope deltas:

- press-button: −627 LOC of effect-loop runtime (press-effect-
  runtime.ts 557 + ripple.svelte.ts 70) and ~330 LOC of effect
  keyframes/@property css — attachment-channel machinery, out of the
  frozen carrier ("variant table + density + press-physics"). Also
  dropped: the ButtonGroup context lane (~90 LOC of comments+plumbing).
- range: −190 LOC wheel engine + ruler pointer-snap + form-reset sync
  + RangeTick context (behavior, not styling surface).
- popover: −204 LOC surface-motion WAAPI kernel (lib/surface-motion)
  + tryFallbacks/physical-placement custom candidates.
- code-card: highlight-backend pluggability (shiki/prism/microlighter
  + detection rings, ~230 LOC) — the plain sample is the corpus floor.
- prose: plugin chain + typography context pair (the knob RESOLUTION
  surface kept; the context provide/getter machinery scoped out).
- icon: the plugin-generated lazy chunk system (inline-core + {#await}
  + warnedChunks) — renderer + reserved box kept.

Where comparable surface IS 1:1 (switch, separator, prose host lane),
the StyleX side runs +34% (switch — the source's law lives in the
shared jixoai.css theme, the rewrite inlines it into the family) to
−35% (separator — the variant×orientation matrix hand-expands denser
in source comments+css than in one styles object). The honest
per-family ergonomics read: **StyleX re-authoring of jixoai's
component paints is LOC-competitive to favorable; the css residue is
bounded and lawful** (321 LOC across 4 families, every byte of it a
placement-law case: generated law mounts, anchor geometry, descendant
presence lanes, ancestor-scoped token lineage).

Demo harness (out of family ledger): App.svelte + 8 route pages +
demo chrome + theme.css = 678 LOC.

## 3. Per-family detail

### 3.1 press-button — the flagship
Carried: the five-rung ladder (fill/tonal/outline/ghost/link) with
per-rung forced-colors degradation; density geometry via --jx-hit/
--jx-inset/--jx-gap/--jx-text/--jx-line var refs; the press law
(hover grows only the shadow, :active presses +1px with the shadow's
counter-shrink — re-authored as `':hover'`/`':active'` pseudo blocks,
':active' sorts after ':hover' by StyleX's pseudo priority); the flat
texture axis incl. the :active::before corner-tint (dual-gradient +
mask exclude, fully expressible); hue injection as defineVars +
createTheme pair classes (destructive pair, success tonal) — the
idiomatic replacement for `[--jx-*:…]` arbitrary-property setters;
the loading lock + one-shot flash (spinner = stylex.keyframes with
visibility steps, per-frame animationDelay classes); square pose.
Differences vs original: effect loops absent (scope); the variant
table is a hand-rolled map (TW variant prefixes have no StyleX
equivalent — by design, the map IS the variant grammar).
Key assertions: variant paint divergence, hover shadow growth, active
translate 1px 1px, ghost none-pose, flat engrave var override,
density minHeight 40→48px, loading aria+spinner animationName.

### 3.2 range — the folder-css boundary proof
The GENERATED law mount ([data-jx-range], cq-unit geometry,
::−webkit/::−moz slider pseudos, .jx-invalid thumb) carried VERBATIM
in range.css; the scaffolding (label row, mono tabular readout, tick
ruler geometry + repeating-gradient marks + :dir(rtl) flip, error
line, vertical orientation) re-authored in StyleX. The source's
vertical-face DESCENDANT selectors (.jx-field[data-orient] ...) lift
into component conditionals — the state→class tax (E4).
**ENGINE FINDING (production-relevant)**: Chromium resolves cq units
inside UA-shadow slider pseudos with AXIS COERCION — the thumb's
`width: 100cqh` computes to the input's WIDTH, the ring border
(calc(100cqh/8)) collapses to 0 — bare-input repro in §5.4. The
production site carries the IDENTICAL law (jx-pure.css:1601-1660) on
the same engine and the www suite only REGEX-MATCHES the css text
(range.spec.ts) — the thumb ring is likely collapsed in production
Chromium too. Not a corpus defect; flagged for an owner probe.

### 3.3 popover — the floating-surface kernel
NativeHTML base kept: popover="auto" + popovertarget; CSS Anchor
Positioning inline (anchor-name sanitized from id, position-area)
with the @supports joint fallback + flip chain + ::backdrop + the
:has(::popover-open) caret flip in popover.css residue. Trigger
button (press law + muted hover), caret transition, surface
body/shadow/scroll-ring (acrylic 72%+blur/solid/auto with
prefers-reduced-transparency) re-authored in StyleX.
**ENGINE FINDING (production-relevant)**: the source maps
bottom-end → `bottom span-right`, whose engine semantics place the
panel from the anchor's LEFT edge spanning right (left-flush +
viewport clamp) — NOT the right-edges-flush its comment describes.
Identical rules in production; recorded verbatim.
WAAPI motion kernel out of scope (the panel rests at the open pose).

### 3.4 icon — the factory idiom's clean proof
currentColor-by-nature svg root, square size edge, round caps/joins,
the reserved box via the typed FACTORY (single-word keys width/
height) — markup-level `stylex.attrs(s.reserved, s.reservedSize(css))`
emits class + inline custom property end-to-end (style="--x-width:
20px" verified). The lazy-chunk system is out of corpus scope; the
demo pins a 4-glyph inline set (registry items are dependency-free).

### 3.5 code-card — print + scroll hooks
Card/head/foot paint, fill/vscroll conditional branches, the
subtraction-ink edge veils (::before/::after + backdrop contrast +
mask ramps, gated by scroll-state CONDITIONAL classes — the state→
class tax replacing [data-hscroll-*] attr selectors), focus rings,
'@media print' display/overflow — all StyleX. The --tok palette +
--readonly-code-* keep css: ANCESTOR-scoped lineage overrides
(.dark/.jx-light) are inexpressible (E6); the palette re-anchors on
data-kind="code" (Svelte cannot merge a literal class into a spread
class — E10). maxHeight/minHeight ride the INLINE lane (E8).

### 3.6 prose — the two-channel law restated
Host inheritance lane: static enums (family/ink/ground/align/wrap/
hyphens) as StyleX classes; free-form size via the inline
declaration channel (the source provider's own emission — its
bag.declarations wrote font-size identically). Var mirrors
(--jx-ty-*) + presence attrs feed the residue css's descendant lanes
(leading/indent/drop-cap @supports BOTH arms/gradient ink + print/
forced-colors restores) — presence-gated, sovereignty-preserving,
carried. 11-knob ONLY-SET resolution kept (absence IS the state).

### 3.7 switch — the state-machine carve-out
ZERO css residue. One input[role=switch]; ::before is the knob;
':checked::before' travel (calc inline — see E7), ':hover:not(:checked):
not(:disabled)' inset ring, ':focus-visible' −1px outline, ':disabled'
0.5, reduced-motion transition kills — the ENTIRE law in one
styles object. Density flows through --jx-toggle-* (derived from
--jx-line) with zero component code.

### 3.8 separator — subtraction ink, all the way down
ZERO css residue. contrast(0.5) ghost, 4 mask geometries (incl. the
data-URI svg wave) with -webkit- twins, the blend engine (mix-blend-
mode difference + alpha ramp, peak 0.6), the solid exception — every
construct is a string value to StyleX. The :where() zero-specificity
consumer-wins discipline does NOT translate (E11) — override
discipline moves to stylex() merge order.

## 4. Expressibility failures — the total table

"Failure" = construct the TW/css source uses that stylex.create
cannot express on 0.19.0, WITH the workaround and its price. Two
classes: HARD (no path) and TAXED (path exists, costs).

| id | construct | class | workaround | price |
|---|---|---|---|---|
| E1 | container-query UNITS in values (100cqh/cqw) on UA-shadow pseudos (range law) | HARD | folder css (placement law #2) | residue split; plus the engine coercion finding §3.2 |
| E2 | generated law mounts as a unit (laws/range.ts projection) | HARD | carry css verbatim | zero re-authoring of generated artifacts |
| E3 | descendant / child combinators (prose presence lanes, range vertical face, jx-surface body descendants) | HARD | css residue OR lift state into component conditionals (state→class) | the vertical-face lift duplicates the orientation branch per styled part; presence lanes must stay css (they target CONTENT elements) |
| E4 | :has() over sibling + element state (:popover-open caret flip) | TAXED | ':popover-open' COMPILES+emits (verified) but ':has(+ .jx-pop…)' selector syntax does not | kept in css residue (1 rule) |
| E5 | anchor positioning family: anchor-name/position-area/position-try as AUTHORED styles | TAXED | inline style + css residue for the @supports fallback | dynamic anchor names per instance MUST ride inline style (stylex props are static) |
| E6 | ancestor-scoped token lineage (.dark .jx-code-card, .jx-light re-flip) | HARD | css residue; or JS theme state + per-element createTheme classes | the JS path couples paint to state (re-render on theme flip) — chose residue |
| E7 | `vars: {…}` key inside stylex.create namespaces | HARD (throws "Invalid pseudo or at-rule") | defineVars/createTheme for the var contract; plain calc in values | the switch travel calc inlines into the transform value (the source's own form) |
| E8 | camelCase factory keys (maxHeight/minHeight) | TAXED (0.19.0 bug) | inline style lane (the source's own form) | plugin mints var(--x-maxHeight) (camel), Svelte serializes the inline --x-max-height (kebab) — the value never meets the rule; single-word keys (width/height) work |
| E9 | factory calls inside script closures ($derived/$effect) | TAXED | factories must sit in MARKUP-level stylex.attrs(...) calls | the babel plugin only transforms markup-sited calls; runtime styleq silently drops closure-built factory results |
| E10 | literal class + stylex spread on one element | TAXED (Svelte §5.6, re-hit) | re-anchor css hooks to data attributes, or merge into the attrs object | code-card palette re-anchored to data-kind="code" |
| E11 | :where() zero-specificity (consumer utilities always win) | TAXED (semantic shift) | stylex() merge order (last-wins) becomes the override discipline | consumers lose the cascade escape hatch; document as law change |
| E12 | `attrs` missing from 0.19.0 d.ts | TAXED (typing debt) | module augmentation (vite-env.d.ts, committed) | 3 lines; also `import { stylex }` named-import is a runtime MISSING_EXPORT — namespace import only |
| E13 | TW variant prefixes (forced-colors:, hover:) | TAXED (by design) | nested condition objects + hand-expanded variant maps | MORE explicit, typo-checked by key type; net LOC-neutral in practice |

Verified-EXPRESSIBLE beyond the L1 dossier's claims (probed +
emitted in dist css): ':popover-open', '::-webkit-slider-thumb',
'::backdrop', '@supports …' both arms, ':dir(rtl)', ':has' is in the
pseudo table but selector-complex :has chains untested,
container-type/@container appear in AT_RULE priorities (untested —
the range law needs cq UNITS, which is E1). The L1 "no container
queries" line needs nuance for the decision doc: the at-rule may
parse; the family's actual usage (cq units on UA-shadow pseudos) is
the hard wall.

## 5. StyleX-specific taxes found (NEW, beyond L3a's §5)

1. **Shorthand wall in practice**: 7 shorthand sites hit the throw
   mode in one session (border ×6, background ×3, borderBottom) —
   all mechanical longhand conversions; 'throw' mode is what makes
   them visible (silent under default).
2. **E7/E8/E9 form a pattern**: StyleX 0.19.0's dynamic-value
   machinery (vars-in-create, camelCase factories, closure-sited
   factories) fails SILENTLY or with a misleading error — the three
   together mean **dynamic values are only safe as single-word-key
   factories called in markup**. This is the single biggest D5
   pressure point.
3. **Serialization normalizations** (all harmless, recorded):
   ::before→:before, steps(1)→step-end, 0.5→.5, saturate(1)→
   saturate() — grep-based receipts must normalize before matching.
4. **':not(#\\#)' specificity bumpers**: without useCSSLayers,
   StyleX orders rules by chained :not(#\#) padding — rules carry
   3-5 bumpers; consumer css co-existence inherits this specificity
   ladder (coexist spike owns the layer story).
5. **Two engine findings that reflect on PRODUCTION, not StyleX**
   (§3.2 range cq coercion; §3.3 popover span-right semantics) —
   surfaced BECAUSE the corpus asserts computed values; the www
   suites assert css text, so both would stay invisible there.

## 6. Firefox closure — D1-13 LIMITATION upgraded

`npx playwright-core install firefox` (playwright engine only, ~101.5
MiB → ms-playwright/firefox-1538). Raw outputs (verbatim):

```
ENGINE=firefox node scripts/probe-dev.mjs     (spike/minimal)
 PASS D1-01 — style[data-stylex] seen after 414ms (≤2000); computed bg=rgb(18, 52, 86)==authored
 PASS D1-03(dev) — style_ready=132.0ms FCP_start=143.0ms gap=-11.0ms
 PASS D1-02 — #00aa33→#00bb44 after 127ms; navigation entries 1→1
 PASS D1-06(dev) — data-style-src="stylex-spike-minimal:src/App.svelte:43"
 PASS D1-08(dev) — width 120px→220px via inline --x-width
 PASS D1-09(dev) — :hover rgb(11,11,11)→rgb(255,204,0); animationName=xqng64z-B; currentTime advances
 [probe-dev:firefox] 6/6 green

ENGINE=firefox node scripts/probe-prod.mjs    (spike/minimal)
 PASS D1-05 — computed=rgb(18, 52, 86); link bytes contain 3/3 atomic classes
 PASS D1-09(prod) — … dev≡prod=true
 [probe-prod:firefox] 5/5 green

ENGINE=firefox npm run probe                  (spike/ssg — D1-04's home)
 PASS D1-04 — built CSS rule class=x1jqbvbq; prerendered class attr="x1jqbvbq x1r1tdag x1tamke2 x14vqqas" (string-equal member check=true)
 (+ D1-05/06/07/08/09/10 all green) [probe-ssg:firefox] 9/9 green
```

**D1-13 Firefox: LIMITATION → PASS.** The frozen subset {D1-01,
D1-04, D1-05, D1-09} is green on Firefox 153.0 (playwright v1538);
the runs additionally covered D1-02/03/06/07/08/10 beyond the subset.
decision.md should report D1-13 as Chromium full + WebKit smoke +
Firefox smoke, all green on this machine.

## 7. Receipts

- Version-lock: `npm ls` — svelte@5.57.0, vite@8.3.0,
  @stylexjs/stylex@0.19.0, @stylexjs/unplugin@0.19.0,
  @stylexjs/babel-plugin@0.19.0, @sveltejs/vite-plugin-svelte@7.3.0,
  playwright-core@1.62.1 (identical shape to minimal's receipt).
- svelte-check: **0 errors** (1 intentional a11y warning on the
  scrollport tabindex, svelte-ignored like the source).
- Build: `vite build` clean; dist CSS 47.5KB unminified-in-receipt
  (47493B across stylex rules + carried law/palette css); index.html
  links the hashed asset (the §5.2 CSS-entry discipline held).
- Chromium run: 43/43 (probe output §2 of scripts/probe-corpus.mjs;
  screenshots in spike/corpus/shots/*.png — all passed the PNG-decode
  non-triviality gate: nonZero 97.8–99.1%, ≥64 distinct colors).
- Dev-mode sanity: style[data-stylex] present (runtimeInjection),
  fill paints exact token oklch — dev≡prod observed.

## 8. Process discipline

Servers spawned detached + unref'd, recycled by process-group kill +
port sweep; two ORPHANS occurred mid-session (npx's node child
outliving the group kill — the known trap) and were killed by pid;
final sweep: `lsof -ti :5317..5323` empty, `pgrep -fl "vite"` empty.
No git commit performed (spike + research files left staged-in-
worktree only). registry/, apps/, openspec/ untouched outside this
change folder (git status verified: only spike/corpus/** and
research/corpus-report.md are new).

## 9. Friction log (subagent protocol)

1. **The brief's "switch" family does not exist as a directory** —
   the registry's switch IS `ui/toggle` (the D2 fixture's
   `.switch-host` is synthetic; the census marks `toggle*` as the
   frozen corpus family). Resolved: rewrote ui/toggle as "switch";
   recorded here for the Gate-2 reviewer.
2. **D5's LOC anchor ambiguity**: "LOC delta ≤ +50%/+30%" has no
   declared comparison basis (family dir vs styling-surface-only vs
   per-file). This report counts family-dir totals AND names every
   scope-out; R6 must pick the basis explicitly before scoring.
3. **L1's capability lines are stale vs 0.19.0**: "no container
   queries" and (implicitly) "no popover-open/vendor pseudos" —
   §4's verified-expressible list corrects this; the dossier should
   be footnoted, not the fixtures.
4. **The expressibility boundary is GRAYER than the design assumed**:
   compile-and-emit ≠ works-in-cascade. :popover-open compiles, but
   combining it with :has sibling state does not; cq at-rules parse,
   but cq units on UA-shadow pseudos are engine-broken ANYWAY. D5
   scoring should weigh the TAXED class, not just HARD failures.
5. **Probe infrastructure**: fixed-sleep server waits raced cold
   starts twice (spurious FAILs); port-polling + unref + port-sweep
   made runs deterministic — worth folding into the repo's probe
   conventions.

# Report 20 — button-group, REVIEW (2nd, marginalia)

agent: marginalia · 2026-09-22 · route
`apps/www/src/routes/docs/components/button-group.html/` (+page.ts; hand
props lane — the family has no meta yet, the accordion precedent; PILOTS
axes block at test/canvas-same-source.spec.ts:491) · coder vellum
(integrated 80c46cac) · law: mdn-doc-style §5+§6, LAW #14, PROVIDER
family duties, declaring-element, emission-form · reviewer #1: scribe
(PASS, 6 findings — read only AFTER my findings were filed; consolidation
appended). Every verdict re-derived from source, raw SSR bytes, or live
probes on :5244.

## Verdict: PASS

**0 BLOCKER · 0 MAJOR · 1 MINOR · 3 NIT.** The provider story reproduces
end to end under my own probes — the four-voice theme split (three voices
measured directly, the fourth structurally + transparent-bg), the density
provider ladder, the number-lane inertness, the radius concentric chain,
size supply-only, the W7 start-closed verdict, and the query() case. One
MINOR: the density row's channel list omits `--jx-inset`, which the joined
buttons demonstrably re-base. **button-group CLOSES as page #16** (the
MINOR's one-line fix rides the closure commit per the consolidation).

## Findings

1. **MINOR — the density row under-reports the re-based lanes: the joined
   buttons read a third re-based channel, `--jx-inset`, and the row's
   "(--jx-hit, --jx-text)" enumeration is falsifiable as written.**
   `press-button.stylex.ts:60`: `paddingInline: 'var(--jx-inset)'` — the
   joined buttons' horizontal padding IS a density channel, and the same
   `[data-density]` scope re-bases it: measured padding-inline **8px at xs
   / 8px at sm / 12px at default / 16px at lg** (4px unit × coefficients
   2/2/3/4; jixoai.css :1250-1254 factor ladder, :468 the
   `--jx-inset-base × coefficient` composition). The TokenTable also lost
   the row the old page carried (`--jx-inset: 8 / 8 / 12 / 16px` —
   verified true then, absent now; the current table is 4 rows: --jx-hit,
   --jx-text, --shadow-xs, --border). Nothing false is claimed about
   behavior — my measured ladder confirms the re-base — but "the lanes the
   joined buttons read" names two of three. Fix (rides the closure
   commit): name `--jx-inset` in the row's channel list + restore the
   token row.
2. **NIT — TokenTable `source: 'structural'` renders an empty Source
   cell.** The page's --shadow-xs and --border rows carry
   `source: 'structural'`; served SSR has `>structural<` ×0 — the word
   never renders (sourceLabel maps density/component/color only). Either
   map 'structural' in token-table.svelte or drop the source from the two
   rows. (The W-next #3 two-arm TokenTable gap, another instance.)
3. **NIT — dead veil-gate selectors in button-group.css:210-217.**
   `.jx-btngroup-scroll-host`/`[data-jx-btngroup-run]`/`.jx-btngroup-veil-layer`
   appear in the served CSS (×2) but match no DOM element — the component
   stamps `jx-scroll-host` + `data-jx-scroll-run` and the live gates are
   scroll-run.css's. My scroll probe found zero `.jx-btngroup-veil-layer`
   elements. Drift ledger #8: delete the residue.
4. **NIT — the page header comment lumps deferral into the rejection
   class.** :62-66: the lab/scroll/query canvases are REAL rejection-class
   cases (page state, reactive query embed), but the zone/nesting/boundary
   canvases are static stages that COULD migrate (the axes canvas proves
   static-plus-atoms extraction works). Say "deferred", not implied
   rejection.

## Verified-TRUE receipts (all my own probes, current tree)

- **Four-voice theme split, co-resident specimens in one evaluate**:
  - FLIPS: outline button border oklch(0 0 0) light → **oklch(1 0 0)** dark
    (the theme-scoped --jx-outline slot).
  - FROZEN: label ink oklch(0 0 0) in BOTH (the --jx-foreground alias,
    substituted at :root).
  - FOLLOWS: root cluster shadow rgba(0,0,0,0.5) light →
    **rgba(255,255,255,0.5)** dark (raw --shadow-xs re-declared under the
    island).
  - THEME-NEUTRAL: the divider/seam element — background transparent, the
    contrast-ghost engine paints no color channel (structural read +
    transparent-bg measured; scribe's backdrop-filter read complements).
- **Density provider**: default row **40px/13px**, lg row **48px/15px**;
  stamped xs → **28px/11px**, sm → **32px/12px** (the rung attribute is
  the mechanism the named stamp writes). Number lane INERT: coefficient 3
  stamped → still 40/13 (`coefInert: true`). Provider side in source:
  `provideDensity(() => resolvedDensity)` with the eager parent capture
  (button-group.svelte:397-414, the derived_references_self guard).
  Pins: defaults-buttons.spec.ts:194/:223 (green in the family run).
- **Radius concentric chain**: no-carrier button corner **0px**; page
  `radius="medium"` → **8px**; stamped 16px carrier → **16px**
  (press-button.css:66-73, R−seam).
- **Size supply-only**: root font 20px → button type stays **13px**, box
  40 (`sizeInert: true`) — the button's own `var(--jx-text)` atom beats
  inherited root font.
- **W7 scroll**: run verdict `data-jx-scroll-state="start-closed"` ✓;
  `overflow-x: auto` ✓; `scrollbar-width: none` ✓; `scrollLeft 0` ✓;
  overflow confirmed (scrollWidth 512 > clientWidth 360 at my viewport —
  scribe's 232>172 is the same fact at a narrower stage); start chevron
  **display: none**, end chevron **display: block** ✓.
- **query() two-generic, both directions**: served usage
  `query&lt;{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')`;
  live 1280px → density lg, button 48/15 → 600px → base small, 32/12 →
  back → 48/15. The page comment documents WHY both generics are the §6
  law (single-arg pins B to undefined → real svelte-check error).
- **Standard**: toc **11/11** ×1 each, order matches DOM; `add
  button-group` ×4 install marker; four-voice density numbers served
  (28/11px at xs · 32/12 at sm · 40/13 at default · 48/15 at lg — each
  ×1); census batch A + §1 collision rule + elevation carve-out cited in
  the deviations paragraph; hand-lane arithmetic: API 14 rows
  (orientation…children*, …rest) + axes 8 rows + variant-scope 2 rows, no
  extra-lane collisions (density is the provider itself, told once per
  table); measurement-first header; raw-SSR discipline throughout.
- **test/ pins**: family specs solo — button-group + button-group-overflow
  + button-group-scroll + defaults-buttons = **71/71 PASS** (exit 0);
  canvas-same-source solo **75/75** (the PILOTS axes block :491 green).

## Consolidation (scribe's 1st = PASS, read after filing)

Full agreement — every measured claim reproduced independently to the
digit: the density ladder (28/32/40/48 · 11/12/13/15), number-lane
inertness, radius 0→16 (medium→8), size 13px unmoved, the four voices,
W7 start-closed, query both directions, toc 11/11, family specs 71/71.
My MINOR = scribe's finding 1 (MEDIUM in its scale), independently
re-derived before the cross-read: the paddingInline source read, the live
8/8/12/16 ladder, and the dropped token row all confirmed — the fix is
one row-edit plus one token row, riding the closure commit. Its findings
2-4 co-signed as my NITs (empty Source cells measured: `>structural<` ×0;
dead veil-gate classes ×2 in served CSS, zero DOM elements; the deferral
wording). Its findings 5-6 (family type errors, capture warns) are
family-owner hygiene outside page scope. Scribe's probe-hygiene note (the
bogus light baseline caught by its own darkClass field) and mine (W7
numbers are viewport-relative; state the viewport) agree with the
campaign's measurement-first posture.

## Process evidence

- Port :5244 empty before (lsof exit 1); dev server background task (log
  /tmp/marginalia-20-dev.log), killed by PID at the end with the
  lsof-empty receipt in the final message.
- Probes: /tmp/marginalia-20-probe.mjs (axes groups, provider stamps, W7
  scroll, query flip), -probe2.mjs (scroll chips display + divider),
  -probe3.mjs (padding-inline ladder 8/8/12/16). SSR:
  /tmp/marginalia-20-ssr.html (1,285,890 bytes). Old page:
  /tmp/marginalia-20-old.svelte. Gates: /tmp/marginalia-20-{fam,univ,twl,docs}.log.
- Independence: scribe's review read only after the findings above were
  written.
- Working tree carries sibling in-flight work (unchecked, untouched). NO
  commits, NO push.

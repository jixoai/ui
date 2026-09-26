# scribe task 8 — checkbox (docs-eight-axes-mdn)

Agent: scribe · date 2026-09-22 · main dir, no commits, no push, port 5243.
Scope: `apps/www/src/routes/docs/components/checkbox.html/+page.svelte`,
`+page.ts`, and the same-source pilot gate
(`apps/www/test/canvas-same-source.spec.ts` — PILOTS + one snapshot).
Family (`apps/www/src/lib/ui/checkbox/`) untouched.

## Tier: 2 优化重构 — justification

The page's bones were real (the playground canvas, the states matrix, the
FormData form demo, the generated PropsTable + docs curation, DocsSeeAlso)
but the shape was docs-demo-standard, not the archetype: no overview, no
per-axis table, no query() case, the W3-era universal demo card still
shipping (and its "size 14" panel demonstrated a non-consumer — the exact
claim the axes work exists to correct), the states matrix duplicated across
two sections (demo + types), the `usage` CodeBlock rendered twice, the toc
was stale (`universal-props` in the DOM but absent from `+page.ts`), a11y
was one table with no hit-floor/mechanism prose, and the `bare` branch —
the family's most distinctive story — was documented only in a props row.
Tier 1 cannot reach the archetype; tier 3 would discard real usage facts.
Tier 2: restructure, dedupe, fill the gaps, keep every real demo working.

## What changed

- **Archetype order** (§2, skeleton-safe — checkbox is in the
  `docs-skeleton-scope.json` inScope list, so the six staged sections stay
  in order): hero → overview (new, 4 paragraphs) → Install → Usage (the
  playground canvas folded INTO the Usage SectionCard, live example early;
  a `theme="dark"` specimen added) → Examples (states matrix absorbs the
  old types section; the form demo kept whole) → Props (generated meta +
  `CHECKBOX_DOCS`; the `data-jx-props-table-universal` marker intact) →
  **The eight axes on checkbox** → **The bare branch** (new section) →
  Accessibility (enriched) → See also (`DocsSeeAlso`, now with an
  `id="see-also"` anchor so the toc row is not dead).
- **The per-axis table** — real mechanisms from the family chain
  (`.jx-html-checkbox` + `.jx-check-lane` + the stylex host): density
  (named rung → `data-density` scope at the wrapper; channels
  `--jx-icon`/`--jx-hit`/`--jx-gap`/`--jx-text`/`--jx-line`; NUMBER lane
  INERT — below), theme (FULL re-theme, both halves named per the
  theme-split law), and six honest stamped-but-not-painted rows with the
  var each paint voice reads instead (`--corner-shape` for shape — a site
  token the axis never bridges; `border-radius: 0` for radius — the square
  glyph is the design; raw `--primary`/`--border`/`--background`/
  `--primary-foreground`/`--ring` for color; no shadow voice for
  elevation; fixed 150ms + `prefers-reduced-motion` for motion; the label
  declares its own `--jx-text` for size).
- **The §1 collision rule documented in action** (census batch A): the
  Props interface `Omit<HTMLInputAttributes, 'size' | 'color'>` — the
  destructured axis wins, the element never receives a native
  `size`/`color` attribute, everything else rides the rest object
  (name, value, required, disabled…). Census cited in the axes prose.
- **The bare branch — the unstamped embedded lane** (the brief's census
  story, its own section): bare renders ONE input (SSR receipt:
  `<input type="checkbox" checked="" class="jx-html-checkbox"
  name="bare-inert"/>` — no wrapper, no `data-density`, no style attr, no
  `.dark` class, no query anchor). Explicit lanes resolve, supply to a
  context with no descendants, and stamp nowhere; ambient tree scopes
  still flow (custom properties inherit). The DOM-shape rationale
  documented with the consuming laws named: markdown's
  `[data-jx-markdown] li:has(> input[type='checkbox'])` marker suppression
  and the list family's middle alignment — the wrapped div>span>input
  shape defeats them, the bare direct-child input keeps them.
- **Demos earned, not forced**: the axes canvas (id="axes", joined the
  same-source lane) carries the two named density rungs (lg / 2xs — both
  measured); the ONE real query() case is density across the viewport
  (`query<{ sm: DensityLane }, DensityLane>({ sm: 'small' }, 'large')` —
  base large below 40rem (24px box / 48px lane, touch), sm at ≥40rem
  (18px / 32px, pointer), flip verified BOTH directions via real viewport
  moves). No demo for inert lanes (demo-selection law).
- **TokenTable with measured values** (calc-chain derived + live-probed):
  `--jx-icon` 14/16/18/20/24px · `--jx-hit` 24/28/32/40/48px ·
  `--jx-gap` 8/8/8/12/16 · `--jx-text` 10/11/12/13/15 · `--jx-line`
  14/16/18/20/24 (2xs → lg); the coefficient row documents its own
  inertness on this family; structural rows (1px border, 2px glyph inset,
  150ms ease-out / reduced-motion none).
- **A11y** enriched: native semantics (no ARIA synthesis; :indeterminate
  exposes mixed — platform), `label[for]` widening the target across the
  lane, the hit-floor truth (default floor 28px; the 2xs scope LOWERS it
  to 24px — the WCAG 2.5.8 AA pointer-dense note, jixoai.css:2768),
  aria-invalid + describedby wiring, native disabled, reduced-motion.
- **toc rewritten in page order** (9 ids, all resolve; the old one was
  unordered, stale, and missing `universal-props`).

## Findings for the orchestrator

1. **DRIFT-LEDGER CANDIDATE #6** (`family-comment-drift.md`): checkbox.svelte's
   `size` prop comment claims "CONSUMED by the family" — measured false:
   the carrier stamps and nothing reads it (label declares `--jx-text`, box
   is rem-anchored `--jx-icon`; size={32} carrier path probed live: box and
   label byte-unmoved). Same class as ledger #3/#4/#5. Out of doc scope —
   family file untouched.
2. **The census batch A row says "8 axes, standard pattern"** — the axis
   SURFACE is standard; the honest density story is narrower: the NUMBER
   lane is inert on this family. Mechanism (the declaring-element law, my
   4-accordion finding, now measured in the wild): the channels are
   declared at `:root` and the rung scopes — substitution runs THERE — so
   a wrapper-local `--jx-density-coefficient` re-declares nothing.
   Measured: coefficient 1.5 through the real carrier path leaves the
   20px box, the 40px lane, and the 13px label byte-unmoved, while the
   named rungs visibly move everything (lg: 24/48/16/15px all TRUE).
   This is alert's density finding #2 recurring on a family where the
   source READ says "every channel composes the coefficient" — the calc
   is true at the declaring scope and irrelevant to a stamp on a
   non-declaring element.

## Gates

| gate | baseline (pre-change) | after | evidence |
|---|---|---|---|
| dev smoke :5243 | (old page 200) | **200** | SSR receipts: universal marker ×1, install ×1, see-also ×1, ONE Usage H2, `data-density="lg"` + `--jx-density-coefficient: 1` (§4 reset) + `data-density="2xs"` + `class="jx-field dark"` stamped; bare inputs byte-equal with no stamps |
| computed probe (playwright-core + system Chrome, /tmp/scribe-8-probe.mjs, log /tmp/scribe-8-probe.log) | — | **16/16** | density ladder all rungs TRUE (20/40/12/13/20 default; 24/48/16/15/24 lg; 14/24*/8/10/14 2xs — *the scoped floor); number-lane inert through the real carrier path; size inert through the real carrier path; theme flip (fill + border, structure diff — L 0.6489→0.7044, the −4° drift); query() flip both directions; bare inertness computed |
| canvas-same-source solo | 56/56 (badge's 58 incl. mine pending) | **58/58** green without -u | snapshot written once with -u, then green; my diff = PILOTS line + the `checkbox.html :: axes` snapshot |
| svelte-check (repo root, machine output) | page carried 1 error (the fleet cx-idiom narrowing) | **exactly 1 diagnostic on my page — the same pre-existing idiom class** (cx `.filter(Boolean)`, now at :281; byte-identical to anchor:66/alert:179/breadcrumb) | /tmp/scribe-8-svelte-check.log; workspace total 1645, zero new classes |
| verify:tailwindless | GREEN files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 | **UNMOVED** (run pre- AND post-build) | receipt identical both runs |
| verify:docs-universal (fresh dist) | 110/110 | **110/110** (110 markers; my page ×1) | checkbox dist grep: marker ×1 |
| verify:docs | staged scope green | **staged scope green** (checkbox is inScope — hard gate, passing) | backlog rows unchanged, pre-existing |
| affected specs solo | `openspec validate docs-eight-axes-mdn --strict` → valid | **valid** | no spec edits, zero deletions, no re-pins |
| dist receipts | — | all present | `data-density="2xs"` ×1, bare specimens ×1, "unstamped embedded lane" ×4 in the built HTML |

## Processes

- Dev server `node scripts/dev.mjs --port 5243` from the repo root
  (background task). Reclaim: `kill 73520` (the listener), then the
  WRAPPER 73516 (my own logged mistake class — caught it this time);
  receipt: `lsof -i :5243 -sTCP:LISTEN` → 0, `pgrep -f "dev.mjs --port
  5243"` → 0. Fresh `npm run build` AFTER the kill (exit 0).
- Browser tooling: the in-app browser is unavailable in subagents
  ("Browser is not available in subagent") — the working path is
  vellum's: a probe script driving
  `node_modules/playwright-core` + system Chrome headless against the
  dev page (/tmp/scribe-8-probe.mjs). Adopted permanently for my
  remaining pages.
- Scratch artifacts /tmp only: scribe-8-dev.log, scribe-8-ssr.html,
  scribe-8-probe.mjs, scribe-8-probe.log, scribe-8-svelte-check.log,
  scribe-8-build.log. Repo-side writes: the three files above + this
  report + experience.md.
- Shared-tree note: `component-canvas.html/+page.svelte`/`+page.ts` and
  a new `component-canvas.docs.ts` are a CONCURRENT agent's work in this
  main dir — present in my build/gates, not mine, untouched by me. My
  spec-file diff verified line-by-line (PILOTS + my snapshot only).
- Self-caught mid-task: (1) `{...rest}` inside a template ATTRIBUTE is a
  Svelte parse error (500) — braces are safe in script strings and in
  text children via the `{'…'}` dodge, but attributes just need rewording;
  (2) the PILOTS list drifted under concurrent agents (badge landed
  between my read and my edit) — re-read at edit time, merge cleanly.

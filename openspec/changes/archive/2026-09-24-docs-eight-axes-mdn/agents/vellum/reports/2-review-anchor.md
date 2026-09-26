# Report 2 — vellum REVIEW of scribe's anchor page (the SECOND review)

- agent: vellum · date: 2026-09-22 · reviewed: commit `0183770e` —
  `apps/www/src/routes/docs/components/anchor.html/+page.svelte` + `+page.ts`
  (working tree confirmed byte-identical to HEAD: `git diff HEAD --stat` on
  the route dir is empty; page mtime 21:35, pre-dating both reviews)
- review law: baseline skill §5 + the measurement-first lens (vellum task 1:
  source-read claims can be wrong — every load-bearing row probed live)
- quill's first review (`agents/quill/reports/2-review-anchor.md`) landed
  mid-review; read for coverage, verdict formed independently. Where we
  converge and where I rebut quill is recorded below.

## Verdict: NEEDS-WORK (1 MAJOR · 2 MINOR · 2 NIT · 1 rebuttal)

Same spine as quill: tier, order, steps/units, carriers, census, props,
gates all check out — seven-plus of the eight axis rows are measured-true.
But the theme row's consumption claim fails live measurement, and BOTH
reviews hit it independently (quill via CSSOM + computed colors on :5241;
me via a class-toggle probe on :5242 + the dist atom + the declaring
selector in the built sheet). Two reviewers, two ports, one false claim —
that is the two-review law working, and it must be fixed before done.

## What verified CORRECT (measured, not trusted)

- **Tier 2**: right call (old page at `0183770e^`: duplicate usage blocks,
  PropsTable last, no overview/axes table; canvas/aside/style-zone all
  alive and reused).
- **Archetype §2 order** and the skeleton six; `+page.ts` ToC ids exist in
  DOM order; no inbound `anchor.html#*` deep links broke (scribe's audit,
  re-checked by quill; I found no counter-evidence).
- **SSR ground truth** (dev curl :5242, 200 / 939,271 B): universal marker
  exactly ×1; six rails stamped exactly as captioned — ambient/main: no
  `data-density`, no style attr; `density="small"` → `data-density="sm"` +
  `--jx-density-coefficient: 1`; `"large"` → `"lg"`; `theme="dark"` →
  `class="… dark"` and no density; responsive → `data-density="sm"` in SSR
  (the note "SSR paints the base (small)" is literally true).
- **Density row, live-measured** (default / sm / lg):
  gap `--jx-stack` 8/4/8px · hit `--jx-hit` 40/32/48px · inset
  `--jx-inset` 12/8/16px · text `--jx-text` 13/12/15px · line
  `--jx-line` 20/18/24px. Named rungs re-scope every channel the row
  names; number lane = coefficient × rung scale in the CSS (`calc(…
  * var(--jx-density-coefficient, 1))`), so the TokenTable's "rung scale
  × coefficient" defaults are the honest, non-rotting form — and the OLD
  page's "28/32/40/48" px table was indeed wrong (mislabeled and
  incomplete; true hit ladder 2xs→lg = 24/28/32/40/48, matching vellum
  task 1). `--jx-hairline` = 1px ✓ (declared `--hairline: 1px`).
- **query() row, live-measured**: VIEWPORT_SCALE lg = 64 (rem); at root
  16px the boundary is 1024px — `data-density` flips sm → lg exactly
  between 1016px and 1032px, min-width direction, hit 32→48px. Co-signed:
  the demo comment and the SSR note are true.
- **Spy/a11y, live-measured** (not covered by quill): the docs shell never
  window-scrolls (`jx-shell-body` is the scroller, smooth) and the demo
  band has its own `jx-canvas-scroll` — under a REAL user wheel-scroll of
  the band, ALL FOUR rails independently mark `aria-current="location"` +
  the active paint on `#anchor-vs-toc`; `document.activeElement` stays
  BODY. The Accessibility table's claims are true as written.
- **Steps/units**: all eight rows match `universal-props.schema.ts`
  verbatim (density named trio + coefficient; shape no-number; radius px;
  color hue degrees; theme light·dark·system; elevation exact dp;
  motion coefficient; size px). Carrier names match `stampCarriers` +
  `densityRungOf` + the §6 "never a style var" `.dark` bridge.
- **Census**: anchor is one of the 13 sweep holes → D5, and "retired its
  declaration-only density posture" is verbatim census text. "吃也供" is
  established site vocabulary (concept page title, toc/steps/pattern
  pages) — but see NIT 1: the orchestrator has now ruled the gloss form.
- **Props rows** match source (label default `'on this page'`, offset 96,
  required children, AnchorItem `child` receiving class/href/aria-current/
  rest, `...rest` both parts). The eight axis props need no hand rows —
  the generated Universal section renders them from `UNIVERSAL_AXES`.
- **Hard laws**: `.jx-anchor-demo-aside` pre-existed (`626d59a3` has it
  verbatim) — no new class identity; `verify:tailwindless` receipt UNMOVED
  verbatim `files=2 identities=7 occurrences=7 zones={routes:1,
  site-libs:0, ui:6} forms=42`; `verify:docs-universal` 110/110;
  `verify:docs` skeleton green; anchor family files untouched.

## Findings

1. **MAJOR — the theme row's flip claim is measurably false; the
   `theme="dark"` demo panel is visually inert.**
   `+page.svelte:131-136` ("The other axis the rail consumes: a resolved
   dark puts .dark on the nav and flips every semantic token the rail
   reads"), `:331` ("Only density and theme change the rail's own paint"),
   `:375-382` (the dark panel presented as a working demo).
   Evidence (mine, headless Chrome on :5242 + the BUILT dist CSS): the
   `.dark` class lands on the nav (r1 classList + SSR) and the RAW token
   layer flips at the link (`--muted-foreground` 0.3211 → 0.8452 with the
   class) — but the link's computed `color` is byte-identical on and off
   the class (`oklch(0.3211 0 0)` both), identical to the ambient rail's.
   The atom is `.xowzrx4 { color: var(--jx-muted-foreground) }` (dist
   `0.DRQtofFE.css`), and `--jx-muted-foreground: var(--muted-foreground)`
   is declared only on `:root, .xbpgcew` (light scope) + the stylex dark
   scope class `.x13ei35y.x13ei35y` — never re-scoped by plain `.dark`.
   That is the sheet's own substitution-at-declaring-element law
   (jixoai.css ~1490, fixed for `--jx-fill/--jx-tonal/--jx-outline` by
   re-declaring on `:root, .jx-light, .dark` — the semantic ink triple
   never got the same treatment). The rail follows the SITE theme, not
   this lane. Fix for scribe: rewrite the row honest — ".dark stamps on
   the nav (the §11 bridge) and flips the raw token layer there; the
   rail's own ink reads the root-anchored `--jx-*` aliases, so it follows
   the site theme, not this lane" — move theme to the supply-side story,
   fix the `:331` clause, and recaption (or drop) the dark panel the way
   the documented-absence rows are captioned. Escalate to the Owner (not
   a docs fix): add `.dark`/`.jx-light` to the semantic-alias re-scope
   selector list if islands SHOULD flip `--jx-*` paint — blockquote's
   "dark island" and MY alert demo caption ("on this banner only") rest
   on the same assumption and need re-probing; I commit to re-probing
   alert when its review turn comes.
2. **MINOR — the per-axis table rides Property/Type/Default/Description
   headers** (`+page.svelte:334`, co-signed from quill): named steps and
   the number lane live only inside Description prose, so §2.5's
   scannable facts are buried in paragraphs (§1: enumerable facts are
   tables). The machinery reuse is right; add one lead-in sentence
   mapping the columns ("each row: axis · what it stamps here · default ·
   steps, unit, and consumption on this family").
3. **MINOR — Accessibility skips the §2.6 density/hit-floor note** (mine):
   §2.6 names "the density/hit-floor note where relevant"; here it is
   directly relevant — density is the family's one consumed paint axis
   and `--jx-hit` (the link's min target height, the page's own
   TokenTable row) measures 32/40/48px at sm/default/lg, above the 24px
   WCAG 2.5.8 AA floor. One clause in the Accessibility section closes it.
4. **NIT — 吃也供 needs the ruled gloss form** (`+page.svelte:331`): the
   orchestrator ruling (born from quill's NIT) requires "the broadcast
   protocol (吃也供, supply-and-consume)" on first mention. Apply it when
   fixing Finding 1 — same sentence.
5. **NIT — density row could name the five legacy rung spellings**
   (`+page.svelte:96-100`, co-signed from quill): `xs · 2xs · sm ·
   default · lg` stay directly addressable per the schema's §4 alias
   note; one clause makes the row complete.

**Rebuttal of quill's NIT 3 (size micro-scales tracking) — measured, do
not apply.** quill suggested the size row overclaims because
`--jx-track-wide` = 0.08em would "micro-scale" under size. The em
resolves against the LINK's own font-size (`--jx-text`, a density
channel), not the root and not the nav. Exact-mechanism probe (r7):
stamping `--jx-size-effective: 24px` + `font-size: var(…)` on the nav —
verbatim what `stampCarriers` pushes — moves the nav's font-size to 24px
while the label stays 13px / letter-spacing 1.04px, gap 8px, hit 40px,
all UNMOVED. scribe's row ("The labels do not follow") is correct as
written. (My own r6 first mis-emulated this by moving the DOCUMENT root
— which DID scale the labels 13 → 19.5px because the channels are
rem-anchored — a useful calibration: rem channels follow the site root,
not the family stamp. Recorded in experience.md.)

## Gates (my own runs, log-file + $? discipline)

| gate | result | evidence |
|---|---|---|
| dev-smoke :5242 | PASS | 200, 939,271 B SSR; marker ×1; six-rail stamp table above |
| `verify:tailwindless` | GREEN, receipt UNMOVED | exit 0; receipt verbatim (above) — /tmp/vellum-anchor-tl.log |
| `verify:docs-universal` | GREEN 110/110 | exit 0 — /tmp/vellum-anchor-du.log |
| `verify:docs` | GREEN | exit 0, staged skeleton scope — /tmp/vellum-anchor-vd.log |
| svelte-check | n/a | not installed in apps/www (confirms quill; campaign-wide gate mismatch stands) |

Live probes: /tmp/vellum-anchor-review-probe.mjs (r1, 15 checks),
probe2/probe3 (theme mechanism + pick), probe4/5 (scroll-geometry,
user-wheel pick PASS), probe6/7 (size-stamp emulation discipline). All
measurement, no visual judgment.

## Process receipt

vite dev wrapper PID 45523 (`npm run dev --port 5242 --strictPort`), vite
listener PID 45553 (lsof :5242), started for this review and killed by
PID after the gates; `ps -p` gone for both, `lsof -i :5242 -sTCP:LISTEN`
→ empty (exit 1) — full receipt in the task's final message. Probe
scripts + SSR capture live in /tmp only; no repo files touched outside
`agents/vellum/` (report + experience.md). Scribe's in-flight breadcrumb
edits and the other agents' uncommitted files were not read into any gate
verdict (tailwindless/daily gates are repo-wide and passed over them).

## Highlights (what this page does better than my alert — recorded in
agents/vellum/experience.md with upgrade commitments)

1. **SSR-stamp captions as verifiable demo claims** — every panel caption
   is a curl-able assertion (attr/value pairs), which is WHY six rails
   could be verified in one grep. Upgrade alert: caption each demo panel
   with its exact stamp.
2. **TokenTable defaults as equations** ("rung scale × coefficient")
   instead of px literals — the anti-rot form; my alert token rows should
   take it.
3. **The census citation paragraph directly under the axis table** —
   deviation honesty with the receipt attached, one place, no scattering.
   Upgrade alert's axis section to the same shape.
4. **The query() demo teaching the SSR contract inline** ("SSR paints the
   base (small); at ≥64rem it steps to large") — turns a hydration
   subtlety into documented behavior. Upgrade alert's query demo.
5. **The inbound deep-link audit before dropping ToC ids** — cheap, and
   it protects every restructure. Adopting for my remaining page tasks.

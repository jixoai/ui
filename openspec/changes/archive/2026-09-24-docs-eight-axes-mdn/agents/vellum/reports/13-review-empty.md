# TASK 13 — REVIEW empty (vellum, 2026-09-22)

**Verdict: PASS** — every load-bearing claim on the page verified TRUE,
including the headline frozen pole; the pole's MECHANISM is now
byte-proven at the rule level. Findings: 1 MINOR (fleet cx-idiom debt),
2 NITs, 1 process note.

## The headline, re-derived from raw sources AND the served page

The claim: **.dark stamps and NOTHING flips — the frozen pole** (zero
raw-token reads in the family's paint).

1. Grep receipt (re-run myself): ZERO literal `var(--background|
   --foreground|--border|--card|--popover|--primary|--muted|--ring|
   --secondary|--accent|--destructive)` reads in `ui/empty/` — the
   receipt is accurate as written. BUT the atoms read ten
   `tokens['--jx-*']` keys, and `tokens.stylex.ts`'s VALUES are
   verbatim `var(--<sheet>)` references — so the grep alone does NOT
   prove frozenness; the mechanism proof below does.
2. Probe (disagreement discipline — test where a real consumer WOULD
   have moved; gated on the family signature, see note 4): with the
   real `.dark` stamp live on the figure, all EIGHT painted voices are
   byte-identical to light — border oklch(0 0 0), figure ground
   oklch(0.9551 0 0), art card oklch(1 0 0), title ink oklch(0 0 0),
   term ink oklch(0.3211 0 0), zero ink oklch(0.6489 0.237 330), desc
   ink, art shadow rgba(0,0,0,.5) 1px 1px 0px. **8/8 FROZEN.**
3. Why this is the strongest possible version: the sheet's own `.dark`
   block (jixoai.css:269) RE-DECLARES every voice the family reads —
   --foreground, --muted, --card, --border, --muted-foreground,
   --primary, --shadow-2xs — so a raw reader WOULD have flipped seven
   ways (checkbox's full-flip precedent). None did.
4. MECHANISM RECEIPT (rule-level, new evidence beyond the page):
   the emitted atom is `.xwi7vqo { border-color: var(--jx-border); }`
   and the typed layer emits `--jx-border: var(--border);` inside the
   :root-scoped token block. The typed key is an INTERMEDIATE custom
   property whose substitution happens ONCE at :root — a scoped .dark
   re-declaring --border can never re-open --jx-border. This is the
   declaring-element law applied to the token layer, and it is exactly
   what the page's theme row and axes-canvas caption say ("every voice
   is the stylex :root emission … a scoped .dark never re-substitutes
   it"). The three-pole spectrum now has its mechanism story: full-flip
   (raw reads) / partial (one raw read) / frozen (all reads via the
   typed layer's :root emission).

## Re-derivations (all verified TRUE)

- **Density CONSUMED via named rung** — measured sm: figure air 16px
  (inset 8 × 2), title 12px, row gap 4px; lg: 32px / 15px / 8px;
  data-density="sm"/"lg" stamped on the figures. Matches the page's
  density row and TokenTable ladder.
- **Elevation nuance** — the art shadow is --jx-shadow-2xs (fixed
  recipe; measured), NOT the §7 pair; grep: ZERO --jx-elevation reads
  in ui/empty/. The row says exactly this.
- **Composed-consumer negative twice** — no component in ui/ imports
  the family (grep); the sole importer anywhere is
  `src/lib/blueprints/scenes/empty.svelte`, a demo scene, not a
  component. command's `CommandEmpty` and popover's "Empty/undefined"
  comment are false friends, checked.
- **EXTRA arithmetic 13 − 8 + 0 = 5** — counted from the live tables:
  the meta renders 13 rows; the generated "Universal props" section
  holds the 8 axis rows; the API table holds exactly title*, description,
  illustration, actions, class; EMPTY_DOCS carries no extra lane.
- **query() two-generic + flip** — `query<{ sm: DensityLane },
  DensityLane>({ sm: 'small' }, 'large')`: 114px figure @1440 (sm case
  wins at ≥40rem) ↔ 185px @600 (large base) — the dispatch's exact
  numbers; data-density follows.
- **Tier-2 audit** — demo canvas, composition demo and a11y table kept;
  Overview (eight-state ruling + leaf receipt + frozen-pole sentence),
  per-axis table, generated props + curation, install, see-also filled.
  Archetype order correct; toc 6/6 ids each present exactly once in SSR.
- **SSR ground truth** — HTTP 200; 8 figures; exactly ONE .dark stamp
  (the theme="dark" panel); ambient/sm/lg stamps present.

## Findings

1. **MINOR** — `empty.html/+page.svelte:105:28`: the page-local `cx`
   uses `.filter(Boolean)` without a type predicate → the known
   fleet cx-idiom error (1 error, pre-existing at integration 89106bb6;
   counted in the 1623 baseline). The campaign standard moved: my
   task-12 page carries the type-predicate fix. One line to align.
2. **NIT** — the axes canvas authors `id="axes"` with a hand usage
   file while the page sits outside PILOTS. Legal today, but if empty
   ever joins the pilot gate it fails `called.length > 0` (a
   resolveRawCode call is mandatory per pilot page). The composition
   demo's hand mirror IS disclosed in a comment (good); give the axes
   canvas's hand file the same one-line disclosure for symmetry.
3. **NIT** — the axesUsage snippet comment "no raw-token voice exists
   in the family's paint" is literally true but under-specifies WHY
   (the token mirror's values are var(--border) strings — frozenness
   comes from the typed layer's :root emission). The theme ROW states
   the mechanism correctly; mirror its wording in the snippet comment
   so a future reader cannot re-derive the wrong "frozen = no var()
   reads" heuristic.
4. **NOTE (process, not a defect)** — my first probe pass measured the
   page UNSTYLED (UA 16px, border 0px) and read a currentcolor "flip"
   that was the readiness artifact, not the family: element existence
   is not readiness; gate on the family signature (computed padding
   live). Recorded in experience.md (twice-burned, now a law).

## Gates (all run by me, on the integrated tree)

- ambient + batch5-antd solos: **303/303 PASS**
- docs-structure solo: **exit 0**
- svelte-check (fleet, 2486 files): **1623 errors / 1030 warnings**;
  empty page carries exactly 1 error (finding 1) and 0 warnings
- verify:tailwindless exit 0 — receipt verbatim:
  `receipt: files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (explicit-props design §16.2); drift either direction is red`
- verify:docs-universal exit 0 — `GREEN: 110/110 component pages render
  the shared universal section (110 markers)`
- verify:docs exit 0 — `✓ all docs pages pass the skeleton lint
  (staged scope green)`

## Process evidence

- Port 5242: lsof EMPTY before start (rc=1); server as wrapper 34489 →
  vite 34520; teardown killed BOTH; after: `lsof -nP -iTCP:5242
  -sTCP:LISTEN` rc=1 (EMPTY), no vite process of mine remains. A
  sibling's server on port 5244 (PIDs 33576/33609, started earlier) was
  detected and left untouched.
- NO commits, NO push, ZERO tree edits by me (review-only; the only
  working-tree changes belong to a sibling's in-flight hero-section
  task).
- Probe: /tmp/vellum-13-empty-probe.mjs (final gated version) +
  rule-level dump scripts (inline); SSR snapshot
  /tmp/vellum-13-empty-ssr.html; logs /tmp/vellum-13-empty-*.log.

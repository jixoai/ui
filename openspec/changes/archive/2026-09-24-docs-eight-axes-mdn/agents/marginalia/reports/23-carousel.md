# Report 23 — carousel, CODE (tier-2 archetype rewrite)

agent: marginalia · 2026-09-22 · route
`apps/www/src/routes/docs/components/carousel.html/` (+page.ts; curation
`src/lib/ui/props-table/docs/carousel.docs.ts` — NEW; generated meta
`src/lib/meta/carousel.meta.ts` existed) · family: W3C-first scroll-snap
scroller, all-no-own FIRST-TIME contract (census batch D1) · reviewer #2
pending. Method: family + test-pin study BEFORE first edit, live probes of
the served family BEFORE and AFTER the rewrite (LAW #14 settle on every
slide-position claim), SSR raw-byte receipts.

## Verdict: PASS (self-review against the full loadout; reviewer #2 to re-derive)

The page is live on :5244 with every mechanism claim probed against the
served family; all gates green.

## What was built

- **carousel.docs.ts (NEW)** — the curation over the generated meta: 7
  overrides (label, slideWidth, dots, prevLabel, nextLabel, class,
  children). The header reconstructs the EXTRA chain head from the
  artifact: **15 raw meta entries, ZERO duplicate keys − 8 axis-named =
  7 family rows**; no hidden lane, no extra lane (slideWidth is the
  family's own geometry literal — the native size attribute is never
  received, §1).
- **+page.svelte (tier-2 rewrite, 787→487 lines of generated surface)**:
  hero → DocsInstall → overview → usage → the live lab (same-source
  PILOTS block) → API (generated meta + curation — the hand API table
  retired) → the eight axes (per-axis table + the frozen pole + query()
  case + the fixed-paint TokenTable) → accessibility → see-also. The cx
  predicate one-liner applied (typed filter). One h1 (hero
  headingLevel={1}). The old page's `<style>` block (raw-var demo
  slides) replaced by rt.panel atoms + structural inline heights.
- **+page.ts** — toc rebuilt: overview/usage/carousel-demo/api/axes/
  accessibility (6/6 ×1, DOM order); the dead #types/#theming/
  #universal-props anchors gone; see-also out of the toc per the ruling.
- **PILOTS joined** — both canvases are static stages wired through
  `resolveRawCode` (carousel-demo + axes); the query() canvas stays hand
  with the documented rejection class (the responsive query() embed).
  Spec blocks added at test/canvas-same-source.spec.ts:541/:551 with the
  provenance comment; snapshots filled by `-u` and stable on a clean run.

## The axis story (all claims probed, receipts in-repo)

- **The family is the W3C-first scroller**: CSS scroll-snap pages
  (`scroll-snap-type: x mandatory`), the platform animates, JS only
  READS the position (rAF-throttled) for the dots' honesty. The paging
  motion is deliberately the platform's own — the motion row retires the
  axis with that reason (zero readers).
- **Density: SUPPLY-ONLY ON SELF, SUPPLIED TO THE SLIDES** — data-density
  stamps the root; the chrome reads NONE of the re-based channels (the
  track gap is the fixed --jx-space-12, the dots' gap --jx-space-8, the
  arrows' type the fixed base-type equation). Measured: a stamped lg rung
  leaves snap/gap/arrows/dots unmoved. The falsified density token rows
  the W3-era page documented (--jx-icon 16/18/20/24px, --jx-hit
  28/32/40/48px, both `source: 'density'`) read **0** in ui/carousel/ and
  retired with the hand table — the avatar falsification precedent.
- **Theme: THE FROZEN POLE, measured.** Every painted voice is the stylex
  :root emission (--jx-border/--jx-popover/--jx-foreground/--jx-primary/
  --jx-muted/--jx-ring/--jx-shadow-xs) plus kernel space channels — zero
  raw reads (grep receipt) — so a resolved dark stamps .dark and NOTHING
  flips: measured byte-identical arrow ground/ink/border/shadow and dot
  ground across the island. (The arrow shadow is the typed --jx-shadow-xs
  intermediate — frozen, unlike button-group's raw --shadow-xs cluster
  shadow that follows the theme; the emission-form grep decides, and here
  it decides FROZEN.)
- **Size inert on the chrome**: the §11 stamp lands on the root; the
  arrows/dots/track are fixed micro-geometry (2rem/0.5rem/fixed space
  steps); slides inherit the echo only through their own markup.
- **shape/radius/color/elevation/motion**: supply-only with zero-reader
  grep receipts (all measured 0 in ui/carousel/).
- **query() two-generic**: `query<{ lg: DensityLane }, DensityLane>(
  { lg: 'large' }, 'small')` served in the usage file; live 1280px →
  data-density **lg** → 600px → **sm** → back — the root's stamp flips in
  the live DOM, the chrome stays fixed (the honest caption names exactly
  that split).
- **LAW #14 applied to the dots-honesty receipt**: next-click → 700ms
  settle → scrollLeft lands exactly one slide+gap and the active dot +
  aria-current move together (before 0/dot 0 → after 314/dot 1/aria
  -current 1 on the new page; 671/1 on the old — viewport-dependent, the
  page states no absolute px).
- **a11y floor**: role=region + aria-roledescription="carousel"; the
  track is the keyboard surface (tabindex 0 — mandatory snap eats the
  native arrow scroll, so the track's own keydown pages); arrows and dots
  are real buttons (aria-labels, aria-current on the active dot); the
  no-aria-pressed law (selection is toggle-group's) is the recorded
  boundary.

## EXTRA arithmetic (chain head reconstructed from the artifact)

carousel.meta.ts parsed (string-aware, hyphen-inclusive): **15 raw
entries, ZERO duplicate keys** − 8 axis-named = **7 family rows** (label,
slideWidth, dots, prevLabel, nextLabel, class, children); no hidden lane;
no extra lane. Served family table: 8 rows incl header = **7** ✓.

## Gates (before/after the edit)

| gate | before | after |
|---|---|---|
| batch4-components solo (the family pin) | green at task-19 era | **12/12** (exit 0) |
| docs-structure solo | green | **12/12** (exit 0) |
| docs-nav-filter solo | green | **20/20** (exit 0) |
| docs-ambient-vocabulary solo | 283/283 (task 22) | **283/283** (exit 0) — carousel is outside the tasksUniverse, no matrix re-pin required |
| canvas-same-source solo | 79/79 (task 22) | **88/88** (exit 0; −u filled the 2 carousel snapshots, clean run stable) |
| `verify:docs-universal` | 110/110 | **110/110** (exit 0) |
| `verify:tailwindless` | exit 0 | receipt verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim` |
| `verify:docs` | exit 0 | `✓ all docs pages pass the skeleton lint (staged scope green)` |
| svelte-check page-scoped | — | **0 carousel.html diagnostics** (fleet 1617 pre-existing, sibling noise) |

## Process evidence

- Port :5244 empty before (lsof exit 1); dev server background task (log
  /tmp/marginalia-23-dev.log), killed by PID at the end with the
  lsof-empty receipt in the final message.
- Probes: /tmp/marginalia-23-probe0.mjs / -probe0b.mjs (pre-write: snap,
  dots honesty, theme voices — probe0's tail crash was my own variable
  shadowing, kept), probe2.mjs (post-write: rungs, frozen pole, dots
  honesty, query flip). SSR: /tmp/marginalia-23-ssr.html (982,734 bytes,
  fetched AFTER the transient mid-edit 500 — the first 500 was a
  compile-in-progress; the second was real: the dropped PlayFields
  import, caught by svelte-check and fixed).
- Honesty receipts: the falsified --jx-icon/--jx-hit density token rows
  (--jx-icon ×143 / --jx-hit ×74 remain page-wide from OTHER families'
  css, but ui/carousel/ reads neither — grep 0) retired with the hand
  table; the old page's `<style>` raw-var demo block replaced by rt atoms.
- Working tree carries sibling in-flight work (unchecked, untouched). NO
  commits, NO push.

# Report 1 — CODE `alert` (vellum, 2026-09-22)

**Task:** docs-eight-axes-mdn round 1, page `alert`
(`apps/www/src/routes/docs/components/alert.html/+page.svelte` + `+page.ts`).
Family: `apps/www/src/lib/ui/alert/`. No commits made (orchestrator
integrates); work left in the tree.

## Tier: 2 优化重构

**Why:** the bones were good — SectionCard/ComponentCanvas/PropsTable
machinery, an accurate API table, real same-source canvas files — but
(1) the W3-era universal-props section was exactly the proposal's
"single uniform demo card" (one summary + two static alerts), (2) the
same `usage` CodeBlock was rendered twice (the `#alert-base` and
`#usage` sections were byte-identical), (3) section order drifted from
the archetype (a11y/theming before the axis material, API dead last),
and (4) there was no per-axis documentation, no query() case, no
see-also. A rewrite (tier 3) would have cost more than repair and
discarded accurate material.

## What changed

- **Archetype order landed:** hero (H1 + one-sentence contract) →
  Overview (4 short paragraphs absorbing the old W3C live-region-split
  card + the dismissal lifecycle + hue injection) → **Usage** (the live
  example: canvas with the variant pair × both roles + a `theme="dark"`
  notice; body-only notice folded into the hero/pills + overview so the
  old types section could retire without information loss) → **Props**
  (the 10-row PropsTable, moved up per archetype, `universal` flag
  intact) → **The eight axes on alert** (the new heart) →
  Accessibility (kept, tightened, measured hit numbers) → **See also**
  (new: toast, system-dialog, universal-props concept page).
- **The eight-axes section** replaces the W3 demo card:
  - per-axis table (8 PropsTable rows, the concept page's custom-row
    idiom): axis · lane type (schema-accurate steps/units) · default ·
    what it drives HERE with real carrier names from the family source
    (`--jx-size-effective`, `--jx-radius-effective`,
    `--jx-shape-effective` + `--jx-radius-factor-effective`,
    `data-density` + `--jx-density-coefficient`,
    `--jx-color-effective`, the `.dark` class bridge,
    `--jx-elevation-effective`, `--jx-motion-effective`);
  - grouped runnable examples: the concentric-anchor demo
    (`radius={20} size={18}` + nested `Card radius="auto"` resolving
    6px) and the density-rung pair (`density="lg"` vs `"2xs"`,
    dismissible, × hit lane 48px vs 24px);
  - ONE real query() case with its own canvas:
    `density={query<{ sm: DensityLane }>({ sm: 'small' }, 'large')}` —
    live-measured: ≥40rem resolves sm (32px ×), below 40rem the base
    large rung (48px ×), re-resolving live on viewport flips;
  - the supply-only axes (shape · color · elevation · motion) stated
    as documented absences with the family-CSS reasons, plus the
    census citation (explicit-props `migration-census.md`, W3 CLOSE,
    LANDED D5 — the declaration-only density posture retirement);
  - TokenTable trimmed to the family's REAL tokens (dropped
    `--jx-text/--jx-inset/--jx-stack` rows the banner never reads;
    `--jx-hit` re-measured: 24/28/32/40/48px for 2xs→lg — the old
    row's "28/32/40/48" was missing the 2xs rung).
- **+page.ts toc** updated to the new section ids (overview, usage,
  api, axes, accessibility, see-also).
- Every honesty claim in the per-axis table is **live-measured**
  (probe below), not inferred from source reading — three of my
  source-read claims were wrong and got corrected by measurement.

## Live-measurement receipt (the page's honesty contract)

Playwright probe against the dev server (17/17 PASS, log
`/tmp/vellum-alert-axis-probe.log`):

- auto stamps nothing (plain alert: empty style attr);
- `radius={20} size={18}` stamp both carriers inline;
- root font-size composes 18px **but the banner's title/body stay
  13px** (rem-anchored `--jx-text-base`) — the family source comment
  "ONE number moves the whole notice: title, body and the × affordance
  scale" is WRONG for today's atoms; the page documents the truth
  (the axis sets the ambient reference, the fixed voices stay);
- the banner's own corners read the theme `--radius` (8px where
  corner-shape is supported), never the radius lane;
- nested `Card radius="auto"` computes max(0px, 20 − 14) = 6px;
- density rungs stamp `data-density` (lg/2xs) and move only `--jx-hit`
  (48px vs 24px); banner type unaffected;
- `theme="dark"` stamps the `.dark` class bridge on the banner root;
- query(): media keys are MIN-WIDTH — my first draft had the ladder
  inverted ("below 40rem → small"); measurement corrected the demo to
  base-large-below / case-sm-at-or-above, verified live across a
  viewport flip and back;
- exactly ONE `data-jx-props-table-universal` marker; the per-axis
  table renders 8 rows; Props renders 10 family rows + the shared
  8-row universal section from the ONE source.

Visual pass (ui-shot standard, pixel-sanity gated): full page + axes
section + top viewport, light theme, no layout breakage; the toc
renders the new outline; the two density rungs show visibly different
× targets.

## Learnings

1. **Measure before writing honesty.** Three source-read conclusions
   were wrong or stale (the size-axis scaling comment in the family
   source; the theme `--radius` default I assumed to be 0px; the
   query() min-width direction). The dev server + a Playwright
   computed-style probe caught all three before they became
   documented lies. The receipt-authoring law (assert declarations +
   computed recipes) generalizes to doc pages.
2. **The skeleton spec outranks the archetype.** My first draft cut
   the Usage section (the archetype has no Usage slot) and
   `verify:docs` went RED with "alert: no `Usage` H2 section" — the
   docs-site spec hard-requires exactly one Usage H2 on EVERY page.
   Fix: the live-example section IS the Usage section (titled Usage,
   canvas + source inside), keeping archetype order and the gate
   green. Future coders: do NOT drop the Usage H2; retitle whatever
   section carries the minimal working example.
3. **`--jx-hit` rung values**: 2xs=24 · xs=28 · sm=32 · default=40 ·
   lg=48 (measured). The a11y floor note (28px guardrail, 24px at the
   2xs scope = WCAG 2.5.8 AA) is in jixoai.css and now in the page.
4. **Scribe's `-rn` trap, self-inflicted**: one `rg -rn` mid-search
   replaced matches with "n" and briefly masqueraded as a
   `var(n, 0px)` CSS mystery. `rg -n` only.
5. **Orphan process law, again**: killing the dev.mjs wrapper PID
   left vite.js alive on :5242; the grandchild needed its own kill by
   PID before lsof showed the port empty.

## Gate tails

- dev-smoke: `alert page: 200` on :5242; exactly 1 universal marker in
  the served page; probe 17/17.
- `npm run verify:docs-universal` (fresh `npm run build`, exit 0):
  `GREEN: 110/110 component pages render the shared universal section
  (110 markers)`.
- `npm run verify:tailwindless`: `✓ GREEN — 2 class-bearing files
  against the pin ... receipt: files=2 identities=7 occurrences=7
  zones={routes:1, site-libs:0, ui:6} forms=42` — UNMOVED.
- affected specs solo-run (`verify:docs`, docs-site skeleton +
  staged scope): `✓ all docs pages pass the skeleton lint (staged
  scope green)` — alert appears only in the printed backlog
  (no Install/see-also MARKER sections; out-of-scope warn, unchanged
  from the pre-refactor backlog except Usage now passes).
- `verify:mirror`: GREEN (the dev server's www→registry route mirror
  is manifest-clean).
- scoped compile check: svelte-check is NOT installed in this
  workspace; the scoped substitute is the fresh production build
  (Svelte compile + prerender of the page) — exit 0 with the page
  generated. Full `test:types` left for the orchestrator's batch
  close.

## Processes

- Dev server: started `node scripts/dev.mjs --port 5242` (wrapper PID
  6094; actual vite PID 6096). Killed 6094, then found the orphaned
  grandchild 6096 still LISTENing, killed by PID. Evidence:
  `lsof -i :5242 -sTCP:LISTEN` → 0 lines; `pgrep -f "vite.js dev
  --port 5242"` → no process.
- Probe/screenshot scratch files live in /tmp
  (`/tmp/vellum-alert-axis-probe.mjs`, `/tmp/vellum-alert-shots/`) —
  nothing repo-side except the two page files.

## Working-tree note for the integrator

My paths, in full: `apps/www/src/routes/docs/components/alert.html/
+page.svelte` and `+page.ts`. The tree also carries parallel agents'
edits (breadcrumb pages, BOARD.md, assignment.json) — not mine, do
not sweep them into an alert commit.

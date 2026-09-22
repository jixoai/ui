# Report 3 — accordion, REVIEW (2nd, vellum)

agent: vellum · date 2026-09-22 · page
`apps/www/src/routes/docs/components/accordion.html/+page.svelte` (+page.ts) ·
coder marginalia (integrated 895fefe8) · law: mdn-doc-style §5 + §6 ruling +
the W-next ledger · scribe's 1st review parallel, not consulted

## Verdict: NEEDS-WORK

The page's bones are the campaign's best so far — tier 2 was the right call,
the per-axis honesty architecture is sound, and every density/radius/query
number on the page measured TRUE live. But the theme axis documents the exact
false claim the W-next ledger already rules against, and its demo renders a
visibly broken state (white summary ink on the still-white card ground) while
captioning it as success. Plus a stale route TOC with a dead anchor, and
hand-mirrored demo snippets already drifting from their stages in one commit.

## Findings

### BLOCKER

**B1 — The theme row + demo claim "the whole disclosure re-themes in place"; measured: it half-does, and the half that flips makes the summary invisible.**
`+page.svelte:155-160` (theme row: "Consumed on the family… the whole
disclosure re-themes in place"), `:481-489` (deviations paragraph: "density
and theme are the only lanes that repaint the accordion itself"), `:531` and
`:216` (demo caption/snippet: "the frame re-themes in place").

Live probe on :5242, theme canvas (`<Accordion theme="dark">`):
- `.dark` lands on the frame ✓ (claim true).
- Summary ink flips: `oklch(0 0 0)` → `oklch(1 0 0)` (raw `--foreground`).
- Card ground does NOT flip: frame stays `oklch(1 0 0)` — `--card` at the
  frame IS dark (`oklch(0.3211 0 0)`) but the atom consumes `--jx-card`,
  frozen at :root (`oklch(1 0 0)`). Net: **white summary text on a white
  ground — the demo's summary line is invisible on the live page.**
- Body ink does NOT flip (`--jx-muted-foreground` stays the light
  `oklch(0.3211 0 0)`); frame border does NOT flip (`--jx-border` frozen).

This is the semantic-ink gap of W-next ledger #1
(`research/family-comment-drift.md`, "Pages must document theme as
supply-side until the protocol pass") — the exact corollary I was asked to
check, now measured on THIS family: raw-token voices flip, semantic stylex
voices stay at page resolution. The page documents the opposite. §4 hard law:
"never invent an axis behavior." Fix (one line each): theme row → "the .dark
class bridge flips the family's raw-token voices (summary ink, seam, focus
ring); the semantic stylex voices (card ground, frame border, body ink) stay
at page-scope resolution — the semantic-ink re-scope gap (W-next ledger #1) —
so a dark island is a PARTIAL re-theme until the protocol pass"; deviations
paragraph → density is the only full repainter, theme is partial (say which
voices); recaption the demo to name the gap instead of "re-themes in place"
(or drop the demo until the re-scope lands — an honest absence is MDN-grade).

### MAJOR

**M1 — Route TOC is stale: dead anchor, the page's heart section missing, labels/order wrong.**
`+page.ts:6-13`. The toc array still lists the OLD page: `theming` (id no
longer exists on the page — 0 hits in SSR; the TOC entry scrolls nowhere),
no entry for `universal-props` ("The eight axes on the accordion" — §2.5's
heart), `types` labeled "Types" (section is now "Postures"), `api` labeled
"API" (now "Props"), order stale. Every sibling campaign page (alert, anchor,
blockquote, breadcrumb) rewrote its toc to the archetype — accordion is the
outlier; deep-link audit found zero inbound repo links to the dead id, so the
blast radius is the TOC itself. Fix: rewrite the array (alert's `+page.ts` is
the shape): accordion-base → usage → types(Postures) → api(Props) →
universal-props(The eight axes) → accessibility.

**M2 — Hand-mirrored demo snippets already drift from their stages (§4: "no stale snippets").**
Four spots, all introduced in the same commit:
- density: snippet `:192/:198` says "The lg rung — 15px summary text." /
  "The sm rung — 12px summary text."; stage `:508/:517` renders "The lg
  rung: T_base + 2px." / "The sm rung: T_base − 1px." (also "T_base" is an
  undefined term — §1).
- concentric: snippet `:241-244` carries the parenthetical "(native-details
  content is in flow; no portal boundary)"; stage `:548` truncates it.
- query: stage `:561-562` adds "Resize the window and watch the summary
  step."; snippet `:267` lacks it.
- canvas drawer: `canvasFiles` `:71` presents `usage` (2 plain items) as the
  page's usage source; the stage `:389-407` renders a 3-item FAQ with a Badge
  and `bind:open`.
Fix: make each snippet string mirror its stage verbatim (prefer the clearer
"15px summary text" copy on BOTH sides; define or drop "T_base"), and either
regenerate the drawer's usage file from the stage or label it as the minimal
install example.

### MINOR

**m1 — density type union truncated vs schema.** `+page.svelte:144`: type
column says `'small' | 'medium' | 'large' | 'auto' | number`; the schema
(`universal-props.schema.ts:71`) is `'small' | 'medium' | 'large' | 'xs' |
'2xs' | 'sm' | 'default' | 'lg' | 'auto' | number`. The prose mentions "the
five legacy rungs" but the type column is the reference — `density="2xs"` is
valid and the table says no. blockquote `:109` already carries the full
union. Fix: paste the schema union.

**m2 — §6 ruling: the broadcast mechanism is invoked 6+ times, gloss never supplied.**
First mention `:482` ("the five broadcast-only lanes"); also `:131/:152/
:166/:173` ("broadcasts to nested consumers"). The page avoids raw Chinese,
so the letter's prohibition holds, but the ruling's form — first mention
per page writes "the broadcast protocol (吃也供, supply-and-consume)" —
is unmet, and this is the first page integrated after the ruling. Fix: gloss
at `:482`, e.g. "the five broadcast-only lanes (the broadcast protocol, 吃也供
— supply-and-consume; the universal-props concept page owns the term)".

### NIT

**n1 — A11y section misses the measured density-invariance note.** `:576`.
The archetype wants the density/hit-floor note where relevant; here the
honest note is the ABSENCE: the summary's hit height does not move with
density (measured: 11px padding-block at default, sm AND lg). One line in
Accessibility earns its keep.

**n2 — Size-row prose garble.** `:124`: "a Card or PressButton inside an
item body at auto sizes in em off it" — hard to parse. Fix: "a Card or
PressButton inside an item body sizes in em off it when its own size is
auto."

## What measured TRUE (live re-measurements, :5242)

Marginalia's core claims largely survive contact with a browser — recording
them so the fix round doesn't touch them:

1. **Density is the one full painter, exactly as documented**: summary 13px
   default / 15px lg / 12px sm, and the DensityDemo's wrapper-scoped xs rung
   measures 11px — the "11 · 12 · 13 · 15px at xs/sm/default/lg" ladder is
   measured-true. Paddings UNMOVED across rungs (11px block / 14px inline —
   the `calc(var(--jx-unit) * 3.5)` ruler-equation claim confirmed; my first
   probe disagreed due to a string-compare bug, re-measured clean).
2. **Radius is anchor-only, and the D5 census receipt lives**: frame style
   stamps `--jx-radius-effective: 20px`, frame's own corners stay ambient
   (8px, unmoved), nested auto Card computes exactly 6px — census
   `migration-census.md` D5 row verbatim on the page.
3. **query() direction correct**: min-width ladder — 12px below 40rem, 13px
   above; page text ("compact below, default above") matches the engine.
4. **The five broadcast-only lanes**: source-grep confirms the family CSS
   consumes NONE of `--jx-size-effective`, `--jx-shape-effective`,
   `--jx-radius-factor-effective`, `--jx-color-effective`,
   `--jx-elevation-effective`, `--jx-motion-effective` (only radius's
   `--jx-radius-effective` is supplied for nested consumers). The density
   row's declaring-element mechanics (rung attr → scope block re-declares
   `--jx-text` at the frame; bare coefficient matches no block) match
   `jixoai.css:453-458, 2594-2599` exactly.
5. **Steps/units vs schema**: all eight type unions match
   `universal-props.schema.ts` except density (m1). Defaults all `auto` ✓.
6. **Tier judgment**: tier 2 correct. The dropped W3-era TokenTable
   (`--jx-hit/--jx-inset/--jx-stack` "source: density") was FALSE for this
   family — the CSS consumes none of those channels and pads measure
   unmoved — so dropping it was correction, not information loss; tier-2's
   survival duty holds for everything real.

## Hard laws / gates (all re-run this review)

- `npm run verify:tailwindless` (repo root): exit 0 — receipt UNMOVED
  verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0,
  ui:6} forms=42 — bound verbatim`.
- `npm run verify:docs-universal`: exit 0 — `GREEN: 110/110 … (110 markers)`.
- Universal marker ×1: exactly one `data-jx-props-table-universal` in SSR.
- Generated sections intact: `data-doc-install` + `data-doc-see-also` both
  present in SSR.
- `npm run verify:docs`: exit 0; accordion has ZERO backlog lines (the two
  alert lines are my own in-flight page per BOARD — not this review's page).
- Same-source: registry files ride `?raw` imports ✓ (`:30-31`).

## Process (the recycle law)

- Probe server: `npm run dev -- --port 5242 --strictPort` in
  `apps/www`, wrapper PID **84271** (`/tmp/vellum-acc-review-5242.pid`),
  page `HTTP:200 bytes:1155371`.
- Probes: `/tmp/vellum-accordion-review-probe.mjs` (15 checks) +
  `/tmp/vellum-acc-pad-recheck.mjs`, `/tmp/vellum-acc-xs-recheck.mjs`.
- Recycled: wrapper killed; orphan sweep found no vite grandchild holding
  the port; `lsof -i :5242 -sTCP:LISTEN` → exit 1 (zero listeners); PID
  84271 gone.

## Highlights (what this page does better than my alert — adopted)

1. **The census-citation paragraph with NAMED lane groups** (five
   broadcast-only · anchor-only radius · the repainters) under the axis
   table — sharper than the flat citation I planned for alert. Upgrade: my
   alert deviation paragraph gets the same grouping (with theme corrected to
   "partial, per B1").
2. **The D5 concentric demo as a page-number-equals-census-number receipt**
   (20 → 6px measured live). Adopt: put a live numeric receipt in alert's
   axes demos instead of prose-only claims.
3. **The declaring-element mechanics documented per lane** (rung attr vs
   bare coefficient — WHY one repaints and one doesn't). Adopt for alert's
   density row.
4. **The drift ledger discipline** — marginalia routed the family-comment
   lie to `research/family-comment-drift.md` instead of silently documenting
   around it (and my alert entry was already there). Adopt as standing
   practice: any comment-vs-code contradiction I find gets a ledger line.

Upgrade commitments (queued with my alert micro-fix per BOARD): theme re-probe
+ honest rewrite (now with exact expected values from B1's probe), grouped
deviation paragraph, live numeric receipt in one axes demo, declaring-element
density mechanics, toc kept archetype-shaped.

## Follow-ups for the orchestrator

1. B1 is the ledger-#1 gap surfacing in a THIRD page (anchor ×2, accordion).
   The page-side honest-rewrite fix is mechanical and B1 spells it out; the
   protocol pass itself stays W-next.
2. M2 suggests the same-source spec's coverage gap (usage-kind files are
   unguarded — the spec passed while four mirrors had already drifted). If
   the drift keeps recurring, a lint comparing snippet strings to stage
   markup is the ratchet; not this task.
3. marginalia's archetype-vs-skeleton follow-up (#1 in its report) remains
   open and now has four pages of precedent (Usage before the live canvas) —
   worth an explicit ruling before the pattern calcifies.

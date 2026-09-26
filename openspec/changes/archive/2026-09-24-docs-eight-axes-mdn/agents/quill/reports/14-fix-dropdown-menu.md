# Task 14 — FIX dropdown-menu (post-review corrections) · quill · 2026-09-22

**Verdict: LANDED (working tree; no commits).** All four consolidated-ledger
findings fixed on my task-10 page; every citation re-verified by grep before
writing, and the two load-bearing discriminators re-measured live (probe PASS).

Single file touched: `apps/www/src/routes/docs/components/dropdown-menu.html/+page.svelte`.
Family source untouched.

## Per-finding fixes

### 1. MAJOR — composer sentence named five composers, two false
Re-verified by import-grep before writing: real composers are
`breadcrumb-dropdown.svelte:52` (relative-path import — my original task-10
grep missed it because the pattern assumed `$lib/ui/…`),
`button-group.svelte:253`, `canvas-playground.svelte:185`. menubar imports
NOTHING and its header says "duplicated deliberately: registry items stay
independent, no hidden coupling" (menubar.svelte:17-18); navigation-menu's
header declares "an independent thin" navigation contract
(navigation-menu.svelte:6) where "actions belong to dropdown-menu" (:28).
Rewrote the Overview paragraph: three named composers with an explicit
"import-grep receipt" tag + the sibling sentence ("Two siblings deliberately
DO NOT… registry items stay independent") quoting both headers. Rendered prose
cites files + header language; exact line numbers live here in the report
(line numbers in shipped docs go stale). Verified in SSR: new sentence
present, old five-composer sentence gone.

### 2. MINOR — theme row mis-attributed the panel fill to --popover
Verified the full chain before rewriting: the own level2 default is
unconditional (`dropdown-menu-defaults.svelte.ts:63` `elevationAxisSlot('level2')`
→ `elevationSurfaceOf` stamps the §7 pair + solid-fill bridge on every render),
so `.jx-surface-body`'s `background: var(--jx-elevation-surface,
var(--jx-surface-solid-fill, var(--popover)))` (jixoai.css :962; :892 solid,
:1067 auto variants) takes the FIRST branch → `--jx-elevation-level2-surface`
(:249 light / :382 dark) → `--surface-container-low` (:217 light oklch(0.96) /
:357 dark oklch(0.185)). `--popover` (:59/:278, dark 0.3211) is only the
stamp-less fallback. The theme row and the elevation row now state the fill's
real chain with the discriminator; the --border seam half (which was right)
is kept. **Probe D1**: dark island fill = `oklch(0.185 0 0)` ≠ --popover
`oklch(0.3211 0 0)` (read on the panel itself for the receipt).

### 3. MINOR — FLIPS enumeration omitted the elevation shadow recipes' flip
Verified the declaring lines: light `--jx-elevation-level2-shadow` = black hsl
pair at jixoai.css :246-248; dark re-declares WHITE at :379-381. Added both a
clause in the theme row AND a themeSplitTokens row
(`--jx-elevation-level2/4-shadow` → "FLIPS: black → white recipes").
**Probe D2**: dark island computed shadow =
`rgba(255, 255, 255, 0.16) 0px 1px 2px 0px, rgba(255, 255, 255, 0.08) 0px 2px 6px 2px`
— marginalia's measured value confirmed live.

### 4. NIT — elevation own-default caption not curl-checkable
axes-e-own passes no prop and renders identically to omitted, so "3dp, the
menu rung" wasn't greppable. Caption now: "level2 · own — inspect the panel's
--jx-elevation-effective: 3". **Probe D3**: the panel's style attr carries
`--jx-elevation-effective: 3` with no explicit prop — the caption now points
at a raw-SSR-greppable fact.

## themeSplitTokens reordered (fill first — the mechanism, then the fallback)

New order: level2-surface (fill via ladder) · level2/4-shadow (black→white) ·
--popover/--border (seam; popover as fallback only) · popover-foreground ·
ring · destructive pair · frozen trigger chrome · frozen --jx-destructive ·
press seams.

## Gates

| Gate | Result |
|---|---|
| svelte-check (page-scoped) | dropdown-menu.html exactly 1 error — the standing cx idiom at 91:28 (count-neutral since task 10) |
| dev-smoke :5241 | 200; PID 51377 killed; `lsof :5241` empty before AND after |
| SSR greps | new composer sentence, sibling sentence, fill attribution, shadow row, own-caption all present; old five-composer sentence absent |
| probe | PASS (D1/D2/D3 above) |
| verify:tailwindless | GREEN — receipt verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs-universal | GREEN 110/110 |
| verify:docs | staged scope green |
| affected specs solo (4) | **405/405** |

No commits made. Density-adoption pin untouched (composer wording is prose —
confirmed: the vocabulary spec's carriers set and the density fixture are
unmodified).

# T137 — SECOND REVIEW pagination.html (vellum)

- **Reviewer**: vellum (2nd review; quill's 129b 1st-review NEEDS-WORK opened FIRST;
  every landed disposition verified at byte + served layers; headline receipts
  re-derived through the playground's real state drives. NO commits, NO pushes; zero
  product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/pagination.html/` over the
  seven-part pagination family + pageRange, served live on :5242, dist @ HEAD ef520d44.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT. Tier ruling: Tier 2** (her
  proposal; the window law and the honest-edges claims re-derived digit-exact; the
  NEEDS-WORK driver is fully closed). Her NIT-1 (the lowercase rail label "live demo")
  stands unlanded — cosmetic, the rail-polish pass's queue.

## Her findings — the NEEDS-WORK set closed

1. **MINOR-1 (LAW #19: duplicate `id="usage"` ×2) — KILLED**: the page serves
   **exactly one `#usage`**; duplicate ids 0 page-wide ✓.
2. **LOW-1 (the 7-seat cx-clone concentration) — CLOSED**: `style ?? {}` serves on all
   six family part files (pagination/content/link/previous/next/ellipsis) and the page
   seat; svelte-check: **page 0 / family 1** — the 1 is the KNOWN residual below, not
   a cx seat.
3. **LOW-2 (the `$props`-before-declaration trio + implicit-any fallouts) — CLOSED**:
   pagination-link declares `$props()` at :49 (previous :34, next :33) with no earlier
   `props.` reads — the before-declaration errors are gone.
4. **NIT-1 (the lowercase rail label)**: stands ("live demo" at +page.ts :7) —
   cosmetic, unlanded, correctly out of the mechanical sweep's scope.

## Her headline receipts — re-derived through the playground's real state drives

- **The five-pose window law, digit-exact at every drive** (range → served grid):
  | page | served window | laws |
  |---|---|---|
  | 1 | `‹ prev · 1 · 2 · … · 30 · next ›` | sticky head edge + head window + one collapsed-tail token |
  | 5 | `1 · … · 4 · 5 · 6 · … · 30` | ±1 siblings around current |
  | 12 | `1 · … · 11 · 12 · 13 · … · 30` | ✓ |
  | 30 | `1 · … · 29 · 30` | sticky tail edge |
  **aria-current="page" follows the drive at every pose** ✓ (my fresh-axis live
  current-tracking, folded into the same drive).
- **Honest edges at the bounds**: at page 1, Previous renders a **SPAN with
  aria-disabled="true" and NO href** ✓ — "a link that goes nowhere is a lie" holds.
- **Ellipsis decoration**: the collapsed-range token carries **aria-hidden="true"**
  (out of the reading order) ✓.

## The KNOWN residual — receipted, not re-found

`pagination-link.svelte :93:16` — the button-spread conversion cast
(`HTMLAnchorAttributes & { class: string }` → `Record<string, string>`) remains the
ledgered residual (the dispatch's note). Not re-filed; its owner's sweep owns it.

## Fresh axis (beyond her report)

- The current-tracking drive folded into the window battery: `aria-current` moved
  1 → 5 → 12 → 30 with zero drift across four state transitions — the live slider and
  the grid are one state, measured at every pose.

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD ef520d44, fresh build) | **GREEN rc=0** |
| verify:docs-universal (batch) | **GREEN 110/110 rc=0** |
| svelte-check (ONE saved run) | **page 0 / family 1** — the 1 is pagination-link :93:16, the ledgered residual (not cx, not the trio) |

## Process evidence

- Port **5242**: wrapper + listener 66309; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. The playground range restored through the pose battery.
- Probe faults owned: (1) my ellipsis finder matched the li wrapper first (aria-hidden
  null) — the hidden attribute lives on the inner token span (her
  read-the-named-carrier lesson, applied); (2) my first edge read raced the range
  state (her fault #3's shape) — the aria-current-guarded waits are in.
- Artifacts: /tmp/t137/{probe-mer-pag.mjs,mp.json,gate-docs.log,gate-universal.log,
  scheck.log,lsof-after.txt}.

## Open questions

1. The :93 residual and the NIT-1 rail label remain with the owner's sweeps — both
   ledgered, neither new.

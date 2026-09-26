# T137 — SECOND REVIEW pattern-hero-set.html (vellum)

- **Reviewer**: vellum (2nd review; quill's 129d 1st-review PASS opened FIRST; landed
  items verified at byte + served layers; the copyCommand three-jobs re-derived
  end-to-end; fresh axis. NO commits, NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/pattern-hero-set.html/` over
  pattern-hero-set + pattern-hero-ascii + pattern-hero-marquee (composed over
  hero-section), served live on :5242, dist @ HEAD ef520d44.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT. Tier ruling: Tier 2** (her
  proposal; three live forms, each centerpiece claim re-measured).

## Her findings — closed

1. **LOW-1 (cx clone, page :88 + hero-ascii :124 + hero-marquee :134) — CLOSED**: all
   three lanes serve the `style ?? {}` fix; svelte-check: **page 0 / family 0 errors**
   (the 24-warning lane remains, recorded, untouched).
2. **NIT-1 (the composite API table's prefix convention)** — stands as recorded
   (information complete; the polish pass owns the convention).

## Her headline receipt — copyCommand's THREE jobs, re-derived end to end

- **aria-label = the command**: "copy npx jixoai-ui init --hue 210" ✓
- **The visible label = the same command**: "npx jixoai-ui init --hue 210" ✓
  (labelMatches true — the label IS the payload, one prop driving both).
- **The clipboard carries the exact payload**: read-back **"npx jixoai-ui init
  --hue 210"** — identical, payloadMatches true ✓.
- **The terminal demo types the same string**: present in the surface text after the
  typing window ✓ (her ~1.5s window honored).

## Her other receipts — re-derived

- **The ascii hero's whitespace-as-payload**: the figlet banner rides a `pre` with
  computed **white-space: pre** and **21 newlines** intact — art scrolls, never
  reflows ✓.
- **The marquee two-state contract**: two marquee strips serve the readable row +
  **aria-hidden duplicate rows (×24 elements)**; under emulated
  `prefers-reduced-motion: reduce` the animation computes **none** (animatedCount 0)
  and the hidden duplicates fold away (13 folded to zero-height) ✓.

## Fresh axis (beyond her report)

- The marquee's duplicate census at the element layer: **24 aria-hidden rows** across
  the two strips — the readable row + its hidden twin pattern holds at every copied
  item, not just the strip container (her receipt was strip-level; mine is per-item).

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD ef520d44, fresh build) | **GREEN rc=0** |
| verify:docs-universal (batch) | **GREEN 110/110 rc=0** |
| svelte-check (ONE saved run) | **page 0 / family 0 errors** (LOW-1's three lanes closed; the 24-warning lane recorded) |

## Process evidence

- Port **5242**: wrapper + listener 66309; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. Clipboard state died with the probe browser (permission
  scoped to the probe context).
- Probe faults owned: (1) my first copy-CTA finder keyed visible "copy" — it hit the
  hero bar's INSTALL copy button (HER fault #1's exact shape, re-owned); the command
  is findable by its aria-label carrying the payload; (2) my first marquee-reduce read
  keyed strip-level animation only — the per-item hidden rows needed their own fold
  census.
- Artifacts: /tmp/t137/{probe-faq-hero.mjs,probe-hero2.mjs,fh.json,scheck.log,
  lsof-after.txt}.

## Open questions

1. The composite API table's prefix convention (NIT-1 standing) — the api-polish
   pass's queue; information complete as served.

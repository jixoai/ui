# TASK 139 — scroll-run (docs page) — 2nd eight-axes review (scribe)

**VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT (new) — Tier 2 CONFIRMED.**
Owner = marginalia; her 1st (T131, PASS 0M/2m/0L/1N) is LEDGERED — its findings land at
the next consolidation, not this review's to find. This 2nd verifies the standing state,
re-derives the verdict-machine receipts, and adds the fresh axis. Dist = **14c8ecd2**
(fresh build rc=0). Port 5243 mine; killed after probes, lsof post rc=1, siblings
untouched.

## The ledgered findings — state-checked, honestly standing

- **MINOR-1 (chips shipped `tabindex="-1"` while the page teaches "real focusable
  buttons" ×2)** — STILL PRESENT as ledgered: both `tabindex="-1"` stamps in
  scroll-chrome.svelte confirmed at source, the served chips read tabindex="-1", and both
  page seats (:369 the srun-law line, :396 the a11y aria row) still teach focusable.
  Consolidation's reword-or-drop decision still owed.
- **MINOR-2 (six page type seats)** — **ALREADY HEALED by the fleet sweeps**: the batch's
  ONE saved svelte-check reports **0 errors on scroll-run.html/+page.svelte** (the
  :286/:301 cx-false handings and :314/:315 snippet unify were the exact classes the
  post-T131 consolidations closed fleet-wide). The ledger entry can record this half as
  resolved; the family stays 0 errors + 9 standing warnings.
- **NIT ("pre-hydration the strip is naked — no chips")** — STILL PRESENT at :334 (the
  DOM-false phrasing; the one-clause "no chips paint" fix still owed).

## Her receipts — re-derived on my instruments

- **The four-state verdict machine, live**: `data-jx-scroll-state` = **start-closed** at
  load (tabindex "0", progress "0") → **end-closed** at scrollLeft 159 = max 159 (progress
  "1") → **start-closed** back at 0 — the cycle reproduces exactly.
- **The end-state edge flip**: at end-closed the FIRST member carries
  `--jx-edge-start: 1.000` and the LAST member's edge-end is cleaned ("") — her flip
  receipt verbatim.
- **The chips are the ledgered shortcuts**: four rendered chips (two runs) all carry
  tabindex="-1" — the MINOR-1 receipt, still standing.

## The fresh axis — the traveling state, sampled

Her four-state census sampled start-closed, end-closed, and none (the two rest verdicts
plus the fits verdict). I drove the run to **mid-travel**: the verdict reads **"open"** —
the traveling state her receipt implied but never sampled — with `--jx-scroll-progress`
at **0.479** (76/159, the exact half of the travel). The machine is therefore fully
five-valued on the served page: `open` while traveling, `start-closed` / `end-closed` at
the rest edges, `none` under fits — and the progress var tracks continuously (0 → 0.479 →
1 → 0 across my drive).

## Standard battery

- toc 8 == rail; **LAW #19: 37 ids, zero duplicates**.
- Gates: verify:docs **rc=0** (after one transient ENOENT crash — a sibling consolidation
  was rewriting dist/docs/components mid-read; the re-run passed clean, recorded as
  environment) · ONE saved svelte-check (the receipts above).
- Probe-fault ownership: my first nudge/scroll attempts raced the run's smooth
  scroll-behavior — `scroll-behavior: auto` forced before assignments (the family's own
  trick); the mid-travel read waited for the verdict stamp to settle after the forced
  scroll.
- Artifacts: /tmp/g139-{sr-sel,r2,th}.mjs + /tmp/g139-{build,docs,docs2,scheck,preview}.log.

## Open questions

The ledger's reword-or-drop decision on MINOR-1 (and the NIT clause) is the only owed
item — confirmed standing, one consolidation away.

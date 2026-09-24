# Proposal — docs-eight-axes-tier-conditional (Owner decision #13: B+C)

## Why

The docs-eight-axes-mdn campaign archived at **implementation-complete / Owner-gated**
(Codex R3: 8.5/10 CONDITIONAL GO, 2026-09-24). The gate was the archived change's
spec delta — "Every page SHALL carry a per-axis table … and one real query() case"
— an UNCONDITIONAL per-page SHALL that the campaign's Tier-1 execution practice
did not fully satisfy: 48/110 pages carry no bespoke axis table marker, 7 lack a
query() case, 39/40 lack Install/See-Also, 70 render Examples before Usage
(Codex R1 B2, independently scanned; preserved verbatim in the archived
owner-acceptance.md §7-B2).

**The Owner has ruled (2026-09-24, this change's trigger): option B+C.**

## What Changes

1. **B — the living spec gains the REVISED, tier-conditional requirement**
   (the archived delta's unconditional SHALL is superseded by this text; it was
   deliberately never landed — see the archive note on 09eee3f5): axis depth is
   governed by each page's RECORDED tier, and the tier + justification live in
   the campaign ledger the reviews enforced.
2. **C — the successor handoff is formalized**: the skeleton-contract gaps
   (Install/See-Also/Usage-order across the warn fleet, 149 lint lines tracked by
   `scripts/docs-skeleton-scope.json`) belong to
   `2026-08-30-docs-demo-standard-global-gate`. With B landed, that flip's red
   surface is the skeleton contract only — the axis depth can no longer redden
   it, because depth-at-tier is now the contract.

## Non-goals

- No page rewrites in this change (option A was not chosen).
- No gate mechanics change: `docs-skeleton-scope.json` and
  `verify-docs-structure` keep their staged behavior; the successor flip stays
  the successor's move.

## Evidence trail

- R1 4.5 NO-GO → R3 8.5 CONDITIONAL GO receipts: archived change
  `2026-09-24-docs-eight-axes-mdn/owner-acceptance.md` §7 (terminal-state
  declaration + decision #13/#14).
- The Owner's one-line signature in the governing session: **"B+C"**.

# T137 — SECOND REVIEW pattern-faq.html (vellum)

- **Reviewer**: vellum (2nd review; quill's 129c 1st-review PASS opened FIRST; landed
  items verified at byte + served layers; the exclusive guard re-driven; fresh axis.
  NO commits, NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/pattern-faq.html/` over
  pattern-faq (composed on the accordion family's native details/summary), served live
  on :5242, dist @ HEAD ef520d44.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT. Tier ruling: Tier 1 CONFIRMED**
  (her proposal stands — the compact pattern page whose claims ride composed platform
  behavior; my re-derives reproduced with zero new surface).

## Her findings — both closed or standing-as-ledgered

1. **LOW-1 (cx clone, page :59 + family :126) — CLOSED**: both sites carry the
   `style ?? {}` fix; svelte-check: **page 0 / family 0 errors**.
2. **NIT-1 (the universal demo pair numerically coincident)** — STANDING, verified as
   she left it: the universal section's two seats stamp `--jx-size-effective: 16px`
   and `--jx-size-effective: var(--jx-size-medium)` and BOTH compute **16px** — the
   coincidence receipt re-taken (cosmetic, the owner's demo-coherence queue).

## Her headline receipts — re-derived

- **The exclusive guard, live (two transitions, scoped to the pattern's own four
  questions)**: opening Q1 → `[true, false, false, false]`; opening Q4 →
  **`[false, false, false, true]`** — Q1 closed, exactly ONE `details[open]` at every
  step; openAtEnd 1 ✓ — "one-open-at-a-time" measured through the accordion's own
  guard.
- **The man-page framing**: `jixoai-ui-faq(7)` head, the NAME row, and the SEE ALSO
  footer citing `jixoai-ui(1)` + `patterns(7)` all serve ✓.
- **LAW #19 / battery**: zero duplicate ids; toc == DOM == rail 5/5, zero dangling ✓.

## Fresh axis (beyond her report)

- **The keyboard toggle, real keys**: focusing a question's summary and pressing real
  Enter opens it (1 open), a second Enter closes it (0 open) — "nothing hydrated in
  the toggle path" exercised through the platform's own summary activation, her
  no-synthetic-events discipline held.

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD ef520d44, fresh build) | **GREEN rc=0** |
| verify:docs-universal (batch) | **GREEN 110/110 rc=0** |
| svelte-check (ONE saved run) | **page 0 / family 0 errors** (LOW-1's both seats closed) |

## Process evidence

- Port **5242**: wrapper + listener 66309; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. The question states died with the probe browser.
- Probe faults owned: (1) my first summary census matched 24 page-wide summaries —
  the scaffold's own sidebar groups among them (an invisible nth(23) timed the click
  out); scoped to `#demo summary` (the pattern's own four questions) — the guard read
  is per-family, never page-global.
- Artifacts: /tmp/t137/{probe-faq-hero.mjs,probe-fh2.mjs,fh.json,scheck.log,
  lsof-after.txt}.

## Open questions

1. The coincident universal pair (NIT-1 standing): a `size={20}` second seat would
   show the em-scale the demo teaches — the owner's cosmetic queue.

# T115 — SECOND REVIEW terminal-card.html (vellum)

- **Reviewer**: vellum (2nd review; marginalia's 99 1st-review report opened FIRST;
  landed items verified at byte + served layers; the bezel-lock two-read re-derived
  with the tree injection; fresh axes. NO commits, NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/terminal-card.html/` over the
  terminal-card family, served live on :5242, dist @ HEAD.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT.** **Tier ruling: Tier 2** (her
  explicit proposal; the timing-state-machine receipts re-derived where they were
  cheaply falsifiable). Her MINOR 1 (the 6px→4px truing) LANDED at all eight seats and
  mirrors clean; her LOW 2 (the content-keyed each) LANDED as the index key, mirrored.

## Her findings — both landed, byte + served receipts

1. **MINOR 1 (the "6px hard offset shadow" claim stale at 4px) — TRUED EVERYWHERE.**
   Byte layer: `grep 6px` across page + family + registry twin = **0 hits**; the page
   carries the 4px wording ×5. Served layer: exactly **8 elements paint
   `4px 4px 0px 0px`, zero paint 6px** — and my fresh split: the dark-locked cards
   paint **rgb(255, 255, 255) 4px 4px** while the light-scoped seat paints
   **rgb(0, 0, 0) 4px 4px** — the shadow digit true at BOTH scheme strata (her
   receipt named the white; the black half is the light shell's own).
2. **LOW 2 (outputs keyed by line STRING — duplicate-line key collision) — FIXED and
   MIRRORED.** Both trees :247: `{#each outputs as line, index (index)}` — the key is
   positional, duplicate line strings can no longer collide (the content-keyed-each
   hazard closed for this append-only list; the family files byte-match).

## Headline claims — re-derived

- **The bezel lock, two-read with the tree injection (her headline, both seats)**:
  with `html.dark` injected on the light page — the default card's ground
  **oklch(0.2 0 0) unchanged** (own-before-ambient ✓) and the `theme="light"` seat
  (own `.jx-light` scope class, source :229) **oklch(0.9551 0 0) unchanged** —
  before/during digit-identical at both seats, restored after. The two shells read
  independently of the tree, exactly her receipt.
- **The prerender/settled claim, re-receipted in raw HTML**: SSR 985,549 bytes carry
  **jx-out-shown ×14** (every served output settled — her run counted 11; the light
  seat's outputs and additions since account for the delta; the CLAIM "every seat
  settled" is what matters and holds at 14/14) and **24 traffic-light dots = 8 cards
  × 3** ✓ digit-exact.
- **The static cursor**: `.jx-cursor` computes **animation-name: none** ✓ (the
  no-blink law; source :244, aria-hidden).
- **svelte-check**: **0 diagnostics** on the page (her :94:28 cx clone closed).

## Fresh axes (beyond her report)

- The two-scheme shadow split (above) — the trued digit verified per theme stratum,
  not just per seat count.
- The light-seat identification receipt: the light scope rides the card's OWN class
  (`[data-jx-terminal].jx-light`, lightOwn true — not an ancestor wrapper), pinning
  her "always wears its own scope class" sibling-differential note to a selector.

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD 43da0d99) | GREEN rc=0 |
| verify:docs-universal | GREEN 110/110 rc=0 |
| svelte-check page-scoped | **0 diagnostics** (her Finding-cx closed) |

## Process evidence

- Port **5242**: wrapper + listener 76910; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. The html.dark injection removed in-probe (restore verified).
- Probe faults owned: my first bezel finder keyed `[data-jx-terminal-card]` (a guessed
  hook — ×0 matches) and the light seat by text search (caught a dark card) — the
  real hooks are `[data-jx-terminal]` + the own `.jx-light` class (source :215/:229);
  the two-read re-run on the true carriers is the receipt.
- Artifacts: /tmp/t115/{probe-steps-tc.mjs,probe-main3.mjs,probe-final.mjs,probe-tc3.mjs,
  tc-ssr.html,steps-tc.json,main3.json,scheck.log,lsof-after.txt}.

## Open questions

1. None. Her `theme="system"` unseated-arm note stands (source-real, one seat away).

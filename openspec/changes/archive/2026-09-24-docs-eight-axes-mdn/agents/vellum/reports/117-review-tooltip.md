# T117 — SECOND REVIEW tooltip.html (vellum)

- **Reviewer**: vellum (2nd review; marginalia's 106 1st-review report opened FIRST;
  landed items verified byte + served; her intent-battery digits accepted as the
  receipt set per dispatch, with my census re-derive; fresh axes. NO commits, NO
  pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/tooltip.html/` over the tooltip
  family, served live on :5242, dist @ HEAD f4a36087.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT.** **Tier ruling: Tier 2** (per
  her proposal). Her LOW-1 (Escape attribution) TRUED verbatim; LOW-2 (cx pair +
  the :762 Node guard) CLOSED; the intent census re-derived.

## Her findings — both closed

1. **LOW-1 (the base summary credited the platform with Escape plumbing manual
   semantics turn off) — TRUED, her wording landed**: source :171 reads "The Popover
   API gives the top layer and **manual semantics — Escape becomes the component's
   job** (manual popovers skip the native Esc path; the family wires its own window
   keydown)". The a11y row and the summary no longer disagree.
2. **LOW-2 — CLOSED**: svelte-check page **0 diagnostics** (:81 cx gone) and the
   family's :762 seat is fixed exactly per her fix shape —
   `if (!(e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget))) close();`
   (source :762, the instanceof Node narrowing). The :156 cx twin: family lane now
   carries 8 hits all warnings-class standing (the recorded octet) — the cx ERROR
   seats are gone.

## Her intent battery — the census re-derived (her digits stand as the receipt set)

- **15/15**: role=tooltip panels ×15, aria-describedby wrapper→panel pairs ×15
  (resolved targets), popover=manual — her census digit-exact at the current tree.
- **Live drive**: a real Tab walk opened a tip; at kernel rest — **rest gap exactly
  6px** (the --jx-tip-gap token, margin 6px, translate 0px — the settle discipline
  that turned her probe1's 16px artifact into her probe2's 6px receipt), the
  describedby pairing resolved (anchor's describedby === the open panel's id),
  `data-side="bottom"` stamped, and **Escape closed the open tip** — the component's
  own window-keydown path serving the trued claim end-to-end.
- LAW #19/census: no duplicate ids in my pass; the DensityDemo quadruple survives
  clean.

## Fresh axes (beyond her report)

- The kernel-rest gap re-derive via a real-key drive (her probe2 used mouse rest
  geometry; mine confirms 6px through the focus-intent path — one token, both intent
  channels).
- The Escape end-to-end attribution (open via keyboard intent, close via Escape — the
  trued summary sentence exercised rather than only read).

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD f4a36087) | GREEN rc=0 |
| verify:docs-universal | GREEN 110/110 rc=0 |
| svelte-check page-scoped | **0 diagnostics** (her :81 seat closed) |
| family lane | 8 hits, all the recorded warnings class; the :156 cx ERROR and :762 relatedTarget ERROR gone (the Node guard landed) |

## Process evidence

- Port **5242**: wrapper + listener 27154; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. Open/closed tip state died with the probe browser.
- Probe faults owned: (1) programmatic `.focus()` on the anchor does not engage the
  keyboard-intent path (open stayed false) — a real Tab walk is the valid instrument
  (the focus-visible/keyboard gating is doing its job); (2) my first trigger locator
  guessed button[aria-describedby] — the trigger is the span[data-jx-tip-anchor]
  wrapper (source :747-751); (3) a null-anchor crash on the gap read (aria-expanded
  not on the anchor) — guarded.
- Artifacts: /tmp/t117/{probe-b.mjs,probe-c.mjs,probe-d.mjs,probe-e.mjs,b.json,c.json,
  d.json,scheck.log,lsof-after.txt}.

## Open questions

1. None. Closes clean at Tier 2.

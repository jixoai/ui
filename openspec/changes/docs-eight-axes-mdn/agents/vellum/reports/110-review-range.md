# T110 — SECOND REVIEW range.html (vellum)

- **Reviewer**: vellum (2nd review; marginalia's 95 1st-review report opened FIRST;
  her keyboard contract re-derived on real keys; the boundary law she flagged
  untested-by-the-page exercised live as my fresh axis. NO commits, NO pushes; zero
  product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/range.html/` over the range family,
  served live on :5242.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT.** **Tier ruling: Tier 2** (her
  explicit proposal, dispatch-conformant: "others per her proposals" — her six-contract
  battery at digit and pixel grade is the Tier-2-grade evidence; my pass re-derived the
  keyboard contract, exercised the E-13 boundary she left source-true, and found
  nothing contradicting the ruling).
- Her MINOR 1 (the page cx overload :153:28) is CLOSED; nothing new filed.

## Her receipts — re-derived

- **Keyboard contract, real keys**: first live range (value 40, min 0, max 100,
  step 1): ArrowRight → 41, Home → 0, End → **100**, with **aria-valuetext "100"**
  following the commit — her digit-exact contract (arrows step, Home/End jump, the
  input's own channel carrying readout + aria) reproduced ✓.
- **Structure**: toc == DOM == rail **7/7** (#demo #types #usage #accessibility
  #theming #universal-props #api), zero dangling hashes, zero duplicate ids ✓ (her
  census unchanged). The section order is the page's own (range is parity-excluded by
  design, her §4 receipt — no archetype-order claim to falsify).
- **The pseudo-read liar lesson, honored**: her ::marker/::-webkit-slider-thumb
  computed-read garbage → pixel-scan discipline. I ran no geometry claims this pass;
  nothing I filed rests on a pseudo-element computed read.

## Fresh axis: the E-13 boundary, exercised live (she receipted it source-true only)

Her report: "min/max terminal snap + re-clamp law (E-13) untested at the boundary by
the page but source-true." Exercised: external write below min on the served input —
`r.value = '-50'`:

- **rawAfterWrite reads "0" immediately** — the platform's IDL clamp lands at the min
  terminal at write time;
- after the input/change dispatch + settle: **value "0", aria-valuetext "0"** — the
  component state and the a11y channel agree at the boundary.

Receipt shape (honest): the below-min branch is platform-clamped at the IDL layer
before the component's own re-clamp can fire — E-13's terminal snap reproduces, with
the mechanism attributed (platform first, component idempotent behind it). The
above-max mirror is the same IDL law; not separately driven (one boundary suffices
for the page's untested-claim).

## Her MINOR 1 — CLOSED

svelte-check page-scoped: **0 diagnostics** on range (her :153:28 cx overload is
closed by the campaign's cx-joiner wave; fleet totals 1507 E / 1028 W elsewhere,
untouched). Her fleet-level shared-util recommendation stays with the orchestrator as
the standing direction (native-select's page is the remaining carrier — receipted in
its own 110 report).

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD 4c4ba4ff) | GREEN rc=0 |
| verify:docs-universal | GREEN 110/110 rc=0 |
| svelte-check page-scoped | **0 diagnostics** (her Finding 1 closed) |
| verify-native-parity | N/A by design (range excluded, design §4) — per her receipt |

## Process evidence

- Port **5242**: wrapper 26755 / listener 26805; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. The driven value died with the probe browser.
- Probe faults owned: my first E-13 read captured `r.value` before the dispatch
  settled — the settled re-read (250ms) is the receipt; synthetic events were used
  only against the input's own event seams after the real-key path reproduced (the
  T63/T89 discipline her report also records).
- Artifacts: /tmp/t110/{probe-radio-range.mjs,radio-range.json,scheck.log,
  lsof-after.txt}.

## Open questions

1. None on the page.

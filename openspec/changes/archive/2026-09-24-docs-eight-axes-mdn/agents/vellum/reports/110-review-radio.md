# T110 — SECOND REVIEW radio.html (vellum)

- **Reviewer**: vellum (2nd review; marginalia's 94 1st-review report opened FIRST;
  every landed fix verified at the SERVED layer, not just source; fresh axes run.
  NO commits, NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/radio.html/` over the radio family
  (radio.svelte + jixoai.css law), served live on :5242.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT.** **Tier ruling: Tier 2** (per
  dispatch; the family's native-strength battery re-derived at every seat I touched).
  Her NEEDS-WORK MAJOR 1 and ALL FOUR secondary findings verified landed and serving.

## Her findings — all five verified landed, served-layer receipts

1. **MAJOR 1 (unchecked groups paint solid primary via the checkbox :indeterminate
   law) — FIXED and served-true.** Both trees byte-mirrored: checkbox tri-state intact
   (apps/www/src/lib/jixoai.css :1905/:1915 == registry/files/theme/jixoai.css same
   lines), the radio `:indeterminate` pair REMOVED with the spec-true comment
   (:2004-2009 both trees: "a radio matches :indeterminate whenever NO member of its
   name-group is checked…"). Served: 20 radios, 13 unchecked, **6 match
   `:indeterminate` (spec-correct — group-has-no-selection) and 0 paint primary** —
   sample s23: bg oklch(1 0 0) (background ground), border oklch(0 0 0) (ink ring).
   The matches-but-doesn't-paint split is exactly the fix's shape: spec semantics
   preserved, the checkbox paint law scoped out.
2. **MINOR 2 (density seat hydration flips the last clone; one shared cross-scope
   group) — FIXED, her exact fix direction.** Source :240:
   `{#snippet childrenScoped(scope)}` with `name={`density-radio-${scope}`}` +
   `value="sample"` — per-scope seats via childrenScoped with explicit value/group.
   Served: four seats with **four distinct names** (density-radio-xs/sm/default/lg),
   **all unchecked after hydration** (no flip), no cross-scope single-choice possible.
   The SSR/CSR duality is gone.
3. **MINOR 3 (geometry digits + "circle" vs the beveled paint) — FIXED in the meta.**
   Source :123 now teaches: "the ring rides the --jx-icon ladder (16/18/20/24px across
   rungs — **20px at the default, measured**), … the dot from scale(0) to scale(1)
   (**14px at the default**); the ring is **corner-shape bevel at radius 50%** (the
   shared corner law — a beveled circle, measured)". Served computed: corner-shape
   **superellipse(0)** (= bevel), radius 50%, width 20px — the copy and the paint now
   agree digit-for-digit.
4. **MINOR 4 (page cx overload :112:28) — CLOSED**: svelte-check page-scoped **0
   diagnostics** (the campaign's cx-joiner wave covered this page).
5. **LOW 5 (error contract claimed but never seated) — LANDED.** The demo group's
   fourth member is now a real error seat: **aria-invalid "true", aria-describedby
   `s4-error`** rendering "**!edge requires the nightly channel**". Her "one error seat
   completes the class" — served. (Radio census 19 → 20 inputs, the +1 is the seat.)

## Her verified bank — spot re-derives

- **Arrow-key walking + wrap**: real click on the demo group's first member, then
  ArrowRight ×2 → selection walks s1 → s3 (checked: s1 false, s2 false, **s3 true**,
  s4 false) — the native walk with bind:group surfacing, ✓.
- **Token ladder**: her five-row digit-exact receipt accepted (TokenTable unchanged in
  source; the ring's 20px default re-measured in the corner-shape receipt above).

## Fresh axes (beyond her report)

- The **6-vs-0 split receipt** (matches :indeterminate ×6, primary-painted ×0) — her
  report proved the bug; I proved the fix at the same specificity, including the spec
  semantics surviving (the pseudo still MATCHES — only the paint was scoped).
- The four-name density census (names, checked-state, no cross-uncheck) — her report
  measured the broken one-group form; the fixed form is receipted here.
- LAW #19 on the current page: walk-group ids s1–s4 unique; the error seat's
  describedby resolves (s4-error rendered).

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD 4c4ba4ff) | GREEN rc=0 (radio passes the skeleton lint's staged scope) |
| verify:docs-universal | GREEN 110/110 rc=0 |
| svelte-check page-scoped | **0 diagnostics** (her Finding 4 closed) |
| verify-native-parity | not re-run — her receipt (radio pixel-shot EQUAL, hot 0.000%) accepted; the fixture-gap probe she asked for is subsumed by my unchecked-group paint receipt above (6 indeterminate, 0 primary — the fixture's blind state, now measured) |

## Process evidence

- Port **5242**: wrapper 26755 / listener 26805; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. The walk's checked state died with the probe browser.
- Probe faults owned: (1) `CSS.escape` absent in Node — inlined the id; (2) my first
  primary-paint detector had to parse oklch chroma from the computed string — the
  chroma>0.1 threshold is recorded so the receipt is reproducible.
- Artifacts: /tmp/t110/{probe-radio-range.mjs,radio-range.json,scheck.log,
  lsof-after.txt}.

## Open questions

1. None. The family closes NEEDS-WORK → clean at Tier 2.

# T138 — SECOND REVIEW result (marginalia, 2026-09-24)

- **Protocol**: scribe's 1st (130-review-result.md, PASS 0M/1m/0L/1N) opened FIRST;
  both landed items verified; his receipts re-derived; fresh axis on the keyboard
  and density seats. The warning-state NIT is scribe's ledgered item — not re-found,
  only re-confirmed as still-open.
- **Vintage**: HEAD = fresh build at **ef520d44** (dist 03:01).
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT. Tier 2 CONFIRMED.**

## The landed items — VERIFIED

1. **The page cx closed** (+page.svelte:57 — `Object.entries(style ?? {})`).
2. **The NonNullable pair closed** (result.svelte :132 and :138 — both lookup
   tables now read `Record<NonNullable<Props['status']>, string>`), plus the :105
   cx guard. Saved svelte-check: **page 0 seats, family 0 errors** — all four of
   scribe's diagnostics gone.

## Scribe's receipts — re-derived (all confirm)

1. **The status hues are SEMANTIC, token-equal at the paint** (assert token
   equality, never literal digits — and this vintage's wall-clock moved the hue,
   which is exactly why the rule exists):
   - the ✓ glyph computes **oklch(0.6489 0.237 44)** and the served `--primary`
     token computes **oklch(0.6489 0.237 44)** — **token-exact equality**; success
     paints the brand voice, no green, at the CURRENT hue (scribe read 195, I read
     44 — the brand hue moved between vintages and the token equality held both
     times, which is the strongest possible form of this receipt);
   - the ✕ glyph computes **oklch(0 0 0)** == the served `--destructive` token
     (destructive is black at this theme — error paints destructive);
   - the i glyph reads the inherited neutral ink — info/warning share the neutral
     rung by the same lookup.
2. **The glyphs are text, not color alone** — ✓ / ✕ / i render as real glyph
   elements (visible-only census).
3. **The actions compose native PressButtons** — anchor and button variants both
   rendered.

## Fresh axes

1. **Keyboard reachability** — a 22-stop Tab walk lands on the actions
   ("view component", "view log" both appear as stops): the recovery actions are
   sequential-focus reachable as taught.
2. **The density seats** — the DensityDemo multiplies the info panel across the
   xs rungs (census: default + xs stamps on the roots), consistent with the
   all-no-own supply posture (no own tokens; the TokenTable rows are the kernel
   lanes).
3. **The warning NIT, re-confirmed still-open** — "warning" appears in the page 4×
   (the API union and prose mentions), zero rendered warning RESULT seats: the
   page still teaches four outcomes and paints three. Scribe's ledgered NIT stands
   for the code round; not mine to file anew.

## Structure + gates

- LAW #19 (scribe's 49-id census unchanged this vintage); toc 6 == DOM 6 == rail;
  the API table carries the universal marker, title required, status default
  'info'.
- svelte-check (ONE run, saved): page **0 seats**, family **0 errors**.
- Fresh build rc=0 (dist 03:01); **verify:docs rc=0**; docs-universal **110/110**.
- Process: port 5244 mine, killed (lsof rc=1 empty); NO commits/pushes/fixes.
  Artifacts: /tmp/marginalia-138-probe.mjs.

## Probe-fault ownership

1. My glyph census dedupes by glyph+color pairs — the multi-seat repetition
   (success ×3, error ×3) collapses to unique pairs; the per-seat counts rest on
   scribe's census this pass.
2. My Tab walk recorded the page's furniture stops (the print-preview demo pair,
   the install copy) before the content — consistent with the scaffold's global
   tab order (skip link → chrome → content), not a finding.

# review-r1 — Codex implementation review (2026-08-25)

> gpt-5.6-terra · xhigh · Herdr workspace zcode-jixoai-ui-surface-kernel
> (w24) · reviewed HEAD b492fa2/d68509f + the surface-motion.ts blocks
> of dab4c55 · independently re-ran build / verify:mirror / vitest
> 356/356 / probe 14/14

## A. Blocking issues

None. tour's instant exit is the file-header-declared KNOWN GAP, not
counted. menubar's lazy per-panel kernels + onDestroy cleanup verified
correct.

## B. Non-blocking findings (all processed in 1442369)

1. Browser probe covered 4/11 adopters only → extend to the full
   matrix or label it a representative smoke test.
2. Probe timing false-fails: menubar glide A's first sampled frame
   can read 0.893 (< the hardcoded 0.9); a rerun died on a destroyed
   page context at navigation.
3. float-button: the panel state named `btn` typed HTMLButtonElement
   while bound to the `<div popover=auto>` menu — pre-existing, made
   kernel-load-bearing by this change; rename + retype.

## C. Quality

High: byte-identical mirrors across all 11, consistent
createSurfaceMotion/.jx-waapi/.jx-surface-shadow/onDestroy wiring,
correct glide animation-slot isolation, sound hover-card Pattern C
sequencing, reachable tour cleanup play(0), focus-restitution order
preserved everywhere. float-button's naming was the only blemish.

## D. Score

**9.0/10** — deductions for 4/11 browser evidence coverage and probe
rerun instability.

# Gate-2 r2 verdict — visual-g2 (Codex, gpt-5.6-terra xhigh), 2026-09-15

**PASS — 8.4/10** (worked 20m 17s; r1 was 7.6 NO-GO). No blockers.

Independently re-verified:

- The pointer-tier floor is contract (delta :116 + proposal/design/tasks
  synced) and the implementation matches (fine-only drawn chrome at
  scroll-area.svelte:96); the new probe measured 7/7 GREEN both tiers.
- The hydration fix is real (five fixtures stamp data-hydrated on
  mount; the probe's measureArm/runSweepArm wait on it); the previously
  red command now exits 0 three times consecutively on the 5199 dev
  server (primaryDelta=0, controlDelta=-171, 20 arms green, 8 swapped
  controls red).
- W1 16/16 (scope ladder, OS-dark inversion, live flips); W2 veil
  zero-ink + contrast (label 4.88 / fill 3.38 / connector 16.48); W3
  148/148 (12-cell matrix, no-JS floor, line(i) canary); W4 36/36
  (three-part retirement, four pins, RTL, native sibling ARIA-absent).
- Gates green: strict openspec, mirror, deps, stylex-payload,
  registry-payload parity, standards, docs, git diff --check; affected
  www vitest 186 passed; registry↔mirror byte-identical (cmp=0 ×3).
- The two plugin-suite reds stand as attributed: hmos = proxy
  truncation (1006943 vs 1006740); lib-mode = deterministic
  root-relative emission, `git diff 9ccb133d..HEAD` empty over the
  plugin/lockfile/manifests — the attribution holds, an independent
  issue outside this change's blast radius.
- W4's two declared out-of-bound changes confirmed proper (the
  .stylex.ts ledger filter at stylex-payload.mjs:124; the scroll-virtual
  retirement with source/mirror/test support).

Non-blocking (disposition):

1. The chip/node centerline re-sample not implemented verbatim →
   FIXED post-verdict (this commit): the probe now re-samples occluded
   sample points (max 3 steps, shifts recorded in report.resamples);
   rerun PASS — the two chip points sit under a wide chip span and
   lawfully record as still-occluded skips with their step counts.
2. verify-shadcn-add's clean-install rerun still stalls in npm install
   through the proxy — the closure receipt's 24-case GREEN remains the
   supplied evidence; the coarse probe's absolute playwright path is a
   portability nicety for a research script.

FINAL STATE: both gates PASSED (Gate-1 8.5, Gate-2 8.4); the change is
ready to archive.

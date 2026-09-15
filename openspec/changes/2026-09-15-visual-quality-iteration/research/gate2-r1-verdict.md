# Gate-2 r1 verdict — visual-g2 (Codex, gpt-5.6-terra xhigh), 2026-09-15

**NO-GO 7.6/10** (worked 31m 21s). Independently verified GREEN: W1 16/16,
W2 veil/contrast (min label 4.88 / node fill 3.38 / connector 16.48), W3
148/148, W4 36/36, www affected vitest 237/237, strict openspec, mirror,
deps, stylex-payload, registry-payload parity; W4's two declared
out-of-bound changes properly attributed; the two plugin-suite reds
attributed (hmos = the known proxy truncation; lib-mode = deterministic,
byte-proven outside this change's blast radius).

Blockers:

1. **W4's coarse-pointer floor contradicted the spec delta** — the
   implementation gates the drawn chrome on `(pointer: fine)` (coarse
   keeps the platform bar), the tests accept it, but the delta said
   "ALWAYS" with no such exception. Fix: write the floor into
   proposal/spec/scenario + re-verify, or remove the gate.
2. **W5's probe red on the 5199 dev server** — first arm measured a
   stable-but-stale 36.3px offset (hydration timing); self-hosted dist
   green. Fix: a verifiable hydration-readiness gate, or pin the probe
   to self-hosted builds; the named command must exit 0 stably.

Non-blocking: W2's 2 chip-occluded connector skips vs the contract's
narrower skip rule (dodge the chips or amend the contract);
verify-shadcn-add independent rerun stalled in npm install (~3.5min,
kept the closure receipt's 24-case GREEN as supplied evidence).

## r2 response (this commit)

- B1: the pointer-tier floor is now CONTRACT (amendment rationale: it
  is the Owner's own native-best-practices philosophy applied to touch
  — momentum/edge behaviors ride the platform; hover-growth/drag-pin
  have no touch equivalent; a media-state capability, not a mode): the
  delta requirement intro + a NEW scenario ("coarse pointers keep the
  platform bar"), proposal W4, design W4, and task 4.2 all carry it.
  Made-true verification: NEW probe
  `research/w4/coarse-pointer-floor-probe.mjs` — **7/7 GREEN both
  tiers** (fine: media fine + data-chrome=on + lanes mounted; coarse:
  media coarse + chrome off + ZERO drawn chrome + platform
  scrollbar-width=thin not hidden).
- B2: hydration-readiness gate — all five probe fixture routes
  (popover/dropdown/tooltip/float-button/menubar) stamp
  `data-hydrated` via `onMount`; `verify-popover-area-align.mjs` waits
  on it in BOTH measureArm and runSweepArm before any measurement
  (timeout 15s). Verified: **3 consecutive exit-0 runs against the
  5199 dev server** (primaryDelta=0, controlDelta=-171, 20 sweep arms
  green, 8 swapped-control arms red) — the exact command that was red.
- Non-blocking #1 adopted: the occlusion rule now covers sample-point
  AND ground-patch occlusions by nodes, adjacent connectors, OR
  edge-label chips (re-sample max 3 steps, recorded skips) — delta +
  design + tasks consistent; the r1 run's 2 chip skips are lawful under
  the amended rule.
- Non-blocking #2 noted: the shadcn-add rerun stall sits in npm
  install through the local proxy (same environmental class as hmos);
  the closure receipt's 24-case GREEN stands as supplied evidence.

# verification — surface-kernel-adoption

## Gates (2026-08-25, integration round)

| gate | result |
| --- | --- |
| svelte compile, 11 components | 0 new warnings (date-picker 2 / color-picker 3 a11y warnings byte-identical to HEAD) |
| `pnpm build` (shadcn payload regen) | GREEN |
| `node scripts/gen-mirror-manifest.mjs --check` | GREEN (87 items, 235 pairs) |
| apps/www vitest | 355/355 mine green; 1 failure (batch4b navigation-menu Escape) belongs to the PARALLEL session's in-flight fix — landed + resolved in their dab4c55 |

## Browser walkthrough (dedicated dev server :5211, Chromium)

`scripts/verify-kernel-adoption.mjs` — **14/14 GREEN**:

- dropdown-menu: jx-waapi + real shadow child while open; entry --jx-p
  0→1 (460ms); exit 1→0; allow-discrete holds the panel rendered
  through the exit window
- menubar glide (close A → open B, trusted CDP clicks — the switch
  path rides the document pointerdown handler, which synthetic
  el.click() never fires): A exits 0.96→0 WHILE B enters 0→1;
  A never ghost-pinned at 1 (the per-panel-kernel fix, live-verified)
- hover-card (Pattern C): opens to kernel rest (p=1, jx-waapi,
  jx-rest) after openDelay; closes on pointer exit
- select (listbox representative): entry + exit both drive --jx-p

`verify:surface` (popover page, law walkthrough): 46/47 — the one
failure (mid-entry close continuity) reproduces IDENTICALLY with the
pre-change surface-motion.ts (checked out f87ec87 temporarily):
pre-existing frame-sampling flake, not a regression of this change.
Recorded for a follow-up; popover.svelte itself is untouched here.

## Probe-methodology findings (why earlier runs read dead panels)

1. **Hydration race**: native popovertarget opens panels WITHOUT js,
   but the kernel choreography needs Svelte's handlers — sampling
   before hydration reads p=0 forever. The walkthrough waits out
   hydration per page.
2. **Trusted input only**: the native popover Escape close and
   menubar's pointerdown-driven switch never respond to synthetic
   events; the probe uses CDP keyboard/clicks.

## Cross-batch fixes (ZCode integration)

- menubar: single shared kernel → per-panel lazy kernels (Map). A
  shared instance holds ONE animation slot: gliding between slots
  cancels the outgoing exit, whose inline --jx-p pin then holds the
  closing panel at rest through the allow-discrete window (~460ms
  ghost beside the incoming panel). Live-verified by the glide probe.
- surface-motion.ts: `surfaceMotionSupported` exported (engine
  capability probe) so multi-panel consumers can gate .jx-waapi with
  no kernel instance at render time.

## Accepted gaps (documented, unchanged)

- tour: the exit has no rendered panel (the panel unmounts in the
  same flush as open=false — the file's pre-existing KNOWN GAP
  "the tour closes instantly"); entry animates.

## Parallel-session interleaving (transparency)

The Owner's other session worked the same tree concurrently
(canvas-redesign closeout + navigation-menu Escape fix). Commits
1ba47f4 and dab4c55 swept up this change's OpenSpec scaffold,
surface-motion.ts, mirror-manifest.json and registry.json before this
change's own commits landed. History accepted as-is (no rebase on a
live tree); the feature commit below carries the 11 components.

## Codex review round 1 (2026-08-25, gpt-5.6-terra xhigh, Herdr)

Verdict: **9.0/10, zero blocking issues** (independently re-ran
build / verify:mirror / vitest 356/356 / probe 14/14). Non-blocking
findings, all processed this round:

1. probe covered 4/11 adopters → extended to the FULL matrix
   (34 checks GREEN): combobox/tags-input need TRUSTED clicks
   (focus-driven openers ignore synthetic clicks — no focus event)
   and tags-input needs a typed query (the panel follows the
   filter); tour gets entry + structure checks (its exit is the
   documented instant-close gap)
2. probe timing false-fails → menubar glide threshold 0.9→0.85
   (rAF can miss A's exact rest frame), per-section try/catch so a
   destroyed context FAILs a row instead of crashing the run
3. float-button's panel state was named `btn` typed
   HTMLButtonElement (pre-existing, now kernel-load-bearing) →
   renamed `panel: HTMLDivElement | null`, mirrors synced


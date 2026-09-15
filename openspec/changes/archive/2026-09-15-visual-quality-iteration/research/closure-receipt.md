# Closure receipt — 5.3 + 5.4 + the full-chain gates (2026-09-15, orchestrator)

## 5.3 — buildId/generatorVersion: the NO-BUMP branch, proven

- `pnpm build:registry` (shadcn build + gen-stylex-payload --publish public):
  exit 0, **buildId `60807e498baf…` — unchanged from phase-0**, 10 kernel
  items, 175 class constants.
- Working tree after the regen: **byte-identical, zero diff** (git status
  clean on registry/payload + public/payload).
- Reading: this change's components are NOT in the stylex payload corpus
  (that lane is the 10 kernel items); generator inputs unchanged → the
  no-bump criterion (input diff empty + manifest regenerated
  byte-identical) holds with the strongest possible evidence.

## 5.4 — the dual invariants, each with its own receipt

- source-to-mirror: `pnpm verify:mirror` **GREEN** (143 items / 537 file
  pairs; committed manifest regenerated after the closure's scroll-area
  isolation fix); `pnpm verify:deps` **GREEN**.
- source-to-payload: `pnpm build:registry` exit 0;
  `pnpm verify:stylex-payload` **GREEN** (same-build consistency);
  `pnpm --filter @jixoai/www exec vitest run
  test/registry-payload-parity.spec.ts` **exit 0**.
- clean-consumer: `node scripts/verify-shadcn-add.mjs` — **24 cases ALL
  GREEN** (incl. native-scroll-area; the kit arrives via the
  registryDependencies edge).

## Full-chain gates

- `verify-all` (CHROME_PATH pinned): **GREEN, exit 0** — after one
  closure fix: W4's reworked scroll-area css carried an UNROOTED z=1
  (the track lanes) + a stale stacking-ladder seed. Fixed per the law:
  `isolation: isolate` on `.jx-scroll-area` (the ladder's common
  parent), seeds entry re-pointed (svelte→css, needle
  "isolation: isolate"), mirror synced, manifest regenerated;
  `verify-standards` GREEN (36 static z sites, every one cleared an
  exit).
- www vitest suite: **exit 0**.
- Serial plugin suite (`npm test -- --maxWorkers=1`): **498 passed |
  6 skipped | 2 red**, both with full attribution below.

## The two red items (attributed, not buried)

1. `example-hmos.test.ts` — the KNOWN environmental proxy truncation
   (SIZE MISMATCH after 3 attempts: received 1006943, pin expects
   1006740 — truncated transfer through the local proxy). Identical
   signature to phase-0 Gate-2's receipt; CI is the authoritative
   channel for it.
2. `plugin.test.ts` "lib mode: emits the content-addressed asset and a
   node-importable module" — **NEW since phase-0, deterministic,
   proven OUTSIDE this change's blast radius**:
   - Failing assertion: `new URL(mod.url).protocol === 'file:'`;
     measured emission is now `"/assets/ghostty-vt-0fb5949c….wasm"`
     (root-relative, leading slash — no `new URL` wrapper survives the
     `import.meta.ROLLUP_FILE_URL_*` replacement).
   - `git log 9ccb133d..HEAD -- packages/vite-plugin/` is EMPTY (the
     plugin is byte-identical to the phase-0 Gate-2 PASS commit);
     pnpm-lock.yaml and every package.json unchanged; the installed
     rolldown@1.2.8 / vite@8.3.0 dist files and the darwin-arm64 native
     binding are content-identical (sha256 + mtimes predate today).
   - Reproduced in isolation and under `env -i` (not an env var, not
     flaky). The phase-0 receipt (499 passed | 6 skipped, zero
     failures) is not reproducible on today's machine state.
   - The only observable machine deltas since: `node_modules/.pnpm`
     relinked today 19:54 (during the parallel implementation waves'
     build/install activity — content-neutral per hashes, but the
     resolution graph before the relink is unrecoverable) and
     `/tmp/ghostty-research` deleted (the wasm bytes now come from the
     sha-verified cache — content-neutral for the emission).
   - Disposition: NOT hacked green (relaxing the test would weaken a
     real contract — a node-unusable root-relative URL is a genuine
     emission regression). Recorded for Gate-2's judgment; the fix
     belongs to a dedicated plugin-side change (pin/adjust the lib-mode
     url emission or its assertion) with its own gate, or CI's verdict
     on this branch's push.

## Housekeeping in this closure commit

- scroll-area.css isolation fix + mirror + manifest (described above).
- stacking-ladder.seeds.json: stale svelte seed pruned, css seed added.
- tasks.md: W1–W5.3 ticked; 5.4 ticked by this receipt.

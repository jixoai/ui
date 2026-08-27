# build-plugins — delta

## ADDED Requirements

### Requirement: the @jixoai/vite-plugin package

`packages/vite-plugin` SHALL publish as `@jixoai/vite-plugin` (the
cli/ package precedent: a separate npm-publishable package, not a
registry item) with ZERO runtime dependencies and peerDependency
`vite ^6 || ^7 || ^8`. Its plugins are build-time only: they never
transpile or instantiate wasm; their contract surface is
source-resolution (verify + cache), dev serving, build emission, and
handing data URLs to code via virtual modules.

#### Scenario: consumer wires the ghostty plugin

- GIVEN a vite consumer with `@jixoai/vite-plugin` installed and
  `jixoaiGhostty()` in `plugins`
- WHEN the dev server starts or a build runs
- THEN the pinned `ghostty-vt.wasm` resolves (env override →
  sha256-keyed cache → pinned download, verified), is served in dev
  at a stable path with `application/wasm`, and is emitted into
  `dist/` in build with a content-addressed (sha256-derived) hashed
  filename — no manual file placement anywhere

#### Scenario: virtual module carries provenance, not behavior

- WHEN code imports `virtual:jixoai-ghostty`
- THEN it receives a pure-data module
  `{ url, sha256, variant, version }`; the module does not touch
  fetch or WebAssembly at evaluation time, so SSR and node test
  environments import it safely

### Requirement: ghostty wasm supply chain is pin-verified

The repo SHALL carry a text pin manifest
(`packages/vite-plugin/ghostty.pin.json`: url, version, buildInfo,
sha256, size, variants) as the ONLY committed artifact of the wasm;
binaries stay out of git. The version identity SHALL come from the
wasm's own `ghostty_build_info` (extracted by the probe), NOT from
release metadata — the tip release object's dates are static while
its assets rotate nightly. The `ghostty-wasm-sync` workflow SHALL
update the pin only after `WebAssembly.validate` plus an ABI smoke
probe (terminal create → vt_write → render-state iteration) pass,
and SHALL open a PR (never push to main directly). Every consumer
build path (dev, CI deploy, package consumers) resolves against the
pin and verifies sha256 before use.

#### Scenario: broken nightly is not pinned

- GIVEN a tip release whose wasm fails validation or the ABI probe
- WHEN the sync workflow runs
- THEN the pin stays on the previous version and the workflow fails
  loudly; no PR is opened

#### Scenario: airgapped build

- GIVEN an environment with `JIXOAI_GHOSTTY_WASM_PATH` pointing at a
  local file
- WHEN the plugin resolves the wasm
- THEN the local file is used, its sha256 still verified against the
  pin, and no network is touched

# build-plugins Specification

## Purpose
How this repo ships vite build plugins as npm packages: the
@jixoai/vite-plugin package (the ghostty wasm supply plugin — pin-verified
asset resolution, dev serving, build emission, virtual-module handoff),
its probe bin, its self-contained npm engineering, and the
ghostty-wasm-sync supply-chain workflow that keeps the pin honest. The
registry distributes components; this capability distributes what a
consumer's BUILD needs before the component can run — the "we assemble
it, not the user" law applied to the build pipeline itself.

## Requirements

### Requirement: the @jixoai/vite-plugin package

`packages/vite-plugin` SHALL publish as `@jixoai/vite-plugin` (the
cli/ package precedent: a separate npm-publishable package, not a
registry item) with ZERO runtime dependencies and peerDependency
`vite ^8.0.0` (the only tested surface), built by tsdown into
`dist/index.js` + `dist/probe.js` and carrying the
`jixoai-ghostty-probe` bin. The package's public API is frozen:
`jixoai(opts)` (THE umbrella entry — one call wires every jixoai
build-time feature; `ghostty` is the first, default-on feature, taking
`boolean | options` under `jixoai({ ghostty })`; the unpublished
`jixoaiGhostty()` name never shipped, the umbrella landed in its
place), `resolveGhosttyWasm(opts)` (the
node-usable resolver: variant/cacheDir/offline →
`{ bytes, path, sha256, variant, buildInfo }`, cache filename
`<sha256>.wasm`, default cache dir
`<cwd>/node_modules/.cache/jixoai-ghostty/`, and a frozen behavior
matrix: an env-override file is verified against the pin and its own
path returned without copying; offline resolves cache-only with a
named error on miss; the online path fills the cache atomically),
and the `./client` sub-export
(`dist/client.d.ts`, ambient `declare module
'virtual:jixoai-ghostty'` with NAMED exports only). The
package is a SELF-CONTAINED npm project: its own committed
package-lock.json and devDependencies so `npm ci && npm run build`
reproduces without any root install (the repo root is not a
workspace). Consumers add ONE
`/// <reference types="@jixoai/vite-plugin/client" />` line to their
d.ts environment (the apps/www vite-env.d.ts fixture proves
svelte-check stays green). Its plugins
are build-time only: they never transpile or instantiate wasm; their
contract surface is source-resolution (verify + cache), dev serving,
build emission, and handing data URLs to code via virtual modules.

#### Scenario: package build emits the type contracts

- GIVEN the package built by `npm ci && npm run build`
- WHEN `npm pack --dry-run` inspects the tarball
- THEN `dist/index.js`, `dist/probe.js`, `dist/index.d.ts`, and
  `dist/client.d.ts` are all present in the published files (CI
  asserts this — a types-less publish is a gate failure, since
  exports['.'] and exports['./client'] both point at d.ts files)

#### Scenario: consumer wires the ghostty plugin

- GIVEN a vite consumer with `@jixoai/vite-plugin` installed and
  `jixoai()` in `plugins`
- WHEN the dev server starts or a build runs
- THEN the pinned `ghostty-vt.wasm` resolves (env override →
  sha256-keyed cache → pinned download, verified), is served in dev
  at a sha-prefixed path with `application/wasm` + immutable caching,
  and is emitted into `dist/` in build with the content-addressed
  filename `assets/ghostty-vt-<sha256-16>.wasm` (our hash, not the
  bundler's) — no manual file placement anywhere

#### Scenario: virtual module carries provenance, not behavior

- WHEN code imports `virtual:jixoai-ghostty`
- THEN it receives a pure-data module
  `{ url, sha256, variant, buildInfo }`; the module does not touch
  fetch or WebAssembly at evaluation time, so SSR and node test
  environments import it safely, and a server-consumer build emits no
  duplicate asset

#### Scenario: emission timing follows rollup semantics

- GIVEN the virtual module is loaded during a build
- WHEN its code is generated
- THEN the wasm asset was emitted in the same `load` hook (before
  rendering) and the URL is produced from
  `import.meta.ROLLUP_FILE_URL_<ref>`; a vite `build()` integration
  test asserts the real dist filename (the sentinel for vite/rollup
  major upgrades)

### Requirement: ghostty wasm supply chain is pin-verified

The repo SHALL carry a text pin manifest
(`packages/vite-plugin/ghostty.pin.json`) as the ONLY committed
artifact of the wasm; binaries stay out of git. The manifest schema
is frozen: top-level `{ pinnedAt, source{repo,tag,releaseUrl},
variants }` with EACH variant (`full`, `small`) independently
carrying `{ url, sha256, size, buildInfo }` — never a mixed
top-level/variant split. The version identity SHALL come from the
wasm's own `ghostty_build_info` (extracted by the probe), NOT from
release metadata — the tip release object's dates are static while
its assets rotate nightly. The pin has exactly ONE runtime writer:
the `ghostty-wasm-sync` workflow, which updates it only through a PR
and only after the probe passes (`WebAssembly.validate`, required
export-family assertions, an EMPTY import table assertion — the
shipped binaries import nothing and the binding instantiates with
`{}` — plus instantiation + ABI smoke: terminal create → vt_write →
render-state iteration → Enter encodes to CR);
the initial pin is committed once with the same probe run locally.
Every consumer build path (dev, CI deploy, package consumers)
resolves against the pin and verifies sha256 before use. Network
paths SHALL be hardened uniformly: a final-host allowlist (github.com
plus the GitHub asset CDN hosts objects.githubusercontent.com /
release-assets.githubusercontent.com), per-hop redirect validation,
a URL structure check parametrized by the pin's own `source.tag`
(the expected path is
`/ghostty-org/ghostty/releases/download/<source.tag>/<variant asset
name>` — tip today, a future stable tag without code changes; tests
cover both tag forms),
and a streaming 4MB hard cap on the response body that holds even
when Content-Length is missing or lies. The binary-stays-out-of-git
rule has TWO guardrails: the default cache dir lives under
`node_modules/.cache/` (covered by the existing node_modules ignore
rules everywhere — no special-case ignore entry), and
`verify:ghostty-pin` plus CI assert `git ls-files '*.wasm'` is empty.
Threat model, stated: sha256 pinning gives integrity, not publisher
authenticity — authenticity rests on the pinned github.com/
ghostty-org origin plus human review of pin PRs; minisig is a
non-goal.

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

### Requirement: package release rides the trusted-publishing flow

`@jixoai/vite-plugin` SHALL be published by the same release
workflow pattern as the `jixoai-ui` CLI (npm Trusted Publishing /
OIDC, idempotent skip when the version exists, tarball attached to
the tagged release); configuring the npm-side trusted publisher for
the new package name is an Owner TODO that blocks publishing day,
not development (in-repo consumers use the `file:` dependency).

#### Scenario: tagging a release publishes both packages

- GIVEN a `v*` tag pushed with an unchanged cli version but a bumped
  `packages/vite-plugin` version
- WHEN release.yml runs
- THEN the CLI publish step skips (already published) and the
  vite-plugin job builds, packs, and publishes only the new version

### Requirement: the lucide provider imports the library

`lucideIconProvider` SHALL read slot geometry from the `lucide`
package (dynamic `import('lucide')` inside the async factory) and
serialize IconNode children through the stroke-artwork wrapper
(viewBox 0 0 24 24, fill none, stroke currentColor, sw 2, round
caps/joins, no width/height). Embedded hand-copied path literals
are REMOVED. `lucide` is an OPTIONAL peer dependency: consumers
who never configure the icons feature install nothing; a missing
install MUST fail loudly at factory time with the install hint.

#### Scenario: lucide is not installed

- GIVEN a consumer config with `icons: { provider: lucideIconProvider() }`
- WHEN the lucide package is absent from node_modules
- THEN the provider factory rejects with a message naming
  `npm i lucide` (build fails, no silent fallback)

#### Scenario: slot geometry matches the library

- GIVEN lucide@0.472.0 installed
- WHEN the provider serves the 'chevron' slot
- THEN the serialized children equal the lucide `ChevronDown`
  IconNode serialization, and the wrapper carries no width/height
  attributes (theme owns sizing)

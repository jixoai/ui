# @jixoai/vite-plugin

Vite plugin that supplies the pinned [ghostty](https://ghostty.org)
`ghostty-vt` wasm to your build: **resolve (env → cache → verified
download) → serve in dev / emit in build → hand over the URL** through
the `virtual:jixoai-ghostty` module.

You need it because none of vite 8's native wasm forms fit a wasm that
comes from a release download rather than your module graph — every
native form (bare import / `?url` / `?init` / `publicDir`) either
requires the file to already sit in your project, or gives up control
over loading and caching. This plugin pins the exact bytes (sha256),
verifies them, and exposes a stable, content-addressed URL.

- Zero runtime dependencies. Peer: `vite ^8.0.0` (vite 8 is the only
  tested surface; older majors are not promised).
- Binaries never enter git or your bundle source; the only shipped
  artifact is the text manifest `ghostty.pin.json`.

## Install

```bash
npm i -D @jixoai/vite-plugin
```

Wire it in `vite.config.ts`:

```ts
import { jixoaiGhostty } from '@jixoai/vite-plugin';

export default {
  plugins: [jixoaiGhostty()],
};
```

Add the client types once (e.g. in your `src/vite-env.d.ts`):

```ts
/// <reference types="@jixoai/vite-plugin/client" />
```

Consume the wasm URL (this module is pure data — safe to import in SSR
and tests; nothing touches `fetch`/`WebAssembly` at evaluation time):

```ts
import { url, sha256, variant, buildInfo } from 'virtual:jixoai-ghostty';
```

| export | value |
| --- | --- |
| `url` | dev: `/@jixoai/ghostty-vt-<sha16>.wasm` (middleware-served, `application/wasm`, `immutable`); build: your emitted asset URL |
| `sha256` | full 64-hex pin digest of the bytes |
| `variant` | `'full' \| 'small'` |
| `buildInfo` | version string read from the wasm itself (`ghostty_build_info`) |

Options (all optional):

```ts
jixoaiGhostty({
  variant: 'full',   // 'small' = trimmed build (~711KB vs ~981KB)
  cacheDir: '…',     // default <cwd>/node_modules/.cache/jixoai-ghostty
  offline: false,    // true = cache only; a miss is an error
})
```

## Where the bytes come from

```
JIXOAI_GHOSTTY_WASM_PATH (env)   → read that file, verify sha256, return its path
cache hit  (<cacheDir>/<sha256>.wasm) → verify and reuse
cache miss (online)               → download per pin.url, verify, write atomically
```

- The default cache lives under `node_modules/.cache/` — safe to blow
  away, re-created on demand, ignored by git everywhere.
- Downloads are hardened: https only, host allowlist
  (`github.com`, `objects.githubusercontent.com`,
  `release-assets.githubusercontent.com`), per-hop redirect checks
  (max 5), 30s timeout, streaming 4MB cap that never trusts
  `Content-Length`, and a canonical URL path check parameterized by the
  pinned tag.

## Offline / CI

Point the env var at a local copy (it is still sha256-verified):

```bash
JIXOAI_GHOSTTY_WASM_PATH=/path/to/ghostty-vt.wasm npm run build
```

or pre-seed the cache and run with `offline: true`.

## Troubleshooting

Errors always name the fix. The ones you are most likely to meet:

- `WASM RESOLVE FAILED … SHA256 MISMATCH` — the pinned digest and the
  upstream release disagree (nightly moved). Check the repo's
  `ghostty-wasm-sync` workflow status; pin updates land via PR. To
  force ahead locally, set `JIXOAI_GHOSTTY_WASM_PATH`.
- `OFFLINE CACHE MISS` — run once online to populate the cache, or use
  the env override.
- `REJECTED URL / REJECTED REDIRECT` — the pin or a redirect hop left
  the allowlisted GitHub download layout; treat as a supply-chain
  incident, do not bypass.

## jixoai-ghostty-probe

The package ships an ABI sentinel CLI used by CI (and useful when
inspecting a download by hand):

```bash
npx jixoai-ghostty-probe --wasm ./node_modules/.cache/jixoai-ghostty/<sha256>.wasm --variant full --json
```

Prints the pin fragment `{ variant, sha256, size, buildInfo }` on
success; exits non-zero with a named reason on any ABI drift (import
face, required exports, marshalling smoke, simd128).

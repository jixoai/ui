# design — icon-component-pipeline

## 0. Two faces, one subsystem (the load-bearing split)

```
jixoai({ icons: {
  provider: lucideIconProvider(),   // SLOT/CSS face — FROZEN this change
  safety:  { mode: 'warn' },        //   --jx-icon-*, ink law, byte locks
  library: { … },                   // NAMED-ICON face — NEW (this change)
}})                                 // provider | library: ≥1 required
```

The slot face answers "what image does a CSS var hold"; the library
face answers "what can `<Icon name=…>` render". They share only the
safety checker and the I/O discipline. svgo NEVER runs on the slot
face (ink-equivalence byte locks pin those URIs exactly).

## 1. Options contract + the validation matrix

```ts
interface IconsPluginOptions {
  provider?: IconProviderFactory;      // now optional (library-only is legal)
  library?: IconLibraryOptions;
  safety?: SafetyCheckerConfig;        // shared by both faces
}
interface IconLibraryOptions {
  includeDefaults?: boolean;           // default true — the 38 built-ins
  icons?: Record<string, IconSource>;  // add + override (same name = override)
  maxChunkBytes?: number;              // default 20480, RAW non-gzip module bytes
  chunking?: 'auto' | 'single';        // default 'auto'; 'single' = one chunk
  inlineFirstChunk?: boolean;          // default true; false = all-lazy escape hatch
  output?: string;                     // artifact write target (project-root-relative),
                                       // ONLY used when write is on (consumer apps);
                                       // default 'src/lib/icon-set.gen.ts'
  write?: boolean;                     // default false — the vite adapter serves
                                       // virtual chunks + drift-warns; it never
                                       // writes unless a consumer app opts in
  optimize?: boolean | OptimizeConfig; // default true (svgo)
}
type IconSource =
  | string                             // inline '<svg …>…</svg>' literal
  | { file: string }                   // .svg path — plugin owns the I/O
  | `lucide:${kebab}`;                 // reference into the lucide package
```

**Artifact ownership (single-writer law)**: in THIS repo the root
`gen:icons` script is the ONLY writer of the canonical artifact
(`registry/files/lib/icon-set.gen.ts`); the www copy arrives through
the existing mirror-sync tooling. The vite adapter in apps/www and
registry/ runs with `write: false` (the default): it serves virtual
chunks, and in dev it WARNS when the on-disk artifact drifts from
the generator output (freshness stays CI's job via
`verify:icons --check`). `registry/` has no `src/` — with
`write: false` as the default the orphan-file problem cannot arise;
a dual-app build + mirror probe asserts no `registry/src/**`
artifact ever appears. Consumer apps outside the repo may set
`write: true` + their own `output` for dev ergonomics.

The config matrix (runtime-validated, unit-tested):

| `icons` value        | behavior                                                       |
| -------------------- | -------------------------------------------------------------- |
| `false`/`undefined`  | icons feature OFF (today's default — unchanged)                |
| `{}` (neither face)  | STARTUP ERROR naming `provider` and `library` as the two legal shapes |
| `{ provider }`       | slot face only — EXACTLY today's behavior (regression-locked)  |
| `{ library }`        | library face only (no CSS module emitted)                      |
| `{ provider, library }` | both faces, independent modules                              |

- Same-name entry OVERRIDES a built-in. Icon names SHALL match
  `/^[a-z][A-Za-z0-9]*$/`.
- Order determinism: built-ins in manifest order (the GROUPS order
  migrated from gen-icons.mjs), then custom icons in config insertion
  order. Same inputs → byte-identical outputs.
- **lucide stays an optional peer of the PLUGIN package only.**
  Built-in resolution runs at build time inside the plugin
  (`import('lucide')`, loud-fail install hint); the emitted artifact
  carries zero lucide references, so registry consumers stay
  lucide-free. `includeDefaults: false` with no `lucide:` sources
  never touches the lucide import at all.

## 2. Resolution pipeline (per icon)

```
source ──► safety check ──► svgo optimize ──► structured extract ──► pack
 (resolve)  (raw, untrusted)  (library face)    {v, n, d}           (greedy)
```

- **Resolve**: `lucide:` refs dynamically `import('lucide')`;
  `{file}` loads through the plugin-owned I/O context (the
  ProviderContext machinery — the plugin owns ALL file I/O, frozen
  principle #4 — reused by the library face INDEPENDENTLY of
  whether the optional provider face is configured; svg files join
  `watchFile` for HMR); inline strings pass straight through.
- **Safety**: the shared checker runs on the RAW source BEFORE any
  transformation; warn-mode rejection drops the icon with a named
  warning, error-mode fails the build. The safety surface extends to
  the structured-extract contract: only RAW-gated, plugin-extracted
  payload may ever reach the component's `{@html}` sink — component
  props and consumer strings never reach it (test fixtures cover
  disallowed elements, event-handler attrs, foreign namespaces,
  CDATA/COMMENT injections, not just `<script>`/`<use>`).
- **svgo v4** (`import { optimize } from 'svgo'`, dynamically
  imported inside the icons sub-entry so the umbrella entry's graph
  stays provider-free): preset-default tuned — `removeViewBox: false`,
  floatPrecision 3 (the PATH_DECIMALS precedent), dimension
  stripping. A unit test pins svgo as a no-op on lucide's canonical
  serialization (the geometry-consistency law survives).
- **Structured extract**: root `<svg>` → `viewBox` + nature (stroke
  vs fill artwork) + children serialized to inner-HTML string `d`.
  The component re-owns the root; the artifact stores `{ v, n, d }`,
  never a full `<svg>` string. Root stroke/fill/stroke-width are NOT
  stored; child-level overrides (lucide's fill dots) survive in `d`.

## 3. Packing + loading semantics

- **Budget unit**: the serialized entry bytes inside a chunk module
  (key + payload), raw non-gzip. Default 20480. The default set's
  chunk count is a MEASURED acceptance (a test asserts the real
  generator output — count, order, per-chunk bytes), never an
  a-priori doc claim.
- **Greedy**: fill chunk K in order; the next icon that would exceed
  `maxChunkBytes` opens K+1; an icon larger than the budget forms its
  own chunk with a warning (safety's `maxBytes` already bounds single
  icons — the budgets are independent on purpose).
- **Mode matrix** (exact, test-locked):

| `chunking` | `inlineFirstChunk` | chunk layout | artifact imports |
| --- | --- | --- | --- |
| `'auto'` (default) | `true` (default) | budgeted chunks; chunk 0 inline | lazy imports for chunks 1..N only; N=0 → ZERO virtual imports |
| `'auto'` | `false` | budgeted chunks; all lazy | lazy imports for every chunk |
| `'single'` | `true` (default) | one chunk, fully inline | ZERO virtual imports (the "不拆" mode) |
| `'single'` | `false` | ONE lazy chunk with everything | exactly one lazy import |

```
chunk 0  ── inline const in icon-set.gen.ts ──► getIcon() sync hit
                                                    │ SSR renders it in
                                                    │ server HTML,
                                                    │ hydration matches,
                                                    │ ZERO wiring
chunks 1+ ── virtual:jixoai-icons/chunk/K ────► loadIcon(name) dynamic
              export default {name:{v,n,d}}      import, cached promise,
                                                   {#await} → reserved box
```

  Svelte's standard SSR renders ONLY the pending branch of `{#await}`
  — the inline core makes the default case synchronous and the
  default-config artifact plugin-free (per the CURRENT generator
  output — the acceptance test owns the numbers, and the
  artifact's plugin-free property holds exactly when that output
  has zero lazy chunks). Lazy chunks exist only past the budget (or
  behind `inlineFirstChunk: false`); `preloadIcons` warms them
  ahead of a mount.

## 4. The registry install contract (how consumers stay installable)

Two tiers, test-enforced by `verify-shadcn-add` probes:

1. **Default tier (plugin-free)**: the committed artifact is the
   default-config output — 38 built-ins, inline core, and (measured;
   today's payload fits) ZERO lazy chunks. `shadcn add @jixoai/icon`
   + `@jixoai/icon-set` lands files that build standalone with zero
   npm deps and zero virtual imports. The existing clean-consumer
   probe set is MIGRATED to this shape (its `src/lib/icons.ts`
   exact-once/preseed/hero-closure fixtures become
   `src/lib/icon-set.gen.ts`).
2. **Overflow tier (plugin prerequisite, documented)**: a consumer
   whose config yields lazy chunks (big libraries,
   `inlineFirstChunk: false`) MUST wire `@jixoai/vite-plugin`
   `jixoai({ icons: { library } })` — the item docs carry the wiring
   recipe (the ghostty-term precedent: documented plugin
   prerequisite). A NEW forced-overflow clean-consumer probe builds
   a real vite project with the plugin wired and asserts the lazy
   chunks emit and load; without the plugin the failure is a named
   build error naming the plugin option (never a silent 404).

## 5. Generator architecture (pure core + adapters)

```
resolveLibraryInputs(config, io)            // ADAPTER-side: IconSource →
  lucide refs, file reads (ctx.loadSource),  // resolved SvgAsset list —
  inline literals                           // the ONLY stage with I/O
        │
generateIconLibraryArtifacts(assets, opts)  // PURE: no fs, no vite, no
  → { artifact: string,                    // dynamic imports; input is the
      chunks: Map<number, string>,         // RESOLVED asset list, never
      report: { perIconBytes, chunkCount,  // IconSource (the type split
                warnings } }               // makes I/O smuggling untypeable)
        │
        ├─ vite adapter  — virtual chunk modules, dev drift-warn
        │                  (write only when the consumer opted in),
        │                  HMR through the slot face's refresh path
        └─ root script    — `gen:icons` canonical write (the ONLY
                           in-repo writer) + `verify:icons --check`
                           (no vite import)
```

The pure core is the ONLY serializer; adapters own every side
effect and every I/O boundary. `verify:icons --check` runs without
vite and without the dev server.

**The overflow named-error sentinel (build-time primary, runtime
belt)**: when the vite plugin IS present but the library face is
NOT configured, its `resolveId` explicitly recognizes
`virtual:jixoai-icons/chunk/*` and throws ONE fixed build error —
`[jixoai/icon-set] virtual:jixoai-icons/chunk/* imported but no
icons library is configured — wire jixoai({ icons: { library } })
in your vite plugins (see the icon-set item docs)` — so an unwired overflow
consumer never sinks into vite's generic unresolved-import error.
(Plugin absent entirely: vite's generic error is unavoidable —
documented; the item docs lead with the wiring recipe.) The
artifact's LAZY loaders ALSO wrap every dynamic import in a catch
that rethrows the same fixed message with the original error as
`cause` (runtime failures: fetch/parse after a green build). The
forced-overflow probe asserts the EXACT build-time message on the
unwired path and successful chunk loading on the wired path.

## 6. The artifact (`icon-set.gen.ts`) + chunk ownership under mirror law

```ts
// GENERATED — do not edit (source: @jixoai/vite-plugin icons library face)
export type IconName = 'arrowRight' | … | 'myLogo';
export const ICON_NAMES = […] as readonly IconName[];
export interface IconData { v: string; n: 'fill'|'stroke'; d: string }
const CHUNK_0: Readonly<Record<string, IconData>> = {…};
const CHUNK_OF: Readonly<Record<IconName, number>> = {…};
const LAZY: Record<number, () => Promise<{default: …}>> = {…};
const cache: Map<string, IconData> = new Map(Object.entries(CHUNK_0));
export function getIcon(name: IconName): IconData | null;
export function loadIcon(name: IconName): Promise<IconData>;
export function preloadIcons(names: Iterable<IconName>): Promise<unknown[]>;
```

- **Mirror scope**: ONLY the artifact file mirrors
  (`registry/files/lib/icon-set.gen.ts` ←→
  `apps/www/src/lib/icon-set.gen.ts`, byte-identical, sha-checked).
  Lazy chunk bodies are NOT files — they are virtual modules
  generated at dev/build time by whichever app runs the plugin, so
  nothing else enters the mirror manifest, and `verify:mirror` needs
  no law change (the artifact joins the existing
  `registry/files/lib/**` classification).
- **Artifact ↔ chunk parity**: because both the canonical artifact
  and any app's runtime chunks come from the same pure generator with
  the same inputs, parity is enforced by determinism + a dogfood
  assertion (the virtual chunk payload the plugin serves must equal
  the artifact's CHUNK_OF/LAZY mapping).
- Dev HMR: svg-file change → regenerate → virtual chunks invalidate
  via the slot face's refresh path (full reload). An artifact WRITE
  happens only on the consumer `write: true` path, and only on
  content change — the in-repo apps never write (§1's single-writer
  law; the adapter drift-warns instead).

## 7. The component (`registry/files/ui/icon/`)

```
<Icon name="chevronRight" />                       // 16px default, sw 2
<Icon name="x" size={13} strokeWidth={2.5} class="…" />
```

- Props: `name: IconName` (required, typo = compile error), `size`
  (`number | string`, default 16), `strokeWidth` (default 2), plus
  `class`/rest spread onto the `<svg>` root.
- Root attrs the component owns: `xmlns`, `viewBox={v}`,
  `width/height={size}`, currentColor by nature, round caps/joins,
  `aria-hidden="true"`, `data-jx-icon`. Children from `d` via
  `{@html}` — an internal render detail, reachable only by
  RAW-gated, plugin-extracted payload (§2).
- Sync path: `getIcon(name)` hit → render directly (the SSR path).
- Lazy path: `{#await loadIcon(name)}`; the pending/catch DOM shape
  is FIXED (SSR/hydration-stable):
  `<span data-jx-icon-pending aria-hidden="true"
     style="display:inline-block;width:{size};height:{size}"></span>`
  — identical markup pending and rejected, so hydration never
  rewrites the box; rejection logs `console.warn` DEDUPED PER CHUNK
  (one warn per failed chunk import per session — repeated mounts
  and names in the same chunk stay silent; no reset API).
- Imports from `$lib/icon-set.gen` only; the item declares
  `@jixoai/icon-set` + `@jixoai/jixoai-theme` in registryDependencies.

## 8. Migration (full, no compat layer) — the auditable inventory

The migration list is a MACHINE-GENERATED, COMMITTED artifact, not
prose: a new `scripts/verify-icon-migration.mjs` (`--write` emits /
refreshes `scripts/icon-migration-inventory.json`, `--check` gates)
produces the authoritative consumer inventory from the real rg
sweep — scoped to implementation surfaces only
(`registry/files apps/www/src scripts package.json packages
registry.json`), with living specs, change docs, THE VERIFIER'S OWN
SOURCE, and THE INVENTORY FILE ITSELF excluded by fixed rule (the
verifier must never match its own patterns). Snapshot semantics:
the JSON holds the live hit list at generation time; `--check`
fails whenever live hits ≠ the committed snapshot (progress =
shrink + re-commit the snapshot; C5 completion = snapshot `[]` AND
zero live hits — "snapshot is truth" and "zero-hit exit" compose
instead of conflicting). Patterns: `$lib/icons`, `@html icons\.`,
`@jixoai/icons`, `registry/files/lib/icons\.ts`,
`apps/www/src/lib/icons\.ts`, `scripts/gen-icons\.mjs`. Wired into
verify-all as `verify:migration`.

Known members of that inventory today (the snapshot is the truth):

- **Gates/scripts**: root package.json `gen:icons`/`verify:icons`;
  scripts/verify-all.mjs; scripts/verify-shadcn-add.mjs (exact-once
  list, preseed, hero closure — all `src/lib/icons.ts` fixtures →
  `src/lib/icon-set.gen.ts`); scripts/verify-deps.mjs synthetic
  fixtures (the four-case matrix's dangling/dead names become
  icon-neutral — they carry `@jixoai/icons` / `@lib/icons.ts`
  literals today); scripts/verify-deps-baseline.json (the
  `breadcrumb -> @jixoai/icons` row migrates to the new items).
- **Tests**: jx-pure-parity.spec.ts, icons-page.spec.ts,
  terminal-patterns.spec.ts, geometry-consistency.test.ts.
- **Registry plumbing**: registry.json — the `icons` item RETIRES
  and every one of its 26 `@jixoai/icons` dependency EDGES
  migrates per the committed expected-owner snapshot
  (`scripts/icon-edge-ownership.json`: component importers →
  `@jixoai/icon`; artifact-level importers → `@jixoai/icon-set` —
  the mapping is reviewed data, not an afterthought). Final
  assertion: `rg '"@jixoai/icons"' registry.json scripts apps
  registry packages` = zero hits (verify-deps stays green —
  dangling edges are hard failures and cannot be baselined).
- **Living specs (updated by THIS change's deltas — openspec
  archive applies them to the living specs at closure; C6 verifies
  no stale Requirement survives post-archive)**:
  component-authoring's "components consume the generated icon
  module" requirement; registry's icons-item requirement and the
  registryDependencies "declared icon dep is unused" scenario.
- **Consumers**: registry/files/ui/** (~33 files), www chrome +
  docs pages + blueprints scenes (~57 files), incl. docs PROSE
  teaching the old API and blueprint fixtures.
- Ternaries → dynamic `name`; `SEMANTIC_GLYPHS`'s `keyof typeof
  icons` → `IconName`; sizing/stroke wrapper classes → `size`/
  `strokeWidth` props where mechanical; contextual CSS sizing may
  stay.

## 9. Package boundaries (svgo chain + the umbrella bridge)

`packages/vite-plugin` gains svgo as its ONLY regular dependency —
and the change covers the whole reproducibility chain in ONE task:
package.json `dependencies`, the self-contained package-lock.json
(`npm install` inside the package, lock committed), tsdown keeps
svgo EXTERNAL (loaded only via the icons sub-entry's dynamic
import), `npm ci && npm run build && npm pack --dry-run` gate, and
a graph-purity test asserting `dist/index.js` (umbrella) contains
no svgo/provider code (the existing entry-purity law, extended).

**The umbrella bridge (how `jixoai()` stays sync while the icons
graph stays out of the entry)**: today `src/index.ts` STATICALLY
imports `./icons/types.js` + `./icons/vite-plugin.js` and calls
`createIconPlugin` directly. Post-change the umbrella keeps its
frozen sync API (`jixoai()` returns `Plugin[]` immediately) but
ships only a BRIDGE plugin: a thin `'jixoai-icons-bridge'` proxy
whose hooks (`buildStart`/`resolveId`/`load`/`configureServer`)
`await import('./icons/vite-plugin.js')` ONCE (memoized), then
delegate to the real icon plugin instance. The static imports are
REMOVED from `src/index.ts`; the icons implementation is reachable
only through the `./icons` sub-entry and the bridge's dynamic
import. The graph-purity test becomes a REAL import-graph check
(parse `dist/index.js`'s static imports transitively — no
`icons/vite-plugin`, no provider, no `lucide`, no `svgo` — not a
string scan), and the `jixoai({ icons: … })` integration test
proves the bridge delegates end-to-end (config matrix included).
The gate also covers the PUBLISHED artifact shape: the pack smoke
test asserts the dist layout actually carries the icons
sub-entry's module files the bridge dynamic-imports (e.g.
`dist/icons/vite-plugin.js` — source paths existing is not enough;
the published package must contain the chunk the bridge loads).

## 10. Deliberately out of scope

The slot/CSS face beyond zero-touch; woff2/font transport and any
runtime rasterization; per-icon ink theming; unregistry'd ad-hoc
icons at render time (names not in the config are compile errors).

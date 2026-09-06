# design — icon-prefix-compiler

## 0. The data flow (one pass, no source rewriting)

```
scan.ts — ONE pure module, TWO collection entries:

(a) EAGER project walk        (b) dev transform collector
    buildStart when               enforce:'pre' transform
    command === 'build' AND       (.svelte/.ts/.html, dev only)
    inside script.ts
    buildArtifacts (gen:icons     rides scheduleRefresh —
    / --check)                    module-graph-safe, HMR-invalidating
        └───────────┬──────────────────┘
                    ▼
  collect STATIC name="…" literals
    ├─ "md:X"          → ref
    └─ "md:X as Y"     → ref + alias(Y)
                    ▼
generateIconLibraryArtifacts(inputs: manifest + declared + SCANNED)
  ├─ IconName union: concrete names ∪ aliases ∪ `md:${string}` (per enabled preset)
  ├─ ALIASES table: alias → canonical; payload packs ONCE per canonical key
  └─ collision rules enforced (named errors)
                    ▼
artifact (alias indirection) — sources untouched, HMR stable
```

## 1. The scanner — one pure module, TWO entries

Transform-only collection CANNOT serve production builds (generation
runs at buildStart BEFORE any transform; the build promise is
memoized; invalidation no-ops without a dev server) nor the root
gen:icons/verify:icons script (its scanner-less twin would emit
artifacts diverging from dev). `scan.ts` is therefore a pure module
with TWO entries:

- **(a) the EAGER project walk** — the same matcher run directly
  over the project's source files, at buildStart when
  `command === 'build'` AND inside script.ts's buildArtifacts, so
  gen:icons / `--check` stay byte-equal to the dev-server artifact
  for the same scanned set.
- **(b) the DEV-INCREMENTAL transform collector** — the vite
  transform collects literals and rides scheduleRefresh (dev only):
  a scanned-set change invalidates and regenerates like a config
  edit — one full-reload cycle, the slot-face refresh path.

- Scope: module ids matching /\.(svelte|ts|js|html)$/ EXCLUDING
  node_modules, dist, .svelte-kit, virtual modules, and the
  generated artifact itself. A conservative literal matcher for
  `name="<prefix>:<name>[ as <identifier>]"` (attribute + `name={'
  …'}` string-literal forms) — NO expression evaluation: dynamic
  names are intentionally out (the runtime lane owns them).
- Name grammar: the ENABLED PRESET's OWN name grammar is the law —
  the preset resolver validates. Examples are `md:copy_all`
  (snake_case per material-symbols naming), NOT kebab. The scanner's
  literal regex is deliberately permissive — `/^[a-z][a-z0-9_]*$/`
  after the prefix — so it never rejects what a preset accepts;
  resolution is the authority. Consequence for the name law: scanned
  keys like `md:copy_all` are EXEMPT from the camelCase
  ICON_NAME_PATTERN, while ALIASES must satisfy it.
- `as <identifier>` grammar: `/^[a-z][A-Za-z0-9]*$/` (the name law).
- Determinism: refs sort (preset, name) — scan ORDER never affects
  bytes.

The transform itself must exist in THREE places (an umbrella
consumer must not silently lose the scanner): (1) createIconPlugin's
plugin object; (2) the `IconPluginHooks` contract as a
plain-function member (like `load`); (3) a delegating transform hook
in the umbrella bridge — the bridge today delegates
configResolved/buildStart/resolveId/load/configureServer only and
has NO transform, so `jixoai()` consumers would silently get no
scanner.

## 2. Generator inputs + collisions

- `ScannedRef = { preset: 'md', name: 'copy_all', alias?: 'copy2' }`.
- Collision errors (all named, all fail the build):
  alias ↔ existing declared/scanned name; two refs → one alias; one
  ref → alias identical to another ref's name. Plain duplicate
  `md:X` occurrences (no alias) dedupe silently — that is the point.
- Packing (DECIDED: alias indirection, not literal dual keys — the
  per-key payload serialization makes a second full key cost real
  bytes, so "packing bytes unaffected (data shared)" was FALSE): the
  payload packs ONCE under the canonical key (the FULL prefixed
  name); the artifact gains `ALIASES: Readonly<Record<alias,
  canonical>>`; `getIcon`/`CHUNK_OF`-style lookups deref aliases
  FIRST. Budget accounting counts the payload once plus the
  alias-table row. The artifact-shape test locks update in THIS
  change accordingly.
- Report and ordering: `report.iconCount` = canonical entries
  (aliases excluded); ICON_NAMES ordering = canonical order with
  each alias emitted ADJACENT to its ref.
- `Record<IconName, number>` stays compile-legal with the template
  members (verified on TS 5.9.3): un-packed names are simply
  runtime-undefined in the record, and the existing `?? -1`
  defenses already cover that semantics.

## 3. Typing

```ts
export type IconName =
  | 'arrowRight' | …            // manifest + declared (+ aliases)
  | `md:${string}` | `ph:${string}` | `rx:${string}`;  // enabled presets only
```

Template members exist ONLY for presets the consumer enabled — an
`fa:` name is a compile error with zero runtime story. This is the
"一定程度安全" contract stated precisely: prefix = compile time,
concrete name = build time (named error), dynamic composition =
runtime lane.

## 4. The dynamic-name runtime lane

`getIcon(unpackedName) === null` → the component's EXISTING lazy
path renders the reserved box — VERBATIM reuse (the chosen form (a):
no new component machinery). The chunk-warn channel is NOT dev-gated
today and stays that way: the component logs once per unknown name
(once-ness via the message identity). The generator's loadIcon error
message for unpacked names is REWORDED in this change to cover BOTH
causes — artifact drift OR a dynamic/scanned-miss name — so the
advice is never misleading.

## 5. Out of scope

Source REWRITING (`name="md:X"` → `name="Y"` in user files — the
ruled-out alternative); expression-evaluating scans; runtime
on-demand resolution of unscanned refs (the artifact stays the
closed world); presets themselves and font sources (companion
change).

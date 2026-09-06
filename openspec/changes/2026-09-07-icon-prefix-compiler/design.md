# design — icon-prefix-compiler

## 0. The data flow (one pass, no source rewriting)

```
vite transform (enforce:'pre', .svelte/.ts/.html)
  scans STATIC name="…" literals
    ├─ "md:X"          → ref        (packed under its own key)
    └─ "md:X as Y"     → ref + alias(Y)
        │ module-graph-safe, HMR-invalidating
        ▼
generateIconLibraryArtifacts(inputs: manifest + declared + SCANNED)
  ├─ IconName union: concrete names ∪ aliases ∪ `md:${string}` (per enabled preset)
  ├─ CHUNK_0/LAZY payload: each ref packed ONCE (md:X and its alias share the entry)
  └─ collision rules enforced (named errors)
        ▼
artifact (dual keys) — sources untouched, HMR stable
```

## 1. The scanner

- Scope: module ids matching /\.(svelte|ts|js|html)$/ EXCLUDING
  node_modules, dist, .svelte-kit, virtual modules, and the
  generated artifact itself. A conservative literal matcher for
  `name="<prefix>:<kebab>[ as <identifier>]"` (attribute + `name={'
  …'}` string-literal forms) — NO expression evaluation: dynamic
  names are intentionally out (the runtime lane owns them).
- `as <identifier>` grammar: `/^[a-z][A-Za-z0-9]*$/` (the name law).
- Determinism: refs sort (preset, name) — scan ORDER never affects
  bytes.
- The scanner is a SEPARATE module the vite adapter drives
  (transform hook collects; the plugin's module-graph invalidation
  carries changes into the generator like a config edit — one
  full-reload cycle, the slot-face refresh path).

## 2. Generator inputs + collisions

- `ScannedRef = { preset: 'md', name: 'copy_all', alias?: 'copy2' }`.
- Collision errors (all named, all fail the build):
  alias ↔ existing declared/scanned name; two refs → one alias; one
  ref → alias identical to another ref's name. Plain duplicate
  `md:X` occurrences (no alias) dedupe silently — that is the point.
- Packing: the ref's canonical entry key is the FULL prefixed name;
  the alias registers as a second key into the SAME entry (one
  payload, both resolvable via getIcon/CHUNK_OF).

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
path renders the reserved box; additionally (dev server only) the
component logs once per unknown name via the chunk-warn channel.
This reuses the lazy-path verbatim — no new component machinery.

## 5. Out of scope

Source REWRITING (`name="md:X"` → `name="Y"` in user files — the
ruled-out alternative); expression-evaluating scans; runtime
on-demand resolution of unscanned refs (the artifact stays the
closed world); presets themselves and font sources (companion
change).

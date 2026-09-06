# icon-prefix-compiler — `md:copy_all` names, `as` aliases, dual-key artifacts

## Why

`<Icon name="copy" />` is fully type-safe but every icon must be
declared in the vite config's `library.icons` map first. The Owner
wants tailwind-style prefixed names — `<Icon name="md:copy_all" />`
— typed as `` `md:${string}` `` template-literal members (prefix-
level compile safety; the concrete name resolves at build time),
plus an inline alias form `<Icon name="md:copy_all as copy2" />`
that pins a short local name later references can share.

## What Changes

1. **Template-literal typing**: for every ENABLED preset (the
   companion presets change), the generated `IconName` union gains
   `` `md:${string}` `` — prefixed names typecheck without
   declaration; concrete validity is enforced at BUILD time
   (resolution failure = named build error).
2. **Source scanning** (the compiler): a PURE scan module with TWO
   entries — (a) an EAGER project walk run at buildStart for
   production builds AND inside the root gen:icons/verify:icons
   script (generation runs at buildStart, BEFORE transforms, and
   the build promise is memoized — a transform-only collector
   cannot serve either lane; the script twin must see the same
   scanned set so gen:icons stays byte-equal to dev), plus
   (b) a dev-incremental vite transform (enforce: 'pre',
   .svelte/.ts/.js/.html sources) collecting static `name="md:X"` /
   `name="md:X as Y"` literals (the tailwind content-scan pattern,
   adapted) — scanned refs resolve through the preset resolvers and
   enter the artifact WITHOUT any vite-config declaration;
   name-literals with an un-enabled prefix are ignored (the
   unknown-prefix error stays a config-face law).
3. **Alias-indirection artifacts** (the ruled form — sources are
   NEVER rewritten): the payload packs ONCE under the canonical
   `md:copy_all` key; the artifact gains an
   `ALIASES: Readonly<Record<alias, canonical>>` table and lookups
   deref aliases first. `as Y` means "I declare the short name Y for
   this ref"; subsequent `md:copy_all` uses and `copy2` uses share
   one packed icon — and the runtime lookups accept the un-split
   literal itself (they split on ` as ` and deref the base). Canonical
   keys serialize quoted (`'md:copy_all': { … }` — the colon makes
   bare keys invalid TypeScript). Alias collisions (two refs claiming one alias,
   or an alias shadowing a declared name) fail the build with a
   named diagnostic.
4. **Dynamic names get a defined runtime lane**: `` name={`md:${x}`} ``
   cannot be scanned — the generated union admits it (template
   literal), and `getIcon` returns null for names absent from the
   packed set; the component's lazy path then renders the reserved
   box and the unresolved name warns once through the chunk-warn
   channel (not dev-gated — the channel's existing behavior), with
   the generator's loadIcon error message reworded to cover both
   unpacked causes (artifact drift or a dynamic/scanned-miss name) —
   documented as the dynamic-name contract.

## Impact

- `packages/vite-plugin`: the scan module (eager walk + dev
  transform collector, the transform wired through the plugin
  object, the IconPluginHooks contract, AND the umbrella bridge) +
  generator inputs (scanned refs as a third input stream after
  manifest/custom/declared refs, entering resolveLibraryInputs as an
  optional extra parameter — existing 3-arg callers keep compiling
  and behaving identically) + `IconName` emission; HMR (a new
  scanned ref invalidates the artifact like any config change).
- Depends on 2026-09-07-icon-library-presets (presets provide the
  resolvers; this change is the ergonomics layer over them).
- The dual-key artifact slightly grows the union/name table (alias
  keys); each alias costs an ALIASES-table row, not a second packed
  payload — per-key payload serialization is exactly why the
  indirection layer exists.
- In-repo lock: this change lands WITHOUT dogfooding scanned refs in
  the www app (ICON_NAMES.length === 38, the MEASURED acceptance,
  and the icons-page first-cell lock all stay green); any later
  adoption updates all three together.
- docs: the component page documents prefixed names, the `as` form,
  and the dynamic-name contract; icons page cross-links.

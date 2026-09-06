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
2. **Source scanning** (the compiler): a vite transform
   (enforce: 'pre', .svelte/.ts/.html sources) collects static
   `name="md:X"` / `name="md:X as Y"` literals (the tailwind
   content-scan pattern, adapted) and feeds the generator — scanned
   refs resolve through the preset resolvers and enter the artifact
   WITHOUT any vite-config declaration.
3. **Dual-key artifacts** (the ruled form — sources are NEVER
   rewritten): the artifact registers BOTH keys — `md:copy_all` and
   its alias `copy2` — pointing at the same data. `as Y` means "I
   declare the short name Y for this ref"; subsequent `md:copy_all`
   uses and `copy2` uses share one packed icon. Alias collisions
   (two refs claiming one alias, or an alias shadowing a declared
   name) fail the build with a named diagnostic.
4. **Dynamic names get a defined runtime lane**: `` name={`md:${x}`} ``
   cannot be scanned — the generated union admits it (template
   literal), and `getIcon` returns null for names absent from the
   packed set; the component's lazy path then renders the reserved
   box and (dev only) `console.error`s the unresolved name —
   documented as the dynamic-name contract.

## Impact

- `packages/vite-plugin`: the scanning transform + generator inputs
  (scanned refs as a third input stream after manifest/custom/
  declared refs) + `IconName` emission; HMR (a new scanned ref
  invalidates the artifact like any config change).
- Depends on 2026-09-07-icon-library-presets (presets provide the
  resolvers; this change is the ergonomics layer over them).
- The dual-key artifact slightly grows the union/name table (alias
  keys) — packing bytes unaffected (data shared).
- docs: the component page documents prefixed names, the `as` form,
  and the dynamic-name contract; icons page cross-links.

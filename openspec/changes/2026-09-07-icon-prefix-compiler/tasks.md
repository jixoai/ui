# tasks — icon-prefix-compiler

## A. Scanner (packages/vite-plugin)

- [x] A1: `src/icons/library/scan.ts` — ONE pure module, TWO
       entries: (a) the EAGER project walk (buildStart when
       command === 'build' AND wired into script.ts's
       buildArtifacts so gen:icons/--check stay byte-equal to dev)
       and (b) the dev transform collector (attribute +
       string-literal expression forms; `as` grammar; the permissive
       `/^[a-z][a-z0-9_]*$/` literal regex — the preset's own name
       grammar is the validating authority, e.g. material's
       snake_case `copy_all`; scope exclusions; (preset, name)
       sorted dedupe)
- [x] A2: vite adapter wiring — enforce:'pre' transform collects;
       scanned-set changes invalidate through the slot-face refresh
       path; the transform lands in THREE places:
       createIconPlugin's plugin object, the IconPluginHooks
       contract (plain-function member, like `load`), and a
       delegating transform hook in the umbrella bridge (the bridge
       has no transform today — umbrella consumers would silently
       get no scanner); unit tests incl. dedupe, exclusions,
       expression-form non-matches (dynamic names intentionally
       unserved)

## B. Generator + typing

- [x] B1: ScannedRef input stream (after declared refs);
       CONTRACT: resolveLibraryInputs gains the scanned stream as an
       OPTIONAL 4th parameter (or a new sibling function) and any
       generator-options extension defaults cleanly — the existing
       3-arg callers (script.ts, the vite adapter, the
       verify-shadcn-add probes, the library test files) must keep
       compiling AND behaving identically; collision matrix (named
       errors: alias↔name, 2→1 alias, 1 ref↔other ref's name);
       packing = alias indirection (payload once under the canonical
       key, one ALIASES row per alias, deref-first lookups;
       report.iconCount counts canonicals only; ICON_NAMES emits
       each alias adjacent to its ref; artifact-shape test locks
       updated)
- [x] B2: `IconName` emission gains `` `md:${string}` ``-style
       members for ENABLED presets only; `Record<IconName, number>`
       stays compile-legal with template members (un-packed names
       runtime-undefined, the existing `?? -1` defenses cover it);
       generator tests for the union shape
- [x] B3: dynamic-name lane — getIcon(null) rides the existing lazy
       path VERBATIM; unknown-name warn through the chunk-warn
       channel (NOT dev-gated today — stays that way; once per
       unknown name via message identity); the generator's loadIcon
       error message for unpacked names REWORDED to cover both
       causes (artifact drift or a dynamic/scanned-miss name);
       component test for the reserved-box + no-crash contract

## C. Docs + gates

- [x] C1: component page — prefixed names, the `as` form, the
       compile/build/runtime three-tier safety story, the
       dynamic-name contract; icons page cross-link; spec locks
- [x] C2: bridge integration test extended to cover the transform
       through `jixoai()` (an umbrella consumer must get the
       scanner, not silently lose it); full gate battery green
       (verify:all; vite-plugin suite; www suite)
- [ ] C3: ordering note — this change IMPLEMENTS after
       2026-09-07-icon-library-presets lands (resolvers dependency);
       IN-REPO LOCK: this change lands WITHOUT adopting scanned refs
       in the www app — ICON_NAMES.length === 38, the MEASURED
       acceptance, and the icons-page first-cell lock all stay
       green; any later dogfood adoption updates all three together

## D. Closure

- [ ] D1: codex doc-review rounds (PASS gate) → implementation
       streams → codex diff review → archive → push

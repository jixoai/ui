# Tailwind CSS v4 container-query variant grammar (for our `query()` keys)

<!-- Sources:
  - https://tailwindcss.com/docs/responsive-design (v4 docs, "Container queries" section; fetched 2026-09-21)
  - https://github.com/tailwindlabs/tailwindcss — packages/tailwindcss/src/variants.ts (the '@', '@min', '@max' functional variants)
  - Local ground truth: tailwindcss 4.3.3 dist, registry/node_modules/tailwindcss/dist/lib.mjs (grep-verified)
-->

1. **Bare container variants.** Prefix a size name from the container scale with `@`:
   `@sm:flex-row` (min-width, mobile-first), `@max-md:flex-col` (below), `@sm:@max-md:flex-col`
   (range stack, compounds). Arbitrary one-offs use an explicit direction prefix:
   `@min-[475px]:`, `@max-[960px]:`. The scale is a **separate `--container-*` namespace**,
   NOT `--breakpoint-*`: default `@3xs` 16rem ... `@sm` 24rem, `@md` 28rem, `@lg` 32rem ...
   `@7xl` 80rem (extend via `@theme { --container-8xl: 96rem; }`). Source: named values resolve
   via `theme.resolveValue(v, ['--container'])`; arbitrary values pass through as-is; values
   containing `var()` are rejected.

2. **Named containers.** Key order is **size first, then slash, then name**:
   `@sm/main:flex-col` (docs: "name containers using `@container/{name}` and target specific
   containers with variants like `@sm/{name}`"). NOT `@main/sm`. Declare on the container
   element with the `@container/main` utility, which emits `container-type: inline-size;
   container-name: main` (raw CSS: `container-name: main; container-type: inline-size;`,
   query: `@container main (width >= 24rem) { ... }`). Purpose: in nested-container trees,
   target a *distant* container instead of the nearest ancestor. Generation (dist-verified):
   modifier present -> `@container ${name} (width >= ${value})`, else `@container (width >= ${value})`.

3. **min/max directions.** Three sibling functional variants share the `--container` scale:
   `@` and `@min` are identical, both `(width >= value)`; `@max` emits `(width < value)`.
   Arbitrary values are documented only with explicit `min-`/`max-` (an `@[475px]` bare form
   is directionless/ambiguous). Ordering comparators: `asc` for `@`/`@min`, `desc` for `@max`.

4. **Styling the container itself.** The `@container` utility marks the element
   (`container-type: inline-size`; `@container-size` -> `container-type: size` for cqb/cqh);
   `@`-variants then style **descendants**. CSS container queries evaluate against the nearest
   *ancestor* container, so an element can never query itself: putting `@md:` on the element
   that carries `@container` would test its *parent's* container (or match nothing). Tailwind's
   docs show no self-styling form — style the wrapper from one level outside.

5. **Our `query()` adaptation.** Chosen named-container grammar: **`"@sm/card"`** —
   `@` + container scale name + `/` + container name, e.g. `{ "@sm/card": {...}, "@max-lg/sidebar": {...} }`.
   Rationale: it mirrors Tailwind v4's exact key order (`@sm/main`) so the syntax is
   Tailwind-familiar and any future docs/mental-model transfers 1:1; the leading `@` keeps
   container keys disjoint from bare media keys (`sm`, `md`), so a single startsWith('@') check
   routes the key; and size-first preserves the invariant that the token between `@` and `/`
   is always the scale token, letting the parser strip `@`, split once on `/`, and reuse the
   same min/max/scale resolution as bare `@sm`. The alternative `"@card/sm"` (name-first) would
   make the first segment unbounded and require two-pass parsing for no Tailwind precedent.

6. **v4 gotchas relevant to us.**
   - `--container-*` != `--breakpoint-*`: same short names, different rem values
     (viewport `sm` 40rem vs container `@sm` 24rem). Our `@sm` keys must use the container scale.
   - `--container-*` values containing `var()` are rejected by the variant resolver.
   - Descendant `@sm:` never matches without an ancestor `@container` (inline-size) element —
     our runtime/IDE should surface a missing-container hint.
   - Arbitrary sizes need explicit direction: support `@min-[475px]` shape, not bare `@[...]`.
   - `container-type: inline-size` establishes inline-size containment: the container's inline
     size no longer depends on its content (watch intrinsic-sizing wrappers).
   - `@container-normal` resets via `container-type: normal` (opt-out utility exists in 4.3.x).

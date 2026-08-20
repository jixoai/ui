# Motion — jixoai website

Motion is restrained: exactly two patterns. Anything beyond them needs an
explicit user request.

## 0. No flash before animation (initial-state law)

The pre-animation hidden state MUST exist in the prerendered markup, and
the `html.js` gate class MUST be set by the synchronous inline bootstrap in
`<head>` (before first paint). JS may only ever add the *revealed* state.

Concretely: `data-reveal` (and its `rule` variant) is a static attribute in
the template markup — never something a mount-time action adds. A
mount-time hidden-state attribute produces a visible-content flash on
every full page load (observed on unipty's flat-file navigation, 2026-08-20):
the prerendered HTML paints first, then hydration adds the attribute, then
the animation plays — the user sees content pop in, disappear, and animate.
Client-side-routed sites hide this by mounting before paint; flat-file and
SSG sites cannot, so the rule holds for ALL jixoai sites.

Verification: `curl` the built page — `data-reveal` must be present in the
static HTML, and the inline bootstrap (which adds `html.js` and the theme
class) must run synchronously in `<head>` before the stylesheet link or at
least before any content element.

## 1. Scroll reveal (entrance)

A `reveal(node, { delay?, rise? })` action wired to an
IntersectionObserver. The action's ONLY jobs are: set the per-element
`--reveal-delay`/`--reveal-rise` custom properties, observe, and add
`.is-revealed` on first intersection. The `data-reveal` / `data-reveal="rule"`
attribute lives in the static template markup (section 0) — the rule
variant is expressed ONLY by the static attribute value; the action has no
`rule` option. Write the attribute with an explicit empty value,
`data-reveal=""` — Svelte/JSX serializers render a bare `data-reveal` as
`data-reveal="true"`, which still matches the presence selector but is
byte-unstable across frameworks; `""` keeps the serialized markup
deterministic. If an element carries the attribute without the action,
prefer a no-JS-safe default: the CSS below keeps it hidden only while
`html.js` is present — pair the attribute with the action in the same
template so the hidden state never outlives JS availability.

- CSS hides only when JS is live: `html.js [data-reveal] { opacity: 0;
  transform: translateY(var(--reveal-rise, 10px)); }` — prerendered and
  no-JS output stays fully visible.
- Revealed state: opacity 1, transform none; transition `opacity 260ms
  ease-out` + `transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1)`, both
  delayed by `--reveal-delay` (stagger siblings ~60–90ms apart).
- `rule` variant: horizontal rules draw in — `scaleX(0) → 1`,
  `transform-origin: left center`, 360ms `cubic-bezier(0.22, 1, 0.36, 1)`.
- Observer: `threshold: 0, rootMargin: '0px 0px -6% 0px'`, unobserve
  after first reveal. **Threshold must be 0** (first-pixel entry): an IO
  threshold is a ratio OF THE ELEMENT, so any non-zero value couples reveal
  timing to element height — tall cards need dozens/hundreds of pixels of
  entry before revealing while the user already sees them (Owner feedback,
  2026-08-20). Control edge buffering only through `rootMargin`, which is
  a viewport percentage and element-size-independent. Migration hint: the
  reference and early jixoai sites shipped `threshold: 0.12` — when
  adopting this law, grep `threshold:` across site sources and bundles to
  purge the legacy value.

## 2. Press physics (interaction)

Every interactive element (PressButton and equivalents):

```
transition-[transform,box-shadow,background-color] duration-150
hover: -translate-x-0.5 -translate-y-0.5  + grow shadow (xs → md)
active: translate-x-px translate-y-px     + shadow-none
```

The element lifts toward the viewer on hover and physically presses back
into the page on click — the brutalist shadow is the affordance. Add
`motion-reduce:transition-none` to the press base class so reduced-motion
users get instant state changes.

## Terminal cursor

Terminal-mimicking cards use a STATIC block cursor (one-time typing
entrance is allowed). The reference site's blinking cursor predates this
law; new jixoai sites do not blink (a blink is a looping animation).

## Law

- `prefers-reduced-motion: reduce` disables both patterns: reveal elements
  render immediately (`opacity: 1; transform: none; transition: none`),
  press transitions drop to none, `scroll-behavior` returns to `auto`.
- No other animation: no looping/ambient motion, no parallax, no page
  transitions, no spinner decorations. Loading states are textual.
- `html { scroll-behavior: smooth }` for anchor navigation only.

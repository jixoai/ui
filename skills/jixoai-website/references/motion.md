# Motion — jixoai website

Motion is restrained: two standing patterns (scroll reveal, press)
plus opt-in effect loops (section 2b). Anything beyond them needs an
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

## 2. Press law (interaction)

Every interactive body uses the theme's `.jx-press` class (Owner
rulings, 2026-08-23 — restrained by decree, r2 same day):

```
hover:  body NEVER moves; the box-shadow alone grows (xs → sm)
active: body translate +1px,+1px; the box-shadow's offsets shrink by
        the same 1px (the *-press token poses) — the shadow's paint
        stays ANCHORED on screen
```

The shadow is the element's OWN box-shadow — no pseudo layer, no
stacking machinery. The arithmetic lives in tokens: each `*-press`
pose is its hover pose minus the 1px press vector (keep them in sync
when a base pose changes). Pose opting through `--jx-press-shadow` /
`-hover` / `-active` (floats rest on `--shadow`; ghost idioms set all
THREE to none and keep the bare +1px press). The law owns the
transition chain — components never carry their own `transition-*`
utilities (unlayered rules beat layered utilities, so a component's
own transition would be silently overridden anyway). Reduced motion
ships inside the law: every press transition drops to `none`.

Legacy note (r1, same day): the first cut painted the shadow on a
counter-translated `::after` layer — geometrically equivalent, but it
put `relative` + `isolation` + `z-index: -1` on every interactive
element for a 1px effect. Dropped in r2 in favor of the token poses.

## 2b. Effect loops (opt-in, Owner request 2026-08-23 r3)

`shimmer / pulse / rainbow / ripple` are OPT-IN attention loops on
press-button, modeled on the animation-svelte reference
(github.com/SikandarJODD/animations) and implemented INSIDE the
component (parametric options belong to the component, not the theme
sheet). The API is typed builders exported from the component's
module script — `import PressButton, { shimmer } from
'@ui/press-button.svelte'` then `effect={shimmer({ speed: 4000 })}`.
One effect per button — loops are attention, never ambience. The
press law holds underneath every effect: the body still never moves
on hover and the shadow paint still anchors on active; every effect
layer sits at negative z-index inside the host's own stacking
context, above the fill and under the label.

- `shimmer(options)` — a conic spark walks the perimeter (Owner polish
  2026-08-23): a height-sized square slides edge-to-edge (container
  queries, alternate) while a 3× conic arc rotates in 90° steps with
  holds. The BOX owns the clip and bleeds 1px past the border for the
  2px blur; the spark blends `plus-lighter` — additive light over the
  host fill. Options: color / spread / cut / speed.
- `pulse(options)` — sonar rings cast by a `background: inherit`
  silhouette copy: `slow` expand-and-fade, `ring` breathe out and
  back, `ripple` eased expand-fade. Options: color / duration /
  distance / variant.
- `rainbow(options)` — a blended aurora wash (Owner spec r4→r6): ONE
  heavily blurred `::after` hugging the body (inset -0.2rem, blur
  1rem) wandering by percentage (±8% x · ±5% y). FOUR background
  layers — a base conic, a counter-rotating conic, a linear sweep,
  and a two-tone conic — each driven by its own registered angle
  property on its own PRIME timeline (3s / 5s / 7s / 11s / 13s /
  17s at the default pace), stacked through background-blend-mode
  (screen / overlay / soft-light). The whole wash then blends with
  the variant fill: `mix-blend-mode: screen` on primary, `color`
  elsewhere — the fill keeps its luminosity, the aurora brings the
  hues. Options: speed (scales all six timelines) / colors.
- `ripple(options)` — ink from the exact activation point (Owner
  spec 2026-08-23): WAAPI drives every dot (`scale 0→2` with fade,
  `fill: both`) and the dot leaves the DOM on `animation.finished` —
  no timer racing the paint. Keyboard activation (click detail 0)
  ripples from the center. `shape: 'round'` (default) PINS
  `corner-shape: round` on the ink against the site-wide bevel law;
  `shape: 'bevel'` cuts half-side corners into a diamond — where
  corner-shape is unsupported, a flat square rotated 45° carries the
  same silhouette. Options: color / duration / shape.

Reduced motion freezes every loop and hides the traveling light (a
frozen stripe mid-surface reads as a defect); the ripple is skipped
in JS — the anchored press already answers the pointer.

## Terminal cursor

Terminal-mimicking cards use a STATIC block cursor (one-time typing
entrance is allowed). The reference site's blinking cursor predates this
law; new jixoai sites do not blink (a blink is a looping animation).

## Law

- `prefers-reduced-motion: reduce` disables both patterns: reveal elements
  render immediately (`opacity: 1; transform: none; transition: none`),
  press transitions drop to none, `scroll-behavior` returns to `auto`.
- No other animation beyond the opt-in effect loops (section 2b): no
  looping/ambient motion, no parallax, no page transitions, no spinner
  decorations. Loading states are textual.
- `html { scroll-behavior: smooth }` for anchor navigation only.

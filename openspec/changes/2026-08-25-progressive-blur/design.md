# design — progressive-blur port rulings

## D1. The pin contract: sticky h-0, never abspos-in-scroller

Probed on Chromium (2026-08-25, headless): absolutely positioned
children of a scroll container scroll away with the content (both
`top:0` and `bottom:0`), so Magic UI's demo placement (overlay inside
the Radix viewport) does not survive OUR contract — the overlay must
stay pinned to the scrollport edge. The pin:

```
scroller (overflow auto)
 ├─ <div class="jx-pblur sticky h-0 z-10 pointer-events-none">   ← root
 │    └─ <div class="absolute inset-x-0 top-0" style="height:H"> ← band
 │         └─ layers: absolute inset-0 + backdrop-filter + mask
 └─ …content…
```

- sticky `top: 0` (or `bottom: 0`) + height 0 → zero flow impact,
  pinned through the whole scroll range (parent = the scroller).
- The band + layers are utilities; only the reveal law lives in
  progressive-blur.css (@layer components).
- `height` takes a definite CSS length (default 6rem). Percentages are
  NOT supported: the band resolves % against the 0-height root.
  Deliberate deviation from Magic UI's `%` default — documented on the
  item.

## D2. The mask ladder (faithful port, generalized)

One formula covers every layer (Magic UI special-cases first/last; the
general form subsumes both — out-of-range stops clamp):

```
step = 100 / blurLevels.length
layer i: linear-gradient(to {edge},
            transparent  i·step,   opaque (i+1)·step,
            opaque      (i+2)·step, transparent (i+3)·step)
+ backdrop-filter: blur(levels[i]px)
```

Cumulative stacking (each layer blurs everything beneath it, including
earlier layers) → blur ramps from ~nothing at the inner edge to the
full stack at the scrollport edge. `position='both'` renders TWO pinned
roots (top + bottom), each with its own ladder — Magic UI's single
full-height element degenerates into uniform blur; the twin-root form
is the correct visual.

## D3. reveal='scroll' — zero-JS scroll gating

The rail must NOT blur at scrollTop 0 (the resting title/search would
sit under a permanent haze). Ruling: the reveal rides CSS scroll-driven
animations, gated by @supports — never a scroll listener:

- opacity animates on EACH LAYER (`.jx-pblur-layer`), never the root:
  an opacity<1 ancestor becomes a BACKDROP ROOT and the layers would
  sample nothing beneath — the classic backdrop-filter killer.
- `animation-timeline: scroll(nearest block)`;
  top: `animation-range: 0px var(--jx-pblur-ramp, 72px)`;
  bottom: `animation-range: calc(100% - ramp) 100%` (fades as the end
  approaches).
- Unsupported engines keep the authored `opacity: 0` → no effect, never
  a wrongly-painted band. `reveal='static'` (default) = Magic UI
  parity, always painted.

## D4. navigation-menu realignment (the drift fix)

The site's top nav is terminal-header — a registry component, not a
custom header — which took the 2026-08-25 Owner ruling (click open
only; hover, grace timers and corridor retired) and delegates panels
to the Popover primitive. navigation-menu keeps the pre-ruling hover
design and a raw `popover=auto` div with NO motion kernel — hence
"opens on mouse-enter, no animation". Realignment:

- Drop hoverIntent/leaveBar/openDelay/pointer handlers entirely.
- Panels = the Popover primitive (trigger snippet = the roving button):
  anchoring, try-fallbacks, light dismiss, one-at-a-time AND the WAAPI
  surface-motion entry/exit all arrive from the primitive.
- open state mirrors ONLY through the primitive's onToggle (the single
  native seam); the click toggle reads live state (light dismiss runs
  after click handlers — Chromium-probed 2026-08-25, terminal-header
  precedent).
- Kept: roving tabindex (one tab stop on current section), ←/→ walk
  with menubar glide, Escape closes + focus returns to the trigger,
  aria-current passthrough, panel snippet carries REAL LINKS.
- navigation-menu.css dissolves (anchoring now primitive-owned; the
  width law is utilities on panelClass).

## D5. Adoption surface

docs-sections-nav is SITE-ONLY chrome (never a registry item): the
overlay drops inside `.jx-dsn-rail` (wide scroller child, hidden with
the rail below 1200px) and inside `.jx-dsn-expand` (the mobile
expansion scroller). Band height 4.5rem, ramp 72px — tuned visually.

# icon-button — inheritance by composition on press-button

## Why

Owner ruling (2026-08-25): "icon-button 本身应该继承与 button，拥有
button 所有的能力，包括 effect" — the component had drifted its own
markup and geometry (a 36px square vs the text button's 42px band),
duplicating press law styling with none of the capabilities.

## What

- icon-button wraps PressButton (the copy-command precedent): the
  two-part contract (icon always decorative, text the ONE label) and
  the posture axis stay component-owned; the paint variants, effect
  loops (shimmer/pulse/rainbow/ripple), href/external anchoring, type
  and class pass through verbatim — inheritance BY CONSTRUCTION, so
  press law and shadow tokens are identical to a text button's.
- press-button grows the geometry axis: `square` (the 42px size-10.5
  frame, level with text buttons — the shadow parity the Owner asked
  for) and `class` passthrough.
- API break (Owner-sanctioned): `variant="normal"|"icon-only"` becomes
  paint `variant` (press-button union) + `iconOnly` boolean. In-repo
  consumers migrated (docs pages, blueprint scene); dense idioms use
  `class="size-7!"` (the deterministic same-family override).
- The icon-only tooltip's pointer notch defaults ON (`arrow` prop,
  opt-out): a square trigger reads best with the aimed pin (antd
  parity); aimed at the anchor point the placement names.

## Verification highlights

- Contract tests (fixtures/icon-button-host.svelte + spec): aria-label
  single-sourcing, size-10.5 band, paint passthrough, shimmer host
  attrs + spark layer, href target/rel, class passthrough, arrow
  on-by-default + opt-out — green.
- Geometry (headed): square 42×42 = text button height, zero padding,
  shadow tokens byte-equal; list-item dense squares honor `size-7!`.
- Docs page: playground drives paint variant + posture + placement;
  the inherited-effect demo (shimmer) shown live.

## Codex

Covered inside the tooltip-review rounds (composition rated a
non-blocking strength from r2 on) + the dedicated gap-change reviews.
File list: icon-button (mirror pair), press-button (mirror pair), docs
pages, blueprint scene, tests + fixture.

# Ruling: Header second-level navigation

Date: 2026-08-22

## Decision

Choose **C: Popover reuse on desktop, repaired in-flow disclosure on mobile**.

The owner requirement is satisfied where the second-level navigation is a
popover-shaped desktop interaction: `terminal-header` consumes the registry
`Popover` primitive rather than maintaining a second panel primitive and a
second positioning law. Mobile is a different composition problem. The
header is a structural, in-flow terminal bezel on small screens, so it keeps
the disclosure and gains a bounded scroll viewport.

Do not choose B. It leaves two popover implementations, preserves the
header's special geometry code, and makes the registry primitive a demo rather
than a real consumer. Do not choose literal A for mobile: a bottom sheet adds
overlay, focus, viewport-height, and sticky-top-layer semantics to the one
place where the product currently communicates structure by pushing content
down.

The desktop implementation is still deliberately hybrid in one respect:
hover grace is consumer orchestration. Native Popover cannot infer a pointer
intent corridor between a link and a panel. The rule is therefore **native
Popover for lifecycle and placement; header JavaScript only for hover intent,
link-vs-toggle policy, and navigation cleanup**.

## Desktop contract

Each item with children renders one `Popover` instance:

```svelte
<Popover
  id={panelId}
  placement="bottom-start"
  panelClass="jx-nav-popover jx-nav-mega"
  bind:this={popover}
  onToggle={handleToggle}
>
  {#snippet trigger()}
    <a href={item.href} aria-haspopup="true" aria-expanded={expanded}>
      {item.label}{@render caret()}
    </a>
  {/snippet}
  ...panel...
</Popover>
```

The trigger snippet is intentionally still the consumer's anchor. The
declarative default remains unchanged: a normal `Popover` trigger is a real
`button popovertarget={id}` and gets native `aria-expanded` behavior. The nav
case is the explicit exception because the parent item must remain a route.

### Principled optional imperative surface

Add an optional handle to `popover.svelte`, without adding listeners or a
placement algorithm:

```ts
export interface PopoverHandle {
  show(): void;
  hide(): void;
  toggle(): void;
}
export function show(): void;
export function hide(): void;
export function toggle(): void;
```

`bind:this` exposes these methods. They call `showPopover()`, `hidePopover()`
and `togglePopover()` on the component-owned panel; unsupported engines are a
no-op. The panel's native `toggle` event remains the only open-state source of
truth. The component should forward an optional typed `onToggle` callback so a
consumer can mirror state into `aria-expanded`; it must not maintain a second
open boolean or synthesize close events.

This is not a general controlled component API: no `open` prop, no effect that
reopens the panel, no hover props, no timers, no viewport measurement, and no
consumer-supplied coordinates. The declarative path stays the default and
retains the zero-listener/zero-positioning-script story. The imperative
methods are an escape hatch for native controls whose activation element is a
link or whose intent is hover.

The primitive also needs a generic `panelClass` (and, if required by the
registry styling convention, `panelStyle`) hook. Nav-specific width, grid,
tokens, and transitions belong to `terminal-header`, not to `popover.svelte`.

### Desktop CSS law

Delete `panelPos`, `getBoundingClientRect`, `positionPanel`, manual clamping,
and all fixed `top`/`left` styles from `terminal-header`.

The shared primitive owns:

```css
anchor-name: --jx-pop-...;       /* wrapper */
position-anchor: --jx-pop-...;   /* panel */
position-area: bottom span-left; /* nav chooses start/end deliberately */
position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
position-visibility: anchors-visible;
margin: 8px;
```

For a right-side nav, the nav instance should use `bottom-end`/`bottom-start`
according to the visual edge it wants; the important law is that the anchor
engine, not a clamp function, chooses the fallback. The mega panel keeps a
definite width and a hard cap:

```css
.jx-nav-popover.jx-nav-mega {
  width: min(90vw, 42rem);
  max-width: 90vw;
  max-height: min(72vh, 42rem);
  overflow: auto;
}
```

The 42rem cap is a maximum, not a promise that a tablet can display four
columns. Container queries choose the number of tracks; below two 14rem
tracks, groups stack and only horizontal rules remain. Every panel is tested
at 1440, 1024, 768, and intermediate widths where the trigger is near the
right edge. A panel must never exceed the visual viewport.

The header's top-layer token class must be repeated on the panel, as it is
today. `::backdrop` remains transparent. A sticky/ported header does not get a
special z-index workaround: the panel is in the popover top layer, while the
anchor is resolved against the fixed/sticky header geometry.

### Desktop close and activation policy

* Hover enters trigger: `show()` after no delay; leaving trigger schedules a
  120ms hide. Entering the panel cancels that timer.
* Click on the parent anchor: prevent navigation only when the panel can be
  opened. First click opens; a second click on a click-open panel hides it.
  If Popover is unsupported, do not intercept the click: navigate normally.
* Native `popover="auto"` supplies light dismiss, Escape, top-layer stacking,
  and one-auto-popover-at-a-time. The `toggle` event sets `openKey`; it is not
  inferred from pointer state.
* A child link calls `hide()` before navigation. External links use their
  normal target behavior.
* SvelteKit client navigation must close the active panel from the layout's
  navigation hook (`onNavigate`/`afterNavigate`) by calling the handle's
  `hide()`. This is required even though a child click already closes it.

## Mobile decision

Keep the in-flow disclosure below `sm`. Fix the missing viewport boundary at
the scroll container, not at the outer grid animation:

```css
.jx-mobile-disclosure {
  max-height: calc(100dvh - var(--header-row-height));
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}
```

The animated `grid-rows: 0fr -> 1fr` wrapper may remain, but its expanded child
must contain the bounded scroller. Do not use `height: 100vh`; dynamic mobile
URL bars require `dvh`. The hamburger row remains visible while the disclosure
scrolls. At 390px with every group expanded, all links must be reachable.

### Closing-semantics matrix

| Action | Desktop Popover | Mobile disclosure |
| --- | --- | --- |
| Outside pointer/focus | Native light dismiss | No implicit close; user can scroll and retains context |
| Escape | Native close, focus returns to trigger | Close hamburger/disclosure; focus returns to hamburger |
| Child link | Explicit `hide()` then route | Explicit `open = false`, route follows |
| Parent route (`all ->`) | Hide, then navigate | Close, then navigate |
| SvelteKit client route change | Layout hook calls `hide()` | Layout hook resets `open` and expanded groups |
| Hamburger toggle | N/A | Toggle `open`; closing also clears or preserves expanded groups consistently (choose clear) |
| Resize across `sm` | Native open panel is hidden when desktop branch unmounts | Close/reset disclosure when crossing breakpoint |

Mobile does not light-dismiss on an arbitrary body tap. That would turn an
in-flow document section into an accidental modal and make the terminal's
structural language inconsistent. Escape and the explicit hamburger control
are sufficient and predictable.

## Older engines without Anchor Positioning

The generic Popover's authored fallback (viewport-centered, `inset: 0`,
`margin: auto`) is acceptable for a generic status/action popover but **not**
for a desktop navigation mega panel. A centered 42rem menu detached from its
pill is a navigation failure, even if it does not overflow.

Therefore the nav must degrade differently while preserving the primitive's
generic fallback: feature-detect anchor positioning for the desktop nav and
render the parent as a normal navigable link with no second-level overlay (or
render a compact in-flow menu below the nav row). Do not reintroduce JS
measure-and-clamp as a legacy branch. The no-anchor path must remain usable,
not pixel-identical.

## Required edge-case checklist

- Rotation and resize while open: native anchor fallback reflows; test both
  orientations and near-edge triggers. No resize listener is permitted for
  panel coordinates.
- One-at-a-time: opening one `popover="auto"` panel closes the previous one;
  `toggle` events must clear `openKey` for the old panel.
- `aria-expanded`: derive from the last native `toggle` event, including light
  dismiss and Escape. Never set it only in click/hover handlers.
- Focus: keyboard focus on the trigger opens via its supported activation path;
  Escape/light dismiss restores focus per native behavior; focus-visible rings
  must remain visible in the top layer.
- Client navigation: close in the layout navigation hook and reset mobile
  `open`/`expanded` state.
- Sticky header/top layer: verify the anchor remains aligned while the body
  scrolls and that `position-visibility: anchors-visible` hides a stale panel.
- Tablet mega panel: at 768px and below, cap to `90vw`, allow internal scroll,
  and stack groups when 14rem tracks no longer fit. Never let the 42rem cap
  become a minimum width.
- Dynamic viewport: mobile uses `dvh`; URL-bar expansion must not clip the
  last link or cause a direction flip.
- Reduced motion: disable panel/disclosure transitions while retaining all
  close and scroll semantics.
- Unsupported Popover API: parent links remain navigable; no intercepted click
  may strand the user.

## Risks and acceptance gate

The main risk is the imperative handle being mistaken for a second controlled
state model. Keep it three methods only, keep native events authoritative, and
document it as an exceptional trigger integration. The second risk is focus
behavior with an anchor trigger; verify keyboard activation and restoration in
Chromium and Safari rather than assuming button semantics transfer.

Acceptance requires real interaction evidence at desktop 1440/1024/768, a
right-edge trigger, both orientations, and mobile 390 with all groups
expanded. “No overflow” means measured visual-viewport containment and every
mobile child link reachable, not merely that the document has no horizontal
scrollbar.

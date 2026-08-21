# Design consultation: header second-level nav on the Popover component

NO implementation code yet. This is a design ruling request. You are in the
jixoai-ui repo (Svelte 5 component registry, shadcn-style distribution).

Read these two files first:

1. `registry/files/ui/popover.svelte` — public Popover primitive. Law:
   `popover="auto"` + declarative `popovertarget` button; CSS Anchor
   Positioning (anchor-name on wrapper span, position-anchor +
   position-area inline, position-try-fallbacks flip-block/flip-inline,
   position-visibility anchors-visible); uniform 8px margin gap law; ZERO
   runtime script (a JS scroll side-selection bridge was just removed after
   mobile jitter: it never ran at open time and fought the engine plus
   URL-bar resizes). `@supports not (anchor-name)` fallback = viewport
   center + margin auto.

2. `registry/files/ui/terminal-header.svelte` — site nav bar. Desktop
   (>=sm): pills with children orchestrate `popover="auto"` panels via JS
   only: hover grace timers (120ms), click-toggle (pill is an `<a href>`
   that must ALSO stay navigable), and JS measure-and-replace positioning
   (panelPos top/left from getBoundingClientRect + manual clamping) — the
   OLD recipe just deleted from popover.svelte. Mega panels: grouped
   multi-column, container queries, 42rem cap. Mobile (<sm): hamburger
   opens an in-flow grid-rows 0fr->1fr disclosure with nested expandable
   groups; long content has NO scroll support (clips). Sliding active-pill
   indicator uses view-transition-name.

Consumer (`apps/www`): ONE mega item (Components, 4 groups x 3-4 links) +
2 plain links.

Measured defects (today, real interactions, ego-browser):
- Desktop real hover at 1440/1024/768: the mega panel (672px) overflows
  the right viewport edge by 334-354px. The JS clamp is genuinely broken.
- Mobile 390 with all groups expanded: header grows to 908px > 844px
  viewport, overflowY visible, no scroll, bottom items unreachable.

## Owner directive

The header second-level nav SHOULD be implemented with the Popover
component — a very clear application (dogfooding). Must test across device
widths: clearly visible, never overflow the screen. Mobile currently
avoids Popover; either (a) fix the disclosure's missing scroll, or (b)
unify EVERYTHING on Popover including mobile — Owner warns that may get
messy and calls it a test of foundational design ability. Closing
semantics must be designed deliberately, not inherited by accident.

## Candidate plans

A. **Literal reuse**: terminal-header imports popover.svelte per pill
   (trigger snippet renders the pill `<a>`); popover.svelte gains an
   OPTIONAL imperative surface (bind:this -> show()/hide()); hover grace
   stays consumer-owned. Mobile: hamburger opens ONE popover bottom-sheet
   anchored to the header row (position-area bottom, dvh-based max-height,
   overflow auto) replacing the disclosure.

B. **Same-law refactor**: header keeps its own `popover="auto"` panels +
   hover/click JS but swaps JS positioning for the identical CSS Anchor
   Positioning law (per-pill inline anchor names). popover.svelte
   untouched. Mobile: fix disclosure scroll only (max-height +
   overflow-y auto + overscroll-behavior contain).

C. **Hybrid**: plan A on desktop; mobile keeps disclosure with scroll
   fixed.

## Rulings needed

1. A vs B vs C and why — weigh registry primitive API purity (generic vs
   nav-specific), the zero-script story, maintenance (two popover
   implementations vs one), pill-is-a-link vs popovertarget-is-button-only
   tension, and that hover-open with grace timers is inherently JS.
2. If A: the exact imperative API shape for popover.svelte that stays
   principled (exported show/hide? bind:panel? optional hover props?)
   while leaving the declarative default path untouched.
3. Mobile: bottom-sheet popover vs in-flow disclosure — give a
   closing-semantics matrix (light dismiss / Escape / link click /
   client-side route change / hamburger toggle) and judge which fits a
   terminal/brutalist language where the current disclosure pushes content
   down instead of overlaying.
4. Engines without CSS Anchor Positioning (older Safari): popover.svelte
   @supports fallback is viewport-center — acceptable for a nav mega
   panel? Or should nav degrade differently?
5. Edge-case checklist: rotation/resize while open; one-at-a-time across
   pills (popover=auto free); aria-expanded truth via native toggle
   events; focus behavior; closing on SvelteKit client-side navigation;
   sticky header + top layer interplay; mega 42rem panel on tablet widths.

## Deliverable

A design ruling: chosen plan, concrete component API, CSS laws,
close-semantics matrix, risk list. Be opinionated; if the framing is
wrong, say so.

# tasks — progressive-blur change

> Landed 2026-08-25. Implementation was swept into the concurrent
> `d3819be` commit by another session working the same tree; the
> verification record and the post-sweep repairs are the follow-ups.

## 1. the atom (registry)

- [x] registry/files/ui/progressive-blur/progressive-blur.svelte —
      port + reveal extension (design D1–D3); the sticky offset
      (top-0/bottom-0) is load-bearing, found by engine probes
- [x] registry/files/ui/progressive-blur/progressive-blur.css —
      reveal law (@supports scroll() gate)
- [x] registry/files/ui/progressive-blur/index.ts — pure barrel
- [x] registry.json item (group general, registryDependencies
      @jixoai/jixoai-theme, docs field incl. the reveal extension)
- [x] mirror copies under apps/www/src/lib/ui/progressive-blur/ +
      gen-mirror-manifest (87 items GREEN)

## 2. docs surfaces

- [x] docs-sections-nav.svelte: rail top overlay (reveal scroll) +
      mobile expand overlay; the rail's 1.25rem inset moved from the
      scroller to the content (the probed pin-line law — see
      verification.md)
- [x] docs page /docs/components/progressive-blur.html (+page.svelte
      + toc via +page.ts)
- [x] blueprint scene + npm run build:blueprints → committed SVG

## 3. navigation-menu realignment

- [x] rebuild panels on the Popover primitive; retire hover path +
      openDelay (design D4); delete navigation-menu.css; triggers ride
      the DECLARATIVE popovertarget (no click-order race — the jsdom
      polyfill's capture-order light dismiss exposed the imperative
      toggle's race)
- [x] batch4b: click-toggle coverage (open/close/one-at-a-time through
      the seam) + hover-retired lock
- [x] docs page + registry.json description/pills rewritten

## 4. gates

- [x] apps/www vitest suite (349/349, counts locked via the derived
      rail-count from the concurrent 0155e2a + taxonomy pin updated)
- [x] gen-mirror-manifest --check, verify:mirror, verify:surface,
      verify:trygrid, verify:press
- [x] site build (prerender incl. the new page; payload parity GREEN)
- [x] engine probes: rest opacity 0×8 / scrolled 1.00×8, sticky pin
      delta 0 at the clip edge — see verification.md
- [x] visual pass via vision subagent (screenshots; report in
      verification.md appendix when returned)

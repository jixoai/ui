# tasks — progressive-blur change

## 1. the atom (registry)

- [ ] registry/files/ui/progressive-blur/progressive-blur.svelte —
      port + reveal extension (design D1–D3)
- [ ] registry/files/ui/progressive-blur/progressive-blur.css —
      reveal law (@supports scroll() gate)
- [ ] registry/files/ui/progressive-blur/index.ts — pure barrel
- [ ] registry.json item (group general, registryDependencies
      @jixoai/jixoai-theme, docs field incl. the reveal extension)
- [ ] mirror copies under apps/www/src/lib/ui/progressive-blur/ +
      gen-mirror-manifest

## 2. docs surfaces

- [ ] docs-sections-nav.svelte: rail top overlay (reveal scroll) +
      mobile expand overlay
- [ ] docs page /docs/components/progressive-blur.html (+page.svelte
      + toc via +page.ts)
- [ ] blueprint scene + npm run build:blueprints → committed SVG

## 3. navigation-menu realignment

- [ ] rebuild panels on the Popover primitive; retire hover path +
      openDelay (design D4); delete navigation-menu.css
- [ ] batch4b: click-toggle coverage (open/close through the seam)
- [ ] docs page + registry.json description/pills rewritten

## 4. gates

- [ ] apps/www vitest suite (catalog/blueprints/docs-structure counts)
- [ ] gen-mirror-manifest --check, verify:mirror, verify:surface,
      verify:trygrid, verify:press
- [ ] site build (prerender incl. the new page)
- [ ] visual pass: rail scrolled (blur ramps in, none at rest),
      navmenu click-open animated panel — screenshots reviewed

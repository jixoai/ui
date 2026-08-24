# jixoai-ui

The jixoai design language, distributed as a [shadcn registry](https://ui.shadcn.com/docs/registry).
Terminal / neo-brutalist, mono-first, OKLCH token law with one brand hue per
project. Everything here graduated from production work on
[unipty](https://unipty.jixoai.com) and [openspecui](https://www.openspecui.com).

> Orthogonal intents (2026-08-20): design-language registry; consumer
> ergonomics; Owner hosting. The registry is the source of truth; the docs
> site (later, `apps/`) only browses it.

## Consume

Add the namespace to your `components.json`, then add items:

```bash
npx shadcn add @jixoai/press-button
```

```jsonc
// components.json
{
  "registries": {
    "@jixoai": "https://ui.jixoai.com/r/{name}.json"
  }
}
```

### Prerequisite: Tailwind v4 + the jixoai entry (registry:ui items)

`registry:ui` items are utility-authored against Tailwind v4 and the
jixoai token sheet. Your project needs ONE css entry in this exact
order (the theme arrives automatically via each item's
`registryDependencies`):

```css
@import 'tailwindcss';
@import './lib/jixoai.css'; /* delivered by @jixoai/jixoai-theme */
/* optional: @import './lib/jx-pure.css'; — the componentless face */
```

Plus `tailwindcss` + `@tailwindcss/vite` (v4) in your devDependencies
and the vite plugin wired. The check script lives in this repo
(`scripts/check-tw4-prereq.mjs`) — copy it or run it from a checkout
inside your project; it fails with named fixes for each missing piece.

Installed layout is FOLDER-shaped: every ui item lands under
`src/lib/ui/<name>/**` with a pure-barrel `index.ts`
(`import X from '$lib/ui/<name>'`) and, where the design law requires
authored css, a colocated `<name>.css` (standard CSS only —
`@layer components` + `:where()`, order-independent via the canonical
layer prologue; consumer utilities always win over component paint).
The engine and theme items stay framework-free.

## Catalog

| Item | Type | What it is |
| ---- | ---- | ---------- |
| `jixoai-theme` | `registry:theme` | The full OKLCH token sheet (light/dark, hard shadows, radius law, fonts) with the `--brand-hue` law — change ONE number per project |
| `toc-engine` | `registry:lib` | Framework-free ToC geometry engine: IoM weights (`intersection / min(block, viewport)`), line pick (viewport-top line, margin resolves DOWNWARD), 76px mobile line offset |
| `reveal` | `registry:lib` | Scroll-reveal action: static `data-reveal` hook law, delay/rise staggering, reduced-motion safety |
| `press-button` | `registry:ui` | The brutalist press-physics button |
| `section-card` | `registry:ui` | Eyebrow/title/summary content card (site grammar atom) |
| `terminal-header` | `registry:ui` | Terminal-bar site header (brand + nav pills + theme slot) |
| `terminal-footer` | `registry:ui` | Ghost wordmark footer |
| `theme-toggle` | `registry:ui` | light / dark / system switcher with no-flash bootstrap |
| `toc` | `registry:ui` | The Combo ToC: Rule Tracker desktop (spine + weight-driven nodes) + Terminal Rail mobile (glass single-row viewport, expand = height only, line-driven) |

Components are Svelte 5 first (all jixoai sites are SvelteKit); the engine
and theme are framework-free. Non-Svelte consumers can still install
`jixoai-theme` and `toc-engine`.

## Development

```bash
pnpm install
pnpm build   # shadcn build → public/r/*.json (the distributables)
```

Item sources live under `registry/files/…`; `registry.json` is the index.
Dependencies between items use `registryDependencies`.

## Owner TODOs (blocking first publish)

- [x] Create the GitHub repo `jixoai/ui` (brand name jixoai-ui) and push (public; the
      central registry index only lists public namespaces, but decentralized
      hosting works either way — private repos need Pages on a paid plan)
- [ ] Point `ui.jixoai.com` CNAME at GitHub Pages (same DNS flow as
      `unipty.jixoai.com`), enable Pages on the `public/r` artifact
- [ ] Decide the default `--brand-hue` shipped in `jixoai-theme`
      (default `0`, jixoai red; unipty uses `165` 幽绿) — consumers change one number or run `jixoai-ui hue <n>`

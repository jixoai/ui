# Tech stack — jixoai website

The reference stack, validated on `openspecui/packages/website`. Use it for
new jixoai sites; adapt only the deployment transport.

## Core

| Concern | Choice | Why |
| ------- | ------ | --- |
| Framework | SvelteKit 2 (`@sveltejs/kit`), Svelte 5 runes | Static-prerendered, snippet-based composition |
| Build | Vite 8 + `@sveltejs/vite-plugin-svelte` | One pipeline for dev/build/test |
| CSS | Tailwind CSS v4 via `@tailwindcss/vite` (CSS-first config, no tailwind.config) | Tokens live in CSS; `@theme inline` maps to utilities |
| Static output | `@sveltejs/adapter-static` → `dist/`, `strict: true` | Sites are fully static; no server runtime |
| Icons | `lucide-svelte` | Monochrome line icons matching the mono voice |
| Prose/code | `mdsvex` (`.svx`) + `shiki` with a custom highlighter | Prose-heavy sites only; small sites may substitute a deterministic tokenizer that consumes the same theme tokens |
| Fonts | `@fontsource-variable/jetbrains-mono` + `@fontsource/share-tech-mono` | Self-hosted; zero font network requests |
| Tests | Vitest + Testing Library (jsdom) where the project has behavior worth testing | Keep light; sites are mostly static |

## Scaffolding essentials

`svelte.config.js`:

```js
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  preprocess: vitePreprocess({ script: true }),
  kit: {
    adapter: adapter({ pages: 'dist', assets: 'dist', strict: true }),
  },
}
```

`vite.config.ts`: plugins `[sveltekit(), tailwindcss()]`.

`src/app.html`: `theme-color` matches the site's dark canvas — the shared
OKLCH sheet is pure black, so use `#000000` (openspecui's `#09090b` belongs
to its own oklch/zinc canvas, not to this system); inline a no-flash theme
bootstrap before `%sveltekit.head%` (read localStorage `theme`
`light|dark|system`, add the `.dark` class to `<html>` and set
`colorScheme` before first paint; also add `class="js"` — reveal styles key
off it so no-JS output stays visible).

## Theme handling

One theme module (localStorage key `theme`, values `light | dark | system`):

- `apply(theme)` toggles `.dark` on `<html>` + syncs `colorScheme`.
- `installThemeSync()` applies on mount and follows
  `prefers-color-scheme` changes while in `system` mode.
- A `theme-switcher` component cycles light → dark → system with icons.

## Deployment adaptation

| Project | Transport |
| ------- | --------- |
| openspecui | Cloudflare Pages (`wrangler pages deploy dist`) |
| unipty | GitHub Pages via Actions (build → `upload-pages-artifact` → `deploy-pages`) |

The site package stays private to its monorepo and never depends on
runtime packages of that monorepo (e.g. `@unipty/www` consumes a release
artifact, not `unipty`). Preserve each project's build seams: production
CNAME gating, byte-identical artifact copying, static checks — a restyle
must keep them green.

## i18n (optional per project)

The reference routes `[lang=locale]` with an i18n content schema. Adopt
only if the project actually ships multiple languages; single-language
sites keep flat routes and skip the schema.

## Flat-file / seam-preserving builds

When a project's deploy contract demands flat `dist/*.html` page names or
copies artifacts after the vite build (unipty does both):

- `kit.prerender = { crawl: false, entries: ['/','/docs',...] }` — the
  default crawler follows non-route links (e.g. a catalog copied after the
  build) and dies on 404s.
- `trailingSlash: 'never'` plus `<body data-sveltekit-reload>` makes
  `/docs.html` plain full navigations; hydration of the inline payload
  keys off `node_ids`/`data`, not URL matching, so flat URLs still hydrate.
- Publishing a fixed-path asset (e.g. `dist/assets/styles.css`) after
  moving the CSS bundle: rewrite relative `url(./font.woff2)` references
  to absolute `/_app/...` paths or fonts break.
- Orchestrating vite from a Node script with a synchronous error contract:
  vite's `exports` hide `./bin/vite.js` — resolve the bin via
  `vite/package.json` and use `spawnSync` so `BuildError` stays synchronous
  for existing check harnesses.

## Project registry

| Project | Package | Output | Deploy | Brand hue |
| ------- | ------- | ------ | ------ | --------- |
| openspecui | `packages/website` (`@openspecui/website`) | `dist/` | Cloudflare Pages | 0 |
| unipty | `packages/www` (`@unipty/www`) | `dist/` | GitHub Pages (deploy-www.yml) | 160 |

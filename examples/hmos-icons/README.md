# hmos-icons — a third-party channel, end to end

A REAL minimal consumer of `@jixoai/ui-vite-plugin`: plain Vite +
Svelte (no SvelteKit, no tailwind), one custom icon channel over a
LOCAL svg collection, and the registry's `icon` component. It exists
because the plugin's own suite tests the machinery with stubs and
installed npm peers — this project proves the whole path a stranger
would walk: install, define a channel, use icons, build, and get
correct OUTPUT.

## The channel

`src/lib/icons/hmos.ts` is the entire integration: one
`defineIconChannel({ id, prefix, resolveFile })` call whose resolver
maps a ref to an absolute path inside `icons/`. No npm peer, no
packaging — the same surface that fronts `@material-symbols` etc.

The `icons/` dir is an 11-file subset of the HarmonyOS system-icon
set (676 files, 2022-01 Sketch exports — local archive
`HarmonyOS_Icons.zip`; subset committed for reproducibility). The
artwork is deliberately the gritty kind: `defs` + `mask` + `use`
structure that svgo collapses to short ids, which is exactly the
document-collision case the packer's id scoping exists for — two
icons on this page would render wrong without it.

## Run it

```sh
npm install
npm run dev      # http://localhost:5173 — 12 icons, real artwork
npm run build    # dist/ + regenerates src/lib/icon-set.gen.ts
```

`src/lib/icon-set.gen.ts` is committed (the artifact is part of the
consumer contract — type-safe names, inline core chunk). The plugin
regenerates it on dev/build (`write: true`); drift fails loudly.

## What the E2E gate asserts

`packages/vite-plugin/test/icons/library/example-hmos.test.ts`
copies this project to a temp dir, `npm install`s it for real
(the `file:` dependency on the built plugin), then:

1. **client build** — `dist/` exists, the bundle carries the
   REAL artwork bytes (cross-checked against an independent svgo
   re-optimization of the source svgs, not the committed artifact);
2. **SSR build** — `vite build --ssr src/ssr-entry.ts`, executed:
   the rendered HTML paints every `<svg data-jx-icon>` with the real
   paths, `lucide:check` dedupes to the built-in payload, and every
   element id in the document is UNIQUE (the collision law);
3. **artifact freshness** — the regenerated artifact matches the
   committed one byte-for-byte.

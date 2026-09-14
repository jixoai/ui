# d3/arch-a — the consumer hand-wires @stylexjs/unplugin

D3 fixture, architecture A (channel-collapse §3 column A). Same shell + the 8 frozen
families in their StyleX forms (spike/corpus payload, copied verbatim) + the consumer
HAND-COPYING every stylex wiring line:

- `vite.config.ts` — the unplugin block (enforce:undefined spread, dev/runtimeInjection on
  serve, propertyValidationMode 'throw', unstable_moduleResolution), from the docs
- `src/App.svelte` — the official dev-HMR boilerplate (`virtual:stylex:runtime` effect +
  `/virtual:stylex.css` dev link)
- the css entry discipline (`src/theme.css` import in main.ts — a CSS entry is MANDATORY,
  spike-report §5.2) and the F9 layer statement (theme.css:17; hoist above
  @import 'tailwindcss' in a TW-coexisting consumer)

## Exact rerun

```bash
cd spike/d3/arch-a
npm ci
npx vite build
```

Pins: svelte 5.57.0, vite 8.3.0, @stylexjs/{stylex,unplugin,babel-plugin} 0.19.0,
@sveltejs/vite-plugin-svelte 7.3.0, typescript 5.9.3 (exact, no ^).

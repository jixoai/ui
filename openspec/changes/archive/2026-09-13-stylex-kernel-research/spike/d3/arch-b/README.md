# d3/arch-b — @jixoai/ui-vite-plugin absorbs the StyleX wiring

D3 fixture, architecture B (channel-collapse §3 column B). Same shell + the 8 frozen
families in their StyleX forms (spike/corpus payload, copied verbatim). The consumer adds
ONE package (`jixoai-ui-vite-plugin`, the research stub at
`../packages-stub/jixoai-ui-vite-plugin` via `file:`) and ONE vite.config line
(`jixoaiUI()`). The plugin generates the transform preset, the F9 layer statement, and
the dev-HMR wiring. The plugin's dependency closure (@stylexjs/unplugin +
@stylexjs/stylex 0.19.0) COUNTS in this fixture's install vector (F5 ruling).

## Exact rerun

```bash
cd spike/d3/arch-b
npm ci
npx vite build
```

Pins: svelte 5.57.0, vite 8.3.0, @sveltejs/vite-plugin-svelte 7.3.0, typescript 5.9.3,
jixoai-ui-vite-plugin 0.0.0-research-stub (file:, transitively @stylexjs/* 0.19.0).

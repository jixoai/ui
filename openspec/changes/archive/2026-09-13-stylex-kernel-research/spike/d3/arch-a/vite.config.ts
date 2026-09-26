// vite.config.ts — d3/arch-a: the consumer HAND-WIRES @stylexjs/unplugin
// (channel-collapse §3, column A). Every stylex-related line below is
// hand-copied by the consumer from the stylexjs docs + our kernel docs
// (the official example-sveltekit pattern, spike-report §3):
//   - the `enforce: undefined` spread (or unplugin's hardcoded 'pre'
//     would babel-parse RAW .svelte source),
//   - `dev`/`runtimeInjection` keyed on `command === 'serve'` (the
//     unplugin defaults dev from NODE_ENV, which vite never sets),
//   - `propertyValidationMode: 'throw'` (0.19 default 'silent' DROPS
//     shorthands with zero diagnostics — spike-report §5.3),
//   - `unstable_moduleResolution` commonJS+rootDir (import resolution).
// Plus (App.svelte) the hand-copied dev-HMR boilerplate, and the F9
// layer-statement discipline in the css entry (theme.css:17 here; in a
// TW-coexisting consumer the statement must be hoisted ABOVE
// @import 'tailwindcss' — the F9 footgun, see research/d3-consumer.md).
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import stylex from '@stylexjs/unplugin';

export default defineConfig(({ command }) => ({
  plugins: [
    svelte(),
    {
      ...stylex.vite({
        debug: true,
        propertyValidationMode: 'throw',
        dev: command === 'serve',
        runtimeInjection: command === 'serve',
        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir: process.cwd(),
        },
      }),
      enforce: undefined,
    },
  ],
}));

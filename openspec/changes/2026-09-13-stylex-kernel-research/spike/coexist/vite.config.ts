// vite.config.ts — spike/coexist: TW4 + StyleX coexistence, three
// builds selected by STYLEX_LAYER:
//   STYLEX_LAYER=after   → O1 (lawful:    useCSSLayers {prefix:'stylex', after:['utilities']})
//   STYLEX_LAYER=before  → O2 (misconfig: useCSSLayers {prefix:'stylex', before:['utilities']})
//   STYLEX_LAYER=off     → CONTROL (TW-only, zero stylex — the control
//                          build for every CONTROL-BUILD-EQUALITY row)
//
// Same plugin-order trick as spike/minimal (enforce: undefined AFTER
// the svelte compile). debug:true + propertyValidationMode:'throw'
// pinned identically (D1-06 contract + the silent-drop guard).
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import stylex from '@stylexjs/unplugin';

const layer = process.env.STYLEX_LAYER || 'after';

const stylexPlugin =
  layer === 'off'
    ? []
    : [
        {
          ...stylex.vite({
            debug: true,
            propertyValidationMode: 'throw',
            dev: false, // all three D2 builds are production builds
            useCSSLayers:
              layer === 'after'
                ? { prefix: 'stylex', after: ['utilities'] }
                : { prefix: 'stylex', before: ['utilities'] },
            unstable_moduleResolution: {
              type: 'commonJS',
              rootDir: process.cwd(),
            },
          }),
          enforce: undefined,
        },
      ];

export default defineConfig({
  plugins: [tailwindcss(), svelte(), ...stylexPlugin],
  build: {
    rollupOptions: {
      input:
        layer === 'off'
          ? { control: new URL('./control.html', import.meta.url).pathname }
          : { index: new URL('./index.html', import.meta.url).pathname },
    },
  },
});

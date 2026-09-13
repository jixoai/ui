// vite.config.ts — spike/minimal: Svelte 5 + Vite 8 + StyleX (unplugin),
// NO React, NO Tailwind.
//
// The `enforce: undefined` spread is the official plugin-order trick
// (stylexjs.com docs, SvelteKit page; examples/example-sveltekit
// vite.config.ts): @stylexjs/unplugin hardcodes `enforce: 'pre'`, which
// would run its babel transform on RAW .svelte source (parse error);
// overriding to `undefined` puts it in the normal plugin phase, after
// the svelte compile — so it transforms the compiled JS.
//
// `dev: command === 'serve'` is explicit (the unplugin defaults `dev`
// from NODE_ENV, which vite does not set in its process env).
//
// `debug: true` is pinned in BOTH modes — D1-06 contract (the
// data-style-src attribute under assertion is debug-gated).
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import stylex from '@stylexjs/unplugin';

export default defineConfig(({ command }) => ({
  plugins: [
    svelte(),
    {
      ...stylex.vite({
        debug: true,
        // Silent-drop guard: babel-plugin 0.19.0's DEFAULT
        // propertyValidationMode 'silent' DROPS unsupported shorthands
        // (background/border/font/animation...) with zero diagnostics —
        // verified 2026-09-13 on the pinned set. 'throw' makes them
        // compile errors ("background is not supported. Use
        // background-color, border-image etc. instead.").
        propertyValidationMode: 'throw',
        dev: command === 'serve',
        // Dev-side runtime injection: the babel-plugin emits
        // stylex-inject calls whose runtime inserts the
        // <style data-stylex> element — the mechanism the D1-01/D1-03
        // probes instrument (manifest premise). NOTE: unplugin 0.19.0's
        // DEFAULT dev path fetches /virtual:stylex.css into a plain
        // <style id="__stylex_virtual__"> tag instead — recorded in
        // the spike report as a 0.19 toolchain behavior change.
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

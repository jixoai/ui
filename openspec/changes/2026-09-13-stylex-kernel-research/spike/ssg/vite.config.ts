// vite.config.ts — spike/ssg: SvelteKit 2.70.3 + adapter-static +
// StyleX. Follows the OFFICIAL example-sveltekit wiring (2026-04
// PR #1454): stylex.vite spread with `enforce: undefined` (the
// plugin-order trick — AFTER the sveltekit compile), plus explicit
// dev flagging (the unplugin defaults `dev` from NODE_ENV, which
// vite does not set) and the D1-06 contract pins (debug:true both
// modes; propertyValidationMode 'throw' guards the silent-drop
// shorthand footgun found in spike/minimal).
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import stylex from '@stylexjs/unplugin';

export default defineConfig(({ command }) => ({
  plugins: [
    sveltekit(),
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

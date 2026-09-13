// index.js — jixoai-ui-vite-plugin (D3 research stub, architecture B).
//
// What the plugin ABSORBS (the consumer writes NONE of this — the F9
// footgun class becomes un-writable at the consumer, channel-collapse
// §3 column B):
//
//  1. THE TRANSFORM PRESET — every option the spike report (L3a §3)
//     proved load-bearing, hand-wiring of which is arch-a's cost:
//       - `enforce: undefined` spread (unplugin hardcodes 'pre', which
//         would babel-parse RAW .svelte source),
//       - `dev`/`runtimeInjection` keyed on the serve/build mode
//         (derived from NODE_ENV at plugin-creation time — measured on
//         the D1 pin set: vite 8.3.0's CLI sets NODE_ENV=production
//         for `vite build` and =development for `vite dev` BEFORE the
//         config evaluates; override via jixoaiUI({ dev: true|false })),
//       - `propertyValidationMode: 'throw'` (0.19 default 'silent'
//         DROPS shorthands with zero diagnostics),
//       - `unstable_moduleResolution` commonJS + rootDir.
//
//  2. THE F9 LAYER STATEMENT — injected as the FIRST head element of
//     index.html (both dev and build; `head-prepend` beats every
//     stylesheet link, and CSS layer order follows FIRST MENTION):
//         @layer properties, theme, base, components,
//                   stylex.priority1..3, utilities;
//     This is the dist-o1h-proven lawful order (spike-report §5.1 /
//     amendment F9): consumer utilities stay LAST = utilities WIN. A
//     consumer adding Tailwind for their own markup can never invert
//     the override law by writing css in the wrong order.
//
//  3. THE DEV-HMR WIRING — covered by the unplugin's OWN devMode:'full'
//     path (its vite adapter injects the virtual:stylex:runtime module
//     script + /virtual:stylex.css link into index.html in serve mode);
//     this stub pins devMode 'full' so the wiring is generated, never
//     hand-copied.
//
//  NOT absorbed here (out of D3 scope, noted for the blueprint): the
//  CSS-entry law (a css import must exist — theme.css in the payload
//  satisfies it) and the Svelte class-merge helper (a lib item).
import stylex from '@stylexjs/unplugin';

const F9_LAYER_STATEMENT =
  '@layer properties, theme, base, components, ' +
  'stylex.priority1, stylex.priority2, stylex.priority3, utilities;';

export default function jixoaiUI(opts = {}) {
  const serve = opts.dev ?? process.env.NODE_ENV === 'development';
  const stylexPlugin = {
    ...stylex.vite({
      debug: true,
      propertyValidationMode: 'throw',
      dev: serve,
      runtimeInjection: serve,
      devMode: 'full',
      unstable_moduleResolution: {
        type: 'commonJS',
        rootDir: process.cwd(),
      },
    }),
    enforce: undefined,
  };
  const f9EntryPlugin = {
    name: 'jixoai-ui:f9-entry',
    transformIndexHtml: {
      order: 'pre',
      handler() {
        return [
          { tag: 'style', children: F9_LAYER_STATEMENT, injectTo: 'head-prepend' },
        ];
      },
    },
  };
  return [f9EntryPlugin, stylexPlugin];
}

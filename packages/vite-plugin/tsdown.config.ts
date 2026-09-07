// tsdown build for @jixoai/ui-vite-plugin.
//
// Intents:
//   1. dist/index.js + dist/icons.js + dist/probe.js as clean ESM
//      outputs (node platform; vite stays external as a peer dependency —
//      the package's only runtime dependency is svgo, kept EXTERNAL and
//      loaded solely through the icons sub-entry's dynamic import so the
//      umbrella entry's graph stays provider-free; opentype.js /
//      wawoff2 stay external as OPTIONAL dependencies, loaded only via
//      dynamic import inside the icons feature — merge-alignment A1,
//      icon-component-pipeline §9).
//   2. the channel sub-entries (icon-channel-api A4, 2026-09-07):
//      dist/icons/channel.js (defineIconChannel + types + the peer
//      seam), dist/icons/lucide.js (the default-registered channel
//      INSTANCE — pure data), dist/icons/md.js · dist/icons/ph.js ·
//      dist/icons/rx.js (the shipped factories). Each is a per-entry
//      build whose static graph the packaging purity gate walks:
//      channel/md/ph/rx reach NO lucide/svgo/opentype code; lucide
//      reaches NO svgo/opentype code.
//   3. dist/index.d.ts + dist/icons.d.ts (+ the sub-entry .d.ts twins)
//      via dts generation (types point at generated dist declarations,
//      never at src — the ui-plugin lesson); dist/client.d.ts is copied
//      verbatim from src (ambient declaration, nothing to generate).
//   4. probe.js carries a node shebang so it can ship as the
//      `jixoai-ghostty-probe` bin (banner is string-only in rolldown, so
//      the shebang is injected per-chunk by a tiny renderChunk plugin).
import { defineConfig } from 'tsdown';

const shebangProbeBin = {
  name: 'shebang-probe-bin',
  renderChunk(code: string, info: { fileName: string }) {
    if (info.fileName === 'probe.js') {
      return { code: `#!/usr/bin/env node\n${code}`, map: null };
    }
    return null;
  },
};

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      icons: 'src/icons/index.ts',
      'icons/channel': 'src/icons/library/channel/index.ts',
      'icons/lucide': 'src/icons/library/channel/lucide.ts',
      'icons/md': 'src/icons/library/channel/material.ts',
      'icons/ph': 'src/icons/library/channel/phosphor.ts',
      'icons/rx': 'src/icons/library/channel/remix.ts',
      probe: 'src/probe.ts',
    },
    outDir: 'dist',
    format: 'esm',
    platform: 'node',
    target: 'node20',
    dts: true,
    external: ['opentype.js', 'wawoff2', 'svgo'],
    copy: [{ from: 'src/client.d.ts', to: 'dist' }],
    outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
    plugins: [shebangProbeBin],
    unbundle: true,
    exports: false, // package.json exports/bin are hand-frozen (D3); never rewrite them
  },
]);

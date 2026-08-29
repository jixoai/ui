// tsdown build for @jixoai/vite-plugin.
//
// Intents:
//   1. dist/index.js + dist/icons.js + dist/probe.js as clean ESM
//      outputs (node platform; vite stays external as a peer dependency —
//      the package has zero runtime dependencies by law; opentype.js /
//      wawoff2 stay external as OPTIONAL dependencies, loaded only via
//      dynamic import inside the icons feature — merge-alignment A1).
//   2. dist/index.d.ts + dist/icons.d.ts via dts generation (types point
//      at generated dist declarations, never at src — the ui-plugin
//      lesson); dist/client.d.ts is copied verbatim from src (ambient
//      declaration, nothing to generate).
//   3. probe.js carries a node shebang so it can ship as the
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
    entry: { index: 'src/index.ts', icons: 'src/icons/index.ts', probe: 'src/probe.ts' },
    outDir: 'dist',
    format: 'esm',
    platform: 'node',
    target: 'node20',
    dts: true,
    external: ['opentype.js', 'wawoff2'],
    copy: [{ from: 'src/client.d.ts', to: 'dist' }],
    outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
    plugins: [shebangProbeBin],
    unbundle: true,
    exports: false, // package.json exports/bin are hand-frozen (D3); never rewrite them
  },
]);

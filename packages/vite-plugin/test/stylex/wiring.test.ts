/**
 * wiring.test.ts — the stylex feature's build contracts (stylex-kernel
 * phase 0 P0.2; the plugin.test.ts fixture pattern):
 *
 *   1. THE F9 LAYER LAW: an emitted css asset that carries stylex
 *      output STARTS with the canonical FULL statement at byte zero —
 *      ahead of any other css (the O1-H remedy position; the
 *      statement text itself is pinned to the F9 ruling verbatim).
 *   2. the engine output really rides the asset (defineVars vars +
 *      @layer stylex.priorityN blocks) — the positive end-to-end path
 *      through vite build + the bridge.
 *   3. THE CSS-ENTRY TRAP (spike-report §5.2): a build with stylex
 *      output but NO css asset writes the fallback assets/stylex.css
 *      (statement-first) instead of losing the css silently.
 *   4. THE KERNEL-SCOPE GATE, unit-driven at the engine surface: an
 *      out-of-scope id NEVER reaches the babel transform (null before
 *      the engine), an in-scope id does — the law "kernel trees ONLY".
 */

import { mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it } from 'vitest';
import { build } from 'vite';

import { jixoai, STYLEX_LAYER_STATEMENT } from '../../src/index.ts';
import { createStylexEngine } from '../../src/stylex/vite-plugin.ts';

const packageRoot = join(fileURLToPath(new URL('../..', import.meta.url)));

// the F9 ruling, verbatim — the test pins the EXPORT against the
// ruling text so the const can never drift silently
const F9_CANONICAL =
  '@layer properties, theme, base, components, stylex.priority1, stylex.priority2, stylex.priority3, utilities;';

let outRoot: string;
let fixtureRoot: string;

beforeEach(async () => {
  outRoot = await mkdtemp(join(tmpdir(), 'jixoai-stylex-'));
  fixtureRoot = join(outRoot, 'fixture');
});

async function writeKernelFixture(withCssEntry: boolean): Promise<void> {
  await mkdir(join(fixtureRoot, 'src', 'kernel'), { recursive: true });
  await mkdir(join(fixtureRoot, 'src', 'docs'), { recursive: true });
  // treeshakeCompensation keeps the (unused, side-effect-free) stylex
  // import in the transformed module — the fixture needs the package
  // resolvable exactly like a real app install would have it
  await symlink(join(packageRoot, 'node_modules'), join(fixtureRoot, 'node_modules'));
  await writeFile(
    join(fixtureRoot, 'src', 'kernel', 'tokens.stylex.ts'),
    [
      "import * as stylex from '@stylexjs/stylex';",
      '',
      "export const tokens = stylex.defineVars({",
      "  '--jx-probe': '#123456',",
      '});',
      '',
    ].join('\n'),
  );
  await writeFile(
    join(fixtureRoot, 'src', 'kernel', 'paint.ts'),
    [
      "import * as stylex from '@stylexjs/stylex';",
      "import { tokens } from './tokens.stylex';",
      '',
      'export const paint = stylex.create({',
      '  probe: {',
      "    color: tokens['--jx-probe'],",
      "    paddingInline: '16px',",
      '  },',
      '});',
      '',
      'export const probeClass = stylex.props(paint.probe).className;',
      '',
    ].join('\n'),
  );
  await writeFile(
    join(fixtureRoot, 'src', 'kernel', 'entry.ts'),
    [
      "import { probeClass } from './paint.ts';",
      ...(withCssEntry ? ["import './entry.css';"] : []),
      `console.log(probeClass); // keep the stylex module alive through tree-shaking`,
      '',
    ].join('\n'),
  );
  if (withCssEntry) {
    await writeFile(join(fixtureRoot, 'src', 'kernel', 'entry.css'), 'body { margin: 0; }\n');
  }
}

async function findCssFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await findCssFiles(p)));
    else if (p.endsWith('.css')) out.push(p);
  }
  return out;
}

describe('the stylex feature (build side, F11)', () => {
  it('STYLEX_LAYER_STATEMENT pins the F9 canonical statement verbatim', () => {
    expect(STYLEX_LAYER_STATEMENT).toBe(F9_CANONICAL);
  });

  it('F9 layer law: the emitted css starts with the FULL statement at byte zero, engine output riding it', async () => {
    await writeKernelFixture(true);
    const outDir = join(outRoot, 'dist-with-entry');
    await build({
      root: fixtureRoot,
      logLevel: 'silent',
      plugins: jixoai({ ghostty: false, stylex: { include: ['src/kernel'] } }),
      build: {
        outDir,
        emptyOutDir: true,
        rollupOptions: { input: join(fixtureRoot, 'src', 'kernel', 'entry.ts') },
      },
    });

    const cssFiles = await findCssFiles(outDir);
    expect(cssFiles.length, 'exactly one css asset (the entry css, stylex appended)').toBe(1);
    const css = await readFile(cssFiles[0]!, 'utf8');
    // byte zero — the statement precedes EVERYTHING (Tailwind included)
    expect(css.startsWith(`${STYLEX_LAYER_STATEMENT}\n`)).toBe(true);
    // the pre-existing entry css survived the bake (minifier-safe match)
    expect(css).toMatch(/margin:\s*0/);
    // the engine output really rode the asset: defineVars vars +
    // layered atom rules (useCSSLayers prefix config)
    expect(css).toContain('--jx-probe:');
    expect(css).toContain('@layer stylex.priority1');
    expect(css).toContain('@layer stylex.priority2');
  });

  it('css-entry trap (§5.2): no css asset → fallback assets/stylex.css, statement-first, nothing silently lost', async () => {
    await writeKernelFixture(false);
    const outDir = join(outRoot, 'dist-no-entry');
    await build({
      root: fixtureRoot,
      logLevel: 'silent',
      plugins: jixoai({ ghostty: false, stylex: { include: ['src/kernel'] } }),
      build: {
        outDir,
        emptyOutDir: true,
        rollupOptions: { input: join(fixtureRoot, 'src', 'kernel', 'entry.ts') },
      },
    });

    const cssFiles = await findCssFiles(outDir);
    expect(cssFiles.map((f) => f.slice(outDir.length))).toEqual(['/assets/stylex.css']);
    const css = await readFile(cssFiles[0]!, 'utf8');
    expect(css.startsWith(`${STYLEX_LAYER_STATEMENT}\n`)).toBe(true);
    expect(css).toContain('@layer stylex.priority1');
  });

  it('kernel-scope gate: out-of-scope ids never reach the transform; in-scope ids do', async () => {
    const engine = createStylexEngine(
      { include: [join(fixtureRoot, 'src', 'kernel')] },
      { root: fixtureRoot, command: 'build' },
    );
    const codeWithStylexImport = "import * as stylex from '@stylexjs/stylex';\nexport const x = stylex.create({ a: { color: 'red' } });\n";

    // docs-route shape: outside the kernel trees → null BEFORE the engine
    expect(await engine.transform(codeWithStylexImport, join(fixtureRoot, 'src', 'docs', 'page.ts'))).toBeNull();
    // node_modules shape → null
    expect(
      await engine.transform(codeWithStylexImport, join(fixtureRoot, 'node_modules', 'dep', 'mod.js')),
    ).toBeNull();
    // query-suffixed kernel ids still scope-match ('?svelte' HMR shape)
    expect(await engine.transform(codeWithStylexImport, join(fixtureRoot, 'src', 'kernel', 'comp.svelte?v=1'))).not.toBeNull();
    // in-scope plain module → transformed: stylex.create compiled to
    // the class-constant table (treeshakeCompensation legitimately
    // KEEPS the unused side-effect-free import — that is not a leak,
    // the bundler drops it; the compiled table is the proof)
    const transformed = (await engine.transform(codeWithStylexImport, join(fixtureRoot, 'src', 'kernel', 'paint.ts'))) as {
      code: string;
    };
    expect(transformed.code).not.toContain('stylex.create');
    expect(transformed.code).toMatch(/\$\$css:/);
  });

  it('empty include is the named startup error (the scope is the law)', () => {
    expect(() => jixoai({ ghostty: false, stylex: { include: [] } })).toThrowError(/non-empty include/);
  });
});

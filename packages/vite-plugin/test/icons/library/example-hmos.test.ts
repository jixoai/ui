/**
 * example-hmos.test.ts — the END-TO-END consumer gate (the missing
 * tier the stub-svgs and installed-peer tests never covered): a REAL
 * third-party icon set (the HarmonyOS Sketch exports — defs+mask+use
 * artwork with cross-file-identical short ids) behind a REAL custom
 * channel, consumed by the REAL example project at
 * examples/hmos-icons, installed and built FOR REAL (npm install +
 * vite build, twice: client and SSR) — with every assertion made
 * against the FINAL OUTPUT, never against intermediate state:
 *
 *   1. the client bundle carries the REAL artwork bytes (cross-checked
 *      against an independent svgo re-optimization of the SOURCE
 *      svgs, not the committed artifact) — inline core AND the lazy
 *      chunk asset (the default 20KiB budget splits the 11 hmos
 *      icons, exercising both lanes);
 *   2. the executed SSR bundle's rendered HTML paints the inline-core
 *      names synchronously (real paths, data-jx-icon markers) and
 *      reserved boxes for the lazy names (the zero-flicker law), and
 *      its document ids are UNIQUE with every <use> reference
 *      resolving exactly once — the document-collision law that
 *      scopeIconIds exists for (this test fails without it: every
 *      icon's svgo-minified id is literally "a");
 *   3. the artifact the build regenerated matches the COMMITTED
 *      example artifact byte-for-byte (drift fails loudly).
 *
 * Network + the plugin's built dist are prerequisites (CI order:
 * build, then suite — the same contract verify:shadcn-add rides).
 */

import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { optimizeSvg } from '../../../src/icons/library/optimize.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const exampleDir = join(repoRoot, 'examples/hmos-icons');
const pluginDir = join(repoRoot, 'packages/vite-plugin');

/** run one command in a dir, failing with its captured output */
function run(cwd: string, command: string, args: readonly string[]): void {
  try {
    execFileSync(command, args, { cwd, encoding: 'utf8', stdio: 'pipe' });
  } catch (cause) {
    const out = (cause as { stdout?: string; stderr?: string });
    throw new Error(
      `${command} ${args.join(' ')} failed in ${cwd}\n` +
        `${out.stdout ?? ''}\n${out.stderr ?? ''}`,
      { cause },
    );
  }
}

let project: string; // the tmp copy of the example
let html: string; // the SSR-rendered output

/** every JS asset the client build emitted, by name prefix */
const asset = async (prefix: string): Promise<string> => {
  const files = (await readdir(join(project, 'dist/assets'))).filter(
    (name) => name.startsWith(prefix) && name.endsWith('.js'),
  );
  expect(files).toHaveLength(1);
  return readFile(join(project, 'dist/assets', files[0]!), 'utf8');
};

/** the svgo'd head of an icon's first path — an INDEPENDENT
 *  expectation computed from the SOURCE svg, never the artifact */
async function realPathHead(svgFile: string, length = 48): Promise<string> {
  const raw = await readFile(join(exampleDir, 'icons', svgFile), 'utf8');
  const optimized = await optimizeSvg(raw);
  return (optimized.match(/ d="([^"]+)"/)?.[1] ?? '').slice(0, length);
}

beforeAll(async () => {
  // the file: dependency installs the plugin's BUILT package — a
  // missing dist is an ordering bug, not a skip
  const distOk = await stat(join(pluginDir, 'dist/icons.js')).then(
    () => true,
    () => false,
  );
  if (!distOk) {
    throw new Error(
      'packages/vite-plugin/dist is missing — run npm run build there before the suite ' +
        '(the example installs the plugin as a real file: dependency)',
    );
  }

  const root = await mkdtemp(join(tmpdir(), 'jixoai-hmos-e2e-'));
  project = join(root, 'hmos-icons');
  await mkdir(project, { recursive: true });
  await cp(exampleDir, project, {
    recursive: true,
    filter: (path) => !/(node_modules|dist|dist-ssr|package-lock\.json)$/.test(path),
  });
  // the tmp copy lives outside the repo — point the file: dependency
  // at the plugin's ABSOLUTE path (a copy a stranger makes keeps the
  // committed relative form)
  const manifestPath = join(project, 'package.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as {
    dependencies: Record<string, string>;
  };
  manifest.dependencies['@jixoai/ui-vite-plugin'] = `file:${pluginDir}`;
  await import('node:fs/promises').then((fs) => fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2)));

  run(project, 'npm', ['install', '--no-audit', '--no-fund']);
  run(project, 'npm', ['run', 'build']);
  run(project, 'npm', ['run', 'build:ssr']);
  // dist-ssr is a SEPARATE outDir: vite's default emptyOutDir would
  // otherwise wipe the client dist on the second build
  ({ html } = await import(join(project, 'dist-ssr/ssr-entry.js')));
}, 420_000);

afterAll(async () => {
  if (project !== undefined) await rm(dirname(project), { recursive: true, force: true });
});

describe('the client build output (dist/assets)', () => {
  test('the inline-core bundle carries the REAL artwork bytes + scoped ids', async () => {
    const bundle = await asset('index-');
    // the bytes come from the zip's real svgs — re-optimized here
    // independently of the committed artifact
    expect(bundle).toContain(await realPathHead('ic_public_pause.svg'));
    expect(bundle).toContain(await realPathHead('ic_public_appstore.svg'));
    expect(bundle).toContain('id="jx-hmos:ic_public_pause-a"');
    // the config-lane name scopes under its CANONICAL name
    expect(bundle).toContain('id="jx-editGroup-a"');
    // the shared short id never rides an id= attribute
    expect(bundle).not.toMatch(/\sid="a"/);
  });

  test('the lazy chunk asset carries the overflow names (the budget split)', async () => {
    const chunk = await asset('1-');
    expect(chunk).toContain(await realPathHead('ic_public_themes.svg'));
    expect(chunk).toContain(await realPathHead('ic_public_voice.svg'));
    expect(chunk).toContain(await realPathHead('ic_public_switch_camera.svg'));
  });

  test('index.html wires the built bundle', async () => {
    const page = await readFile(join(project, 'dist/index.html'), 'utf8');
    const script = page.match(/src="(\/?\.?assets\/index-[^"]+\.js)"/)?.[1];
    expect(script).toBeDefined();
  });
});

describe('the executed SSR output (the rendered document)', () => {
  test('every icon mounts (12 markers); the inline core paints synchronously', async () => {
    expect((html.match(/data-jx-icon/g) ?? []).length).toBe(12);
    const svgs = (html.match(/<svg\b/g) ?? []).length;
    // 9 inline-resolved of the 12 rendered names; the 3 lazy-chunk
    // names render the SAME fixed reserved box pre-hydration
    expect((html.match(/<svg\b/g) ?? []).length).toBe(9);
    expect(html).toContain('M7.5,3.5 C8.32842712'); // pause, verbatim
    // lucide:check deduped to the built-in payload (EQUIVALENCES)
    expect(html).toContain('M20 6 9 17l-5-5');
  });

  test('the document-collision law: ids unique, every use reference resolves once', () => {
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]!);
    // svgo minifies EVERY icon's id to "a" — without scopeIconIds all
    // six defs collide and the <use>s cross-resolve (this is the
    // regression the HarmonyOS set exists to catch)
    expect(ids.length).toBeGreaterThanOrEqual(6);
    expect(new Set(ids).size).toBe(ids.length);
    const refs = [...html.matchAll(/(?:xlink:)?href="#([^"]+)"/g)].map((m) => m[1]!);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) {
      expect(ids.filter((id) => id === ref)).toHaveLength(1);
      expect(ref.startsWith('jx-')).toBe(true);
    }
  });

  test('the regenerated artifact matches the committed one byte-for-byte', async () => {
    const regenerated = await readFile(join(project, 'src/lib/icon-set.gen.ts'), 'utf8');
    const committed = await readFile(join(exampleDir, 'src/lib/icon-set.gen.ts'), 'utf8');
    expect(regenerated).toBe(committed);
  });
});

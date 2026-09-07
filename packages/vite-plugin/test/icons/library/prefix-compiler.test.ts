/**
 * prefix-compiler.test.ts — the scanned stream through resolve + the
 * pure generator + the EXECUTED artifact (B1/B2/B3, openspec
 * icon-prefix-compiler design §2/§3/§4 / spec delta; codex r1
 * B1/B2/B3/M4/M5/purity).
 *
 *   - resolveLibraryInputs' OPTIONAL 4th parameter: the 3-arg
 *     backward-compat lock (scripts/verify-shadcn-add.mjs's call shape
 *     keeps compiling AND behaving identically — aliases {}, same icons)
 *   - scanned refs resolve through the REAL material peer and pack
 *     under the canonical `md:copy_all` key with NO icons declaration
 *   - the fail-safe law: scanned refs under non-enabled prefixes are
 *     ignored (M5/M6); a ref under an ENABLED prefix that fails channel
 *     resolution fails the build naming the ref (the spec scenario)
 *   - the collision matrix (all named errors): alias grammar; alias ↔
 *     declared name; two refs → one alias (both refs + the alias
 *     named); the canonical↔alias case is unreachable by grammar
 *   - the generator's alias-indirection output: ALIASES table,
 *     payload ONCE (chunk budget unchanged), perIconBytes = payload +
 *     the alias row, iconCount counts canonicals only, ICON_NAMES
 *     adjacency, quoted-key serialization (codex r1 B2) with an eval
 *     round-trip, template union members for ENABLED channels only
 *   - the EXECUTED artifact: all three spellings — the canonical, the
 *     alias, and the FULL `md:copy_all as copy2` literal — resolve the
 *     SAME payload (codex r1 B1); getIcon null + loadIcon's BOTH-CAUSE
 *     error for un-packed names (the dynamic-name lane)
 */

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterAll, describe, expect, test } from 'vitest';
import { createSafetyChecker } from '../../../src/icons/safety.js';
import { generateIconLibraryArtifacts } from '../../../src/icons/library/generate.js';
import { resolveLibraryInputs } from '../../../src/icons/library/resolve.js';
import { md } from '../../../src/icons/library/channel/material.js';
import type {
  IconLibraryOptions,
  ResolvedLibraryIcon,
} from '../../../src/icons/library/types.js';
import type { ScannedRef } from '../../../src/icons/library/scan.js';
import type { ProviderContext } from '../../../src/icons/types.js';

// the fs-backed I/O twin (the channels.test.ts precedent — real peer
// files through the context, watchFile recorded)
const fsIo = (): ProviderContext => ({
  async loadSource(path) {
    const data = new Uint8Array(await (await import('node:fs/promises')).readFile(path));
    return { data, path, mimeType: 'image/svg+xml' };
  },
  watchFile() {
    /* nothing to watch in unit tests */
  },
});

const checker = () => createSafetyChecker({ mode: 'warn' });

const STUB_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 2l4 4"/></svg>';

/** the canonical fixture set: two canonical md refs, one with an alias */
const FIXTURE_REFS: readonly ScannedRef[] = [
  { channel: 'md', name: 'copy_all', alias: 'copy2' },
  { channel: 'md', name: 'copy_all' }, // duplicate canonical — dedupes silently
  { channel: 'md', name: 'home' },
];

const FIXTURE_OPTIONS: IconLibraryOptions = { includeDefaults: false, channels: [md()] };

const resolveFixture = async (
  scanned: readonly ScannedRef[] = FIXTURE_REFS,
  options: IconLibraryOptions = FIXTURE_OPTIONS,
) => resolveLibraryInputs(options, fsIo(), checker(), scanned);

// ── the backward-compat lock (B1's CONTRACT) ───────────────────────

describe('resolveLibraryInputs — the optional 4th parameter', () => {
  test('3-arg calls keep compiling AND behaving identically (the verify-shadcn-add shape)', async () => {
    const options: IconLibraryOptions = { includeDefaults: false, icons: { logo: STUB_SVG } };
    const legacy = await resolveLibraryInputs(options, fsIo(), checker());
    expect(legacy.icons.map((icon) => icon.name)).toEqual(['logo']);
    expect(legacy.aliases).toEqual({}); // no scanned stream → no aliases
    expect(legacy.warnings).toEqual([]);
    // an explicit empty 4th argument is the same call
    const explicit = await resolveLibraryInputs(options, fsIo(), checker(), []);
    expect(explicit.icons).toEqual(legacy.icons);
    expect(explicit.aliases).toEqual({});
  });

  test('generateIconLibraryArtifacts with pre-change options stays byte-identical', async () => {
    const legacy = await resolveLibraryInputs(
      { includeDefaults: false, icons: { logo: STUB_SVG } },
      fsIo(),
      checker(),
    );
    const bare = generateIconLibraryArtifacts(legacy.icons, {});
    const withOptions = generateIconLibraryArtifacts(legacy.icons, {
      maxChunkBytes: 20480,
      chunking: 'auto',
      inlineFirstChunk: true,
    });
    expect(bare.artifact).toBe(withOptions.artifact); // the knobs' defaults
    expect(bare.artifact).not.toContain('ALIASES');
    expect(bare.artifact).not.toContain('${string}');
  });
});

// ── the scanned stream through the REAL resolver ───────────────────

describe('scanned refs resolve + merge (B1)', () => {
  test('the canonical fixture: one alias, two canonicals, real peer artwork', async () => {
    const { icons, warnings, aliases } = await resolveFixture();
    expect(warnings).toEqual([]);
    // canonical keys pack as icons (aliases are NOT assets)
    expect(icons.map((icon) => icon.name)).toEqual(['md:copy_all', 'md:home']);
    expect(icons.every((icon) => icon.svg.includes('<svg'))).toBe(true);
    expect(aliases).toEqual({ copy2: 'md:copy_all' });
  });

  test('scanned refs pack AFTER declared refs, sorted (channel, name) — the packing law', async () => {
    const { icons } = await resolveLibraryInputs(
      { includeDefaults: false, channels: [md()], icons: { zLogo: STUB_SVG } },
      fsIo(),
      checker(),
      [{ channel: 'md', name: 'home' }, { channel: 'md', name: 'copy_all' }],
    );
    expect(icons.map((icon) => icon.name)).toEqual(['zLogo', 'md:copy_all', 'md:home']);
  });

  test('multiple aliases for one canonical ride in scan order (codex r1 M4)', async () => {
    const { aliases, icons } = await resolveFixture([
      { channel: 'md', name: 'home', alias: 'house' },
      { channel: 'md', name: 'home', alias: 'homeBtn' },
    ]);
    expect(icons.map((icon) => icon.name)).toEqual(['md:home']);
    expect(aliases).toEqual({ house: 'md:home', homeBtn: 'md:home' });
  });

  test('non-enabled prefixes are IGNORED fail-safe (M5/M6) — never a build break', async () => {
    const { icons, aliases } = await resolveFixture([{ channel: 'fa', name: 'home' }]);
    expect(icons).toEqual([]);
    expect(aliases).toEqual({});
  });

  test('a scanned ref that fails channel resolution is a NAMED build error (the spec scenario)', async () => {
    // validation DELEGATED to the channel (codex r1 B4): resolveFile
    // fails by name — the channel package + the concrete ref spelling
    await expect(resolveFixture([{ channel: 'md', name: 'definitely_not_a_symbol' }])).rejects.toThrowError(
      /@material-symbols\/svg-400.*has no icon file "outlined\/definitely_not_a_symbol\.svg"/s,
    );
  });
});

// ── the collision matrix (design §2 — all named, all fail the build) ──

describe('the collision matrix', () => {
  test('alias grammar: the camelCase law (scanned keys are exempt, aliases are not)', async () => {
    await expect(resolveFixture([{ channel: 'md', name: 'home', alias: 'Copy2' }])).rejects.toThrowError(
      /"md:home" declares the alias "Copy2".*camelCase icon-name law.*aliases are not/s,
    );
    await expect(resolveFixture([{ channel: 'md', name: 'home', alias: 'copy-2' }])).rejects.toThrowError(
      /alias "copy-2".*camelCase/s,
    );
  });

  test('alias ↔ declared name: shadowing a config icon fails by name', async () => {
    await expect(
      resolveFixture(
        [{ channel: 'md', name: 'home', alias: 'logo' }],
        { includeDefaults: false, channels: [md()], icons: { logo: STUB_SVG } },
      ),
    ).rejects.toThrowError(
      /"md:home" declares the alias "logo" but a declared library icon already owns that name/s,
    );
  });

  test('alias ↔ built-in manifest name (includeDefaults) fails the same way', async () => {
    await expect(
      resolveLibraryInputs(
        { channels: [md()] },
        fsIo(),
        checker(),
        [{ channel: 'md', name: 'home', alias: 'check' }],
      ),
    ).rejects.toThrowError(/alias "check" but a declared library icon already owns that name/s);
  });

  test('two refs → one alias: both refs + the contested alias named', async () => {
    await expect(
      resolveFixture([
        { channel: 'md', name: 'home', alias: 'dup' },
        { channel: 'md', name: 'copy_all', alias: 'dup' },
      ]),
    ).rejects.toThrowError(
      // deterministic sorted order: copy_all before home
      /two scanned refs claim one alias: "md:copy_all as dup" and "md:home as dup"/s,
    );
  });

  test('the same canonical re-declaring its alias in another file dedupes silently', async () => {
    const { aliases, icons } = await resolveFixture([
      { channel: 'md', name: 'home', alias: 'house' },
      { channel: 'md', name: 'home', alias: 'house' },
    ]);
    expect(icons.map((icon) => icon.name)).toEqual(['md:home']);
    expect(aliases).toEqual({ house: 'md:home' });
  });

  test('alias ↔ canonical scanned name is UNREACHABLE by grammar (documented law)', async () => {
    // canonical keys always carry the prefix colon; aliases never can —
    // an alias literally spelling a canonical is a grammar error first
    await expect(
      resolveFixture([{ channel: 'md', name: 'home', alias: 'md:home' }]),
    ).rejects.toThrowError(/alias "md:home".*camelCase/s);
  });
});

// ── the generator's alias-indirection output (B1/B2 + codex r1 B2) ──

describe('generateIconLibraryArtifacts — ALIASES + budget + adjacency + union', () => {
  const assetsOf = (names: readonly string[]): readonly ResolvedLibraryIcon[] =>
    names.map((name) => ({ name, svg: STUB_SVG }));

  test('ALIASES table + deref-first runtime + adjacency, payload ONCE', async () => {
    const resolution = await resolveFixture();
    const generated = generateIconLibraryArtifacts(resolution.icons, {
      aliases: resolution.aliases,
      templatePrefixes: ['md'],
    });
    const { artifact, report } = generated;

    // the ALIASES table: alias → canonical (sorted rows)
    expect(artifact).toContain(
      'export const ALIASES: Readonly<Record<string, string>> = {\n  copy2: \'md:copy_all\',\n};',
    );

    // ICON_NAMES adjacency: the alias rides DIRECTLY after its ref
    const namesBlock = artifact.split('export const ICON_NAMES = [')[1]!.split('\n] as readonly IconName[];')[0]!;
    expect(namesBlock).toContain("  'md:copy_all',\n  'copy2',");
    // the union carries the concrete members + the alias
    expect(artifact).toContain("  | 'md:copy_all'");
    expect(artifact).toContain("  | 'copy2'");

    // the template member: `md:${string}` for the ENABLED channel only
    expect(artifact).toContain('  | `md:${string}`');
    expect(artifact).not.toContain('`rx:${string}`');
    expect(artifact).not.toContain('`ph:${string}`');

    // the payload packs EXACTLY once under the canonical (quoted key —
    // codex r1 B2: `md:copy_all:` is invalid TS, the key is quoted)
    expect(artifact).toContain("  'md:copy_all': {");
    expect(artifact.match(/'md:copy_all': \{/g)).toHaveLength(1);
    // the deref-first runtime
    expect(artifact).toContain("  const base = name.split(' as ')[0] ?? name;");
    expect(artifact).toContain(
      '  return Object.hasOwn(ALIASES, base) ? ALIASES[base] : base;',
    );

    // budget accounting: iconCount = canonicals only; perIconBytes =
    // payload once + the alias row; chunk totals carry payloads only
    expect(report.iconCount).toBe(2);
    expect(report.perIconBytes['md:copy_all']).toBeGreaterThan(0);
    const aliasRow = `  copy2: 'md:copy_all',`;
    expect(report.perIconBytes['copy2']).toBe(
      new TextEncoder().encode(`${aliasRow}\n`).length,
    );
    const payloadTotal = [...report.chunkBytes.values()].reduce((a, b) => a + b, 0);
    expect(payloadTotal).toBe(
      report.perIconBytes['md:copy_all']! + report.perIconBytes['md:home']!,
    );
  });

  test('enabled-channels-only union tracks the config (the spec scenario)', () => {
    const generated = generateIconLibraryArtifacts(assetsOf(['a']), {
      templatePrefixes: ['md', 'ph'],
    });
    expect(generated.artifact).toContain('  | `md:${string}`');
    expect(generated.artifact).toContain('  | `ph:${string}`');
    expect(generated.artifact).not.toContain('`rx:${string}`');
    // and with NONE enabled: no template member at all
    const none = generateIconLibraryArtifacts(assetsOf(['a']), {});
    expect(none.artifact).not.toContain('${string}');
  });

  test('the empty library + templates keeps a legal single-member union', () => {
    const generated = generateIconLibraryArtifacts([], { templatePrefixes: ['md'] });
    expect(generated.artifact).toContain('export type IconName =\n  | `md:${string}`\n  ;');
    expect(generated.artifact).toContain('export const ICON_NAMES = [');
    expect(generated.report.iconCount).toBe(0);
  });

  test('a warn-dropped canonical drops its aliases (no dangling keys)', () => {
    const generated = generateIconLibraryArtifacts(assetsOf(['md:home']), {
      aliases: { ghost: 'md:absent', house: 'md:home' },
      templatePrefixes: ['md'],
    });
    expect(generated.artifact).toContain("  house: 'md:home',");
    expect(generated.artifact).not.toContain('ghost');
    expect(generated.artifact).not.toContain("'md:absent'");
  });

  test('the quoted-key law round-trips through evaluation (codex r1 B2)', async () => {
    const resolution = await resolveFixture();
    const generated = generateIconLibraryArtifacts(resolution.icons, {
      aliases: resolution.aliases,
      templatePrefixes: ['md'],
    });
    const chunkBody = generated.chunks.get(0)!.split('export default {')[1]!.split('\n};')[0]!;
    // eslint-disable-next-line no-eval -- the generate.test.ts round-trip precedent
    const entries = (0, eval)(`({${chunkBody}})`) as Record<string, unknown>;
    expect(Object.keys(entries)).toEqual(['md:copy_all', 'md:home']); // quoted keys parse + survive
    const sameFromArtifact = generated.artifact
      .split('const CHUNK_0: Readonly<Record<string, IconData>> = {')[1]!
      .split('\n};')[0]!;
    // eslint-disable-next-line no-eval -- same precedent, artifact-side
    const inline = (0, eval)(`({${sameFromArtifact}})`) as Record<string, unknown>;
    expect(Object.keys(inline)).toEqual(Object.keys(entries));
  });
});

// ── the EXECUTED artifact (B3 + codex r1 B1: the three spellings) ──

/** the artifact module's runtime surface (the generated exports) */
interface ArtifactModule {
  getIcon(name: string): { readonly d: string } | null;
  loadIcon(name: string): Promise<{ readonly d: string }>;
  readonly ICON_NAMES: readonly string[];
  readonly ALIASES: Readonly<Record<string, string>>;
  readonly EQUIVALENCES: Readonly<Record<string, string>>;
}

let execRoot: string | undefined;
let execCounter = 0;
afterAll(async () => {
  if (execRoot !== undefined) await rm(execRoot, { recursive: true, force: true });
});

/** write the artifact into a tmp module and import it for real (the
 *  single-chunk inline fixture has ZERO virtual imports — the
 *  plugin-free tier, so plain module evaluation is the contract) */
async function importArtifact(artifact: string): Promise<ArtifactModule> {
  execRoot ??= await mkdtemp(join(tmpdir(), 'jixoai-scan-exec-'));
  execCounter += 1;
  const file = join(execRoot, `artifact-${execCounter}.ts`);
  await writeFile(file, artifact, 'utf8');
  return (await import(pathToFileURL(file).href)) as ArtifactModule;
}

describe('the executed artifact — dual keys + the dynamic-name lane', () => {
  test('all three spellings resolve the SAME payload (canonical / alias / full literal)', async () => {
    const resolution = await resolveFixture();
    const generated = generateIconLibraryArtifacts(resolution.icons, {
      aliases: resolution.aliases,
      templatePrefixes: ['md'],
    });
    const artifact = await importArtifact(generated.artifact);

    // codex r1 B1/B4: the full ` as ` literal, the alias, and the
    // canonical all deref to one packed payload
    const canonical = artifact.getIcon('md:copy_all');
    const alias = artifact.getIcon('copy2');
    const literal = artifact.getIcon('md:copy_all as copy2');
    expect(canonical).not.toBeNull();
    expect(alias).toEqual(canonical);
    expect(literal).toEqual(canonical);
    // preloadIcons rides loadIcon — the deref covers it (M4)
    await expect(artifact.loadIcon('copy2')).resolves.toEqual(canonical);
    await expect(artifact.loadIcon('md:copy_all as copy2')).resolves.toEqual(canonical);

    // ICON_NAMES adjacency + the ALIASES export
    expect(artifact.ICON_NAMES).toEqual(['md:copy_all', 'copy2', 'md:home']);
    expect(artifact.ALIASES).toEqual({ copy2: 'md:copy_all' });
  });

  test('getIcon → null + loadIcon → BOTH-CAUSE error for un-packed names (the runtime lane)', async () => {
    const resolution = await resolveFixture();
    const generated = generateIconLibraryArtifacts(resolution.icons, {
      aliases: resolution.aliases,
      templatePrefixes: ['md'],
    });
    const artifact = await importArtifact(generated.artifact);

    // the dynamic-name contract: template members admit the name, the
    // packed set answers null — the component's reserved box renders
    expect(artifact.getIcon('md:never_scanned_xyz')).toBeNull();
    // and the generator's loadIcon message covers BOTH causes (never
    // the misleading drift-only advice)
    await expect(artifact.loadIcon('md:never_scanned_xyz')).rejects.toThrowError(
      /icon "md:never_scanned_xyz" is not in the packed set — either the artifact drifted from the library config \(regenerate icon-set\.gen\.ts\) or the name was composed dynamically and never scanned\/declared/s,
    );
  });

  test('the no-templates artifact keeps the pre-change drift wording (byte-identity)', async () => {
    const resolution = await resolveFixture();
    const generated = generateIconLibraryArtifacts(resolution.icons, {});
    expect(generated.artifact).toContain(
      'has no chunk loader — the artifact drifted from the library config (regenerate icon-set.gen.ts)',
    );
    expect(generated.artifact).not.toContain('is not in the packed set');
  });
});

// ── the EQUIVALENCES law (icon-channel-api design §1, task A3b) ────

/**
 * the manifest-collision matrix: a scanned `lucide:X` whose `X` is
 * ALREADY packed does NOT pack a second payload — the artifact gains a
 * row in the SEPARATE, compiler-generated EQUIVALENCES table
 * (`lucide:X` → `X`), never an ALIASES row; `canonicalOf` chains
 * ALIASES then EQUIVALENCES, so an `as` alias on a deduped ref
 * (`lucide:check as c2`) resolves c2 → `lucide:check` → `check` (the
 * grammar makes alias↔key collision impossible — aliases cannot
 * contain `:`). The five-case matrix: the built-in defaults, a
 * config-overridden default, a declared custom icon, the
 * includeDefaults:false full-key pack, and the alias-through-chain.
 */
describe('the EQUIVALENCES law — scanned lucide refs dedupe against packed names', () => {
  const assetsOf = (names: readonly string[]): readonly ResolvedLibraryIcon[] =>
    names.map((name) => ({ name, svg: STUB_SVG }));
  const lucideScan = (name: string, alias?: string): ScannedRef =>
    alias === undefined ? { channel: 'lucide', name } : { channel: 'lucide', name, alias };

  test('defaults: scanned lucide:check dedupes to the built-in (one payload, EQUIVALENCES row)', async () => {
    const { icons, aliases, equivalences } = await resolveLibraryInputs(
      { includeDefaults: true },
      fsIo(),
      checker(),
      [lucideScan('check')],
    );
    // the 38 built-ins — NO second payload for lucide:check
    expect(icons).toHaveLength(38);
    expect(icons.map((icon) => icon.name)).not.toContain('lucide:check');
    expect(aliases).toEqual({});
    expect(equivalences).toEqual({ 'lucide:check': 'check' });

    // the generator: the SEPARATE table, canonical-only counts, and
    // adjacency in ICON_NAMES/union
    const generated = generateIconLibraryArtifacts(icons, {
      equivalences,
      templatePrefixes: ['lucide'],
    });
    const { artifact, report } = generated;
    expect(artifact).toContain(
      "export const EQUIVALENCES: Readonly<Record<string, string>> = {\n  'lucide:check': 'check',\n};",
    );
    expect(artifact).not.toContain('ALIASES');
    expect(report.iconCount).toBe(38); // canonicals only
    const namesBlock = artifact.split('export const ICON_NAMES = [')[1]!.split('\n] as readonly IconName[];')[0]!;
    expect(namesBlock).toContain("  'check',\n  'lucide:check',"); // adjacent to its canonical
    expect(artifact).toContain(
      '  return Object.hasOwn(EQUIVALENCES, base) ? EQUIVALENCES[base] : base;',
    ); // the chained canonicalizer
    // the payload packs exactly once (the check entry — a BARE key in the chunk)
    expect(artifact.match(/(?:^|\s)check: \{/gm)).toHaveLength(1);

    // executed: all three spellings resolve the SAME built-in payload
    const mod = await importArtifact(artifact);
    const builtIn = mod.getIcon('check');
    expect(builtIn).not.toBeNull();
    expect(mod.getIcon('lucide:check')).toEqual(builtIn);
    expect(mod.getIcon('lucide:check as c2')).toEqual(builtIn); // full literal, no alias declared
    expect(mod.EQUIVALENCES).toEqual({ 'lucide:check': 'check' });
  });

  test('config-overridden default: the equivalence points at the OVERRIDE payload', async () => {
    const override =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 9l6 6M15 9l-6 6"/></svg>';
    const { icons, equivalences } = await resolveLibraryInputs(
      { includeDefaults: true, icons: { check: override } },
      fsIo(),
      checker(),
      [lucideScan('check')],
    );
    expect(equivalences).toEqual({ 'lucide:check': 'check' });
    expect(icons).toHaveLength(38); // the override replaced the built-in in place
    const generated = generateIconLibraryArtifacts(icons, { equivalences });
    const mod = await importArtifact(generated.artifact);
    // lucide:check resolves to the OVERRIDE artwork, not lucide's check
    const data = mod.getIcon('lucide:check');
    expect(data?.d).toContain('M9 9l6 6');
    expect(data?.d).not.toContain('M20 6 9 17l-5-5');
  });

  test('a declared custom icon dedupes the same way (the payload is the DECLARED artwork)', async () => {
    const brand =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M1 1h2v2z"/></svg>';
    const { icons, equivalences } = await resolveLibraryInputs(
      { includeDefaults: false, icons: { brand } },
      fsIo(),
      checker(),
      [lucideScan('brand')],
    );
    expect(icons.map((icon) => icon.name)).toEqual(['brand']);
    expect(equivalences).toEqual({ 'lucide:brand': 'brand' });
    const generated = generateIconLibraryArtifacts(icons, { equivalences });
    const mod = await importArtifact(generated.artifact);
    expect(mod.getIcon('lucide:brand')?.d).toBe(mod.getIcon('brand')?.d);
  });

  test('includeDefaults:false with no packed X: the FULL-KEY pack, no equivalence row', async () => {
    const { icons, aliases, equivalences } = await resolveLibraryInputs(
      { includeDefaults: false },
      fsIo(),
      checker(),
      [lucideScan('zap')],
    );
    expect(icons.map((icon) => icon.name)).toEqual(['lucide:zap']); // full prefixed key
    expect(aliases).toEqual({});
    expect(equivalences).toEqual({}); // nothing packed under `zap` — no dedupe
    const generated = generateIconLibraryArtifacts(icons, { templatePrefixes: ['lucide'] });
    expect(generated.artifact).toContain("  'lucide:zap': {");
    expect(generated.artifact).not.toContain('EQUIVALENCES');
    expect(generated.report.iconCount).toBe(1);
  });

  test('the alias-through-chain: lucide:check as c2 → c2 → lucide:check → check (one payload)', async () => {
    const { icons, aliases, equivalences } = await resolveLibraryInputs(
      { includeDefaults: true },
      fsIo(),
      checker(),
      [lucideScan('check', 'c2')],
    );
    expect(icons).toHaveLength(38);
    expect(aliases).toEqual({ c2: 'lucide:check' });
    expect(equivalences).toEqual({ 'lucide:check': 'check' });

    const generated = generateIconLibraryArtifacts(icons, {
      aliases,
      equivalences,
      templatePrefixes: ['lucide'],
    });
    const { artifact, report } = generated;
    // BOTH tables ride the artifact, each with exactly its row
    expect(artifact).toContain("  c2: 'lucide:check',");
    expect(artifact).toContain("  'lucide:check': 'check',");
    // the CHAINED canonicalizer (ALIASES then EQUIVALENCES) — both
    // derefs own-property-guarded (diff-r1 M2)
    expect(artifact).toContain(
      '  const aliased = Object.hasOwn(ALIASES, base) ? ALIASES[base] : base;',
    );
    expect(artifact).toContain(
      '  return Object.hasOwn(EQUIVALENCES, aliased) ? EQUIVALENCES[aliased] : aliased;',
    );
    expect(report.iconCount).toBe(38); // canonicals only — neither row is a payload
    expect(report.perIconBytes['lucide:check']).toBeGreaterThan(0); // the row costs its bytes
    expect(report.perIconBytes['c2']).toBeGreaterThan(0);

    // executed: the chain resolves every spelling to the built-in check
    const mod = await importArtifact(artifact);
    const builtIn = mod.getIcon('check');
    expect(mod.getIcon('c2')).toEqual(builtIn);
    expect(mod.getIcon('lucide:check')).toEqual(builtIn);
    expect(mod.getIcon('lucide:check as c2')).toEqual(builtIn);
    expect(await mod.loadIcon('c2')).toEqual(builtIn);
    // ICON_NAMES adjacency: alias + equivalence key ride next to `check`
    expect(mod.ICON_NAMES.indexOf('lucide:check')).toBe(mod.ICON_NAMES.indexOf('check') + 2);
    expect(mod.ICON_NAMES.indexOf('c2')).toBe(mod.ICON_NAMES.indexOf('check') + 1);
  });

  test('a grammar-legal prototype-key alias resolves — constructor is a NAME, not Object.prototype (diff-r1 M2)', async () => {
    const { icons, aliases, equivalences } = await resolveLibraryInputs(
      { includeDefaults: true },
      fsIo(),
      checker(),
      [lucideScan('check', 'constructor')],
    );
    expect(icons).toHaveLength(38); // the alias rows never pack a payload
    expect(aliases).toEqual({ constructor: 'lucide:check' });
    expect(equivalences).toEqual({ 'lucide:check': 'check' });

    const generated = generateIconLibraryArtifacts(icons, {
      aliases,
      equivalences,
      templatePrefixes: ['lucide'],
    });
    const mod = await importArtifact(generated.artifact);
    const builtIn = mod.getIcon('check');
    expect(builtIn).not.toBeNull();
    // plain-object tables must not leak inherited members: every
    // spelling of the prototype-keyed alias resolves the payload
    expect(mod.getIcon('constructor')).toEqual(builtIn);
    expect(mod.getIcon('lucide:check as constructor')).toEqual(builtIn);
    await expect(mod.loadIcon('constructor')).resolves.toEqual(builtIn);
    // an UN-packed prototype-key name misses CLEANLY: null — never an
    // inherited function dressed up as IconData
    expect(mod.getIcon('toString')).toBeNull();
    await expect(mod.loadIcon('toString')).rejects.toThrow(/is not in the packed set/);
  });

  test('a warn-dropped canonical drops its equivalence keys (no dangling rows)', async () => {
    const generated = generateIconLibraryArtifacts(assetsOf(['brand']), {
      equivalences: { 'lucide:brand': 'brand', 'lucide:ghost': 'absent' },
      templatePrefixes: ['lucide'],
    });
    expect(generated.artifact).toContain("  'lucide:brand': 'brand',");
    expect(generated.artifact).not.toContain('lucide:ghost');
    expect(generated.artifact).not.toContain("'absent'");
  });

  test('a scanned non-lucide ref NEVER equivalence-dedupes (different artwork, different keys)', async () => {
    // md:home beside a DECLARED home: both pack — only lucide's built-in
    // manifest makes prefixed/unprefixed names the SAME artwork
    const { icons, equivalences } = await resolveLibraryInputs(
      {
        includeDefaults: false,
        channels: [md()],
        icons: { home: STUB_SVG },
      },
      fsIo(),
      checker(),
      [{ channel: 'md', name: 'home' }],
    );
    expect(icons.map((icon) => icon.name)).toEqual(['home', 'md:home']);
    expect(equivalences).toEqual({});
  });
});

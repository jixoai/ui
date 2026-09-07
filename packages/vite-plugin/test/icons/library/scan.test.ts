/**
 * scan.test.ts — the source scanner's unit contract (A1/A2, openspec
 * icon-prefix-compiler design §1 / spec delta; codex r1 B4/M5/M6).
 *
 *   - the literal matcher: the attribute forms (`name="…"` /
 *     `name='…'`) and the string-literal EXPRESSION forms
 *     (`name={'…'}` / `name={"…"}` / the hole-free backtick); the `as`
 *     clause; remix's colon+hyphen suffix (the permissive suffix law —
 *     the preset resolver is the validating authority)
 *   - the fail-safe laws: non-enabled prefixes (`fa:home` in a comment
 *     or doc example) are IGNORED, never errors; dynamic expressions
 *     (`name={`md:${x}`}`, identifiers, concatenations) collect
 *     nothing — the runtime lane owns them
 *   - determinism: refs sort (preset, name, alias); identical triples
 *     dedupe; scan order never affects output
 *   - the EAGER walk (scanProjectSources): the file set
 *     (.svelte/.ts/.js/.html), the exclusions (node_modules, dist,
 *     .svelte-kit, dot-dirs, the artifact itself), sorted deterministic
 *     output regardless of fs order
 *   - the transform-side id scope (isScannableModuleId): virtual ids,
 *     `?t=` cache-busts, excluded segments, the artifact
 */

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';
import {
  collectScannedRefs,
  compareScannedRefs,
  isScannableModuleId,
  mergeScannedRefs,
  scanProjectSources,
  scannedRefKey,
  type ScannedRef,
} from '../../../src/icons/library/scan.js';

const MD = ['md'] as const;
const MD_RX = ['md', 'rx'] as const;

/** structural equality on the plain ScannedRef shape */
const expectRefs = (actual: readonly ScannedRef[], expected: readonly ScannedRef[]): void => {
  expect(actual.map((ref) => ({ ...ref }))).toEqual(expected.map((ref) => ({ ...ref })));
};

describe('the literal matcher — attribute + string-literal expression forms', () => {
  test('the double-quoted attribute form (svelte markup)', () => {
    expectRefs(collectScannedRefs('<Icon name="md:copy_all" />', MD), [
      { preset: 'md', name: 'copy_all' },
    ]);
  });

  test('the single-quoted attribute form', () => {
    expectRefs(collectScannedRefs("<Icon name='md:home' />", MD), [
      { preset: 'md', name: 'home' },
    ]);
  });

  test("the expression forms: {'…'} and {\"…\"}", () => {
    expectRefs(collectScannedRefs("<Icon name={'md:search'} />", MD), [
      { preset: 'md', name: 'search' },
    ]);
    expectRefs(collectScannedRefs('<Icon name={"md:delete"} />', MD), [
      { preset: 'md', name: 'delete' },
    ]);
  });

  test('NON-attribute occurrences never collect (codex r2 B1)', () => {
    const code = [
      "const name = 'md:copy_all';",
      'const config = { name: "md:home" };',
      'obj.name = "md:home";',
      '<input data-name="md:home" />',
      "{#if name === 'md:home'}nope{/if}",
      'if (name == "md:home") return;',
    ].join('\n');
    // bare JS assignments, object keys, the data-name attribute (a
    // DIFFERENT attribute) and comparison expressions all stay out
    expectRefs(collectScannedRefs(code, MD), []);
    // while the real tag-attribute form in the same text collects
    expectRefs(collectScannedRefs(`${code}\n<Icon name="md:home" />`, MD), [
      { preset: 'md', name: 'home' },
    ]);
  });

  test('a raw > anywhere in the value path is fail-safe non-collection (codex r3)', () => {
    // the value itself containing > fails the value grammar…
    expectRefs(collectScannedRefs('<Icon name="md:a>b" />', MD), []);
    // …and an EARLIER attribute containing > ends the tag-opener scan
    // before name= is reached
    expectRefs(collectScannedRefs('<Icon title="a > b" name="md:home" />', MD), []);
  });

  test('a hole-free backtick template literal IS a string literal', () => {
    expectRefs(collectScannedRefs('<Icon name={`md:home`} />', MD), [
      { preset: 'md', name: 'home' },
    ]);
  });

  test('the as clause captures the alias token verbatim', () => {
    expectRefs(collectScannedRefs('<Icon name="md:copy_all as copy2" />', MD), [
      { preset: 'md', name: 'copy_all', alias: 'copy2' },
    ]);
    // single-quoted + expression forms carry it too
    expectRefs(collectScannedRefs("<Icon name={'md:home as house'} />", MD), [
      { preset: 'md', name: 'home', alias: 'house' },
    ]);
  });

  test('remix suffixes ride whole: the second colon + hyphens (codex r1 B4)', () => {
    expectRefs(collectScannedRefs('<Icon name="rx:system:add-line" />', MD_RX), [
      { preset: 'rx', name: 'system:add-line' },
    ]);
    // material snake_case is just another suffix — never special-cased
    expectRefs(collectScannedRefs('<Icon name="md:copy_all" />', MD_RX), [
      { preset: 'md', name: 'copy_all' },
    ]);
  });

  test('multiline component markup matches (attribute on its own line)', () => {
    const code = [
      '<Icon',
      '  size={18}',
      '  name="md:copy_all as copy2"',
      '/>',
    ].join('\n');
    expectRefs(collectScannedRefs(code, MD), [{ preset: 'md', name: 'copy_all', alias: 'copy2' }]);
  });

  test('surrounding whitespace inside the literal is tolerated', () => {
    expectRefs(collectScannedRefs('<Icon name="  md:home  " />', MD), [
      { preset: 'md', name: 'home' },
    ]);
  });
});

describe('the matcher is FAIL-SAFE (codex r1 M5/M6) — never a build break', () => {
  test('a non-enabled prefix is IGNORED, not collected, not an error', () => {
    // the M5 scenario verbatim: fa:home inside a comment/doc example
    const doc = [
      '<!-- docs example: <Icon name="fa:home" /> needs fontawesome -->',
      '<Icon name="md:home" />',
    ].join('\n');
    expectRefs(collectScannedRefs(doc, MD), [{ preset: 'md', name: 'home' }]);
  });

  test('dynamic expressions are intentionally unserved (the spec scenario)', () => {
    expectRefs(collectScannedRefs('<Icon name={`md:${x}`} />', MD), []); // eslint-disable-line no-undef -- source text, not executed
    expectRefs(collectScannedRefs('<Icon name={iconName} />', MD), []);
    expectRefs(collectScannedRefs("<Icon name={'md:' + slug} />", MD), []);
    expectRefs(collectScannedRefs('<Icon name={iconName ?? "md:home"} />', MD), []); // expression, not a bare literal
  });

  test('multi-word junk and brace-bearing values never match', () => {
    expectRefs(collectScannedRefs('<input name="md: two words" />', MD), []);
    expectRefs(collectScannedRefs('<input name="email address" />', MD), []);
    expectRefs(collectScannedRefs('<input name="md:{weird}" />', MD), []);
    expectRefs(collectScannedRefs('<Icon name="md: as copy2" />', MD), []); // empty suffix
  });

  test('an empty enabled set collects nothing (no prefix can ever match)', () => {
    expectRefs(collectScannedRefs('<Icon name="md:home" />', []), []);
  });
});

describe('determinism (design §1: scan order never affects bytes)', () => {
  test('output sorts (preset, name, alias); identical triples dedupe', () => {
    const code = [
      '<Icon name="md:search" />',
      '<Icon name="md:copy_all as copy2" />',
      '<Icon name="rx:system:add-line" />',
      '<Icon name="md:copy_all" />',
      '<Icon name="md:copy_all as copy2" />', // identical triple — dedupes
      '<Icon name="md:home" />',
    ].join('\n');
    expectRefs(collectScannedRefs(code, MD_RX), [
      { preset: 'md', name: 'copy_all' }, // no-alias triple sorts first
      { preset: 'md', name: 'copy_all', alias: 'copy2' },
      { preset: 'md', name: 'home' },
      { preset: 'md', name: 'search' },
      { preset: 'rx', name: 'system:add-line' },
    ]);
  });

  test('mergeScannedRefs dedupes + sorts across modules (the union law)', () => {
    const a = collectScannedRefs('<Icon name="md:search" />', MD);
    const b = collectScannedRefs('<Icon name="md:home as house" />', MD);
    const c = collectScannedRefs('<Icon name="md:home as house" />', MD);
    expectRefs(mergeScannedRefs([...b, ...a, ...c]), [
      { preset: 'md', name: 'home', alias: 'house' },
      { preset: 'md', name: 'search' },
    ]);
  });

  test('scannedRefKey + the comparator agree on the canonical spelling', () => {
    const ref: ScannedRef = { preset: 'md', name: 'copy_all', alias: 'copy2' };
    expect(scannedRefKey(ref)).toBe('md:copy_all');
    expect(compareScannedRefs(ref, { preset: 'md', name: 'copy_all' })).toBe(1); // no-alias first
    expect(compareScannedRefs({ preset: 'md', name: 'home' }, { preset: 'md', name: 'home' })).toBe(0);
  });
});

// ── the eager walk ─────────────────────────────────────────────────

let fixtureRoot: string;
afterAll(async () => {
  if (fixtureRoot !== undefined) await rm(fixtureRoot, { recursive: true, force: true });
});

const writeFixture = async (root: string, rel: string, content: string): Promise<void> => {
  const path = join(root, rel);
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, content, 'utf8');
};

describe('the EAGER project walk (scanProjectSources)', () => {
  test('walks .svelte/.ts/.js/.html, prunes excluded trees + the artifact, deterministic', async () => {
    const root = await mkdtemp(join(tmpdir(), 'jixoai-scan-'));
    fixtureRoot = root;
    const artifact = join(root, 'src/lib/icon-set.gen.ts');

    await writeFixture(root, 'src/App.svelte', '<Icon name="md:copy_all as copy2" />');
    await writeFixture(root, 'src/lib/deep/mod.ts', "export const x = `<Icon name='md:copy_all' />`;");
    await writeFixture(root, 'src/main.js', 'render(<Icon name={"md:home"} />);');
    await writeFixture(root, 'src/index.html', '<i-icon name="md:search"></i-icon>');
    // the exclusions: node_modules, dist, .svelte-kit, dot-dirs, the artifact
    await writeFixture(root, 'node_modules/dep/index.ts', '<Icon name="md:nope" />');
    await writeFixture(root, 'dist/bundle.js', '<Icon name="md:nope" />');
    await writeFixture(root, '.svelte-kit/output/server/app.js', '<Icon name="md:nope" />');
    await writeFixture(root, '.git/config.ts', '<Icon name="md:nope" />');
    await writeFixture(root, 'src/notes.txt', '<Icon name="md:notscannable" />'); // wrong extension
    await writeFixture(root, 'src/lib/icon-set.gen.ts', "'md:home': {}"); // the artifact itself

    const refs = await scanProjectSources(root, MD, { exclude: [artifact] });
    expectRefs(refs, [
      { preset: 'md', name: 'copy_all' },
      { preset: 'md', name: 'copy_all', alias: 'copy2' },
      { preset: 'md', name: 'home' },
      { preset: 'md', name: 'search' },
    ]);
  });

  test('no enabled prefixes → the walk is skipped (no fs cost, no refs)', async () => {
    const root = await mkdtemp(join(tmpdir(), 'jixoai-scan-empty-'));
    fixtureRoot = root;
    await writeFixture(root, 'src/App.svelte', '<Icon name="md:home" />');
    expectRefs(await scanProjectSources(root, [], {}), []);
  });
});

// ── the transform-side id scope ────────────────────────────────────

describe('isScannableModuleId (the dev transform\'s scope)', () => {
  const artifact = '/proj/src/lib/icon-set.gen.ts';

  test('scannable ids pass (both separators, ?t= cache-busts)', () => {
    expect(isScannableModuleId('/proj/src/App.svelte', artifact)).toBe(true);
    expect(isScannableModuleId('/proj/src/lib/util.ts?t=1730500000000', artifact)).toBe(true);
    expect(isScannableModuleId('/proj/src/entry.js', artifact)).toBe(true);
    expect(isScannableModuleId('/proj/index.html', artifact)).toBe(true);
  });

  test('virtual modules, wrong extensions, excluded trees and the artifact fail', () => {
    expect(isScannableModuleId('\0virtual:jixoai-icons/chunk/0', artifact)).toBe(false);
    expect(isScannableModuleId('virtual:jixoai-icons', artifact)).toBe(false);
    expect(isScannableModuleId('/proj/src/style.css', artifact)).toBe(false);
    expect(isScannableModuleId('/proj/node_modules/dep/index.ts', artifact)).toBe(false);
    expect(isScannableModuleId('/proj/dist/app.js', artifact)).toBe(false);
    expect(isScannableModuleId('/proj/.svelte-kit/generated/app.js', artifact)).toBe(false);
    expect(isScannableModuleId(artifact, artifact)).toBe(false);
    expect(isScannableModuleId(`${artifact}?t=1730500000000`, artifact)).toBe(false);
  });
});

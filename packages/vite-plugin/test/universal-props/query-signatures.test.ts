// the §9.1 signature fixtures' runner (explicit-props W2 task 2.5):
// (1) the LOCKSTEP PIN — both fixtures carry design.md §9.1's FROZEN
//     code block byte-identical (extracted from the design doc itself,
//     the spec of record), so the battery compiles what the contract
//     says, never a drifted copy;
// (2) the POSITIVE face compiles under --strict (tsc exit 0);
// (3) the NEGATIVE face — invalid lanes in slot calls — FAILS, with
//     the error naming the invalid literal.
// Runs the workspace's own tsc (spawnSync, the package's devDependency).
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const fixture = (name: string): string =>
  readFileSync(fileURLToPath(new URL(`./fixtures/query-signatures/${name}`, import.meta.url)), 'utf8');

const runTsc = (name: string) => {
  const tscBin = fileURLToPath(new URL('../../node_modules/.bin/tsc', import.meta.url));
  return spawnSync(tscBin, ['--noEmit', '--strict', '--target', 'es2022', '--module', 'esnext', '--moduleResolution', 'bundler', fileURLToPath(new URL(`./fixtures/query-signatures/${name}`, import.meta.url))], {
    cwd: fileURLToPath(new URL('../..', import.meta.url)),
    encoding: 'utf8',
  });
};

describe('the §9.1 lockstep pin (design.md is the spec of record)', () => {
  it('both fixtures embed the FROZEN block byte-identical', () => {
    const design = readFileSync(fileURLToPath(new URL('../../../../openspec/changes/explicit-props/design.md', import.meta.url)), 'utf8');
    const m = /```ts\n(.*?motionSlot\([^\n]*\n)/s.exec(design);
    expect(m).not.toBeNull();
    const frozen = m![1]!;
    const code = frozen.slice(frozen.indexOf('type ViewportScale'));
    for (const name of ['positive.ts', 'negative.ts']) {
      const fx = fixture(name);
      const at = fx.indexOf('type ViewportScale');
      expect(at).toBeGreaterThanOrEqual(0);
      expect(fx.slice(at, at + code.length)).toBe(code);
    }
  });
  it('the schema artifact embeds the same code portion (the one shared artifact)', () => {
    const design = readFileSync(fileURLToPath(new URL('../../../../openspec/changes/explicit-props/design.md', import.meta.url)), 'utf8');
    const schema = readFileSync(fileURLToPath(new URL('../../../../apps/www/src/lib/universal-props.schema.ts', import.meta.url)), 'utf8');
    const m = /```ts\n(.*?motionSlot\([^\n]*\n)/s.exec(design);
    const block = m![1]!;
    const code = block.slice(block.indexOf('type ViewportScale'));
    const at = schema.indexOf('type ViewportScale');
    expect(schema.slice(at, at + code.length)).toBe(code);
  });
});

describe('the positive fixture compiles (frozen block + verified usages)', () => {
  it('tsc exit 0 under --strict', () => {
    const r = runTsc('positive.ts');
    expect(r.status).toBe(0);
  }, 120_000);
});

describe('the negative fixture rejects invalid lanes', () => {
  it('tsc exit ≠ 0, naming the invalid literals', () => {
    const r = runTsc('negative.ts');
    expect(r.status).not.toBe(0);
    expect(r.stdout + r.stderr).toContain('"invalid"');
    expect(r.stdout + r.stderr).toContain('"compact"');
  }, 120_000);
});

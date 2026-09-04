/**
 * context-coverage gate self-test (context-defaults-economy task 1.4,
 * design「门禁合同 — verify:context」, 2026-09-03).
 *
 * The gate (scripts/verify-context-coverage.mjs) runs against two
 * SYNTHETIC fixture trees under test/fixtures/context-coverage/:
 *
 *   root/       — the counterexample tree: one family per failure mode
 *                 (the design's eight counterexamples) plus the legal
 *                 placeholder family and the three exemption families
 *   legal-root/ — the clean tree: must exit 0 GREEN
 *
 * The fixtures are designed-to-fail synthetic files: they live under
 * test/fixtures/, are never imported by the app or the suite, and are
 * registered in NO real registry — the gate reaches them only through
 * its --root flag (the fixture trees carry their own registry.json,
 * config and exemptions whitelist).
 *
 * The gate process spawns as a child (the tw-context-probe precedent:
 * a node tool with its own exit-code contract belongs in a child
 * process, not in vitest's module space).
 *
 * TODO (orchestrator integration, out of 1.4 scope):
 *   - the REAL positive path (a real family resolving through the real
 *     registry/files/lib/defaults.svelte.ts — task 1.1, parallel batch
 *     — plus the pilot batch, tasks 2.x) adds a real-tree
 *     `--scope=pilot` GREEN assertion here mirroring the legal-root one;
 *   - npm script wiring (`verify:context`, verify-all insertion after
 *     verify:mirror) is the orchestrator's shared-file landing, per the
 *     tasks.md orchestration discipline.
 */
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(fileURLToPath(import.meta.url), '../../../..');
const GATE = resolve(repoRoot, 'scripts/verify-context-coverage.mjs');
const FIXTURES = resolve(repoRoot, 'apps/www/test/fixtures/context-coverage');

interface GateFinding {
  rule: string;
  family: string | null;
  file: string | null;
  line: number | null;
  prop: string | null;
  message: string;
}

function runGate(tree: string, ...args: string[]) {
  const res = spawnSync('node', [GATE, `--root=${resolve(FIXTURES, tree)}`, ...args], {
    encoding: 'utf8',
    timeout: 60_000,
  });
  return { status: res.status, stdout: res.stdout, stderr: res.stderr };
}

function runJson(tree: string, ...args: string[]) {
  const res = runGate(tree, '--json', ...args);
  expect(res.stdout.trim().startsWith('{'), `gate should print JSON (stderr: ${res.stderr})`).toBe(true);
  return { status: res.status!, report: JSON.parse(res.stdout) as {
    ok: boolean;
    scope: string;
    findings: GateFinding[];
    census: Record<string, { total: number; banned: number; files: string[] }>;
    exemptions: { total: number; hit: number; outOfScope: number };
  } };
}

const of = (report: ReturnType<typeof runJson>['report'], rule: string, family?: string) =>
  report.findings.filter((f) => f.rule === rule && (family === undefined || f.family === family));

describe('verify-context-coverage — the counterexample tree (full scope)', () => {
  const { status, report } = runJson('root');

  it('exits 1 with a machine report', () => {
    expect(status).toBe(1);
    expect(report.ok).toBe(false);
    expect(report.scope).toBe('full');
  });

  it('A1: a family lands without a Defaults object (kbd + spin, one finding per vocabulary prop)', () => {
    expect(of(report, 'A1-family-defaults-missing', 'kbd').map((f) => f.prop).sort())
      .toEqual(['density', 'variant']);
    expect(of(report, 'A1-family-defaults-missing', 'spin').map((f) => f.prop).sort())
      .toEqual(['density', 'variant']);
  });

  it('A2: a bare function sneaks into slots (chip) — and an invalid slot covers nothing', () => {
    expect(of(report, 'A2-slot-not-factory-call', 'chip')).toHaveLength(1);
    // the rejected slot leaves the prop uncovered: A1-coverage fires too
    expect(of(report, 'A1-slot-coverage', 'chip')).toHaveLength(1);
  });

  it('A2: a no-values factory call without explicit type arguments (dialog: absentSlot bare)', () => {
    expect(of(report, 'A2-missing-type-args', 'dialog')).toHaveLength(1);
  });

  it('A2: defineAxisSlot is lib-only — a ui-side import/call fails (tooltip)', () => {
    expect(of(report, 'A2-define-axis-slot-outside-lib', 'tooltip').length).toBeGreaterThanOrEqual(2);
  });

  it('A3: the loose legacy chain fails (sheet: resolveDensity + getDensityContext inline)', () => {
    expect(of(report, 'A3-banned-channel', 'sheet')).toHaveLength(2);
  });

  it('A3: the empty call — bare-statement resolve fails (anchor); the four accepted forms stay legal (press-button clean)', () => {
    expect(of(report, 'A3-resolve-empty-call', 'anchor')).toHaveLength(1);
    const pb = report.findings.filter((f) => f.family === 'press-button');
    expect(pb, 'the legal placeholder (assignment/return/spread/template call sites) has zero findings').toEqual([]);
  });

  it('A4: a badge trying to reach link fails the availability table (values ≢ frozen row — one source, one finding)', () => {
    expect(of(report, 'A4-values-mismatch', 'badge')).toHaveLength(1);
  });

  it('A3: provider files — legacy helpers legal ONLY in provider-arg and $derived subtrees (table: exactly three out-of-subtree reads)', () => {
    const table = of(report, 'A3-banned-channel', 'table');
    expect(table).toHaveLength(3);
    // the two legal forms (provideDensity(() => resolveDensity(...)) and
    // const inherited = $derived(resolveDensity(..., getDensityContext(), ...)))
    // produce no findings — the three that fire are the plain statement,
    // the event handler and the template read
    expect(table.filter((f) => f.message.includes('[template]')).length).toBeGreaterThanOrEqual(1);
  });

  it('A5: a lib file importing the ui tree fails — both the alias and the relative form', () => {
    expect(of(report, 'A5-lib-to-ui')).toHaveLength(2);
  });

  it('A6: empty reasons and stale entries fail; the three exemption kinds hold their families clean', () => {
    expect(of(report, 'A6-empty-reason')).toHaveLength(1);
    expect(of(report, 'A6-stale-exemption')).toHaveLength(1);
    for (const exempted of ['component-canvas', 'icon-button', 'section-card']) {
      expect(report.findings.filter((f) => f.family === exempted), `${exempted} rides its exemption`).toEqual([]);
    }
  });

  it('census: every legacy occurrence is counted, banned split out (the retirement feed)', () => {
    const rd = report.census.resolveDensity;
    expect(rd.total).toBe(5); // sheet 1 + table 4 (2 legal provider forms included)
    expect(rd.banned).toBe(3); // sheet 1 + table event-handler 1 + template 1
    expect(rd.files.sort()).toEqual([
      'registry/files/ui/sheet/sheet.svelte',
      'registry/files/ui/table/table.svelte',
    ]);
  });
});

describe('verify-context-coverage — --scope=pilot restricts the family subset', () => {
  const { status, report } = runJson('root', '--scope=pilot');

  it('exits 1 (pilot families still violating)', () => {
    expect(status).toBe(1);
    expect(report.scope).toBe('pilot');
  });

  it('out-of-scope families are silent (spin/table/anchor and the exemption families)', () => {
    const families = new Set(report.findings.map((f) => f.family));
    for (const silent of ['spin', 'table', 'anchor', 'section-card', 'component-canvas']) {
      expect(families, `${silent} is outside the pilot subset`).not.toContain(silent);
    }
  });

  it('in-scope pilot families still report; tree laws stay on (lib→ui, axis-constructor boundary, exemption schema)', () => {
    const families = new Set(report.findings.map((f) => f.family));
    for (const present of ['kbd', 'badge', 'chip', 'dialog', 'sheet']) {
      expect(families, `${present} is a pilot family`).toContain(present);
    }
    // tooltip is out of pilot scope, but the defineAxisSlot boundary is
    // a TREE law — it stays on (design: canonical-tree-only protocol)
    expect(of(report, 'A2-define-axis-slot-outside-lib', 'tooltip').length).toBeGreaterThanOrEqual(2);
    expect(of(report, 'A5-lib-to-ui')).toHaveLength(2);
    expect(of(report, 'A6-empty-reason')).toHaveLength(1); // schema validation is scope-independent
    expect(of(report, 'A6-stale-exemption')).toHaveLength(0); // anchor is out of scope — not stale yet
  });
});

describe('verify-context-coverage — the clean tree', () => {
  it('exits 0 GREEN with an empty report', () => {
    const { status, report } = runJson('legal-root');
    expect(status).toBe(0);
    expect(report.ok).toBe(true);
    expect(report.findings).toEqual([]);
  });

  it('human output mode: RED names the violations, GREEN prints the ✓ lines', () => {
    const red = runGate('root');
    expect(red.status).toBe(1);
    expect(red.stderr).toContain('banned bypass channel');
    expect(red.stderr).toContain('RED');
    const green = runGate('legal-root');
    expect(green.status).toBe(0);
    expect(green.stderr).toContain('GREEN');
    expect(green.stdout).toContain('✓ A1 holds');
  });
});

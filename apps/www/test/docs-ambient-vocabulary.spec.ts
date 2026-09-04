/**
 * docs-ambient-vocabulary — the PropsTable three-state marker drift pin
 * (env-debt-cleanup task 2.3, 2026-09-04).
 *
 * The single machine source is the matrix fixture
 * (fixtures/docs-ambient-vocabulary.matrix.json): every entry freezes one
 * axis row's exact Default cell (`'<own>' · Own default, not ambient` /
 * `'ambient scope'`), its table identity (tableIndex = 0-based AST call-site
 * order; occurrence = 1-based ordinal of the same-named prop within that
 * table), and — where edited — the exact description string. Pages are
 * parsed with the real compiler stack (svelte/compiler + typescript AST),
 * never regex; TokenTable rows are excluded by component name at the AST
 * level. The row checker is a pure function so the negative fixtures below
 * feed it SYNTHETIC sources — the expectation matrix itself is never
 * mutated into a tested input (no self-proving loop).
 *
 * Beyond per-row pins:
 *   - schema: tableIndex/batch required, occurrence ≥ 1, unknown structured
 *     fields rejected, owner/title allowed only inside `note` text
 *   - own↔defaults lock: slotExport factories parsed from the family's
 *     *-defaults.svelte.ts (inline tuple OR imported-constant values, single
 *     or multiline calls); bareDefault must equal the factory's own argument
 *   - global deny (every component page): density rows never say
 *     'inherited' / the two retired description sentences
 *   - meta side: the six generated meta files carry ambient ∈ {zone,scope,
 *     own} on exact-key density/variant props (toast-viewport/card-grid
 *     legitimately have none)
 *   - bijection: tasks.md batch lists ↔ matrix (page-level batch equality +
 *     key multiset mutual coverage against the pages' non-exempt candidate
 *     axis rows — deleting a matrix row leaves a candidate uncovered, adding
 *     one finds no candidate)
 *   - exemptions: component-canvas#density is page-owned (no marker, keeps
 *     'comfortable' + "page-owned bindable" prose); inline-code#variant is
 *     the canonical definePaintSlot 'ambient zone' row — locked by its own
 *     invariant, outside the matrix bijection
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const WWW = resolve(HERE, '..');
const REPO = resolve(WWW, '../..');
const ROUTES = join(WWW, 'src/routes/docs/components');
const req = createRequire(join(WWW, 'package.json'));
const ts = req('typescript');
const { parse: parseSvelte } = req('svelte/compiler');

// ── the parser: svelte AST → PropsTable call sites → ts AST rows ─────────
type Row = Record<string, string>;

const AXIS_PROPS = new Set(['density', 'variant', 'tone', 'material', 'size']);

function tableExpressions(source: string): string[] {
  const ast = parseSvelte(source, { modern: true });
  // tableIndex = 0-based order over ALL PropsTable call sites — including
  // meta-driven ones that carry no props attribute (they hold an index slot
  // so a later table's identity cannot shift when one gains/loses meta)
  const attrs: ({ start: number; end: number } | null)[] = [];
  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') return;
    const n = node as Record<string, unknown>;
    if (n.type === 'Component' && n.name === 'PropsTable') {
      const attr = (n.attributes as { type: string; name: string; value?: unknown }[] | undefined)?.find(
        (a) => a.type === 'Attribute' && a.name === 'props',
      );
      const val = attr?.value;
      let expr: { start: number; end: number } | null = null;
      const tags = Array.isArray(val) ? val : [val];
      for (const t of tags) {
        const tag = t as { type?: string; expression?: { start: number; end: number } };
        if (tag?.type === 'ExpressionTag' && tag.expression) expr = { start: tag.expression.start, end: tag.expression.end };
      }
      attrs.push(expr);
    }
    for (const [k, v] of Object.entries(n)) {
      if (k === 'parent') continue;
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object' && (v as { type?: string }).type) walk(v);
    }
  };
  walk(ast.fragment);
  return attrs.map((expr) => (expr ? source.slice(expr.start, expr.end).trim() : ''));
}

function parseRows(exprText: string): Row[] {
  const sf = ts.createSourceFile('x.ts', `const x = ${exprText};`, ts.ScriptTarget.ESNext, true);
  let arr: ts.ArrayLiteralExpression | null = null;
  const visit = (n: ts.Node): void => {
    if (arr) return;
    if (ts.isArrayLiteralExpression(n)) {
      arr = n;
      return;
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  if (!arr) return [];
  return arr.elements.map((el) => {
    if (!ts.isObjectLiteralExpression(el)) return { raw: el.getText(sf) };
    const row: Row = {};
    for (const p of el.properties) {
      if (!ts.isPropertyAssignment(p)) continue;
      const key = p.name.getText(sf).replace(/^['"]|['"]$/g, '');
      let v = p.initializer.getText(sf);
      if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) v = v.slice(1, -1);
      row[key] = v;
    }
    return row;
  });
}

function axisRowsOf(source: string): { tableIndex: number; prop: string; ordinal: number; row: Row }[] {
  const counters = new Map<string, number>();
  const out: { tableIndex: number; prop: string; ordinal: number; row: Row }[] = [];
  tableExpressions(source).forEach((expr, tableIndex) => {
    for (const row of parseRows(expr)) {
      if (!AXIS_PROPS.has(row.name)) continue;
      const key = `${tableIndex}|${row.name}`;
      const ordinal = (counters.get(key) ?? 0) + 1;
      counters.set(key, ordinal);
      out.push({ tableIndex, prop: row.name, ordinal, row });
    }
  });
  return out;
}

const pageSource = (route: string): string => readFileSync(join(ROUTES, `${route}.html/+page.svelte`), 'utf8');

// ── the pure row checker ─────────────────────────────────────────────────
type Entry = {
  route: string;
  batch: string;
  tableIndex: number;
  prop: string;
  occurrence: number;
  bareDefault: string | null;
  marker: 'own' | 'scope';
  defaultsFile: string | null;
  slotExport: string | null;
  exactDescription: string | null;
  note?: string;
};

const expectedCell = (e: Entry): string =>
  e.marker === 'scope' ? 'ambient scope' : `'${e.bareDefault}' · Own default, not ambient`;

function checkPage(sourceText: string, e: Entry): string[] {
  const findings: string[] = [];
  const candidates = axisRowsOf(sourceText).filter(
    (c) => c.tableIndex === e.tableIndex && c.prop === e.prop && c.ordinal === e.occurrence,
  );
  if (candidates.length !== 1) {
    findings.push(`${e.route} table[${e.tableIndex}] ${e.prop}#${e.occurrence}: expected exactly 1 row, found ${candidates.length}`);
    return findings;
  }
  const row = candidates[0].row;
  if (row.default !== expectedCell(e)) {
    findings.push(`${e.route} table[${e.tableIndex}] ${e.prop}#${e.occurrence}: default is ${JSON.stringify(row.default ?? '(absent)')}, expected ${JSON.stringify(expectedCell(e))}`);
  }
  if (e.exactDescription !== null && row.description !== e.exactDescription) {
    findings.push(`${e.route} table[${e.tableIndex}] ${e.prop}#${e.occurrence}: description drifts from the frozen exact string`);
  }
  return findings;
}

// ── matrix + schema ──────────────────────────────────────────────────────
const MATRIX: Entry[] = JSON.parse(readFileSync(join(HERE, 'fixtures/docs-ambient-vocabulary.matrix.json'), 'utf8'));
const ALLOWED_FIELDS = new Set(['route', 'batch', 'tableIndex', 'prop', 'occurrence', 'bareDefault', 'marker', 'defaultsFile', 'slotExport', 'exactDescription', 'note']);

describe('matrix schema (the single machine source)', () => {
  it('every entry carries the frozen identity fields and nothing else', () => {
    for (const e of MATRIX) {
      for (const k of Object.keys(e)) expect(ALLOWED_FIELDS.has(k), `${e.route}: unknown field ${k}`).toBe(true);
      expect(e.tableIndex, `${e.route}: tableIndex required`).toBeGreaterThanOrEqual(0);
      expect(e.occurrence, `${e.route}: occurrence is 1-based`).toBeGreaterThanOrEqual(1);
      expect(['A', 'B'], `${e.route}: batch enum`).toContain(e.batch);
      expect(['own', 'scope'], `${e.route}: marker enum`).toContain(e.marker);
      if (e.marker === 'own') expect(typeof e.bareDefault).toBe('string');
      expect(e).not.toHaveProperty('owner');
      expect(e).not.toHaveProperty('title');
    }
  });

  it('tableIndex is unique per route+prop scope where tables differ (route-local identity)', () => {
    const seen = new Set(MATRIX.map((e) => `${e.route}|${e.tableIndex}|${e.prop}|${e.occurrence}`));
    expect(seen.size).toBe(MATRIX.length);
  });
});

// ── the real pages against the matrix ───────────────────────────────────
describe('PropsTable ambient vocabulary — the frozen matrix holds on the real pages', () => {
  for (const e of MATRIX) {
    it(`${e.route} table[${e.tableIndex}] ${e.prop}#${e.occurrence} → ${expectedCell(e)}`, () => {
      expect(checkPage(pageSource(e.route), e)).toEqual([]);
    });
  }
});

// ── own↔defaults lock ────────────────────────────────────────────────────
function slotOwnValue(defaultsFile: string, slotExport: string): string | null {
  const source = readFileSync(join(REPO, defaultsFile), 'utf8');
  const sf = ts.createSourceFile('d.ts', source, ts.ScriptTarget.ESNext, true);
  let own: string | null = null;
  const visit = (n: ts.Node): void => {
    if (own !== null) return;
    if (ts.isVariableStatement(n)) {
      const decl = n.declarationList.declarations[0];
      if (decl && ts.isIdentifier(decl.name) && decl.name.text === slotExport && decl.initializer && ts.isCallExpression(decl.initializer)) {
        const callee = decl.initializer.expression.getText(sf);
        const args = decl.initializer.arguments;
        const idx = callee.includes('defineOpenSlot') ? 0 : 1;
        const arg = args[idx];
        if (arg && ts.isStringLiteral(arg)) own = arg.text;
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return own;
}

describe('own↔defaults lock — the docs own literal equals the slot factory own argument', () => {
  for (const e of MATRIX) {
    if (!e.defaultsFile || !e.slotExport) continue;
    it(`${e.route}#${e.prop} ↔ ${e.slotExport}`, () => {
      expect(slotOwnValue(e.defaultsFile, e.slotExport!), `factory ${e.slotExport} own argument`).toBe(e.bareDefault);
    });
  }
});

// ── negative fixtures: synthetic sources, immutable expectations ─────────
describe('negative fixtures — the checker rejects drift (no self-proving loop)', () => {
  it('a variant default drifting to ambient zone is flagged', () => {
    const synthetic = `<PropsTable props={[{ name: 'variant', type: "'a' | 'b'", default: "'a' · ambient zone" }]} />`;
    expect(checkPage(synthetic, fakeEntry({ marker: 'own', bareDefault: 'a' })).length).toBeGreaterThan(0);
  });

  it('a missing default field is flagged', () => {
    const synthetic = `<PropsTable props={[{ name: 'density', type: 'Density' }]} />`;
    expect(checkPage(synthetic, fakeEntry({ marker: 'scope' })).length).toBeGreaterThan(0);
  });

  it('a wrong-table row (the swap attack) is flagged', () => {
    const synthetic = [
      `<PropsTable props={[{ name: 'x' }]} />`,
      `<PropsTable props={[{ name: 'variant', type: "'a'", default: "'a' · Own default, not ambient" }]} />`,
    ].join('\n');
    // the matrix says the variant lives in table 0; here it is in table 1
    expect(checkPage(synthetic, fakeEntry({ tableIndex: 0, marker: 'own', bareDefault: 'a' })).length).toBeGreaterThan(0);
  });

  it('a duplicated occurrence is flagged (two same-named rows cannot both be occurrence 1)', () => {
    const synthetic = `<PropsTable props={[{ name: 'variant', type: "'a'", default: "'a' · Own default, not ambient" }, { name: 'variant', type: "'b'", default: "'b' · Own default, not ambient" }]} />`;
    // occurrence 2 exists — checking occurrence 2 must pass shape-wise, but a matrix claiming occurrence 3 finds nothing
    expect(checkPage(synthetic, fakeEntry({ occurrence: 3, marker: 'own', bareDefault: 'a' })).length).toBeGreaterThan(0);
  });

  it('an exactDescription drift is flagged', () => {
    const synthetic = `<PropsTable props={[{ name: 'tone', default: "'default' · Own default, not ambient", description: 'rewritten prose' }]} />`;
    expect(checkPage(synthetic, fakeEntry({ prop: 'tone', marker: 'own', bareDefault: 'default', exactDescription: 'frozen prose' })).length).toBeGreaterThan(0);
  });
});

function fakeEntry(over: Partial<Entry>): Entry {
  return {
    route: 'synthetic', batch: 'A', tableIndex: 0, prop: 'variant', occurrence: 1,
    bareDefault: 'a', marker: 'own', defaultsFile: null, slotExport: null, exactDescription: null, ...over,
  };
}

// ── global deny: no retired vocabulary anywhere in the component docs ────
describe('global deny — retired density vocabulary is gone from every component page', () => {
  const routes = readdirSync(ROUTES).filter((d) => d.endsWith('.html'));
  it('the sweep covers the whole fleet', () => {
    expect(routes.length).toBeGreaterThan(80);
  });
  for (const route of routes) {
    it(`${route}: no 'inherited' default / retired sentences`, () => {
      for (const c of axisRowsOf(pageSource(route.replace(/\.html$/, '')))) {
        if (c.prop === 'density') {
          expect(c.row.default, `${route} density default`).not.toBe('inherited');
          expect(c.row.description ?? '', `${route} density description`).not.toContain('Overrides inherited density');
          expect(c.row.description ?? '', `${route} density description`).not.toContain('Overrides the inherited density scope');
        }
      }
    });
  }
});

// ── meta side: the six generated meta files carry ambient on axis props ──
describe('meta side — generated meta ambient fields on exact-key axis props', () => {
  const META_DIR = join(WWW, 'src/lib/meta');
  const expectedCarriers = new Set(['checkbox', 'combobox', 'date-picker', 'popover', 'press-button', 'select']);
  it('exactly the six known carriers have axis props', () => {
    const carriers = new Set<string>();
    for (const f of readdirSync(META_DIR).filter((f) => f.endsWith('.meta.ts'))) {
      const source = readFileSync(join(META_DIR, f), 'utf8');
      const sf = ts.createSourceFile('m.ts', source, ts.ScriptTarget.ESNext, true);
      const visit = (n: ts.Node): void => {
        if (ts.isPropertyAssignment(n) && ts.isStringLiteral(n.name) && (n.name.text === 'density' || n.name.text === 'variant')) {
          carriers.add(f.replace('.meta.ts', ''));
        }
        ts.forEachChild(n, visit);
      };
      visit(sf);
    }
    expect([...carriers].sort()).toEqual([...expectedCarriers].sort());
  });
  for (const name of expectedCarriers) {
    it(`${name}.meta.ts: axis props carry ambient ∈ {zone, scope, own}`, () => {
      const source = readFileSync(join(META_DIR, `${name}.meta.ts`), 'utf8');
      const sf = ts.createSourceFile('m.ts', source, ts.ScriptTarget.ESNext, true);
      const visit = (n: ts.Node): void => {
        if (ts.isPropertyAssignment(n) && ts.isStringLiteral(n.name) && (n.name.text === 'density' || n.name.text === 'variant')) {
          expect(ts.isObjectLiteralExpression(n.initializer), `${name} ${n.name.text} value is an object`).toBe(true);
          const obj = n.initializer as ts.ObjectLiteralExpression;
          const ambient = obj.properties.find((p) => ts.isPropertyAssignment(p) && ts.isStringLiteral(p.name) && p.name.text === 'ambient') as ts.PropertyAssignment | undefined;
          expect(ambient, `${name} ${n.name.text} has an ambient field`).toBeDefined();
          const v = (ambient!.initializer as ts.StringLiteral).text;
          expect(['zone', 'scope', 'own'], `${name} ${n.name.text} ambient enum`).toContain(v);
        }
        ts.forEachChild(n, visit);
      };
      visit(sf);
    });
  }
});

// ── exemptions: the two rows outside the economy by design ───────────────
describe('exemptions', () => {
  it('component-canvas#density stays page-owned (no marker, comfortable, page-owned prose)', () => {
    const rows = axisRowsOf(pageSource('component-canvas')).filter((c) => c.prop === 'density');
    expect(rows.length).toBe(1);
    expect(rows[0].row.default).toBe("'comfortable'");
    expect(rows[0].row.default).not.toContain('ambient');
    expect(rows[0].row.description).toContain('page-owned bindable');
  });

  it("inline-code#variant keeps its canonical definePaintSlot 'ambient zone' cell (never edited, never matrix-bound)", () => {
    const rows = axisRowsOf(pageSource('inline-code')).filter((c) => c.prop === 'variant');
    expect(rows.length).toBe(1);
    expect(rows[0].row.default).toContain('ambient zone');
  });
});

// ── bijection: tasks.md batch lists ↔ matrix ↔ the pages' candidate rows ─
describe('matrix↔tasks bijection', () => {
  const tasksMd = readFileSync(join(REPO, 'openspec/changes/2026-09-04-env-debt-cleanup/tasks.md'), 'utf8');

  const batchRoutes = (batch: 'A' | 'B'): string[] => {
    const sec = tasksMd.split(`**批次 ${batch}**`)[1]?.split('\n- [')[0] ?? '';
    return [...sec.matchAll(/([a-z][a-z0-9-]{2,})/g)].map((m) => m[1]).filter(
      (t) => MATRIX.some((e) => e.route === t) && !['section-card（tone', '行'].includes(t),
    );
  };

  it('route→batch is page-level equal both ways', () => {
    const byRoute = new Map<string, Set<string>>();
    for (const e of MATRIX) byRoute.set(e.route, (byRoute.get(e.route) ?? new Set()).add(e.batch));
    for (const [route, batches] of byRoute) expect(batches.size, `${route} spans one batch`).toBe(1);
    for (const b of ['A', 'B'] as const) {
      const listed = [...new Set(batchRoutes(b))].sort();
      const matrixRoutes = [...new Set(MATRIX.filter((e) => e.batch === b).map((e) => e.route))].sort();
      expect(listed, `batch ${b} list`).toEqual(matrixRoutes);
    }
  });

  it('the key multiset mutually covers the pages’ non-exempt candidate rows', () => {
    const matrixKeys = new Set(MATRIX.map((e) => `${e.route}|${e.tableIndex}|${e.prop}|${e.occurrence}`));
    const candidateKeys = new Set<string>();
    for (const route of new Set(MATRIX.map((e) => e.route))) {
      for (const c of axisRowsOf(pageSource(route))) {
        if (route === 'inline-code' && c.prop === 'variant') continue; // exempt: invariant-locked
        candidateKeys.add(`${route}|${c.tableIndex}|${c.prop}|${c.ordinal}`);
      }
    }
    const uncovered = [...candidateKeys].filter((k) => !matrixKeys.has(k));
    const orphaned = [...matrixKeys].filter((k) => !candidateKeys.has(k));
    expect(uncovered, 'candidate rows the matrix forgot (delete-attack surface)').toEqual([]);
    expect(orphaned, 'matrix rows with no candidate (add-attack surface)').toEqual([]);
  });

  it('deleting a matrix row is RED (the bijection catches it)', () => {
    const matrixKeys = new Set(MATRIX.map((e) => `${e.route}|${e.tableIndex}|${e.prop}|${e.occurrence}`));
    matrixKeys.delete([...matrixKeys][0]);
    const candidateKeys = new Set<string>();
    for (const route of new Set(MATRIX.map((e) => e.route))) {
      for (const c of axisRowsOf(pageSource(route))) {
        if (route === 'inline-code' && c.prop === 'variant') continue;
        candidateKeys.add(`${route}|${c.tableIndex}|${c.prop}|${c.ordinal}`);
      }
    }
    expect([...candidateKeys].filter((k) => !matrixKeys.has(k)).length).toBeGreaterThan(0);
  });
});

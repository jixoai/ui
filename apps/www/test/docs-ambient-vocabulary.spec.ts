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
import { existsSync, readFileSync, readdirSync } from 'node:fs';
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

// the schema checker as a PURE function so negative fixtures can prove
// it CATCHES violations (impl-review r2 S4: an own row missing its
// lock fields must be a schema violation, never a silent skip)
const schemaViolations = (matrix: Entry[]): string[] => {
  const out: string[] = [];
  for (const e of matrix) {
    for (const k of Object.keys(e)) if (!ALLOWED_FIELDS.has(k)) out.push(`${e.route}: unknown field ${k}`);
    if (!(e.tableIndex >= 0)) out.push(`${e.route}: tableIndex required`);
    if (!(e.occurrence >= 1)) out.push(`${e.route}: occurrence is 1-based`);
    if (!['A', 'B'].includes(e.batch)) out.push(`${e.route}: batch enum`);
    if (!['own', 'scope'].includes(e.marker)) out.push(`${e.route}: marker enum`);
    if (e.marker === 'own') {
      if (typeof e.bareDefault !== 'string') out.push(`${e.route}: own rows require bareDefault`);
      // the own↔defaults lock is not optional: omitting the pair would
      // silently exempt a row from the factory cross-check
      if (typeof e.defaultsFile !== 'string' || !e.defaultsFile) out.push(`${e.route}: own rows require defaultsFile`);
      if (typeof e.slotExport !== 'string' || !e.slotExport) out.push(`${e.route}: own rows require slotExport`);
    } else {
      // the fixture convention: scope rows carry explicit nulls — any
      // truthy smuggle is a violation
      if (e.defaultsFile ?? null) out.push(`${e.route}: non-own rows must not carry defaultsFile`);
      if (e.slotExport ?? null) out.push(`${e.route}: non-own rows must not carry slotExport`);
    }
    if ('owner' in e) out.push(`${e.route}: owner not allowed`);
    if ('title' in e) out.push(`${e.route}: title not allowed`);
  }
  return out;
};

describe('matrix schema (the single machine source)', () => {
  it('every entry carries the frozen identity fields and nothing else', () => {
    expect(schemaViolations(MATRIX)).toEqual([]);
  });

  it('an own row missing its lock fields is a violation (no silent skip)', () => {
    const mutated = structuredClone(MATRIX);
    const target = mutated.find((e) => e.marker === 'own')!;
    delete target.defaultsFile;
    delete target.slotExport;
    const v = schemaViolations(mutated);
    expect(v.some((s) => s.includes('require defaultsFile'))).toBe(true);
    expect(v.some((s) => s.includes('require slotExport'))).toBe(true);
  });

  it('a scope row smuggling lock fields is a violation', () => {
    const mutated = structuredClone(MATRIX);
    const target = mutated.find((e) => e.marker !== 'own')!;
    target.defaultsFile = 'registry/files/ui/x/x-defaults.svelte.ts';
    target.slotExport = 'X_SLOT';
    expect(schemaViolations(mutated).some((s) => s.includes('must not carry'))).toBe(true);
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
// (impl-review r1 hardening, 2026-09-04: the route universe is derived
// INDEPENDENTLY of the matrix — tasks.md's frozen batch lists, each token
// validated against the filesystem page directories — so deleting every
// entry of a route leaves that route's candidate rows uncovered instead
// of silently shrinking the candidate set. Pages OUTSIDE the batches keep
// their marker-less axis rows as recognized debt (zero-increment policy)
// and are deliberately not bijection candidates. Removing a route from
// BOTH the matrix and the archived tasks.md would evade this test — that
// attack rewrites the frozen archive and is git history's to catch, not
// a runtime gate's. Keys compare as MULTISETS (count maps), so a
// duplicated occurrence or an extra same-key entry cannot cancel against
// a missing one.)
describe('matrix↔tasks bijection', () => {
  const tasksMd = readFileSync(
    join(REPO, 'openspec/changes/archive/2026-09-04-env-debt-cleanup/tasks.md'),
    'utf8',
  );

  // the independent route universe: every docs page directory that really
  // exists on disk (the matrix is never consulted)
  const pageUniverse = readdirSync(ROUTES, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.endsWith('.html'))
    .map((d) => d.name.slice(0, -'.html'.length))
    .filter((name) => existsSync(join(ROUTES, `${name}.html`, '+page.svelte')));

  // segment-based batch parsing (impl-review r2 S2): each 、/＋-separated
  // segment names exactly ONE route (its first page-shaped token) — no
  // Set-dedup, no silent filtering. A duplicated route or an unknown
  // page token in a batch list is a PARSE VIOLATION, not a dropped entry
  const parseBatches = (md: string): { A: string[]; B: string[]; violations: string[] } => {
    const violations: string[] = [];
    const parse = (batch: 'A' | 'B'): string[] => {
      const sec = md.split(`**批次 ${batch}**`)[1]?.split('\n- [')[0] ?? '';
      const routes: string[] = [];
      for (const segment of sec.split(/[、＋]/)) {
        const token = segment.match(/[a-z][a-z0-9-]{2,}/)?.[0];
        if (!token) continue; // pure prose segments (「（12 页）」 etc.)
        if (!pageUniverse.includes(token)) violations.push(`batch ${batch}: '${token}' is not a docs page`);
        routes.push(token);
      }
      for (const r of new Set(routes)) {
        const n = routes.filter((x) => x === r).length;
        if (n > 1) violations.push(`batch ${batch}: '${r}' listed ${n} times`);
      }
      return routes;
    };
    return { A: parse('A'), B: parse('B'), violations };
  };

  // the bijection domain: exactly the batch-declared routes (tasks.md is
  // the frozen source; the filesystem validates it), never the matrix's
  const tasksUniverse = [...parseBatches(tasksMd).A, ...parseBatches(tasksMd).B];

  const keyOf = (route: string, tableIndex: number, prop: string, occ: number) =>
    `${route}|${tableIndex}|${prop}|${occ}`;
  const countMap = (keys: string[]): Map<string, number> => {
    const m = new Map<string, number>();
    for (const k of keys) m.set(k, (m.get(k) ?? 0) + 1);
    return m;
  };

  // candidate keys from the tasks universe; (tableIndex, prop, ordinal) is
  // unique per page by construction, so each candidate key counts once
  const candidateKeys = (): string[] => {
    const out: string[] = [];
    for (const route of tasksUniverse) {
      for (const c of axisRowsOf(pageSource(route))) {
        if (route === 'inline-code' && c.prop === 'variant') continue; // exempt: invariant-locked
        out.push(keyOf(route, c.tableIndex, c.prop, c.ordinal));
      }
    }
    return out;
  };

  // the pure comparator: mutated matrix CLONES feed this in the negatives —
  // the real fixture is never a tested input of its own proof
  const diffKeys = (matrix: Entry[]) => {
    const mCounts = countMap(matrix.map((e) => keyOf(e.route, e.tableIndex, e.prop, e.occurrence)));
    const cCounts = countMap(candidateKeys());
    const uncovered: string[] = [];
    const orphaned: string[] = [];
    const countMismatch: string[] = [];
    for (const [k, n] of cCounts) {
      const m = mCounts.get(k) ?? 0;
      if (m === 0) uncovered.push(k);
      else if (m !== n) countMismatch.push(`${k}: pages ${n} vs matrix ${m}`);
    }
    for (const [k, n] of mCounts) {
      const c = cCounts.get(k) ?? 0;
      if (c === 0) orphaned.push(k);
      else if (c !== n && !countMismatch.some((s) => s.startsWith(`${k}:`))) countMismatch.push(`${k}: pages ${c} vs matrix ${n}`);
    }
    return { uncovered, orphaned, countMismatch };
  };

  it('route→batch is page-level equal both ways', () => {
    const parsed = parseBatches(tasksMd);
    expect(parsed.violations, 'batch lists name real pages exactly once').toEqual([]);
    const byRoute = new Map<string, Set<string>>();
    for (const e of MATRIX) byRoute.set(e.route, (byRoute.get(e.route) ?? new Set()).add(e.batch));
    for (const [route, batches] of byRoute) expect(batches.size, `${route} spans one batch`).toBe(1);
    for (const [b, listed] of [['A', parsed.A], ['B', parsed.B]] as const) {
      const matrixRoutes = [...new Set(MATRIX.filter((e) => e.batch === b).map((e) => e.route))].sort();
      expect([...new Set(listed)].sort(), `batch ${b} list`).toEqual(matrixRoutes);
    }
  });

  it('a duplicated route in a batch list is a PARSE VIOLATION (not silently deduped)', () => {
    const mutated = tasksMd.replace('**批次 A**（12 页）：alert-dialog、avatar', '**批次 A**（12 页）：alert-dialog、avatar、avatar');
    expect(mutated).not.toBe(tasksMd); // the mutation must have landed
    expect(parseBatches(mutated).violations.some((v) => v.includes("'avatar' listed 2 times"))).toBe(true);
  });

  it('an unknown page token in a batch list is a PARSE VIOLATION (not silently filtered)', () => {
    const mutated = tasksMd.replace('**批次 A**（12 页）：alert-dialog、avatar', '**批次 A**（12 页）：alert-dialog、ghost-page');
    expect(mutated).not.toBe(tasksMd); // the mutation must have landed
    expect(parseBatches(mutated).violations.some((v) => v.includes("'ghost-page' is not a docs page"))).toBe(true);
  });

  it('every matrix route is a real docs page (no invented routes)', () => {
    for (const e of MATRIX) expect(pageUniverse, `${e.route} exists on disk`).toContain(e.route);
  });

  it('the key multiset mutually covers the pages’ non-exempt candidate rows', () => {
    const { uncovered, orphaned, countMismatch } = diffKeys(MATRIX);
    expect(uncovered, 'candidate rows the matrix forgot (delete-attack surface)').toEqual([]);
    expect(orphaned, 'matrix rows with no candidate (add-attack surface)').toEqual([]);
    expect(countMismatch, 'same-key multiplicity disagrees (duplicate-attack surface)').toEqual([]);
  });

  it('deleting EVERY entry of a route is RED (filesystem universe, not matrix-derived)', () => {
    const victim = MATRIX[0].route;
    const mutated = MATRIX.filter((e) => e.route !== victim);
    const { uncovered } = diffKeys(mutated);
    expect(uncovered.some((k) => k.startsWith(`${victim}|`)), `${victim} candidates left uncovered`).toBe(true);
  });

  it('adding a duplicate-key entry is RED (multiset, not Set)', () => {
    const mutated = [...structuredClone(MATRIX), structuredClone(MATRIX[0])];
    const { countMismatch } = diffKeys(mutated);
    expect(countMismatch.length).toBeGreaterThan(0);
  });

  it('duplicating an occurrence inside one table is RED (1 candidate vs 2 matrix rows)', () => {
    const mutated = structuredClone(MATRIX);
    const target = mutated.find(
      (e) =>
        e.occurrence === 1 &&
        mutated.filter((o) => o.route === e.route && o.tableIndex === e.tableIndex && o.prop === e.prop).length === 1,
    );
    target.occurrence = 2;
    const { uncovered, orphaned } = diffKeys(mutated);
    expect(uncovered.length + orphaned.length).toBeGreaterThan(0);
  });

  it('A/B-swapping a route between batches is RED (batch equality catches it)', () => {
    const mutated = structuredClone(MATRIX);
    mutated[0].batch = mutated[0].batch === 'A' ? 'B' : 'A';
    const spans = new Map<string, Set<string>>();
    for (const e of mutated) spans.set(e.route, (spans.get(e.route) ?? new Set()).add(e.batch));
    expect([...spans.values()].some((s) => s.size > 1)).toBe(true);
  });
});

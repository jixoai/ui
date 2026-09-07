/**
 * The DLD pure-TS layers suite (test/dld-layers.spec.ts,
 * highlight-lang-detector, 2026-09-07).
 *
 * Locks, per design D8.1 / D3.1 / D3.2 / D3.3 and the lang-detection
 * spec scenarios:
 *   - the canonical table's parseable grammar — five classes of
 *     violation throw naming the field and the offending line;
 *   - the exactly-once betlang law: each of betlang 0.1.1's 48 model
 *     labels maps to one canonical or is explicitly unmapped (absent —
 *     the runtime null + one-shot warn of D4);
 *   - L1's frozen filename boundaries (last-dot lowercase extension,
 *     both path separators, case-sensitive exact basenames, dotfiles);
 *   - L2's shebang/modeline boundaries (env forms, -S, BOM, args);
 *   - L3's probe matrix incl. the Markdown-interference negatives
 *     (Rust/Go/Kotlin/Swift fingerprints must penetrate to L4) and the
 *     front-matter double state;
 *   - the layer short-circuit law (an L1 hit leaves L2/L3 unevaluated
 *     — vi.doMock module-evaluation counters; the unselected layers'
 *     counters never move across calls).
 *
 * No sample here may fall through L1-L3: this suite locks the pure-TS
 * layers only — L4 (betlang-detector, wasm) has its own real-wasm
 * suite in betlang-detector.spec.ts, and the layer short-circuit
 * tests below prove the waterfall never reaches it when L1-L3 answer.
 */
import { describe, expect, it, vi } from 'vitest';

import { detectByFilename } from '$lib/highlight/detect-ext-table';
import { detectByShebang } from '$lib/highlight/detect-shebang-table';
import { detectByStructure } from '$lib/highlight/detect-structure';
import { defaultLangDetector } from '$lib/highlight/default-detector';
import {
  canonicalTable,
  getBasenameMap,
  getBetlangLabelMap,
  getExtMap,
  getInterpMap,
  parseCanonical,
} from '$lib/highlight/lang-canonical';

describe('lang-canonical — the parseable grammar', () => {
  it('the shipped table parses: every ext/file/interp value is unique across rows', () => {
    const table = canonicalTable();
    expect(table.rows.length).toBe(44);
    // uniqueness is a parse law — reaching here means it held; spot the
    // three derived views the layers consume
    expect(getExtMap().get('ts')).toBe('typescript');
    expect(getBasenameMap().get('.babelrc')).toBe('json');
    expect(getInterpMap().get('python3')).toBe('python');
  });

  it('SCALAR comma: a canonical id containing a comma is a parse error', () => {
    expect(() => parseCanonical('a,b betlang=-')).toThrow(
      /canonical.*comma|"a,b"/,
    );
  });

  it('SCALAR comma: a betlang value containing a comma is a parse error', () => {
    expect(() => parseCanonical('foo betlang=A,B ext=x')).toThrow(/betlang/);
    expect(() => parseCanonical('foo betlang=A,B ext=x')).toThrow(/A,B/);
  });

  it('leading / trailing / consecutive commas in a LIST are parse errors', () => {
    expect(() => parseCanonical('foo betlang=- ext=,ts')).toThrow(/ext/);
    expect(() => parseCanonical('foo betlang=- ext=,ts')).toThrow(/comma/);
    expect(() => parseCanonical('foo betlang=- ext=ts,')).toThrow(/ext.*comma/);
    expect(() => parseCanonical('foo betlang=- ext=ts,,tsx')).toThrow(/ext/);
    expect(() => parseCanonical('foo betlang=- ext=ts,,tsx')).toThrow(/consecutive/);
  });

  it('a duplicate list item is a parse error naming the field', () => {
    expect(() => parseCanonical('foo betlang=- ext=ts,ts')).toThrow(/ext/);
    expect(() => parseCanonical('foo betlang=- ext=ts,ts')).toThrow(/duplicate.*ts/);
  });

  it('a duplicate canonical across rows is a parse error', () => {
    expect(() => parseCanonical('foo betlang=-\nfoo betlang=- ext=x')).toThrow(
      /canonical.*duplicate/,
    );
  });

  it('a repeated field within one row is a parse error naming the field', () => {
    expect(() => parseCanonical('foo betlang=- ext=x ext=y')).toThrow(
      /ext.*repeat/,
    );
  });

  it('the betlang field is required — omission is a parse error', () => {
    expect(() => parseCanonical('foo ext=x')).toThrow(/betlang/);
  });

  it('cross-row duplicate ext/file/interp values are parse errors', () => {
    expect(() =>
      parseCanonical('foo betlang=- ext=ts\nbar betlang=- ext=ts'),
    ).toThrow(/ext.*more than one row/);
    expect(() =>
      parseCanonical('foo betlang=- file=Rakefile\nbar betlang=- file=Rakefile'),
    ).toThrow(/file.*more than one row/);
    expect(() =>
      parseCanonical('foo betlang=- interp=node\nbar betlang=- interp=node'),
    ).toThrow(/interp.*more than one row/);
  });
});

describe('lang-canonical — the exactly-once betlang law', () => {
  /** betlang 0.1.1's full model-label universe (src/language.rs, 48) */
  const ALL_48_LABELS = [
    'Asm', 'Batch', 'C', 'Clojure', 'CMake', 'Cobol', 'Cpp', 'Cs', 'Css',
    'Dart', 'Dockerfile', 'Elixir', 'Erlang', 'Gemfile', 'Gemspec', 'Go',
    'Gradle', 'Groovy', 'Haskell', 'Html', 'Ini', 'Java', 'JavaScript',
    'Json', 'Julia', 'Kotlin', 'Lisp', 'Lua', 'Markdown', 'ObjectiveC',
    'Ocaml', 'Perl', 'Php', 'Powershell', 'Python', 'R', 'Ruby', 'Rust',
    'Scala', 'Shell', 'Sql', 'Swift', 'Toml', 'TypeScript', 'Vba',
    'Verilog', 'Xml', 'Yaml',
  ] as const;

  /** the labels D4 names unmapped plus the mined rest (null + warn) */
  const UNMAPPED_16 = [
    'Batch', 'Clojure', 'CMake', 'Cobol', 'Erlang', 'Gemfile', 'Gemspec',
    'Gradle', 'Groovy', 'Haskell', 'Julia', 'Lisp', 'Ocaml', 'Scala',
    'Vba', 'Verilog',
  ] as const;

  it('each of the 48 labels maps to exactly one canonical or is explicitly unmapped', () => {
    const labels = getBetlangLabelMap();
    for (const label of ALL_48_LABELS) {
      const owners = canonicalTable().rows.filter(
        (row) => row.betlang === label,
      );
      expect(owners.length, label).toBeLessThanOrEqual(1);
      if (UNMAPPED_16.includes(label)) {
        expect(labels.has(label), `${label} must be unmapped (null at runtime)`).toBe(false);
      } else {
        expect(labels.has(label), `${label} must be mapped`).toBe(true);
      }
    }
    expect(labels.size).toBe(48 - UNMAPPED_16.length);
  });

  it('spot mappings incl. the namespace rulings', () => {
    const labels = getBetlangLabelMap();
    expect(labels.get('TypeScript')).toBe('typescript');
    expect(labels.get('Shell')).toBe('bash');
    expect(labels.get('Cs')).toBe('csharp');
    expect(labels.get('ObjectiveC')).toBe('objective-c');
    expect(labels.get('Asm')).toBe('assembly');
    expect(labels.get('Ini')).toBe('ini');
    expect(labels.get('R')).toBe('r');
    expect(labels.get('Cpp')).toBe('cpp');
  });

  it('the ini row survives with no rendering engine (L3 + label keep it canonical)', () => {
    const ini = canonicalTable().rows.find((row) => row.canonical === 'ini');
    expect(ini?.betlang).toBe('Ini');
    expect(ini?.backend).toEqual([]);
  });
});

describe('L1 — detect-ext-table boundaries', () => {
  it('the extension is the LAST dot suffix, lowercased', () => {
    expect(detectByFilename('main.TS')).toBe('typescript');
    expect(detectByFilename('foo.d.ts')).toBe('typescript');
    expect(detectByFilename('app.PY')).toBe('python');
    expect(detectByFilename('a.b.py')).toBe('python');
  });

  it('both / and \\ cut the path — the last segment answers', () => {
    expect(detectByFilename('src/main.py')).toBe('python');
    expect(detectByFilename('src\\lib\\main.py')).toBe('python');
    expect(detectByFilename('C:\\dev\\main.go')).toBe('go');
  });

  it('the basename table is exact and case-sensitive', () => {
    expect(detectByFilename('Dockerfile')).toBe('dockerfile');
    expect(detectByFilename('pkg/Dockerfile')).toBe('dockerfile');
    expect(detectByFilename('Containerfile')).toBe('dockerfile');
    expect(detectByFilename('dockerfile')).toBeNull(); // case law: no hit
    expect(detectByFilename('Gemfile')).toBe('ruby');
    expect(detectByFilename('Cargo.lock')).toBe('toml');
    expect(detectByFilename('README.me')).toBe('plaintext');
    expect(detectByFilename('PKGBUILD')).toBe('bash');
  });

  it('no make/cmake rows: uncovered ids stay out of the namespace (D3.1 ruling)', () => {
    expect(detectByFilename('Makefile')).toBeNull();
    expect(detectByFilename('makefile')).toBeNull();
    expect(detectByFilename('Makefile.old')).toBeNull();
    expect(detectByFilename('CMakeLists.txt')).toBeNull(); // txt is ambiguous too
  });

  it('dotfiles walk the basename table — a leading dot is not an extension', () => {
    expect(detectByFilename('.babelrc')).toBe('json');
    expect(detectByFilename('.zshrc')).toBe('bash');
    // the dotfile's own basename miss does NOT promote its suffix: .json
    // is the ambiguous set's (L3/L4 own it), and a leading dot never
    // becomes an extension anyway
    expect(detectByFilename('.babelrc.json')).toBeNull();
    expect(detectByFilename('.ts')).toBeNull(); // dotfile form: basename turn only
  });

  it('heuristics-ambiguous extensions stay out of L1 (L3/L4 own them)', () => {
    expect(detectByFilename('main.html')).toBeNull();
    expect(detectByFilename('data.json')).toBeNull();
    expect(detectByFilename('notes.md')).toBeNull();
    expect(detectByFilename('main.h')).toBeNull();
    expect(detectByFilename('main.rs')).toBeNull(); // the .rs block leaves it to L4
    expect(detectByFilename('conf.yaml')).toBeNull();
    expect(detectByFilename('script.cs')).toBeNull();
  });

  it('no opinion on extension-less, empty and trailing-separator names', () => {
    expect(detectByFilename('noext')).toBeNull();
    expect(detectByFilename('')).toBeNull();
    expect(detectByFilename('a/b/')).toBeNull();
  });
});

describe('L2 — detect-shebang-table boundaries', () => {
  it('the two shebang forms are equivalent', () => {
    expect(detectByShebang('#!/usr/bin/env python3\nimport os\n')).toBe('python');
    expect(detectByShebang('#!/usr/bin/python3\nimport os\n')).toBe('python');
    expect(detectByShebang('#!/bin/sh\nls -la\n')).toBe('bash');
    expect(detectByShebang('#!/usr/bin/env node\nx')).toBe('javascript');
  });

  it('interpreter arguments are ignored; env -S yields the first non-flag word', () => {
    expect(detectByShebang('#!/usr/bin/python3 -O\ncode()')).toBe('python');
    expect(detectByShebang('#!/usr/bin/env python3 -u\nx')).toBe('python');
    expect(detectByShebang('#!/usr/bin/env -S python3 -u\nx')).toBe('python');
  });

  it('a UTF-8 BOM before the shebang is stripped', () => {
    expect(detectByShebang('\uFEFF#!/usr/bin/env python\nx')).toBe('python');
    expect(detectByShebang('\uFEFF#!/usr/bin/env node\nx')).toBe('javascript');
  });

  it('the runtime rulings: node-family → javascript, deno/ts-node → typescript', () => {
    expect(detectByShebang('#!/usr/bin/env bun\nx')).toBe('javascript');
    expect(detectByShebang('#!/usr/bin/env deno\nx')).toBe('typescript');
    expect(detectByShebang('#!/usr/bin/env ts-node\nx')).toBe('typescript');
  });

  it('case-sensitive interpreter names from linguist', () => {
    expect(detectByShebang('#!/usr/bin/Rscript\nx <- 1')).toBe('r');
    expect(detectByShebang('#!/usr/bin/rscript\nx')).toBeNull();
  });

  it('the emacs first-line modeline — # comment form only', () => {
    expect(detectByShebang('# -*- mode: python -*-\nx')).toBe('python');
    expect(detectByShebang('# -*- mode: c++; -*-\nx')).toBe('cpp');
    expect(detectByShebang('# -*- mode: shell-script -*-\nx')).toBe('bash');
    expect(detectByShebang('// -*- mode: python -*-\nx')).toBeNull();
    expect(detectByShebang('# -*- mode: no-such-mode -*-\nx')).toBeNull();
  });

  it('no opinion without a first-line marker', () => {
    expect(detectByShebang('const x = 1;')).toBeNull();
    expect(detectByShebang('# just a comment')).toBeNull();
    expect(detectByShebang('#!/usr/bin/env\n')).toBeNull();
    expect(detectByShebang('')).toBeNull();
  });
});

describe('L3 — detect-structure probe matrix', () => {
  it('P_JSON: a whole-body parse is the hard evidence (scalars included)', () => {
    expect(detectByStructure('{"name": "jixoai", "v": [1, 2]}')).toEqual({
      lang: 'json',
      source: 'structure',
    });
    expect(detectByStructure('[1, 2, 3]')).toEqual({ lang: 'json', source: 'structure' });
    expect(detectByStructure('123')).toEqual({ lang: 'json', source: 'structure' });
    expect(detectByStructure('\uFEFF{"a": 1}')).toEqual({ lang: 'json', source: 'structure' });
  });

  it('P_JSON negative: a { first char that does not parse declares nothing', () => {
    expect(detectByStructure('{ "unterminated": ')).toBeNull();
  });

  it('P_SVG: the <svg root line and the <?xml…?><svg head pair', () => {
    expect(detectByStructure('<svg xmlns="http://www.w3.org/2000/svg">\n  <circle/>\n</svg>')).toEqual({
      lang: 'svg',
      source: 'structure',
    });
    expect(
      detectByStructure('<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg">\n<path d="M0 0"/>\n</svg>'),
    ).toEqual({ lang: 'svg', source: 'structure' });
  });

  it('P_XML: the declaration prefix is case-sensitive; SVG outranks it', () => {
    expect(detectByStructure('<?xml version="1.0"?>\n<catalog>\n  <book title="x"/>\n</catalog>')).toEqual({
      lang: 'xml',
      source: 'structure',
    });
    expect(detectByStructure('<?XML version="1.0"?>\n<catalog>\n  <b/>\n</catalog>')).toBeNull();
  });

  it('P_HTML: the doctype matches case-insensitively', () => {
    expect(detectByStructure('<!DOCTYPE html>\n<html lang="en">\n<body>hi</body>\n</html>')).toEqual({
      lang: 'html',
      source: 'structure',
    });
    expect(detectByStructure('<!doctype HTML>\n<html>\n</html>')).toEqual({
      lang: 'html',
      source: 'structure',
    });
  });

  it('P_YAML: leading --- with key-colon density ≥60%', () => {
    expect(detectByStructure('---\ntitle: Some Title\nauthor: jixoai\n')).toEqual({
      lang: 'yaml',
      source: 'structure',
    });
    // density 1/2 = 50% — under the threshold, no opinion
    expect(detectByStructure('---\nkey: value\nnot a mapping line at all\n')).toBeNull();
    // no leading --- at all
    expect(detectByStructure('name: value\nother: thing\nthird: one\n')).toBeNull();
  });

  it('P_YAML front-matter boundary: markdown after the second --- abstains', () => {
    expect(detectByStructure('---\ntitle: t\n---\n# Heading\nSome prose')).toBeNull();
    expect(detectByStructure('---\nlayout: post\n---\n```js\ncode()\n```')).toBeNull();
    expect(detectByStructure('---\ntitle: t\n---\n- item one\n- item two')).toBeNull();
    // the other state: marker-free multi-document YAML stays YAML
    expect(detectByStructure('---\na: 1\n---\nb: 2\n')).toEqual({
      lang: 'yaml',
      source: 'structure',
    });
  });

  it('P_TOML: a section line plus ≥2 spaced assignments; a single # comment survives', () => {
    expect(detectByStructure('[package]\nname = "mine"\nversion = "0.1.0"')).toEqual({
      lang: 'toml',
      source: 'structure',
    });
    expect(detectByStructure('# one comment line only\n[package]\nname = "x"\nversion = "1"')).toEqual({
      lang: 'toml',
      source: 'structure',
    });
  });

  it('P_INI: unspaced = assignments; TOML answers first when both shapes exist', () => {
    expect(detectByStructure('[section]\nkey=value\nother=value2')).toEqual({
      lang: 'ini',
      source: 'structure',
    });
    // mixed: two spaced (TOML) + one unspaced — the spaced = is TOML's
    // strong marker, so TOML wins the mutual-exclusion
    expect(detectByStructure('[cfg]\na = 1\nb = 2\nc=3')).toEqual({
      lang: 'toml',
      source: 'structure',
    });
    // spaces inside the section brackets are INI's shape, not TOML's
    expect(detectByStructure('[my section]\nkey=value\nkey2=v2')).toEqual({
      lang: 'ini',
      source: 'structure',
    });
  });

  it('the n ≥ 3 non-empty-line gate', () => {
    expect(detectByStructure('[s]\nk=v')).toBeNull();
    expect(detectByStructure('---\nk: v')).toBeNull();
  });

  it('guard_Markdown: fences (indented / closing / CRLF) and heading density abstain', () => {
    expect(detectByStructure('```rust\nfn main() {}\n```')).toBeNull();
    expect(detectByStructure('~~~\nplain\n~~~')).toBeNull();
    expect(detectByStructure('intro\n\n   ```\ncode here\n```')).toBeNull();
    expect(detectByStructure('```\r\nfn main() {}\r\n```\r\n')).toBeNull();
    expect(detectByStructure('# Title\n\n## Section\n\nbody')).toBeNull();
    // a SINGLE heading is not markdown density — prose with one # line
    // and no other shape stays no-opinion (penetrates to L4)
    expect(detectByStructure('# only heading\nsome prose\nmore prose')).toBeNull();
  });

  it('the Markdown-interference negatives: language fingerprints penetrate to L4', () => {
    expect(detectByStructure('fn main() {\n    println!("Hello, world!");\n}')).toBeNull();
    expect(
      detectByStructure('package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("hi")\n}'),
    ).toBeNull();
    expect(detectByStructure('fun main() {\n    println("hi")\n}')).toBeNull();
    expect(detectByStructure('import Foundation\n\nlet greeting = "hi"\nprint(greeting)')).toBeNull();
  });

  it('a markdown link line is not a section', () => {
    // [title](url) must not satisfy the section requirement, so this
    // TOML/INI-shaped body with only a link line declares nothing
    expect(detectByStructure('[title](url)\nkey = value\nother = value2')).toBeNull();
  });

  it('empty and whitespace-only bodies are no opinion', () => {
    expect(detectByStructure('')).toBeNull();
    expect(detectByStructure('   \n\n  \n')).toBeNull();
  });
});

describe('the DLD waterfall — L1-L3 paths (L4 is the parallel seam)', () => {
  it('L1 answers from the filename with source filename', async () => {
    const detector = defaultLangDetector();
    await expect(
      detector.detect({ code: 'whatever', filename: 'src/main.ts' }),
    ).resolves.toEqual({ lang: 'typescript', source: 'filename' });
  });

  it('an L1 miss with a shebang first line lands on L2', async () => {
    const detector = defaultLangDetector();
    await expect(
      detector.detect({ code: '#!/usr/bin/env python3\nimport os', filename: 'x.unknown' }),
    ).resolves.toEqual({ lang: 'python', source: 'shebang' });
  });

  it('no filename, no shebang — L3 answers structurally', async () => {
    const detector = defaultLangDetector();
    await expect(
      detector.detect({ code: '[package]\nname = "mine"\nversion = "0.1.0"' }),
    ).resolves.toEqual({ lang: 'toml', source: 'structure' });
  });

  // the trace channel (docs playground's live log): one event per
  // EXECUTED layer, hit/miss + detail + timing; skipped layers are the
  // negative space — L1 answering means no L2/L3/L4 event ever fires.
  it('an L1 hit traces exactly one event and nothing below it', async () => {
    const events: Array<{ layer: string; outcome: string; lang?: string }> = [];
    const detector = defaultLangDetector({
      onTrace: (e) => events.push({ layer: e.layer, outcome: e.outcome, lang: e.lang }),
    });
    const result = await detector.detect({ code: 'whatever', filename: 'src/main.ts' });
    expect(result).toEqual({ lang: 'typescript', source: 'filename' });
    expect(events).toEqual([
      { layer: 'L1', outcome: 'hit', lang: 'typescript' },
    ]);
  });

  it('a full cascade traces the miss order L1→L2→L3→L4 and the L4 event matches the verdict', async () => {
    const events: Array<{ layer: string; outcome: string; lang?: string }> = [];
    const detector = defaultLangDetector({
      onTrace: (e) => events.push({ layer: e.layer, outcome: e.outcome, lang: e.lang }),
    });
    const result = await detector.detect({
      code: 'set -euo pipefail\n# no filename hit, no shebang, no structural shape — the wasm answers:\n# betlang calibrated top label is Shell, the authority table maps it to bash\nnpx jixoai-ui add @jixoai/highlight-lang-detector\nls -la | wc -l\ncurl -fsSL https://example.com | tar -xz',
      filename: 'x.unknownext',
    });
    expect(result).not.toBeNull();
    expect(result!.source).toBe('statistical');
    expect(events.map((e) => e.layer)).toEqual(['L1', 'L2', 'L3', 'L4']);
    expect(events.slice(0, 3).every((e) => e.outcome === 'miss')).toBe(true);
    expect(events[3].outcome).toBe('hit');
    expect(events[3].lang).toBe(result!.lang);
    // every event carries a human detail line and a non-negative timing
    expect(events.length).toBe(4);
  });
});

describe('the layer short-circuit law (module-evaluation counters)', () => {
  it('an L1 hit leaves L2/L3 unevaluated — and they never move across calls', async () => {
    const evaluations = { l2: 0, l3: 0 };
    let shebangAnswer: string | null = null;
    vi.resetModules();
    vi.doMock('$lib/highlight/detect-shebang-table', () => {
      evaluations.l2 += 1; // the factory runs exactly when the module is evaluated
      return { detectByShebang: () => shebangAnswer };
    });
    vi.doMock('$lib/highlight/detect-structure', () => {
      evaluations.l3 += 1;
      return { detectByStructure: () => null };
    });
    try {
      const { defaultLangDetector: fresh } = await import(
        '$lib/highlight/default-detector'
      );
      const detector = fresh();

      // two L1 hits: L2/L3 counters must stay at zero (and the call
      // resolving at all proves L4 — a module not on disk yet — was
      // never reached either)
      const first = await detector.detect({ code: 'x', filename: 'main.ts' });
      expect(first).toEqual({ lang: 'typescript', source: 'filename' });
      await detector.detect({ code: '#!/usr/bin/env python3\nx', filename: 'app.ts' });
      expect(evaluations).toEqual({ l2: 0, l3: 0 });

      // an L1 miss evaluates L2 (once — the module cache law), never L3
      shebangAnswer = 'python';
      const second = await detector.detect({ code: '#!/usr/bin/env python3\nx', filename: 'x.unknown' });
      expect(second).toEqual({ lang: 'python', source: 'shebang' });
      expect(evaluations.l2).toBe(1);
      expect(evaluations.l3).toBe(0);
    } finally {
      shebangAnswer = null;
      vi.doUnmock('$lib/highlight/detect-shebang-table');
      vi.doUnmock('$lib/highlight/detect-structure');
      vi.resetModules();
    }
  });
});

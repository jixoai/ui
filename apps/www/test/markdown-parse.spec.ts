/**
 * markdown parse adapter suite (test/markdown-parse.spec.ts,
 * markdown-streaming task 1.4, 2026-09-06).
 *
 * Locks the registry adapter's public contract against the installed
 * stream-markdown-parser@1.2.14 (any dependency bump re-runs this whole
 * matrix — tasks 1.5): golden digest-v1 vectors, the keyed-block laws
 * (append stability, tail-in-place, bounded key transition, final
 * convergence), the adapter state machine (initial static/streaming,
 * false→true restart, non-append reset), document-level link-reference
 * invalidation, GFM vocabulary conformance, the pinned-axes table
 * (maxNesting 100, indented-code fix, validateLink floor) and the
 * ambient global-plugin trust boundary (detection warn + real
 * suspension proof). This suite reads the adapter through its public
 * exports only — nothing below imports the adapter's internals.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DIGEST_VERSION,
  createMarkdownParser,
  detectBlockquoteAlert,
  fnv1a36,
  GITHUB_ALERTS,
  stableStringify,
  type BlockquoteNode,
  type MarkdownParseResult,
} from '$lib/ui/markdown/parse';
import type { ParagraphNode, ParsedNode, TableNode } from '$lib/ui/markdown/parse';
import {
  clearRegisteredMarkdownPlugins,
  getMarkdown,
  parseMarkdownToStructure,
  registerMarkdownPlugin,
} from 'stream-markdown-parser';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const keys = (result: MarkdownParseResult): string[] => result.blocks.map((block) => block.key);

/** Index-aligned key changes between consecutive parses = the remount
 *  count keyed-each performs (new indexes are mounts, not remounts). */
const remountsBetween = (a: MarkdownParseResult, b: MarkdownParseResult): number => {
  let remounts = 0;
  const shared = Math.min(a.blocks.length, b.blocks.length);
  for (let i = 0; i < shared; i++) {
    if (a.blocks[i]?.key !== b.blocks[i]?.key) remounts++;
  }
  return remounts;
};

const blockquoteDepth = (node: ParsedNode | undefined): number => {
  let depth = 0;
  let cursor: ParsedNode | undefined = node;
  while (cursor?.type === 'blockquote') {
    depth++;
    cursor = cursor.children[0];
  }
  return depth;
};

// ---------------------------------------------------------------------------
// digest public vectors (design §2.2 — the cross-implementation key
// contract; any change bumps digest-v2 with a migration note)
// ---------------------------------------------------------------------------

/** The exact paragraph node the parser emits for `hello world` (final). */
const GOLDEN_PARA_NODE: ParagraphNode = {
  type: 'paragraph',
  children: [{ type: 'text', content: 'hello world', raw: 'hello world', center: false }],
  raw: 'hello world',
};

const GOLDEN_PARA_SERIALIZATION =
  '{"children":[{"center":false,"content":"hello world","raw":"hello world","type":"text"}],"raw":"hello world","type":"paragraph"}';
const GOLDEN_PARA_DIGEST = 'xcb0mg';

/** The exact table node the parser emits for the aligned 2x1 GFM table (final). */
const GOLDEN_TABLE_NODE: TableNode = {
  type: 'table',
  header: {
    type: 'table_row',
    cells: [
      {
        type: 'table_cell',
        header: true,
        children: [{ type: 'text', content: 'a', raw: 'a', center: false }],
        raw: 'a',
        align: 'left',
      },
      {
        type: 'table_cell',
        header: true,
        children: [{ type: 'text', content: 'b', raw: 'b', center: false }],
        raw: 'b',
        align: 'right',
      },
    ],
    raw: 'a|b',
  },
  rows: [
    {
      type: 'table_row',
      cells: [
        {
          type: 'table_cell',
          header: false,
          children: [{ type: 'text', content: '1', raw: '1', center: false }],
          raw: '1',
          align: 'left',
        },
        {
          type: 'table_cell',
          header: false,
          children: [{ type: 'text', content: '2', raw: '2', center: false }],
          raw: '2',
          align: 'right',
        },
      ],
      raw: '1|2',
    },
  ],
  loading: false,
  raw: 'a|b\n1|2',
};

const GOLDEN_TABLE_SERIALIZATION =
  '{"header":{"cells":[{"align":"left","children":[{"center":false,"content":"a","raw":"a","type":"text"}],"header":true,"raw":"a","type":"table_cell"},{"align":"right","children":[{"center":false,"content":"b","raw":"b","type":"text"}],"header":true,"raw":"b","type":"table_cell"}],"raw":"a|b","type":"table_row"},"loading":false,"raw":"a|b\\n1|2","rows":[{"cells":[{"align":"left","children":[{"center":false,"content":"1","raw":"1","type":"text"}],"header":false,"raw":"1","type":"table_cell"},{"align":"right","children":[{"center":false,"content":"2","raw":"2","type":"text"}],"header":false,"raw":"2","type":"table_cell"}],"raw":"1|2","type":"table_row"}],"type":"table"}';
const GOLDEN_TABLE_DIGEST = 'kopcom';

describe('markdown parse adapter — digest public vectors (digest-v1)', () => {
  it('pins the digest version stamp', () => {
    expect(DIGEST_VERSION).toBe('digest-v1');
  });

  it('vector: empty string (input / serialization / digest triple)', () => {
    expect(stableStringify('')).toBe('""');
    // the bare offset basis (2166136261 → base-36) pins the FNV constants
    expect(fnv1a36('')).toBe('ztntfp');
    // the full triple: digest of the serialized empty string
    expect(fnv1a36(stableStringify(''))).toBe('1yz14zp');
  });

  it('vector: fixed paragraph node (golden triple, tied to real parser output)', () => {
    const result = createMarkdownParser()('hello world', false);
    expect(result.blocks[0]?.node).toEqual(GOLDEN_PARA_NODE);
    expect(stableStringify(GOLDEN_PARA_NODE)).toBe(GOLDEN_PARA_SERIALIZATION);
    expect(fnv1a36(GOLDEN_PARA_SERIALIZATION)).toBe(GOLDEN_PARA_DIGEST);
    // the adapter's own digest field is the vector digest
    expect(result.blocks[0]?.digest).toBe(GOLDEN_PARA_DIGEST);
  });

  it('vector: fixed table node (golden triple, tied to real parser output)', () => {
    const result = createMarkdownParser()('| a | b |\n| --- | ---: |\n| 1 | 2 |', false);
    expect(result.blocks[0]?.node).toEqual(GOLDEN_TABLE_NODE);
    expect(stableStringify(GOLDEN_TABLE_NODE)).toBe(GOLDEN_TABLE_SERIALIZATION);
    expect(fnv1a36(GOLDEN_TABLE_SERIALIZATION)).toBe(GOLDEN_TABLE_DIGEST);
    expect(result.blocks[0]?.digest).toBe(GOLDEN_TABLE_DIGEST);
  });

  it('stableStringify: code-unit key order, undefined dropped, sourceMap stripped recursively, arrays in order, numbers via Number#toString', () => {
    // code-unit order: 'Z' (U+005A) sorts before 'a' (U+0061)
    expect(stableStringify({ b: 1, a: 2, Z: 3 })).toBe('{"Z":3,"a":2,"b":1}');
    expect(stableStringify({ u: undefined, k: 'v' })).toBe('{"k":"v"}');
    // sourceMap excluded at EVERY level, whatever its value
    expect(
      stableStringify({
        a: 1,
        sourceMap: { startLine: 0, endLine: 1 },
        nested: { sourceMap: null, ok: true },
      }),
    ).toBe('{"a":1,"nested":{"ok":true}}');
    // arrays keep order; NaN/Infinity stay literal (JSON.stringify would
    // null them, colliding distinct inputs)
    expect(stableStringify([1, 'two', null, NaN, Infinity])).toBe('[1,"two",null,NaN,Infinity]');
  });
});

// ---------------------------------------------------------------------------
// keyed-block laws (design §2.2 L1–L4)
// ---------------------------------------------------------------------------

describe('markdown parse adapter — append stability and keyed-block laws', () => {
  it('L1 prefix freeze: multi-round append typing keeps frozen prefix keys invariant', () => {
    const parse = createMarkdownParser();
    const r1 = parse('Alpha', true);
    const r2 = parse('Alpha\n\nBeta', true);
    const r3 = parse('Alpha\n\nBeta\n\n```ts\nconst x = 1;', true);

    expect(keys(r1)).toEqual(['0:paragraph:tail']);
    // Beta appears: Alpha freezes from tail to its digest key
    expect(keys(r2)).toEqual([r2.blocks[0]?.key, '1:paragraph:tail']);
    expect(r2.blocks[0]?.key).toMatch(/^0:paragraph:[0-9a-z]+$/);
    // tail growth alone never touches the already-frozen prefix
    expect(keys(r3)[0]).toBe(keys(r2)[0]);
    // Beta stops being the tail: exactly one key transition (L3), and the
    // digest it freezes to is the one computed while it was still the tail
    expect(keys(r3)[1]).toMatch(/^1:paragraph:[0-9a-z]+$/);
    expect(r3.blocks[1]?.digest).toBe(r2.blocks[1]?.digest);
    expect(keys(r3)[2]).toMatch(/^2:code_block:tail$/);
    expect(remountsBetween(r2, r3)).toBe(1);
  });

  it('duplicate-content siblings disambiguate by the index prefix', () => {
    const result = createMarkdownParser()('same words\n\nsame words', false);
    const [first, second] = result.blocks;
    expect(first?.digest).toBe(second?.digest); // identical semantics
    expect(first?.key).not.toBe(second?.key);
    expect(first?.key).toBe(`0:paragraph:${first?.digest}`);
    expect(second?.key).toBe(`1:paragraph:${second?.digest}`);
  });

  it('L2 tail in place: streaming tail keys on type alone and keeps its digest computed', () => {
    const result = createMarkdownParser()('hello\n\nworld', true);
    const tail = result.blocks[1];
    expect(result.blocks[0]?.isTail).toBe(false);
    expect(tail?.isTail).toBe(true);
    expect(tail?.key).toBe(`1:${tail?.type}:tail`);
    expect(tail?.type).toBe('paragraph');
    expect(tail?.digest).toMatch(/^[0-9a-z]+$/); // digest present even when dropped from the key
  });

  it('L2 fence-close while still the tail: NO remount signal (key unchanged, loading settles)', () => {
    const parse = createMarkdownParser();
    const open = parse('```ts\ncode\n', true);
    const closed = parse('```ts\ncode\n```\n', true);

    expect(keys(open)).toEqual(['0:code_block:tail']);
    expect(keys(closed)).toEqual(['0:code_block:tail']); // no key change at fence-close
    expect(open.blocks[0]?.node.loading).toBe(true);
    expect(closed.blocks[0]?.node.loading).toBe(false); // CodeCard re-renders final content in place
    expect(closed.blocks[0]?.node.code).toBe('code\n');
    expect(remountsBetween(open, closed)).toBe(0);

    // L3: a successor block appears → the fence swaps to its digest key
    const grown = parse('```ts\ncode\n```\nafter', true);
    expect(grown.blocks[0]?.key).toBe(`0:code_block:${grown.blocks[0]?.digest}`);
    expect(grown.blocks[0]?.isTail).toBe(false);
    expect(grown.blocks[1]?.key).toBe('1:paragraph:tail');
    expect(remountsBetween(closed, grown)).toBe(1);
  });

  it('L2 tail type transition (paragraph → heading mid-typing): the type discriminator swaps the key', () => {
    const parse = createMarkdownParser();
    const paraTail = parse('some para', true);
    const withHeading = parse('some para\n\n# ', true);

    expect(keys(paraTail)).toEqual(['0:paragraph:tail']);
    expect(keys(withHeading)).toEqual([
      paraTail.blocks[0] ? `0:paragraph:${paraTail.blocks[0].digest}` : '', // frozen to digest
      '1:heading:tail', // the tail key's TYPE discriminant changed paragraph → heading
    ]);
    expect(withHeading.blocks[1]?.node.type).toBe('heading');
  });

  it('L3/L4 bounded remount accounting: transition + finalize = exactly two remounts, tail growth = zero', () => {
    const parse = createMarkdownParser();
    const r1 = parse('some para', true);
    const r2 = parse('some para\n\n# ', true);
    const r3 = parse('some para\n\n# Title', false);

    // r1→r2: paragraph freezes (tail→digest, 1 remount) + heading mounts (new index, not a remount)
    expect(remountsBetween(r1, r2)).toBe(1);
    // r2→r3: finalize swaps the heading tail key to its digest (1 remount)
    expect(remountsBetween(r2, r3)).toBe(1);
    // the whole stream: bounded at one remount per semantic event, 2 total
    expect(remountsBetween(r1, r2) + remountsBetween(r2, r3)).toBe(2);
    expect(keys(r3).every((key) => !key.endsWith(':tail'))).toBe(true);
  });

  it('L4 final convergence: streaming → false re-parses with digest keys only', () => {
    const parse = createMarkdownParser();
    const streaming = parse('# t\n\nbody', true);
    const finalized = parse('# t\n\nbody', false);

    expect(streaming.mode).toBe('streaming');
    expect(finalized.mode).toBe('final');
    expect(keys(finalized)).toEqual([
      `0:heading:${finalized.blocks[0]?.digest}`,
      `1:paragraph:${finalized.blocks[1]?.digest}`,
    ]);
    expect(finalized.blocks.every((block) => block.isTail === false)).toBe(true);
    // the frozen prefix stays mounted: the heading digest survives finalize
    expect(finalized.blocks[0]?.digest).toBe(streaming.blocks[0]?.digest);
  });

  it('L4: an unclosed fence in final mode parses as closed semantics — loading gone, code complete', () => {
    const result = createMarkdownParser()('```ts\nconst a = 1;', false);
    expect(result.blocks[0]?.node.type).toBe('code_block');
    // final: the loading state disappears and the code block presents complete
    expect(result.blocks[0]?.node.loading).toBe(false);
    expect(result.blocks[0]?.node.code).toBe('const a = 1;');
    expect(result.blocks[0]?.key).not.toContain('tail');
  });
});

// ---------------------------------------------------------------------------
// adapter state machine (design §2.1)
// ---------------------------------------------------------------------------

describe('markdown parse adapter — state machine', () => {
  it('initial static parse (streaming defaults false): final semantics immediately', () => {
    const parse = createMarkdownParser();
    const result = parse('```\npartial', false);
    expect(result.mode).toBe('final');
    expect(keys(result)).toEqual([`0:code_block:${result.blocks[0]?.digest}`]);
    expect(result.blocks[0]?.node.loading).toBe(false); // never a loading state on the static path
  });

  it('initial streaming parse: streaming semantics immediately', () => {
    const parse = createMarkdownParser();
    const result = parse('```\npartial', true);
    expect(result.mode).toBe('streaming');
    expect(keys(result)).toEqual(['0:code_block:tail']);
    expect(result.blocks[0]?.node.loading).toBe(true);
    expect(result.blocks[0]?.node.code).toBe('partial');
  });

  it('false→true restart on an extending source resumes streaming semantics on the same parser', () => {
    const parse = createMarkdownParser();
    const finalView = parse('# t\n\nbody', false);
    const resumed = parse('# t\n\nbody more', true);

    // Instance identity is not observable through the public contract, so
    // this is the behavioral-equivalence assertion: a still-extending
    // source after a final parse keeps the frozen prefix mounted (same
    // digest ⇒ same instance semantics — final parses never poison the
    // stream env, design §2.1) and re-enters streaming cleanly.
    expect(resumed.mode).toBe('streaming');
    expect(resumed.blocks[0]?.key).toBe(finalView.blocks[0]?.key);
    expect(keys(resumed)).toEqual([finalView.blocks[0]?.key, '1:paragraph:tail']);
  });

  it('false→true on a NON-extending source falls to the reset branch', () => {
    const parse = createMarkdownParser();
    parse('# t\n\nbody', false);
    const shortened = parse('# t', true); // does not extend the accumulated text
    expect(shortened.mode).toBe('streaming');
    expect(keys(shortened)).toEqual(['0:heading:tail']);
  });

  it('non-append reset: replace / shorten / message switch all reparse correctly, never throw', () => {
    const parse = createMarkdownParser();
    const long = parse('hello brave new world', true);
    expect(long.blocks[0]?.node.raw).toBe('hello brave new world');

    const shortened = parse('hello', true); // rollback/shorten
    expect(shortened.blocks).toHaveLength(1);
    expect(shortened.blocks[0]?.node.type).toBe('paragraph');
    expect(shortened.blocks[0]?.node.raw).toBe('hello'); // fresh reparse, no stale tail

    const replaced = parse('# other', false); // replace
    expect(replaced.blocks[0]?.node.type).toBe('heading');

    const switched = parse('1. item', true); // message switch (chat-view recycle path)
    expect(switched.blocks[0]?.node.type).toBe('list');
    expect(switched.blocks[0]?.node.ordered).toBe(true);

    // the recycled instance keeps appending stably after the reset
    const appended = parse('1. item two', true);
    expect(appended.blocks).toHaveLength(1);
    expect(appended.blocks[0]?.key).toBe('0:list:tail');
  });

  it('empty source parses to zero blocks and accepts a following append', () => {
    const parse = createMarkdownParser();
    expect(parse('', true)).toEqual({ blocks: [], mode: 'streaming' });
    expect(parse('', false)).toEqual({ blocks: [], mode: 'final' });
    const after = parse('hello', true); // '' prefix: any source is append-compatible
    expect(after.blocks[0]?.node.type).toBe('paragraph');
  });
});

// ---------------------------------------------------------------------------
// document-level invalidation: link reference definitions (design §2.2 L1)
// ---------------------------------------------------------------------------

describe('markdown parse adapter — reference-definition doc-level invalidation', () => {
  it('an appended definition mutates an EARLIER block (text → link) while raw stays: digest and key change', () => {
    const parse = createMarkdownParser();
    const before = parse('[x][r]\n\nfoo', true);
    const after = parse('[x][r]\n\nfoo\n\n[r]: https://example.test', true);

    const beforeNode = before.blocks[0]?.node;
    const afterNode = after.blocks[0]?.node;
    // children mutate from plain text to a link …
    expect(beforeNode?.children[0]?.type).toBe('text');
    expect(afterNode?.children[0]?.type).toBe('link');
    // … while the block's own raw is unchanged …
    expect(afterNode?.raw).toBe('[x][r]');
    expect(afterNode?.raw).toBe(beforeNode?.raw);
    // … so only the digest can see it: the block remounts with correct content
    expect(after.blocks[0]?.digest).not.toBe(before.blocks[0]?.digest);
    expect(after.blocks[0]?.key).not.toBe(before.blocks[0]?.key);
    // the doc grew: the definition itself emits no block, foo stays the tail
    expect(after.blocks[1]?.key).toBe('1:paragraph:tail');
  });
});

// ---------------------------------------------------------------------------
// GFM conformance through the adapter (design §3 vocabulary)
// ---------------------------------------------------------------------------

describe('markdown parse adapter — GFM conformance', () => {
  it('tables: header/rows/cells/align', () => {
    const result = createMarkdownParser()('| a | b |\n| --- | ---: |\n| 1 | 2 |', false);
    const table = result.blocks[0]?.node;
    expect(table?.type).toBe('table');
    if (table?.type !== 'table') return;
    expect(table.header.cells).toHaveLength(2);
    expect(table.header.cells[0]?.header).toBe(true);
    expect(table.header.cells[1]?.header).toBe(true);
    expect(table.header.cells.map((cell) => cell.align)).toEqual(['left', 'right']);
    expect(table.rows).toHaveLength(1);
    expect(table.rows[0]?.cells.map((cell) => cell.header)).toEqual([false, false]);
    expect(table.rows[0]?.cells.map((cell) => cell.align)).toEqual(['left', 'right']);
    expect(table.rows[0]?.cells[0]?.children[0]?.type).toBe('text');
    // golden node parity (the digest-vector triple already pins this exact shape)
    expect(table).toEqual(GOLDEN_TABLE_NODE);
  });

  it('task lists: checkbox_input + label_open/label_close nodes, leading-space text', () => {
    const result = createMarkdownParser()('- [x] done\n- [ ] two', false);
    const list = result.blocks[0]?.node;
    expect(list?.type).toBe('list');
    if (list?.type !== 'list') return;
    expect(list.ordered).toBe(false);
    expect(list.items).toHaveLength(2);

    const firstParagraph = list.items[0]?.children[0];
    const secondParagraph = list.items[1]?.children[0];
    expect(firstParagraph?.children.map((child) => child.type)).toEqual([
      'checkbox_input',
      'label_open',
      'text',
      'label_close',
    ]);
    expect(firstParagraph?.children[0]?.checked).toBe(true);
    expect(firstParagraph?.children[2]?.raw).toBe(' done'); // the label's leading space survives
    expect(secondParagraph?.children[0]?.type).toBe('checkbox_input');
    expect(secondParagraph?.children[0]?.checked).toBe(false);
    expect(secondParagraph?.children[3]?.type).toBe('label_close');
  });

  it('unclosed fence mid-stream: loading=true with partial code; final settles it', () => {
    const parse = createMarkdownParser();
    const mid = parse('```ts\nconst a = 1;', true);
    expect(mid.blocks[0]?.node.type).toBe('code_block');
    expect(mid.blocks[0]?.node.loading).toBe(true);
    expect(mid.blocks[0]?.node.code).toBe('const a = 1;'); // partial code carried

    const done = parse('```ts\nconst a = 1;\n```', true);
    expect(done.blocks[0]?.node.loading).toBe(false);
    expect(done.blocks[0]?.node.code).toBe('const a = 1;\n');
  });
});

// ---------------------------------------------------------------------------
// pinned axes (design §1.1 — the frozen option table)
// ---------------------------------------------------------------------------

describe('markdown parse adapter — pinned axes', () => {
  it('maxNesting: 100 — 30-deep nesting parses fully; beyond 100 clamps at 100, deterministically', () => {
    const parse = createMarkdownParser();
    const deep30 = parse(`${'>'.repeat(30)} deep`, false);
    expect(deep30.blocks).toHaveLength(1);
    expect(blockquoteDepth(deep30.blocks[0]?.node)).toBe(30);

    const deep150 = parse(`${'>'.repeat(150)} deep`, false);
    expect(deep150.blocks).toHaveLength(1); // no throw, no split
    expect(blockquoteDepth(deep150.blocks[0]?.node)).toBe(100); // the boundary

    // deterministic across independent parsers (same digest)
    const other = createMarkdownParser()(`${'>'.repeat(30)} deep`, false);
    expect(other.blocks[0]?.digest).toBe(deep30.blocks[0]?.digest);
  });

  it('maxNesting is live in the factory path (differential: maxNesting 2 clamps at 2)', () => {
    const shallowMd = getMarkdown('spec-maxnesting-differential', {
      markdownItOptions: {
        html: false,
        linkify: true,
        typographer: false,
        breaks: false,
        stream: true,
        maxNesting: 2,
      },
      enableMath: false,
      enableContainers: false,
      enableFixIndentedCodeBlock: true,
    });
    const shallow = parseMarkdownToStructure('>>> deep', shallowMd, { final: true, streamParse: 'auto' });
    const deep = createMarkdownParser()('>>> deep', false);
    expect(blockquoteDepth(shallow[0])).toBe(2);
    expect(blockquoteDepth(deep.blocks[0]?.node)).toBe(3); // our pin of 100 keeps it fully nested
  });

  it('enableFixIndentedCodeBlock: single-line indented prose stays a paragraph (differential)', () => {
    const source = 'intro:\n\n    just some indented prose';
    const fixed = createMarkdownParser()(source, false);
    expect(fixed.blocks.map((block) => block.type)).toEqual(['paragraph', 'paragraph']);

    // the same factory WITHOUT the fix leaves it an indented code block —
    // proving the pinned axis (not a library default on our path) does the work
    const unfixedMd = getMarkdown('spec-indented-code-differential', {
      markdownItOptions: { html: false, linkify: true, typographer: false, breaks: false, stream: true },
      enableMath: false,
      enableContainers: false,
      enableFixIndentedCodeBlock: false,
    });
    const unfixed = parseMarkdownToStructure(source, unfixedMd, { final: true, streamParse: 'auto' });
    expect(unfixed.map((node) => node.type)).toEqual(['paragraph', 'code_block']);
  });

  it('validateLink floor (clean process): javascript: hrefs demote to plain text at parse', () => {
    const result = createMarkdownParser()('[click](javascript:alert(1))', false);
    const paragraph = result.blocks[0]?.node;
    expect(paragraph?.children[0]?.type).toBe('text'); // demoted — never a link node
    expect(paragraph?.children[0]?.raw).toContain('click');
  });
});

// ---------------------------------------------------------------------------
// ambient global-plugin trust boundary (design §1.1 — detection-only)
// ---------------------------------------------------------------------------

describe('markdown parse adapter — ambient global-plugin trust boundary', () => {
  afterEach(() => {
    clearRegisteredMarkdownPlugins(); // never leaked into other suites
    vi.restoreAllMocks();
  });

  it('clean process: no ambient plugins ⇒ no warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const parse = createMarkdownParser();
    parse('hello', false);
    expect(warn).not.toHaveBeenCalled();
  });

  it('benign ambient plugin ⇒ ONE warn stating the TOTAL suspension (vocabulary + URL-security), parse proceeds', () => {
    registerMarkdownPlugin(() => {}); // benign no-op
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const parse = createMarkdownParser(); // warn fires at instance creation
    const result = parse('hello world', false);

    expect(warn).toHaveBeenCalledTimes(1);
    const message = String(warn.mock.calls[0]?.join(' '));
    expect(message).toContain('vocabulary');
    expect(message).toContain('URL-security');
    expect(message).toContain('suspended');
    // the warning states BOTH guarantees pause simultaneously (total, not vocabulary-only)
    expect(message).toMatch(/vocabulary AND URL-security/);

    // parse proceeds regardless
    expect(result.mode).toBe('final');
    expect(result.blocks[0]?.node).toEqual(GOLDEN_PARA_NODE);

    // one warn per parser, even across a non-append instance recreation
    parse('# replaced', true);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('validateLink-override plugin ⇒ the suspension is REAL (link survives) and existing instances stay immune', () => {
    // a parser created BEFORE the registration keeps the factory floor
    const immune = createMarkdownParser();

    registerMarkdownPlugin((md) => {
      md.set({ validateLink: () => true }); // an ambient plugin can defeat the parser-level floor
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const parse = createMarkdownParser(); // globals apply at creation only
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.join(' '))).toContain('URL-security');

    const source = '[x](javascript:alert(1))';
    const throughSuspension = parse(source, false);
    expect(throughSuspension.blocks[0]?.node.children[0]?.type).toBe('link'); // REALLY suspended

    const throughImmune = immune(source, false);
    expect(throughImmune.blocks[0]?.node.children[0]?.type).toBe('text'); // creation order cannot corrupt it
  });
});

// ---------------------------------------------------------------------------
// GitHub-alert detection (markdown-coverage design §4) — the pure
// render-side read of a blockquote node; unit-tested directly against
// REAL parser output (the installed AST shapes) plus one hand-built
// defensive shape
// ---------------------------------------------------------------------------

describe('markdown parse adapter — detectBlockquoteAlert', () => {
  /** the real AST's blockquote for a source (final mode — the frozen shape). */
  const blockquoteFor = (source: string): BlockquoteNode => {
    const result = createMarkdownParser()(source, false);
    const node = result.blocks[0]?.node;
    if (node?.type !== 'blockquote') throw new Error(`expected blockquote, got ${node?.type}`);
    return node;
  };

  it('matches the five kinds (case-insensitive), strips the marker line, keeps the body', () => {
    const kinds = ['NOTE', 'Tip', 'IMportant', 'warning', 'Caution'] as const;
    for (const spelling of kinds) {
      const node = blockquoteFor(`> [!${spelling}]\n> body text`);
      const alert = detectBlockquoteAlert(node);
      expect(alert, spelling).not.toBeNull();
      const kind = spelling.toLowerCase() as keyof typeof GITHUB_ALERTS;
      expect(alert!.kind).toBe(kind);
      // hue/label vocabulary: statuses, never destructive; the hue
      // half carries the FULL site-utility class (the hook-law B1
      // ruling — never a trailing-dash prefix for concatenation)
      expect(GITHUB_ALERTS[kind]).toEqual({
        hueClass: {
          note: 'jx-hue-info',
          tip: 'jx-hue-success',
          important: 'jx-hue-primary',
          warning: 'jx-hue-warning',
          caution: 'jx-hue-error',
        }[kind],
        label: { note: 'Note', tip: 'Tip', important: 'Important', warning: 'Warning', caution: 'Caution' }[kind],
      });
      // the marker line is stripped; the remaining lines are the body
      expect(alert!.children[0]?.type).toBe('paragraph');
      expect(stableStringify(alert!.children[0])).toContain('"content":"body text"');
    }
  });

  it('multi-line first paragraph keeps every remaining line in the stripped text node', () => {
    const node = blockquoteFor('> [!TIP]\n> line one\n> line two');
    const alert = detectBlockquoteAlert(node)!;
    expect(stableStringify(alert.children[0])).toContain('"content":"line one\\nline two"');
  });

  it('the bold-follow shape: a marker-only first text node drops, inline siblings survive', () => {
    // the REAL parser shape for `> [!NOTE] **bold** body`
    const node = blockquoteFor('> [!NOTE] **bold** body');
    const alert = detectBlockquoteAlert(node)!;
    expect(alert.kind).toBe('note');
    const paragraph = alert.children[0];
    expect(paragraph?.type).toBe('paragraph');
    if (paragraph?.type !== 'paragraph') return;
    expect(paragraph.children[0]?.type).toBe('strong'); // the marker text node dropped
    expect(paragraph.children.map((child) => child.type)).toEqual(['strong', 'text']);
  });

  it('an empty-after-strip paragraph is dropped; later paragraphs survive BY REFERENCE', () => {
    const node = blockquoteFor('> [!WARNING]\n>\n> second para');
    const alert = detectBlockquoteAlert(node)!;
    expect(alert.kind).toBe('warning');
    expect(alert.children.length).toBe(1);
    // shallow-structural cloning: untouched siblings SHARE references with
    // the parse tree (only the modified spine is new)
    expect(alert.children[0]).toBe(node.children[1]);
  });

  it('a marker-only quote (no body at all) yields the kind with zero children', () => {
    const node = blockquoteFor('> [!NOTE]');
    const alert = detectBlockquoteAlert(node)!;
    expect(alert.kind).toBe('note');
    expect(alert.children).toEqual([]);
  });

  it('NO match: mid-line marker, marker beyond the first line, unknown kind, non-paragraph first child', () => {
    for (const source of [
      '> text [!NOTE] more', // mid-line (GitHub's own rule)
      '> first line\n> [!NOTE]\n> body', // not the first line
      '> [!FOO]\n> body', // unknown kind
      '> [!NOTE extra]\n> body', // trailing words on the marker line
    ]) {
      expect(detectBlockquoteAlert(blockquoteFor(source)), source).toBeNull();
    }
    // a nested quote's alert lives on the INNER blockquote, not the outer
    const outer = blockquoteFor('> outer only\n>\n> > [!NOTE]\n> > inner');
    expect(detectBlockquoteAlert(outer)).toBeNull();
  });

  it('NEVER mutates the parser nodes — two calls give the same answer, the tree is untouched', () => {
    const node = blockquoteFor('> [!NOTE]\n> body');
    const before = stableStringify(node);
    const first = detectBlockquoteAlert(node)!;
    const second = detectBlockquoteAlert(node)!;
    // strip-then-no-match loop guard: the SECOND detection still matches
    expect(second).not.toBeNull();
    expect(second.kind).toBe(first.kind);
    expect(stableStringify(second.children)).toBe(stableStringify(first.children));
    // and the ORIGINAL tree never changed (digest/stream-cache safety)
    expect(stableStringify(node)).toBe(before);
    // the clone is a NEW spine: the parse tree's text still carries the marker
    expect(node.children[0]?.type).toBe('paragraph');
    expect(stableStringify(node)).toContain('"content":"[!NOTE]\\nbody"');
  });

  it('the inline-wrapper AST shape (defensive tolerance): the detector looks one level deeper', () => {
    // the installed parser emits the direct-text shape for every probed
    // quote (probe-verified); the wrapper arm is tolerance pinned here
    // with a hand-built node so a future parser reshaping keeps alerts
    const wrapped: BlockquoteNode = {
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'inline',
              children: [{ type: 'text', content: '[!TIP]\nwrapped body', raw: '[!TIP]\nwrapped body', center: false }],
              raw: '[!TIP]\nwrapped body',
            },
          ],
          raw: '[!TIP]\nwrapped body',
        },
        { type: 'paragraph', children: [{ type: 'text', content: 'later', raw: 'later', center: false }], raw: 'later' },
      ],
      raw: '[!TIP]\nwrapped body\nlater',
    };
    const alert = detectBlockquoteAlert(wrapped)!;
    expect(alert.kind).toBe('tip');
    expect(stableStringify(alert.children[0])).toContain('"content":"wrapped body"');
    expect(alert.children[1]).toBe(wrapped.children[1]); // untouched sibling shared
    // and the wrapper whose text emptied drops wholesale
    const wrappedEmpty: BlockquoteNode = {
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'inline', children: [{ type: 'text', content: '[!NOTE]', raw: '[!NOTE]', center: false }], raw: '[!NOTE]' },
          ],
          raw: '[!NOTE]',
        },
      ],
      raw: '[!NOTE]',
    };
    const emptyAlert = detectBlockquoteAlert(wrappedEmpty)!;
    expect(emptyAlert.kind).toBe('note');
    expect(emptyAlert.children).toEqual([]);
  });
});

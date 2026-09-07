// Canvas extractor unit tests (typography-context-and-parts §7,
// proposal C §5): the PURE pipeline over page sources — dedent,
// direct-child snippet strip vs nested keep, comments, the
// duplicate-id / non-static-id / self-containment named errors, the
// missing-id skip, multi-canvas pages, the empty canvas, and the
// emitted module's runtime surface (canvasIds + resolveRawCode with
// the named miss-error listing the page's real ids).
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  dedentAndTrim,
  emitCanvasModule,
  extractCanvases,
} from '../../src/canvas/index.js';

const extract = (source: string, filename = 'page.svelte') =>
  extractCanvases(source, { filename });

describe('extractCanvases — the honest slice', () => {
  it('extracts the children byte-honestly: comments kept, layout wrappers kept', async () => {
    const result = await extract(
      [
        '<ComponentCanvas id="a" title="t">',
        '  <!-- the pedagogy comment stays -->',
        '  <div class="grid gap-4">',
        '    <Blockquote>body</Blockquote>',
        '  </div>',
        '</ComponentCanvas>',
      ].join('\n'),
    );
    expect(result.ids).toEqual(['a']);
    expect(result.canvases['a']).toBe(
      [
        '<!-- the pedagogy comment stays -->',
        '<div class="grid gap-4">',
        '  <Blockquote>body</Blockquote>',
        '</div>',
      ].join('\n'),
    );
  });

  it('strips ONLY direct-child {#snippet} blocks; nested snippets stay', async () => {
    const result = await extract(
      [
        '<ComponentCanvas id="a">',
        '  <div>',
        '    {#snippet inner()}<i>nested demo content</i>{/snippet}',
        '    {@render inner()}',
        '  </div>',
        '  {#snippet playground()}',
        '    <p>pane chrome, never usage content</p>',
        '  {/snippet}',
        '</ComponentCanvas>',
      ].join('\n'),
    );
    expect(result.canvases['a']).toBe(
      [
        '<div>',
        '  {#snippet inner()}<i>nested demo content</i>{/snippet}',
        '  {@render inner()}',
        '</div>',
      ].join('\n'),
    );
  });

  it('dedents by the minimum common indentation and trims outer blank lines only', async () => {
    const result = await extract(
      [
        '<div>',
        '  <ComponentCanvas id="a">',
        '      <X y={1}>',
        '        deep',
        '      </X>',
        '      <Z />',
        '  </ComponentCanvas>',
        '</div>',
      ].join('\n'),
    );
    // min common indent of the non-blank lines is 6 ("<X…" and "<Z" at 6)
    expect(result.canvases['a']).toBe(
      ['<X y={1}>', '  deep', '</X>', '<Z />'].join('\n'),
    );
  });

  it('dedentAndTrim keeps interior blank lines and collapses an all-blank slice', () => {
    expect(dedentAndTrim('  a\n\n  b')).toBe('a\n\nb');
    expect(dedentAndTrim('\n\n   \n')).toBe('');
  });

  it('canvases nested anywhere in the page are found (any depth)', async () => {
    const result = await extract(
      [
        '<div>',
        '  {#if shown}',
        '    <ComponentCanvas id="deep"><B>content</B></ComponentCanvas>',
        '  {/if}',
        '</div>',
      ].join('\n'),
    );
    expect(result.ids).toEqual(['deep']);
    expect(result.canvases['deep']).toBe('<B>content</B>');
  });
});

describe('extractCanvases — the opt-in posture', () => {
  it('a canvas WITHOUT an id is skipped silently (zero cost)', async () => {
    const result = await extract(
      '<ComponentCanvas title="unmigrated"><B>x</B></ComponentCanvas>',
    );
    expect(result.ids).toEqual([]);
    expect(result.canvases).toEqual({});
  });

  it('multi-canvas pages: ids in document order, per-canvas slices', async () => {
    const result = await extract(
      [
        '<ComponentCanvas id="one">first</ComponentCanvas>',
        '<ComponentCanvas>skipped middle</ComponentCanvas>',
        '<ComponentCanvas id="two">second</ComponentCanvas>',
      ].join('\n'),
    );
    expect(result.ids).toEqual(['one', 'two']);
    expect(result.canvases['one']).toBe('first');
    expect(result.canvases['two']).toBe('second');
  });

  it('an empty canvas extracts to the empty string', async () => {
    const result = await extract(
      '<ComponentCanvas id="empty"></ComponentCanvas>',
    );
    expect(result.ids).toEqual(['empty']);
    expect(result.canvases['empty']).toBe('');
  });

  it('a page with no canvases at all is fine', async () => {
    const result = await extract('<div><p>plain page</p></div>');
    expect(result.ids).toEqual([]);
  });
});

describe('extractCanvases — the named errors', () => {
  it('duplicate ids fail by name', async () => {
    await expect(
      extract(
        '<ComponentCanvas id="a">1</ComponentCanvas><ComponentCanvas id="a">2</ComponentCanvas>',
      ),
    ).rejects.toThrow(/duplicate canvas id "a"/);
  });

  it('a non-static id fails by name (it reads as an attempted opt-in)', async () => {
    await expect(extract('<ComponentCanvas id={dynamic}>x</ComponentCanvas>')).rejects.toThrow(
      /not a static string literal/,
    );
  });

  it('self-containment (F4): a page-level snippet reference fails by name', async () => {
    await expect(
      extract('<ComponentCanvas id="s">{@render pageGlyph()}</ComponentCanvas>'),
    ).rejects.toThrow(/not\s+self-contained.*pageGlyph/s);
  });

  it('self-containment: a snippet-typed attribute referencing the page fails by name', async () => {
    await expect(
      extract(
        [
          '<ComponentCanvas id="s">',
          '  <Blockquote icon={warningGlyph}>body</Blockquote>',
          '</ComponentCanvas>',
        ].join('\n'),
      ),
    ).rejects.toThrow(/not\s+self-contained.*warningGlyph/s);
  });

  it('self-containment: a shorthand attribute referencing the page fails by name', async () => {
    await expect(
      extract('<ComponentCanvas id="s"><Markdown {source} /></ComponentCanvas>'),
    ).rejects.toThrow(/not\s+self-contained.*source/s);
  });

  it('self-containment: snippet parameters count as in-slice bindings', async () => {
    // {#snippet row(cell)} — cell is a parameter, bound inside the
    // slice; the DEFINITIONS are nested (direct-child snippets are the
    // canvas protocol and get stripped, by law)
    const result = await extract(
      [
        '<ComponentCanvas id="ok">',
        '  <div>',
        '    {#snippet row(cell)}{@render cell()}{/snippet}',
        '    {#snippet first()}<b>the arg snippet</b>{/snippet}',
        '    {@render row(first)}',
        '  </div>',
        '</ComponentCanvas>',
      ].join('\n'),
    );
    expect(result.ids).toEqual(['ok']);
    expect(result.canvases['ok']).toContain('{@render row(first)}');
  });

  it('self-containment: a render argument is a reference too (markdown posture)', async () => {
    // the markdown page class: {@render row(pageOwned)} — pageOwned is
    // not defined in the slice → named error (this is WHY markdown
    // stays opted out until §6.4 identifier lifting)
    await expect(
      extract(
        [
          '<ComponentCanvas id="m">',
          '  {#snippet row(cell)}{@render cell()}{/snippet}',
          '  {@render row(pageOwned)}',
          '</ComponentCanvas>',
        ].join('\n'),
      ),
    ).rejects.toThrow(/not\s+self-contained.*pageOwned/s);
  });

  it('a page that does not parse fails by name with the page identified (F8)', async () => {
    await expect(
      extract('<ComponentCanvas id="p">{#if no}</ComponentCanvas>', 'bad.svelte'),
    ).rejects.toThrow(/\[jixoai-canvas\] bad\.svelte did not parse/);
  });
});

describe('emitCanvasModule — the virtual module surface', () => {
  it('emits named exports only: canvasIds + resolveRawCode, map internal', async () => {
    const extraction = await extract(
      '<ComponentCanvas id="a">first</ComponentCanvas>',
    );
    const code = emitCanvasModule(extraction);
    expect(code).toContain('export const canvasIds = ["a"];');
    expect(code).toContain('export function resolveRawCode(id)');
    expect(code).not.toContain('export const rawCodeMap');
    expect(code).not.toContain('export default');
  });

  it('round-trips: the emitted module imports and answers, misses name the real ids', async () => {
    const extraction = await extract(
      [
        '<ComponentCanvas id="rungs">the rungs slice</ComponentCanvas>',
        '<ComponentCanvas id="rule">the rule slice</ComponentCanvas>',
      ].join('\n'),
    );
    const dir = await mkdtemp(join(tmpdir(), 'jixoai-canvas-emit-'));
    const file = join(dir, 'canvas-module.mjs');
    await writeFile(file, emitCanvasModule(extraction), 'utf8');
    const mod = (await import(pathToFileURL(file).href)) as {
      canvasIds: readonly string[];
      resolveRawCode: (id: string) => string;
      default?: unknown;
    };
    expect(mod.canvasIds).toEqual(['rungs', 'rule']);
    expect(mod.resolveRawCode('rungs')).toBe('the rungs slice');
    expect(mod.resolveRawCode('rule')).toBe('the rule slice');
    expect(mod.default).toBeUndefined();
    expect(() => mod.resolveRawCode('nope')).toThrow(
      /\[jixoai-canvas\] no canvas with id "nope".*\[rungs, rule\]/,
    );
  });

  it('U+2028/U+2029 are escaped as source sequences in the emitted literals', async () => {
    // built via code points (never embedded literals — the invisible-
    // character law); the escapes must appear as the six ASCII chars
    const slice = `line1${String.fromCodePoint(0x2028)}line2${String.fromCodePoint(0x2029)}end`;
    const code = emitCanvasModule({ ids: ['x'], canvases: { x: slice } });
    expect(code).toContain('\\u2028');
    expect(code).toContain('\\u2029');
    expect(code).not.toContain(String.fromCodePoint(0x2028));
    expect(code).not.toContain(String.fromCodePoint(0x2029));
  });
});

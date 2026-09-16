/**
 * p7-node-bridge.test.ts — lab probe p7-node-bridge port
 * (M0 collab-protocol).
 *
 * Original need: Owner 2026-09-15 (collab-protocol M0 — P1-P20 regression
 * battery). Source: `.zcode/epic40/lab/p7-node-bridge.mjs`.
 * Port deviation: none (svelte/compiler + loro-crdt are both pinned
 * dependencies).
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';
import { parse } from 'svelte/compiler';
import { LoroDoc } from 'loro-crdt';

import { finish } from './lab-helpers.ts';

interface TextLikeNode {
  type: string;
  start: number;
  end: number;
  data: string;
}

interface ElementLikeNode {
  type: string;
  children: Array<{ type: string; start?: number; end?: number; data?: string }>;
}

test('p7-node-bridge', () => {
  const source = `<script>let ignored = 1;</script>\n<Button label="Save">  Click &amp; go  </Button>\n`;
  const ast = parse(source);
  const usage = (ast.html.children as ElementLikeNode[]).find(
    (node) => node.type === 'InlineComponent' || node.type === 'Component',
  );
  assert.ok(usage !== undefined, 'Svelte AST must expose Button usage');
  const textNodes = usage.children.filter(
    (node): node is TextLikeNode =>
      node.type === 'Text' && typeof node.start === 'number' && typeof node.end === 'number',
  ) as TextLikeNode[];
  const raw = source.slice(textNodes[0]!.start, textNodes[0]!.end);
  const lead = raw.search(/[^ \t\r\n]/);
  const trailMatch = raw.match(/[ \t\r\n]*$/);
  const trail = trailMatch?.[0].length ?? 0;
  const start = textNodes[0]!.start + lead;
  const end = textNodes[0]!.end - trail;
  const span = {
    start,
    end,
    raw: source.slice(start, end),
    text: textNodes[0]!.data.slice(lead, textNodes[0]!.data.length - trail),
  };
  assert.ok(span.raw === 'Click &amp; go', `raw span was ${span.raw}`);
  assert.ok(
    span.start < span.end && span.text.includes('&'),
    'span should retain decoded text semantics',
  );

  const doc = new LoroDoc();
  doc.setPeerId('801');
  const buffer = doc.getText('page_button_slot');
  buffer.insert(0, span.text);
  doc.commit({ origin: 'panel' });
  const projectedVisible = buffer.toString();
  const serialized = projectedVisible
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('{', '&#123;')
    .replaceAll('}', '&#125;');
  const projectedSource = source.slice(0, span.start) + serialized + source.slice(span.end);
  assert.ok(projectedSource.includes('Click &amp; go'), 'projection must serialize entities into source');

  finish('p7-node-bridge', {
    node: process.version,
    parse: { package: 'svelte/compiler', componentType: usage.type, childTextNodes: textNodes.length },
    span,
    bridge: { sourceToBuffer: 'AST direct Text child -> trimmed UTF-16 span -> LoroText', bufferToSource: 'escape & < > { } -> replace original span' },
    measured: { sourceBytes: source.length, bufferChars: buffer.length, projectedSourceBytes: projectedSource.length, implementationLines: 43 },
    conclusion: 'The CRDT does not replace the existing Svelte bridge; it occupies the named buffer layer and keeps transform/prop-edit as the serializer authority.',
  });
});

/**
 * prop-edit.test.ts — the §3 serializer authority tests (the r2 T8
 * file-CAS lane's own battery was retired with the lane, M7a
 * 2026-09-15: the panel edits ride the collab op lane — see
 * collab-api.test.ts + panel-collab.test.ts for the successor
 * coverage; these two serializers stay because collab/bridge.ts
 * consumes them by §3's frozen law).
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { renderValue, serializeTemplateText } from './prop-edit.ts';

/* ── renderValue (the prop literal law) ──────────────────────────────── */

test('renderValue: string → JSON-quoted, number/boolean → braced', () => {
  assert.equal(renderValue('fill'), '"fill"');
  assert.equal(renderValue('say "hi"'), '"say \\"hi\\""');
  assert.equal(renderValue(42), '{42}');
  assert.equal(renderValue(1.5), '{1.5}');
  assert.equal(renderValue(true), '{true}');
  assert.equal(renderValue(false), '{false}');
});

test('renderValue slice law: the quoted-string prop hole bytes', () => {
  // the bridge's quoted-string law — JSON escaping minus the outer quotes
  assert.equal(renderValue('a & b').slice(1, -1), 'a & b');
  assert.equal(renderValue('line\nbreak'), '"line\\nbreak"');
  assert.equal(renderValue('line\nbreak').slice(1, -1), 'line\\nbreak');
});

/* ── serializeTemplateText (the B3 template text law) ────────────────── */

test('serializeTemplateText escapes in order & < > { }', () => {
  assert.equal(serializeTemplateText('a & b'), 'a &amp; b');
  assert.equal(serializeTemplateText('1 < 2 > 0'), '1 &lt; 2 &gt; 0');
  assert.equal(serializeTemplateText('{expr}'), '&#123;expr&#125;');
  // order matters: an ampersand introduced by a later escape is not re-escaped
  assert.equal(serializeTemplateText('<&{'), '&lt;&amp;&#123;');
});

test('serializeTemplateText keeps quotes literal and newlines raw', () => {
  assert.equal(serializeTemplateText('say "hi"'), 'say "hi"');
  assert.equal(serializeTemplateText('l1\nl2'), 'l1\nl2');
});

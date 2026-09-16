/**
 * p20-cli-parser.test.ts — lab probe p20-cli-parser port
 * (M0 collab-protocol).
 *
 * Original need: Owner 2026-09-15 (collab-protocol M0 — P1-P20 regression
 * battery). Source: `.zcode/epic40/lab/p20-cli-parser.mjs`.
 * Port deviation: none (rowColToOffset comes from lab-helpers.ts, ported
 * verbatim from the lab's common.mjs).
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';
import { LoroDoc } from 'loro-crdt';

import { finish, rowColToOffset } from './lab-helpers.ts';

interface PatchReceipt {
  line: number;
  status: 'accepted' | 'rejected';
  kind?: string;
  offset?: number;
  length?: number;
  code?: string;
  message?: string;
}

function parsePatch(source: string, patch: string): { current: string; cursor: number; receipts: PatchReceipt[] } {
  let current = source;
  let cursor = 0;
  const receipts: PatchReceipt[] = [];
  for (const [index, line] of patch.split('\n').entries()) {
    const lineNumber = index + 1;
    try {
      let match = /^#(\d+):(\d+)$/.exec(line);
      if (match) {
        cursor = rowColToOffset(current, Number(match[1]), Number(match[2]));
        receipts.push({ line: lineNumber, status: 'accepted', kind: 'cursor', offset: cursor });
        continue;
      }
      match = /^\+([\s\S]*)$/.exec(line);
      if (match) {
        current = current.slice(0, cursor) + match[1]! + current.slice(cursor);
        cursor += match[1]!.length;
        receipts.push({ line: lineNumber, status: 'accepted', kind: 'insert' });
        continue;
      }
      match = /^-(\d+)$/.exec(line);
      if (match && Number(match[1]) > 0) {
        const length = Number(match[1]);
        assert.ok(cursor + length <= current.length, 'delete exceeds buffer');
        const previous = current.slice(0, cursor);
        const deleted = current.slice(cursor, cursor + length);
        if (/^[\udc00-\udfff]/u.test(deleted) || /[\ud800-\udbff]$/u.test(deleted)) {
          throw new Error('utf16-boundary: delete splits a surrogate pair');
        }
        current = previous + current.slice(cursor + length);
        receipts.push({ line: lineNumber, status: 'accepted', kind: 'delete', length });
        continue;
      }
      match = /^!(\d+) ([\s\S]*)$/.exec(line);
      if (match && Number(match[1]) > 0) {
        const length = Number(match[1]);
        assert.ok(cursor + length <= current.length, 'replace exceeds buffer');
        const deleted = current.slice(cursor, cursor + length);
        if (/^[\udc00-\udfff]/u.test(deleted) || /[\ud800-\udbff]$/u.test(deleted)) {
          throw new Error('utf16-boundary: replace splits a surrogate pair');
        }
        current = current.slice(0, cursor) + match[2]! + current.slice(cursor + length);
        cursor += match[2]!.length;
        receipts.push({ line: lineNumber, status: 'accepted', kind: 'replace', length });
        continue;
      }
      throw new Error('malformed-patch');
    } catch (error) {
      const message = String((error as { message?: string }).message ?? error);
      receipts.push({
        line: lineNumber,
        status: 'rejected',
        code: message.includes('utf16-boundary') ? 'utf16-boundary' : 'malformed-patch',
        message,
      });
      break;
    }
  }
  return { current, cursor, receipts };
}

test('p20-cli-parser', () => {
  const source = '😀x\nabc';
  const valid = parsePatch(source, '#1:3\n+!');
  assert.ok(
    valid.receipts[0]!.status === 'accepted' && valid.receipts[0]!.offset === 2,
    'ROW:COL must use 1-based UTF-16 code-unit columns',
  );
  assert.ok(
    valid.receipts[1]!.status === 'accepted' && valid.current === '😀!x\nabc',
    'insert must preserve current cursor and code units',
  );
  const cursorDoc = new LoroDoc();
  cursorDoc.setPeerId('1500');
  const cursorText = cursorDoc.getText('buffer');
  cursorText.insert(0, source);
  cursorDoc.commit({ message: 'cli-cursor' });
  const loroCursor = cursorText.getCursor(valid.receipts[0]!.offset!, 0);
  assert.ok(
    loroCursor!.containerId() === cursorText.id && loroCursor!.encode().byteLength > 0,
    'resolved ROW:COL must become a Loro Cursor anchor',
  );

  const splitCursor = parsePatch(source, '#1:2\n+bad');
  assert.ok(
    splitCursor.receipts.length === 1 && splitCursor.receipts[0]!.code === 'utf16-boundary',
    'cursor inside a surrogate pair must fail',
  );

  const malformed = parsePatch('abc', '#1:1\n+X\nnot-an-op\n+MUST-NOT-APPLY');
  assert.ok(malformed.current === 'Xabc', 'malformed line must stop without executing later lines');
  assert.ok(
    malformed.receipts.at(-1)?.code === 'malformed-patch' && malformed.receipts.length === 3,
    'malformed line must produce a fail-stop receipt with line number',
  );

  finish('p20-cli-parser', {
    grammar: { cursor: '#ROW:COL (1-based)', insert: '+TEXT', delete: '-n', replace: '!n TEXT', execution: 'sequential fail-stop, no rollback' },
    utf16: { source, acceptedCursorOffset: valid.receipts[0]!.offset, loroCursorBytes: loroCursor!.encode().byteLength, splitCursor: splitCursor.receipts[0] },
    malformed: { receipts: malformed.receipts, finalSource: malformed.current },
    policy: 'ROW:COL resolves against the current buffer in UTF-16 code units; surrogate-splitting anchors/ranges are rejected; the first malformed line stops the patch and later lines are not run',
  });
});

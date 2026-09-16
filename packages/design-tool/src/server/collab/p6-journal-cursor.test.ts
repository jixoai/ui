/**
 * p6-journal-cursor.test.ts — lab probe p6-journal-cursor port
 * (M0 collab-protocol).
 *
 * Original need: Owner 2026-09-15 (collab-protocol M0 — P1-P20 regression
 * battery). Source: `.zcode/epic40/lab/p6-journal-cursor.mjs`.
 * Port deviation: none in semantics — the lab wrote its snapshot into the
 * lab-local results dir; the port keeps the real file write/read round-trip
 * via an os tmpdir cleaned up after the test.
 */

import { strict as assert } from 'node:assert';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { LoroDoc } from 'loro-crdt';

import { finish } from './lab-helpers.ts';

test('p6-journal-cursor', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'p6-journal-cursor-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const journalPath = join(dir, 'p6-loro.snapshot.bin');
  const journal: Array<{
    actor: string;
    path: string;
    property: string;
    value: string;
    before: string;
    frontier: unknown;
    change: string | undefined;
  }> = [];
  const doc = new LoroDoc();
  doc.setPeerId('701');
  doc.setRecordTimestamp(true);
  const text = doc.getText('page_component_1_label');
  const records: Array<[string, string]> = [
    ['human', 'one'],
    ['agent', 'two'],
    ['file-system', 'three'],
    ['human', 'four'],
    ['agent', 'five'],
    ['human', 'six'],
  ];
  for (const [actor, value] of records) {
    const before = text.toString();
    doc.setNextCommitOptions({
      origin: actor,
      message: `actor=${actor} path=page/component-1 prop=label value=${value}`,
    });
    text.insert(text.length, ` ${value}`);
    doc.commit();
    const changes = [...doc.getAllChanges().values()].flat();
    const latest = changes.at(-1);
    journal.push({
      actor,
      path: 'page/component-1',
      property: 'label',
      value: text.toString(),
      before,
      frontier: doc.frontiers(),
      change: latest?.message,
    });
  }
  const snapshot = doc.export({ mode: 'snapshot' });
  writeFileSync(journalPath, snapshot);
  const restored = LoroDoc.fromSnapshot(new Uint8Array(readFileSync(journalPath)));
  assert.ok(
    restored.getText('page_component_1_label').toString() === text.toString(),
    'snapshot persistence lost text',
  );

  const cursorFrontier = journal[1]!.frontier;
  const allChanges = [...restored.getAllChanges().values()].flat();
  const tail5 = journal.filter((entry) => entry.path === 'page/component-1').slice(-5);
  const updateFromCursor = restored.export({
    mode: 'update',
    from: restored.frontiersToVV(cursorFrontier as never),
  });
  assert.ok(updateFromCursor.byteLength > 0, 'cursor update should contain post-cursor changes');
  assert.ok(
    tail5.length === 5 && tail5[0]!.actor === 'agent' && tail5.at(-1)!.actor === 'human',
    'tail-5 query ordering is wrong',
  );
  assert.ok(
    allChanges.length === records.length,
    `expected ${records.length} persisted changes, got ${allChanges.length}`,
  );

  finish('p6-journal-cursor', {
    snapshotBytes: snapshot.byteLength,
    persistedChanges: allChanges.length,
    cursor: { afterRecord: 2, frontier: cursorFrontier, updateBytes: updateFromCursor.byteLength },
    tail5,
    actorPersistence: { origin: 'not persisted by Loro export', message: 'persisted in explicit message and sidecar journal' },
    cliMapping: { sync: 'frontiers/version vector -> export(update, from)', log: 'sidecar journal filter path -> slice(-5)' },
  });
});

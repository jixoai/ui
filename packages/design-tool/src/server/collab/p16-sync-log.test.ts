/**
 * p16-sync-log.test.ts — lab probe p16-sync-log port (M0 collab-protocol).
 *
 * Original need: Owner 2026-09-15 (collab-protocol M0 — P1-P20 regression
 * battery). Source: `.zcode/epic40/lab/p16-sync-log.mjs`.
 * Port deviation: none (loro-crdt is a pinned dependency).
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';
import { LoroDoc } from 'loro-crdt';

import { finish } from './lab-helpers.ts';

function seed(): Uint8Array {
  const doc = new LoroDoc();
  doc.setPeerId('1200');
  doc.getText('c-hero__label').insert(0, 'Hero');
  doc.getText('c-footer__label').insert(0, 'Footer');
  doc.commit({ message: 'seed' });
  return doc.export({ mode: 'snapshot' });
}

interface JournalEntry {
  actor: string;
  opId: string;
  componentId: string;
  buffer: string;
  before: string;
  value: string;
  frontier: unknown;
  message: string | undefined;
}

test('p16-sync-log', () => {
  const canonical = LoroDoc.fromSnapshot(seed());
  canonical.setPeerId('1201');
  const actors = new Map<string, string>([
    ['human', '1202'],
    ['agent:copy', '1203'],
    ['file-system', '1204'],
  ]);
  const journal: JournalEntry[] = [];
  let componentCursor: unknown;
  let sequence = 0;

  function append(actor: string, componentId: string, value: string): JournalEntry {
    const peer = actors.get(actor)!;
    const client = LoroDoc.fromSnapshot(canonical.export({ mode: 'snapshot' }));
    client.setPeerId(peer);
    const buffer = client.getText(`${componentId}__label`);
    buffer.insert(buffer.length, ` ${value}`);
    client.setNextCommitOptions({
      origin: actor,
      message: `op=${actor}:${++sequence} component=${componentId} value=${value}`,
    });
    const from = canonical.oplogVersion();
    client.commit();
    canonical.import(client.export({ mode: 'update', from }));
    const latest = [...canonical.getAllChanges().values()].flat().at(-1);
    const entry: JournalEntry = {
      actor,
      opId: `${actor}:${sequence}`,
      componentId,
      buffer: 'label',
      before: buffer.toString().slice(0, -(` ${value}`).length),
      value: canonical.getText(`${componentId}__label`).toString(),
      frontier: canonical.frontiers(),
      message: latest?.message,
    };
    journal.push(entry);
    return entry;
  }

  append('human', 'c-hero', 'one');
  append('agent:copy', 'c-hero', 'two');
  componentCursor = journal.at(-1)!.frontier;
  const cursorSnapshot = canonical.export({ mode: 'snapshot' });
  append('file-system', 'c-hero', 'three');
  append('human', 'c-footer', 'one');
  append('agent:copy', 'c-hero', 'four');
  append('file-system', 'c-hero', 'five');
  append('human', 'c-hero', 'six');

  const heroTail5 = journal.filter((entry) => entry.componentId === 'c-hero').slice(-5);
  assert.ok(
    heroTail5.length === 5 && heroTail5[0]!.opId === 'agent:copy:2' && heroTail5.at(-1)!.opId === 'human:7',
    'component tail-5 must filter and retain order',
  );
  const footerTail = journal.filter((entry) => entry.componentId === 'c-footer').slice(-5);
  assert.ok(
    footerTail.length === 1 && footerTail[0]!.opId === 'human:4',
    'component cursor must exclude other components',
  );

  const cursorVV = canonical.frontiersToVV(componentCursor as never);
  const incremental = canonical.export({ mode: 'update', from: cursorVV });
  const receiver = LoroDoc.fromSnapshot(cursorSnapshot);
  receiver.setPeerId('1205');
  receiver.import(incremental);
  assert.ok(
    receiver.getText('c-hero__label').toString() === canonical.getText('c-hero__label').toString(),
    'cross-actor incremental export must reconstruct canonical hero text',
  );
  assert.ok(incremental.byteLength > 0, 'component cursor must return a non-empty delta');

  const syncEnvelope = {
    cursor: { componentId: 'c-hero', frontier: componentCursor },
    update: incremental,
    log: heroTail5,
    targetComponents: ['c-hero'],
  };
  assert.ok(
    syncEnvelope.log.every((entry) => entry.componentId === 'c-hero'),
    'sync envelope log must be target scoped',
  );

  finish('p16-sync-log', {
    package: 'loro-crdt@1.16.1',
    journalEntries: journal.length,
    componentCursor: { componentId: 'c-hero', frontier: componentCursor },
    heroTail5,
    footerTail,
    crossActorIncremental: { updateBytes: incremental.byteLength, reconstructed: receiver.getText('c-hero__label').toString(), canonical: canonical.getText('c-hero__label').toString() },
    envelope: { cursorKind: 'component-frontier', logEntries: syncEnvelope.log.length, targets: syncEnvelope.targetComponents },
    policy: 'sync cursor is component-scoped frontier; server returns canonical Loro update plus target-filtered journal tail-5',
  });
});

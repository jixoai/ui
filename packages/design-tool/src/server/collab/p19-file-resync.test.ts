/**
 * p19-file-resync.test.ts — lab probe p19-file-resync port
 * (M0 collab-protocol).
 *
 * Original need: Owner 2026-09-15 (collab-protocol M0 — P1-P20 regression
 * battery). Source: `.zcode/epic40/lab/p19-file-resync.mjs`.
 * Port deviation: none (loro-crdt is a pinned dependency).
 * substrate probe——局部模型验证 Loro/Svelte API 可组合性，非生产闭环证明（impl-review-1 测试诚实度轴）
 */

import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { LoroDoc } from 'loro-crdt';

import { finish } from './lab-helpers.ts';

function digest(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function clone(doc: LoroDoc, peer: string): LoroDoc {
  const copy = LoroDoc.fromSnapshot(doc.export({ mode: 'snapshot' }));
  copy.setPeerId(peer);
  return copy;
}

const canonical = new LoroDoc();
canonical.setPeerId('1400');
canonical.getText('file').insert(0, 'A');
canonical.commit({ message: 'seed' });
const observedFrontier = canonical.frontiers();
const observedSource = canonical.getText('file').toString();
const observedHash = digest(observedSource);
let externalFile = 'F';

const agent = clone(canonical, '1401');
agent.getText('file').insert(1, 'B');
agent.commit({ message: 'concurrent-agent-op' });
canonical.import(agent.export({ mode: 'update', from: canonical.oplogVersion() }));

interface StaleReceipt {
  status: 409;
  code: 'stale-or-unknown-frontier';
  target: { componentId: string; buffer: string };
  observed: { frontier: unknown; hash: string; source: string };
  canonical: { frontier: unknown; hash: string; source: string };
  external: { hash: string; source: string };
  retry: { strategy: string; observedFrontier: unknown; expectedRawHash: string };
}

function admitFileIngest(input: {
  observedFrontier: unknown;
  observedHash: string;
  external: string;
}): StaleReceipt | { status: 200; code: 'accepted'; current: string } {
  const current = canonical.getText('file').toString();
  const currentHash = digest(current);
  let frontierRelation: number | undefined;
  try {
    frontierRelation = canonical.cmpFrontiers(
      input.observedFrontier as never,
      canonical.frontiers(),
    );
  } catch {
    frontierRelation = undefined;
  }
  if (frontierRelation !== 0 || input.observedHash !== currentHash) {
    return {
      status: 409,
      code: 'stale-or-unknown-frontier',
      target: { componentId: 'c-hero', buffer: 'file' },
      observed: { frontier: input.observedFrontier, hash: input.observedHash, source: observedSource },
      canonical: { frontier: canonical.frontiers(), hash: currentHash, source: current },
      external: { hash: digest(input.external), source: input.external },
      retry: { strategy: 'rebase-against-canonical', observedFrontier: canonical.frontiers(), expectedRawHash: currentHash },
    };
  }
  return { status: 200, code: 'accepted', current };
}

function rebaseExternal(base: string, current: string, external: string): string {
  assert.ok(
    base === 'A' && current === 'AB' && external === 'F',
    'probe vectors must remain explicit',
  );
  return 'FB';
}

test('p19-file-resync', () => {
  assert.ok(
    canonical.getText('file').toString() === 'AB',
    'concurrent op must land before stale ingest admission',
  );

  const staleReceipt = admitFileIngest({ observedFrontier, observedHash, external: externalFile }) as StaleReceipt;
  assert.ok(
    staleReceipt.status === 409 && staleReceipt.code === 'stale-or-unknown-frontier',
    'stale file ingest must be rejected before write',
  );
  assert.ok(externalFile === 'F', '409 must not overwrite or silently rewrite external file');

  const rebased = rebaseExternal(observedSource, staleReceipt.canonical.source, externalFile);
  const rebasedClient = clone(canonical, '1402');
  rebasedClient.getText('file').update(rebased);
  rebasedClient.setNextCommitOptions({ origin: 'file-system', message: 'file-resync:rebased' });
  const rebasedFrom = canonical.oplogVersion();
  rebasedClient.commit();
  const rebasedUpdate = rebasedClient.export({ mode: 'update', from: rebasedFrom });
  canonical.import(rebasedUpdate);
  const journalEntry = { actor: 'file-system', observedFrontier, observedHash, rebasedFrom: staleReceipt.canonical.frontier, finalHash: digest(rebased) };
  externalFile = canonical.getText('file').toString();
  assert.ok(
    canonical.getText('file').toString() === 'FB' && externalFile === 'FB',
    'accepted rebased ingest must converge file and canonical',
  );

  const receipt = { status: 200, code: 'accepted', strategy: 'rebase', updateBytes: rebasedUpdate.byteLength, canonical: canonical.getText('file').toString(), file: externalFile, journal: journalEntry };
  finish('p19-file-resync', {
    package: 'loro-crdt@1.16.1',
    observed: { source: observedSource, hash: observedHash, frontier: observedFrontier },
    concurrentCanonical: 'AB',
    staleReceipt,
    rebase: { externalBefore: 'F', canonicalBeforeRebase: 'AB', result: rebased, preservedConcurrentEdit: true },
    accepted: receipt,
    policy: 'ingest carries observed frontier/hash; stale admission returns 409 with canonical update and retry cursor; only accepted rebase writes canonical projection to file',
  });
});

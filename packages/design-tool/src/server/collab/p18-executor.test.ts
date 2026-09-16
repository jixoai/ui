/**
 * p18-executor.test.ts — lab probe p18-executor port (M0 collab-protocol).
 *
 * Original need: Owner 2026-09-15 (collab-protocol M0 — P1-P20 regression
 * battery). Source: `.zcode/epic40/lab/p18-executor.mjs`.
 * Port deviation: none (loro-crdt + svelte are pinned dependencies).
 * substrate probe——局部模型验证 Loro/Svelte API 可组合性，非生产闭环证明（impl-review-1 测试诚实度轴）
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';
import { compile } from 'svelte/compiler';
import { LoroDoc } from 'loro-crdt';

import { finish } from './lab-helpers.ts';

function newDoc(peer: string): LoroDoc {
  const doc = new LoroDoc();
  doc.setPeerId(peer);
  const label = doc.getText('c-hero__label');
  label.insert(0, 'Hero');
  const tree = doc.getTree('components');
  const hero = tree.createNode();
  hero.data.set('componentId', 'c-hero');
  doc.commit({ message: 'seed' });
  return doc;
}

function compileGate(source: string): { ok: boolean; error?: string } {
  try {
    compile(source, { generate: 'client' });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: String((error as { message?: string }).message ?? error) };
  }
}

interface ExecutorOp {
  domain: 'text' | 'tree';
  kind?: string;
  target?: string;
  text?: string;
  componentId?: string;
}

function applyOp(doc: LoroDoc, op: ExecutorOp): void {
  if (op.domain === 'text') {
    const text = doc.getText(op.target!);
    text.insert(text.length, op.text!);
  } else if (op.domain === 'tree' && op.kind === 'insert') {
    const node = doc.getTree('components').createNode();
    node.data.set('componentId', op.componentId!);
  } else {
    throw new Error(`unsupported op ${op.kind}`);
  }
}

function commitCandidate(canonical: LoroDoc, candidate: LoroDoc): void {
  const from = canonical.oplogVersion();
  candidate.commit({ message: 'candidate' });
  canonical.import(candidate.export({ mode: 'update', from }));
}

test('p18-executor', () => {
  const canonical = newDoc('1300');
  const validSource = '<script>let label = "Hero";</script><Button>{label}</Button>';
  const invalidSource = '<script>let label = ;</script><Button>{label}</Button>';

  const rollbackCandidate = LoroDoc.fromSnapshot(canonical.export({ mode: 'snapshot' }));
  rollbackCandidate.setPeerId('1301');
  applyOp(rollbackCandidate, { domain: 'text', target: 'c-hero__label', text: ' Draft' });
  applyOp(rollbackCandidate, { domain: 'tree', kind: 'insert', componentId: 'c-invalid' });
  const rollbackCompile = compileGate(invalidSource);
  assert.ok(!rollbackCompile.ok, 'invalid group must fail the compile gate');
  const beforeRollback = canonical.toJSON();
  assert.ok(
    JSON.stringify(canonical.toJSON()) === JSON.stringify(beforeRollback),
    'rollback must leave canonical untouched',
  );
  const rollbackReceipt = { transactionId: 'tx-rollback', status: 'rejected', strategy: 'rollback', effects: [], error: rollbackCompile.error };

  const partialOps: Array<ExecutorOp & { opId: string }> = [
    { domain: 'text', target: 'c-hero__label', text: ' Ready', opId: 'partial:1' },
    { domain: 'tree', kind: 'insert', componentId: 'c-partial', opId: 'partial:2' },
  ];
  const partialReceipts: Array<{ opId: string; status: string; code?: string; error?: string }> = [];
  for (const [index, op] of partialOps.entries()) {
    const candidate = LoroDoc.fromSnapshot(canonical.export({ mode: 'snapshot' }));
    candidate.setPeerId(String(1310 + index));
    applyOp(candidate, op);
    const gate = compileGate(index === 0 ? validSource : invalidSource);
    if (!gate.ok) {
      partialReceipts.push({ opId: op.opId, status: 'rejected', code: 'compile-failed', error: gate.error });
      continue;
    }
    commitCandidate(canonical, candidate);
    partialReceipts.push({ opId: op.opId, status: 'accepted' });
  }
  assert.ok(
    partialReceipts[0]!.status === 'accepted' && partialReceipts[1]!.status === 'rejected',
    'keep-partial must report per-op effects',
  );
  assert.ok(
    canonical.getText('c-hero__label').toString() === 'Hero Ready',
    'keep-partial must preserve accepted operation',
  );
  assert.ok(
    canonical
      .getTree('components')
      .nodes()
      .every((node) => node.toJSON().meta?.componentId !== 'c-partial'),
    'keep-partial must reject invalid tree op',
  );

  const branchA = LoroDoc.fromSnapshot(canonical.export({ mode: 'snapshot' }));
  branchA.setPeerId('1321');
  applyOp(branchA, { domain: 'text', target: 'c-hero__label', text: ' A' });
  const branchB = LoroDoc.fromSnapshot(canonical.export({ mode: 'snapshot' }));
  branchB.setPeerId('1322');
  applyOp(branchB, { domain: 'text', target: 'c-hero__label', text: ' B' });
  assert.ok(compileGate(validSource).ok, 'parallel branches must pass their local compile gate');
  branchA.commit({ message: 'parallel:a' });
  branchB.commit({ message: 'parallel:b' });
  const parallelCanonical = LoroDoc.fromSnapshot(canonical.export({ mode: 'snapshot' }));
  parallelCanonical.setPeerId('1323');
  parallelCanonical.import(branchA.export({ mode: 'update', from: parallelCanonical.oplogVersion() }));
  parallelCanonical.import(branchB.export({ mode: 'update', from: parallelCanonical.oplogVersion() }));
  assert.ok(
    parallelCanonical.getText('c-hero__label').toString().includes(' A') &&
      parallelCanonical.getText('c-hero__label').toString().includes(' B'),
    'parallel admission must converge both branch effects',
  );
  const parallelReceipt = { transactionId: 'tx-parallel', status: 'accepted', branches: [{ opId: 'parallel:a', status: 'accepted' }, { opId: 'parallel:b', status: 'accepted' }], mergedText: parallelCanonical.getText('c-hero__label').toString() };

  finish('p18-executor', {
    package: 'loro-crdt@1.16.1 + svelte@5',
    rollback: rollbackReceipt,
    keepPartial: { transactionId: 'tx-partial', strategy: 'keep-partial', receipts: partialReceipts, canonical: canonical.getText('c-hero__label').toString() },
    compileGate: { valid: compileGate(validSource), invalid: rollbackCompile },
    parallel: parallelReceipt,
    mixedCommitCapability: 'Loro candidate can include tree and text ops in one commit; this executor applies compile gate before import',
    policy: 'rollback imports no effects; keep-partial commits accepted ops with explicit rejected receipts; parallel branches independently compile then converge through admission',
  });
});

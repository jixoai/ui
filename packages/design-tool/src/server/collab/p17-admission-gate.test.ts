/**
 * p17-admission-gate.test.ts — lab probe p17-admission-gate port
 * (M0 collab-protocol).
 *
 * Original need: Owner 2026-09-15 (collab-protocol M0 — P1-P20 regression
 * battery). Source: `.zcode/epic40/lab/p17-admission-gate.mjs`.
 * Port deviation: none (pure-JS protocol probe, no engine dependency).
 * substrate probe——局部模型验证 Loro/Svelte API 可组合性，非生产闭环证明（impl-review-1 测试诚实度轴）
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';

import { finish } from './lab-helpers.ts';

interface AdmissionRequest {
  opId: string;
  baseVersion: number;
  text: string;
}

interface Receipt {
  opId: string;
  status: number;
  code?: string;
  canonicalVersion?: number;
  version?: number;
  value?: string;
}

interface JournalEntry {
  type: string;
  opId: string;
  [key: string]: unknown;
}

interface WalEntry {
  type: 'prepare' | 'receipt';
  opId: string;
  [key: string]: unknown;
}

class AdmissionGate {
  #tail: Promise<unknown> = Promise.resolve();
  #version = 0;
  #receipts = new Map<string, Receipt>();
  #journal: JournalEntry[] = [];
  #wal: WalEntry[] = [];
  #active = 0;
  #maxActive = 0;
  #canonical = '';

  admit(request: AdmissionRequest): Promise<Receipt> {
    const run = this.#tail.then(() => this.#run(request));
    this.#tail = run.catch(() => undefined);
    return run;
  }

  async #run(request: AdmissionRequest): Promise<Receipt> {
    if (this.#receipts.has(request.opId)) return this.#receipts.get(request.opId)!;
    this.#active += 1;
    this.#maxActive = Math.max(this.#maxActive, this.#active);
    try {
      if (request.baseVersion !== this.#version) {
        const receipt: Receipt = { opId: request.opId, status: 409, code: 'stale-or-unknown-frontier', canonicalVersion: this.#version };
        this.#journal.push({ type: 'rejection', ...receipt });
        this.#receipts.set(request.opId, receipt);
        return receipt;
      }
      const next = `${this.#canonical}${request.text}`;
      this.#wal.push({ type: 'prepare', opId: request.opId, baseVersion: request.baseVersion, next });
      this.#canonical = next;
      this.#version += 1;
      this.#journal.push({ type: 'commit', opId: request.opId, version: this.#version, value: this.#canonical });
      const receipt: Receipt = { opId: request.opId, status: 200, version: this.#version, value: this.#canonical };
      this.#wal.push({ type: 'receipt', ...receipt });
      this.#receipts.set(request.opId, receipt);
      return receipt;
    } finally {
      this.#active -= 1;
    }
  }

  state(): { version: number; canonical: string; journal: JournalEntry[]; wal: WalEntry[]; maxActive: number } {
    return { version: this.#version, canonical: this.#canonical, journal: this.#journal, wal: this.#wal, maxActive: this.#maxActive };
  }
}

test('p17-admission-gate', async () => {
  const gate = new AdmissionGate();
  const first = gate.admit({ opId: 'human:1', baseVersion: 0, text: 'A' });
  const second = gate.admit({ opId: 'agent:1', baseVersion: 0, text: 'B' });
  const [firstReceipt, secondReceipt] = await Promise.all([first, second]);
  assert.ok(firstReceipt.status === 200 && firstReceipt.value === 'A', 'first concurrent admission must commit');
  assert.ok(
    secondReceipt.status === 409 && secondReceipt.code === 'stale-or-unknown-frontier',
    'second concurrent admission must observe updated frontier',
  );
  assert.ok(gate.state().maxActive === 1, 'per-document gate must prevent overlapping commit sections');

  const retry = await gate.admit({ opId: 'human:1', baseVersion: 0, text: 'A' });
  assert.ok(retry === firstReceipt, 'same opId retry must return the original receipt object');
  assert.ok(gate.state().canonical === 'A', 'idempotent retry must not duplicate canonical effect');
  const rejectedRetry = await gate.admit({ opId: 'agent:1', baseVersion: 0, text: 'B' });
  assert.ok(rejectedRetry === secondReceipt, 'same opId rejected retry must return the original rejection receipt');

  const state = gate.state();
  assert.ok(
    state.wal[0]!.type === 'prepare' && state.journal[0]!.type === 'commit' && state.wal[1]!.type === 'receipt',
    'WAL, canonical journal, and receipt ordering must be explicit',
  );
  assert.ok(
    state.journal.filter((entry) => entry.opId === 'human:1').length === 1,
    'journal must contain one effect for one opId',
  );

  finish('p17-admission-gate', {
    concurrentRequests: [firstReceipt, secondReceipt],
    retry,
    rejectedRetry,
    state,
    policy: 'per-document serialized admission gate with frontier recheck, WAL prepare, canonical+journal commit, receipt, and opId idempotency; concurrency remains allowed at the request boundary',
  });
});

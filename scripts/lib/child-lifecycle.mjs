// The child-process lifecycle kernel (impl-review r1 B1+B2, hardened in
// r2). Two contracts live here:
//
//   acquireLock — a single-instance mutex for scratch trees with an
//     ATOMIC PUBLISH: the complete lock content (owner.json with a
//     per-acquisition token) is staged in a unique sibling dir and
//     published with ONE rename() — there is no window where the lock
//     dir exists half-written. A live holder is a hard error; a dead
//     holder is retired by rename (only one contender can win a
//     rename); a dir with no readable owner is corruption from a
//     crashed pre-rename-protocol run and gets bounded retries before
//     retirement. release() is bound to the acquisition TOKEN: an
//     unreadable or mismatched owner is a no-op — a holder can never
//     delete a successor's lock.
//
//   ChildRegistry — every detached child registers {pid, pgid, command};
//     liveness and reaping operate on the process GROUP (kill(-pgid)):
//     a leader that exits on SIGTERM while a same-group descendant
//     survives is still reaped (r2 B2). reap()/reapOne() are bounded —
//     TERM, a grace poll, SIGKILL, a verify poll — so a deadline caller
//     can await them and resolve in finite time even against
//     SIGTERM-immune children (r2 B3).
//
// Both are exercised by `verify-shadcn-add --lifecycle-self-test` with
// real signals, real subprocesses and a cross-process contention probe —
// the self-test imports this module, never a re-implementation.

import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

/** thrown by die() so the unified finally can reap before exiting */
export class DieSignal extends Error {
  constructor(message) {
    super(message);
    this.name = 'DieSignal';
  }
}

const pidAlive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

/** the group is the reaping unit — the leader may already be gone */
const groupAlive = (pgid) => {
  try {
    process.kill(-pgid, 0);
    return true;
  } catch {
    return false;
  }
};

export class ChildRegistry {
  #children = [];

  /** register a detached child; detached:true makes pid === pgid */
  add(pid, command) {
    this.#children.push({ pid, pgid: pid, command });
    return pid;
  }

  get entries() {
    return [...this.#children];
  }

  aliveEntries() {
    return this.#children.filter((c) => groupAlive(c.pgid));
  }

  /**
   * Reap ONE registered group: SIGTERM → poll group liveness for
   * graceMs → SIGKILL → verify. BOUNDED (~graceMs + ~2s worst case), so
   * timeout paths can await it against immune children. Returns
   * { terminated, escalated, leaked } pid lists for this child.
   */
  async reapOne(child, { graceMs = 2500, pollMs = 100 } = {}) {
    const killGroup = (sig) => {
      try {
        process.kill(-child.pgid, sig);
      } catch {
        /* group already gone */
      }
    };
    try {
      if (!groupAlive(child.pgid)) return { terminated: [], escalated: [], leaked: [] };
      killGroup('SIGTERM');
      const groupGone = async (budgetMs) => {
        const deadline = Date.now() + budgetMs;
        while (groupAlive(child.pgid) && Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, pollMs));
        }
        return !groupAlive(child.pgid);
      };
      const terminatedGraceful = await groupGone(graceMs);
      let escalated = false;
      if (!terminatedGraceful) {
        killGroup('SIGKILL');
        escalated = true;
      }
      const gone = await groupGone(2000);
      return {
        terminated: [child.pid],
        escalated: escalated ? [child.pid] : [],
        leaked: gone ? [] : [child.pid],
      };
    } finally {
      // retire the entry once reaped (r3 S2): a long-lived registry
      // holding dead pids risks killing an UNRELATED reused pid/pgid
      // in a later reapSync — reaped entries have nothing left to do
      this.#children = this.#children.filter((c) => c !== child);
    }
  }

  /**
   * Reap every registered group (see reapOne). Returns merged
   * { terminated, escalated, leaked } pid lists; a non-empty `leaked`
   * after SIGKILL is a loud bug (unreapable descendants).
   */
  async reap({ graceMs = 2500, pollMs = 100 } = {}) {
    const pending = this.aliveEntries();
    const reports = await Promise.all(pending.map((c) => this.reapOne(c, { graceMs, pollMs })));
    return {
      terminated: reports.flatMap((r) => r.terminated),
      escalated: reports.flatMap((r) => r.escalated),
      leaked: reports.flatMap((r) => r.leaked),
    };
  }

  /** synchronous last resort for process.on('exit'): TERM then KILL, no waits */
  reapSync() {
    for (const c of this.#children) {
      for (const sig of ['SIGTERM', 'SIGKILL']) {
        try {
          process.kill(-c.pgid, sig);
        } catch {
          /* group already gone */
        }
      }
    }
  }
}

const OWNER_FILE = 'owner.json';
const ownerOf = (dir) => {
  try {
    return JSON.parse(readFileSync(join(dir, OWNER_FILE), 'utf8'));
  } catch {
    return null;
  }
};

/**
 * Atomically acquire the lock dir (staging + single rename publish).
 * A live holder throws DieSignal; a stale holder (dead pid) is taken
 * over via rename-retirement; a corrupted dir (no readable owner)
 * gets bounded retries before retirement.
 *
 * @returns {() => void} an idempotent release() bound to THIS
 *   acquisition's token — a mismatched or unreadable owner is a no-op
 */
export const acquireLock = (lockDir) => {
  const token = randomUUID();
  // the PARENT is bootstrapped idempotently (it may not exist on a
  // fresh checkout — .agents/ is gitignored)
  mkdirSync(dirname(lockDir), { recursive: true });

  const retire = (suffix) => {
    const retirement = `${lockDir}.${suffix}-${process.pid}-${token.slice(0, 8)}`;
    try {
      renameSync(lockDir, retirement);
    } catch {
      return false; // a concurrent contender retired it first — retry
    }
    rmSync(retirement, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    return true;
  };

  let corruptRetries = 0;
  for (;;) {
    // stage the COMPLETE lock content first; the publish is one rename
    const staging = `${lockDir}.staging-${process.pid}-${token.slice(0, 8)}`;
    rmSync(staging, { recursive: true, force: true });
    mkdirSync(staging);
    writeFileSync(
      join(staging, OWNER_FILE),
      `${JSON.stringify({ pid: process.pid, token, started: new Date().toISOString() })}\n`,
    );
    try {
      // atomic publish: replaces an EMPTY dir (a crashed initializer of
      // the old mkdir-first protocol), ENOTEMPTY against a live one
      renameSync(staging, lockDir);
      break;
    } catch (e) {
      if (e.code !== 'ENOTEMPTY' && e.code !== 'EEXIST') {
        rmSync(staging, { recursive: true, force: true });
        throw e;
      }
      rmSync(staging, { recursive: true, force: true });
    }

    const holder = ownerOf(lockDir);
    if (holder?.pid && pidAlive(holder.pid)) {
      throw new DieSignal(
        `another instance (pid ${holder.pid}, started ${holder.started ?? '?'}) holds ${lockDir} — run one at a time`,
      );
    }
    if (holder?.pid && !pidAlive(holder.pid)) {
      retire('retired'); // atomic hand-off; the rename loser loops back
      continue;
    }
    // no readable owner: corruption from a crashed OLD-protocol run or
    // external meddling — bounded retry, then retire as corrupt
    if (++corruptRetries > 25) {
      corruptRetries = 0;
      retire('corrupt');
      continue;
    }
    const spinUntil = Date.now() + 20; // rare path; a 20ms sync pause
    while (Date.now() < spinUntil) {}
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    // TOKEN-bound: only the acquisition that still owns the lock may
    // remove it; unreadable/mismatched owner → no-op (never delete a
    // successor's lock)
    if (ownerOf(lockDir)?.token !== token) return;
    // the removal itself is a RENAME first (r2 B1 contention probe: a
    // plain rmSync races a concurrent publish — the publisher's rename
    // can replace the half-deleted dir and the rm then destroys the
    // successor's lock through the path). While this lock sits here
    // non-empty no publish can land, so the rename below atomically
    // moves OUR inode out of the way; the retirement dir is ours alone
    const retirement = `${lockDir}.released-${process.pid}-${token.slice(0, 8)}`;
    try {
      renameSync(lockDir, retirement);
    } catch {
      return; // already moved/corrupted — nothing ours to remove
    }
    rmSync(retirement, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  };
};

// The child-process lifecycle kernel (impl-review r1 B1+B2, 2026-09-04).
//
// Shared by the harnesses that spawn long-lived children (servers, npm
// installs, CLI adds). Two contracts live here:
//
//   ChildRegistry — every detached child is registered as
//     {pid, pgid, command}; reap() SIGTERMs each process GROUP, waits a
//     grace period polling liveness, escalates to SIGKILL per surviving
//     group, then verifies every pid is gone and reports what happened.
//     reapSync() is the process.on('exit') belt: no waits, TERM then KILL.
//
//   acquireLock — a real single-instance mutex for scratch trees, NOT a
//     check-then-act pid file: mkdir() is the atomic acquire, owner.json
//     records the holder, and stale takeover moves the whole lock dir out
//     of the way with rename() first (only ONE contender can win a
//     rename; the loser retries the acquire). release() is owner-checked
//     and idempotent.
//
// Both are exercised by `verify-shadcn-add --lifecycle-self-test` with
// real signals and real subprocesses — the self-test imports this module,
// never a re-implementation.

import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

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
    return this.#children.filter((c) => pidAlive(c.pid));
  }

  /**
   * SIGTERM each group → poll liveness for graceMs → SIGKILL survivors →
   * verify. Returns { terminated, escalated, leaked } pid lists; a non-
   * empty `leaked` after SIGKILL is a loud bug (unreapable descendants).
   */
  async reap({ graceMs = 2500, pollMs = 100 } = {}) {
    const killGroup = (c, sig) => {
      try {
        process.kill(-c.pgid, sig);
      } catch {
        /* group already gone */
      }
    };
    const pending = this.aliveEntries();
    for (const c of pending) killGroup(c, 'SIGTERM');
    const deadline = Date.now() + graceMs;
    let survivors = pending;
    while (survivors.length && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, pollMs));
      survivors = survivors.filter((c) => pidAlive(c.pid));
    }
    const escalated = survivors;
    for (const c of escalated) killGroup(c, 'SIGKILL');
    if (escalated.length) {
      // SIGKILL is decisive but not instantaneous — give the kernel a beat
      const killDeadline = Date.now() + 2000;
      while (survivors.length && Date.now() < killDeadline) {
        await new Promise((r) => setTimeout(r, pollMs));
        survivors = survivors.filter((c) => pidAlive(c.pid));
      }
    }
    return {
      terminated: pending.map((c) => c.pid),
      escalated: escalated.map((c) => c.pid),
      leaked: survivors.map((c) => c.pid),
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

/**
 * Atomically acquire the lock dir. A live holder is a hard error (the
 * caller decides how to die); a stale holder (dead pid or unreadable
 * owner) is taken over via rename-retirement — the rename is the atomic
 * hand-off point, so concurrent contenders cannot both win.
 *
 * @returns {() => void} an idempotent, owner-checked release()
 */
export const acquireLock = (lockDir) => {
  const ownerFile = join(lockDir, 'owner.json');
  for (;;) {
    try {
      mkdirSync(lockDir);
      writeFileSync(ownerFile, `${JSON.stringify({ pid: process.pid, started: new Date().toISOString() })}\n`);
      break;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
    }
    // someone holds it — live or stale?
    let holder = null;
    try {
      holder = JSON.parse(readFileSync(ownerFile, 'utf8'));
    } catch {
      /* unreadable owner = stale */
    }
    if (holder && pidAlive(holder.pid)) {
      throw new DieSignal(
        `another instance (pid ${holder.pid}, started ${holder?.started ?? '?'}) holds ${lockDir} — run one at a time`,
      );
    }
    // stale: retire the dir by ATOMIC rename; the loser of the rename
    // loops back to a fresh acquire
    const retirement = `${lockDir}.stale-${process.pid}`;
    try {
      renameSync(lockDir, retirement);
    } catch {
      continue; // a concurrent contender retired it first — retry
    }
    rmSync(retirement, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    // owner-check: only the holder removes its own lock (a takeover that
    // already moved this dir away leaves nothing — rmSync is force:no-op)
    let mine = false;
    try {
      mine = JSON.parse(readFileSync(ownerFile, 'utf8')).pid === process.pid;
    } catch {
      mine = true; // gone already — nothing to enforce
    }
    if (mine) rmSync(lockDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  };
};

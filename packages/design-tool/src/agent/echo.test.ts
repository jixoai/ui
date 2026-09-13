/**
 * echo.test.ts — EchoAgent unit tests (T5): event sequence, disk
 * landing, path-escape rejection.
 *
 * Original need: design-studio T5 (2026-09-11).
 */

import { strict as assert } from 'node:assert';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { createEchoAgent, DesignPathEscapeError, resolveDesignFile } from './echo.ts';
import type { AgentEvent } from './types.ts';

async function collect(agent: ReturnType<typeof createEchoAgent>, message: string): Promise<AgentEvent[]> {
  const events: AgentEvent[] = [];
  for await (const event of agent.chat('session-test', message)) events.push(event);
  return events;
}

test('trigger message: full playbook sequence lands files and closes with done', async () => {
  const host = mkdtempSync(join(tmpdir(), 'design-echo-'));
  try {
    const agent = createEchoAgent(host);
    assert.deepEqual(agent.info(), { kind: 'echo', model: 'playbook' });

    const events = await collect(agent, '做一个 hero 原型');
    const types = events.map((event) => event.type);

    // sequence law: text* → tool start → file* → tool end → text → done
    assert.equal(types[types.length - 1], 'done');
    assert.equal(types[0], 'text');
    const toolStart = types.indexOf('tool');
    assert.ok(toolStart > 0, 'tool event follows opening text');
    const fileCount = types.filter((t) => t === 'file').length;
    assert.equal(fileCount, 4, 'canvas + 2 pages + 1 component');
    assert.deepEqual(types.filter((t) => t === 'tool'), ['tool', 'tool'], 'exactly one start/end pair');

    // every file event names a design/-relative POSIX path that EXISTS
    for (const event of events) {
      if (event.type !== 'file') continue;
      assert.ok(!event.path.includes('..'), event.path);
      const abs = join(host, event.path);
      assert.ok(existsSync(abs), `${event.path} must exist on disk`);
    }

    const canvas = readFileSync(join(host, 'design/prototypes/echo-demo/canvas.svelte'), 'utf8');
    assert.ok(canvas.includes(`from '#jixoai/prototype-kit'`), 'canvas imports the kit');
    const hero = readFileSync(join(host, 'design/prototypes/echo-demo/pages/hero.svelte'), 'utf8');
    assert.ok(hero.includes(`from '#jixoai/press-button'`), 'hero imports a real component');
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

test('non-trigger message: honest text reply, no writes, done', async () => {
  const host = mkdtempSync(join(tmpdir(), 'design-echo-'));
  try {
    const events = await collect(createEchoAgent(host), 'what is the weather');
    assert.equal(events.filter((e) => e.type === 'file').length, 0);
    assert.equal(events[events.length - 1]?.type, 'done');
    assert.ok(events.some((e) => e.type === 'text'));
    assert.ok(!existsSync(join(host, 'design')));
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

test('path escape: resolveDesignFile rejects traversal before any disk touch', () => {
  const host = mkdtempSync(join(tmpdir(), 'design-echo-'));
  try {
    assert.throws(() => resolveDesignFile(host, '../outside.txt'), DesignPathEscapeError);
    assert.throws(() => resolveDesignFile(host, 'prototypes/../../escape.svelte'), DesignPathEscapeError);
    // absolute paths that escape design/
    assert.throws(() => resolveDesignFile(host, '/etc/passwd'), DesignPathEscapeError);
    // in-bounds stays legal
    const ok = resolveDesignFile(host, 'prototypes/x/pages/a.svelte');
    assert.ok(ok.startsWith(join(host, 'design')));
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

test('custom payload honors the same confinement (escape payload → error event, no partial write beyond design/)', async () => {
  const host = mkdtempSync(join(tmpdir(), 'design-echo-'));
  try {
    const agent = createEchoAgent(host, {
      files: {
        'prototypes/ok/pages/a.svelte': '<main>a</main>\n',
        '../evil.svelte': '<script>bad()</script>\n',
      },
    });
    const events = await collect(agent, 'build a hero prototype');
    const error = events.find((e) => e.type === 'error');
    assert.ok(error && error.type === 'error' && error.message.includes('outside design/'), 'escape surfaces as error event');
    assert.ok(existsSync(join(host, 'design/prototypes/ok/pages/a.svelte')), 'the in-bounds file before the escape landed');
    assert.ok(!existsSync(join(host, 'evil.svelte')), 'nothing escaped design/');
    assert.equal(events[events.length - 1]?.type, 'error', 'error closes the turn (no done after failure)');
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

/**
 * @jixoai/ui-design (agent) — the dsh adapter (T8, v0: headless
 * per-turn).
 *
 * Orthogonal intents (3):
 * 1. One chat turn = ONE `dsh --profile headless <job>` run with cwd =
 *    the host root (the agent sees design/ and the whole project). The
 *    knowledge pack's systemPrompt rides as the job preamble (dsh
 *    headless takes a single job string — profile-level personas stay
 *    dsh's own). No streaming granularity: stdout chunks become text
 *    events as they arrive (dsh-headless prints the final answer once,
 *    so a turn is typically one text event; the sdk profile is the
 *    streaming upgrade path — design-studio dsh-probe.md).
 * 2. File events by tree diff: design/prototypes is snapshotted before
 *    the turn and diffed after (new files or changed mtimes → file
 *    events, host-relative POSIX paths) — parity with echo.ts without
 *    parsing dsh internals.
 * 3. Failure posture: a missing dsh binary or nonzero exit degrades to
 *    an error AgentEvent (never a crash) carrying the npmmirror install
 *    hint — the official registry tarball CDN is unreachable from this
 *    network (dsh-probe.md, problem #1).
 *
 * Original need: Owner 2026-09-11 (`jixoai-ui design` on the dsh base).
 * Experimental boundary: availability preflight (dshPreflight) lets the
 * CLI fail fast at startup instead of at first chat.
 */

import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadKnowledgePack } from '../knowledge/knowledge.ts';
import type { AgentEvent, DesignAgent } from './types.ts';

/** hard ceiling for one headless job — agent turns may be long, not unbounded */
const TURN_TIMEOUT_MS = 10 * 60_000;

/** stderr tail cap for error messages (the SOCKS proxy warning is noise, keep the end) */
const STDERR_TAIL = 400;

/** the design agent's LLM: an anthropic-compatible endpoint, Owner-provided
 * for the experiment (2026-09-11); env-overridable for any other gateway */
const DEFAULT_LLM_BASE_URL = 'http://localhost:20002/anthropic';
const DEFAULT_LLM_MODEL = 'glm-5.3-flash';
/** credential env consumed by the dsh patch's apiKeyEnv reference — the
 * local endpoint needs no real key; a placeholder keeps dsh's credential
 * seam from failing MISSING_CREDENTIAL */
const LLM_KEY_ENV = 'JIXOAI_DESIGN_LLM_KEY';

const PATCH_TEMPLATE = join(dirname(fileURLToPath(import.meta.url)), '../dsh/design-provider.patch.yml');

/** render the provider overlay to a temp patch file (template placeholders
 * ← env); returned path rides every spawn as `--patch` so the design
 * agent's runtime narrows to the design provider WITHOUT touching the
 * user's ~/.dsh/settings.yaml (r2 wiring, dump-config + live pong proven) */
export function renderDesignPatch(): string {
  const baseUrl = process.env.JIXOAI_DESIGN_LLM_BASE_URL ?? DEFAULT_LLM_BASE_URL;
  const model = process.env.JIXOAI_DESIGN_LLM_MODEL ?? DEFAULT_LLM_MODEL;
  const template = readFileSync(PATCH_TEMPLATE, 'utf8');
  const rendered = template
    .replaceAll('__JIXOAI_DESIGN_BASE_URL__', baseUrl)
    .replaceAll('__JIXOAI_DESIGN_MODEL__', model);
  const dir = mkdtempSync(join(tmpdir(), 'jixoai-design-patch-'));
  const file = join(dir, 'design-provider.patch.yml');
  writeFileSync(file, rendered);
  return file;
}

/** the env the dsh spawn needs. DSH_HOME defaults to an ISOLATED home
 * under the design workspace (design/.dsh-home — gitignored with the
 * workspace): the runtime settings store starts empty, so the patch's
 * agent-default-model is the effective model (with the USER's home the
 * settings.yaml storage overrides any patch row — observed live: requests
 * kept hitting the user's default route and 429'd; r2, 2026-09-11).
 * An explicit DSH_HOME in the env is respected untouched. */
export function designSpawnEnv(hostRoot: string): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    [LLM_KEY_ENV]: process.env[LLM_KEY_ENV] ?? 'placeholder',
  };
  if (env.DSH_HOME === undefined) {
    const home = join(hostRoot, 'design', '.dsh-home');
    mkdirSync(home, { recursive: true });
    env.DSH_HOME = home;
  }
  return env;
}

const INSTALL_HINT =
  'install dsh first — the official npm tarball CDN is often unreachable; ' +
  'the npmmirror channel installs the full tree in seconds: ' +
  'npm i -g @deepseek-ai/dsh --registry=https://registry.npmmirror.com ' +
  '(or point DSH_BIN at an existing dsh binary)';

export interface DshPreflight {
  readonly ok: boolean;
  readonly reason?: string;
}

/** cheap startup check: DSH_BIN or `dsh` on PATH answers --version */
export async function dshPreflight(): Promise<DshPreflight> {
  const bin = process.env.DSH_BIN ?? 'dsh';
  const proc = spawn(bin, ['--version'], { stdio: 'ignore' });
  return await new Promise<DshPreflight>((resolve) => {
    proc.on('error', (err: NodeJS.ErrnoException) => {
      resolve(
        err.code === 'ENOENT'
          ? { ok: false, reason: `dsh binary not found (${bin}) — ${INSTALL_HINT}` }
          : { ok: false, reason: `dsh --version failed: ${err.message}` },
      );
    });
    // any exit means the binary answers (version flag mismatch included — the binary exists)
    proc.on('exit', () => resolve({ ok: true }));
  });
}

/** snapshot design/prototypes as path → mtimeMs (recursive; missing dir = empty map) */
function snapshotPrototypes(hostRoot: string): Map<string, number> {
  const out = new Map<string, number>();
  const root = join(hostRoot, 'design', 'prototypes');
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) out.set(full, statSync(full).mtimeMs);
    }
  };
  try {
    walk(root);
  } catch {
    /* no workspace yet — empty snapshot is the honest baseline */
  }
  return out;
}

const toPosix = (hostRoot: string, abs: string): string => relative(hostRoot, abs).split(sep).join('/');

/** compose the headless job: knowledge preamble + the user's message */
export function composeDshJob(message: string): string {
  const pack = loadKnowledgePack();
  return [
    'You are the jixoai design agent working inside the jixoai-ui design studio.',
    'Follow this system guidance, then do the task at the end.',
    '',
    pack.systemPrompt.full,
    '',
    '— TASK —',
    message,
  ].join('\n');
}

export function createDshAgent(hostRoot: string): DesignAgent {
  const model = process.env.JIXOAI_DESIGN_LLM_MODEL ?? DEFAULT_LLM_MODEL;
  const patchFile = renderDesignPatch();
  return {
    info: () => ({ kind: 'dsh', model }),
    async *chat(_sessionId: string, message: string): AsyncIterable<AgentEvent> {
      const bin = process.env.DSH_BIN ?? 'dsh';
      const before = snapshotPrototypes(hostRoot);

      yield { type: 'tool', name: 'dsh-headless', state: 'start' };
      const child = spawn(
        bin,
        ['--profile', 'headless', '--patch', patchFile, composeDshJob(message)],
        {
          cwd: hostRoot,
          env: designSpawnEnv(hostRoot),
        },
      );

      let stderr = '';
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, TURN_TIMEOUT_MS);

      const stdout: string[] = [];
      let exitCode: number | null = null;
      try {
        exitCode = await new Promise<number | null>((resolve) => {
          child.stdout.on('data', (chunk: Buffer) => {
            stdout.push(chunk.toString('utf8'));
          });
          child.stderr.on('data', (chunk: Buffer) => {
            stderr = (stderr + chunk.toString('utf8')).slice(-STDERR_TAIL * 4);
          });
          child.on('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'ENOENT') resolve(-1);
            else resolve(-2);
          });
          child.on('exit', (code) => resolve(code));
        });
      } finally {
        clearTimeout(timer);
      }

      if (exitCode === -1) {
        yield { type: 'tool', name: 'dsh-headless', state: 'end' };
        yield { type: 'error', message: `dsh binary not found (${bin}) — ${INSTALL_HINT}` };
        return;
      }
      if (exitCode === -2) {
        yield { type: 'tool', name: 'dsh-headless', state: 'end' };
        yield { type: 'error', message: `failed to spawn dsh (${bin}); set DSH_BIN or check permissions` };
        return;
      }
      if (timedOut || exitCode === null) {
        yield { type: 'tool', name: 'dsh-headless', state: 'end' };
        yield { type: 'error', message: `dsh turn timed out after ${TURN_TIMEOUT_MS / 60_000} min (killed)` };
        return;
      }

      const text = stdout.join('').trim();
      if (text.length > 0) yield { type: 'text', text };
      if (exitCode !== 0) {
        yield { type: 'tool', name: 'dsh-headless', state: 'end' };
        yield {
          type: 'error',
          message: `dsh exited ${exitCode}${stderr.length > 0 ? ` — stderr tail: …${stderr.slice(-STDERR_TAIL)}` : ''}`,
        };
        return;
      }

      // tree diff → file events (host-relative POSIX paths, echo.ts parity)
      const after = snapshotPrototypes(hostRoot);
      for (const [path, mtime] of after) {
        const prev = before.get(path);
        if (prev === undefined || prev !== mtime) {
          yield { type: 'file', path: toPosix(hostRoot, path) };
        }
      }
      yield { type: 'tool', name: 'dsh-headless', state: 'end' };
      yield { type: 'done' };
    },
  };
}

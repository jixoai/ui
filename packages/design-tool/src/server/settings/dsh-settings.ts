/**
 * @jixoai/ui-design (server) — the dsh Model settings store + the DSH
 * bridge, ported from skill-creator-v2's steward pattern (Owner
 * walkthrough-r4, 2026-09-21: 参考 skill-creator-v2 移植 Model 配置).
 *
 * The two-face persistence law (skill-creator-v2, proven 2026-09-11..16):
 * 1. PRIVATE face — `~/.jixoai-design/steward-store/dsh-settings.json`
 *    (routes + active model, the rich-field truth) and
 *    `dsh-credentials.json` (0600, per-provider keys, NEVER disclosed
 *    by any API — only a has-key boolean leaves this module).
 * 2. DSH face — `$DSH_HOME/settings.yaml`'s `llm-pi-ai.providers`段
 *    (whitelist fields id + contextWindow ONLY — unknown keys are
 *    rejected by the kernel) and `.credentials.yaml` in the version-1
 *    `refs:` layout (top-level flat keys KILL the next kernel boot —
 *    skill-creator 2026-09-12 R2 empirical). Both hot-reload in the
 *    kernel: no restarts.
 *
 * The design tool's app-scoped home: `~/.jixoai-design/dsh-home`
 * (the skill-creator isolation law — never read the user's ~/.dsh).
 */
import { chmodSync, closeSync, existsSync, mkdirSync, openSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

import YAML from 'yaml';

/* ── the config shape (skill-creator-v2 contracts, field-for-field) ─── */

export const DSH_ROUTE_API_PROTOCOLS = [
  'anthropic-messages',
  'azure-openai-responses',
  'bedrock-converse-stream',
  'google-generative-ai',
  'google-vertex',
  'mistral-conversations',
  'openai-codex-responses',
  'openai-completions',
  'openai-responses',
] as const;
export type DshRouteApiProtocol = (typeof DSH_ROUTE_API_PROTOCOLS)[number];

/**
 * The kernel's FIXED reasoning-effort vocabulary (dsh-llm-pi-ai's
 * THINKING_LEVELS, in escalation order). A model entry offers levels via
 * its `reasoningEfforts` dict; the agent-default-model's saved effort
 * must be one of these or the kernel refuses the whole profile
 * (UNSUPPORTED_REASONING_EFFORT — live smoke evidence, 2026-09-21).
 */
export const DSH_THINKING_LEVELS = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'] as const;
export type DshThinkingLevel = (typeof DSH_THINKING_LEVELS)[number];

export interface DshModelEntry {
  readonly id: string;
  readonly name?: string;
  readonly efforts?: readonly string[];
  readonly contextWindow?: number;
  readonly maxOutputTokens?: number;
}

export interface DshModelRoute {
  readonly provider: string;
  readonly api?: string;
  readonly baseURL: string;
  readonly models: readonly DshModelEntry[];
}

export interface DshActiveModel {
  readonly provider: string;
  readonly model: string;
  readonly reasoningEffort?: string;
}

export interface DshSettings {
  readonly configVersion: 1;
  readonly revision: number;
  readonly model: DshActiveModel | null;
  readonly modelRoutes: readonly DshModelRoute[];
}

/* ── paths ──────────────────────────────────────────────────────────── */

/** the app root: `~/.jixoai-design` by default; `JIXOAI_DESIGN_HOME`
 *  relocates the whole two-face tree (tests, multi-install isolation) */
export function designAppRoot(): string {
  const override = process.env.JIXOAI_DESIGN_HOME;
  return override !== undefined && override.trim() !== '' ? override : join(homedir(), '.jixoai-design');
}
export function designStewardDir(): string {
  return join(designAppRoot(), 'steward-store');
}
export function designDshHome(): string {
  return join(designAppRoot(), 'dsh-home');
}
function settingsFile(): string {
  return join(designStewardDir(), 'dsh-settings.json');
}
function credentialsFile(): string {
  return join(designStewardDir(), 'dsh-credentials.json');
}
function dshSettingsYaml(): string {
  return join(designDshHome(), 'settings.yaml');
}
function dshCredentialsYaml(): string {
  return join(designDshHome(), '.credentials.yaml');
}

/* ── cross-process write discipline (Codex r4-3 P2-2, r4-4 P1) ────────
 * Two design servers (or a server racing an external writer) share these
 * files; fixed `.tmp` names cross-rename into ENOENT and unlocked
 * read-modify-write loses whole keys. Every RMW cycle rides an O_EXCL
 * lockfile carrying a random OWNER TOKEN: stale takeover claims the path
 * by ATOMIC RENAME (only one breaker wins), a stalled owner re-checks its
 * token before EVERY rename (write fencing — a stolen cycle aborts
 * instead of clobbering the new owner's data), and release only unlinks
 * the lock while it still carries OUR token (the ABA fence). */

/** the lock's total wait budget — the sync lane stalls at most this long
 *  before answering a typed error the API maps to 503 + Retry-After.
 *  Deliberately BELOW the stale TTL: a waiter gives up before its lock
 *  becomes takeover-eligible, so it never races the breaker role */
const LOCK_WAIT_MS = 4000;
/** a holder stalled longer than this is presumed dead and broken */
const LOCK_STALE_MS = 5000;

/** raised when the lock could not be taken within the budget (the API
 *  lane answers 503 + Retry-After, never a silent long stall) */
export class BridgeLockError extends Error {}

/** a per-writer temp sibling of `file` — two concurrent writers never
 *  collide on the staging path */
function uniqueTmp(file: string): string {
  return `${file}.${process.pid}.${Math.random().toString(36).slice(2, 8)}.tmp`;
}

/** a bounded busy-wait (the whole lane is synchronous code) */
function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * The write fence active for THIS process's in-flight locked cycle (JS is
 * single-threaded — at most one cycle runs at a time). atomicWrite calls
 * it right before the rename lands: if our lock was stolen while we were
 * stalled, the rename is refused instead of clobbering the new owner.
 */
let activeFence: (() => void) | null = null;

/** write-then-rename with a unique staging name, fenced against a lost
 *  lock ownership race (rename refuses when our token no longer holds) */
export function atomicWrite(file: string, text: string, mode?: number): void {
  const target = uniqueTmp(file);
  writeFileSync(target, text, mode === undefined ? {} : { mode });
  activeFence?.();
  renameSync(target, file);
}

/** serialize a read-modify-write cycle across processes */
export function withBridgeLock<T>(file: string, run: () => T): T {
  const lock = `${file}.lock`;
  const token = `${process.pid}-${Math.random().toString(36).slice(2, 10)}`;
  mkdirSync(dirname(file), { recursive: true });
  const stillOurs = (): boolean => {
    try {
      return readFileSync(lock, 'utf8') === token;
    } catch {
      return false;
    }
  };
  const started = Date.now();
  for (;;) {
    try {
      writeFileSync(lock, token, { flag: 'wx' });
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }
    // stale takeover: ONLY the writer whose atomic rename wins the claim
    // breaks the lock — a plain unlink would let two breakers through
    try {
      const st = statSync(lock);
      if (Date.now() - st.mtimeMs > LOCK_STALE_MS) {
        const aside = `${lock}.stale.${token}`;
        renameSync(lock, aside); // ENOENT → another breaker won → retry
        rmSync(aside, { force: true });
        continue;
      }
    } catch { /* lock vanished or the claim raced — loop */ }
    if (Date.now() - started > LOCK_WAIT_MS) throw new BridgeLockError(`bridge lock contention on ${file}`);
    sleepSync(25);
  }
  const previousFence = activeFence;
  activeFence = (): void => {
    if (!stillOurs()) throw new BridgeLockError(`bridge lock ownership lost on ${file} — aborting the write instead of clobbering the new owner`);
  };
  try {
    const result = run();
    // a completed cycle whose ownership was stolen mid-flight must still
    // not report success — the final commit check mirrors the fence
    activeFence();
    return result;
  } finally {
    activeFence = previousFence;
    if (stillOurs()) rmSync(lock, { force: true }); // the ABA fence — never unlink a foreign lock
  }
}

/** route provider → the DSH credential ref name (skill-creator's law:
 *  settings.yaml's apiKeyEnv and .credentials.yaml's refs key agree) */
export function dshRouteApiKeyEnv(provider: string): string {
  const slug = provider.replaceAll(/[^A-Za-z0-9]/g, '_').replaceAll(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
  return `JIXOAI_DESIGN_ROUTE_KEY_${slug}`;
}

/* ── the private face ───────────────────────────────────────────────── */

const EMPTY: DshSettings = { configVersion: 1, revision: 0, model: null, modelRoutes: [] };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v > 0;

/** runtime schema check — persisted input is untrusted (store.ts posture) */
function validRoute(v: unknown): v is DshModelRoute {
  if (!isObj(v) || !isStr(v.provider) || !isStr(v.baseURL)) return false;
  if (!/^https?:\/\//.test(v.baseURL)) return false;
  if (v.api !== undefined && !DSH_ROUTE_API_PROTOCOLS.includes(v.api as DshRouteApiProtocol)) return false;
  if (!Array.isArray(v.models) || v.models.length === 0) return false;
  return v.models.every((m) => isObj(m) && isStr(m.id)
    && (m.name === undefined || isStr(m.name))
    && (m.efforts === undefined || (Array.isArray(m.efforts) && m.efforts.every((e) => (DSH_THINKING_LEVELS as readonly string[]).includes(e))))
    && (m.contextWindow === undefined || isInt(m.contextWindow))
    && (m.maxOutputTokens === undefined || isInt(m.maxOutputTokens)));
}

function validSettings(v: unknown): v is DshSettings {
  // revision 0 is the fresh-doc floor (isInt is the positive gate for
  // contextWindow/maxOutputTokens — a different contract)
  if (!isObj(v) || v.configVersion !== 1 || typeof v.revision !== 'number' || !Number.isInteger(v.revision) || v.revision < 0) return false;
  if (!Array.isArray(v.modelRoutes) || !v.modelRoutes.every(validRoute)) return false;
  const m = v.model;
  if (m === null || m === undefined) return true;
  return isObj(m) && isStr(m.provider) && isStr(m.model)
    && (m.reasoningEffort === undefined || (DSH_THINKING_LEVELS as readonly string[]).includes(m.reasoningEffort));
}

export function loadDshSettings(): DshSettings {
  if (!existsSync(settingsFile())) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(readFileSync(settingsFile(), 'utf8'));
    return validSettings(parsed) ? parsed : EMPTY;
  } catch {
    return EMPTY;
  }
}

/** load a provider's key (server-side only — never crosses an API) */
export function loadRouteCredential(provider: string): string | null {
  try {
    const parsed: unknown = JSON.parse(readFileSync(credentialsFile(), 'utf8'));
    if (!isObj(parsed)) return null;
    const value = parsed[provider];
    return typeof value === 'string' && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

function writeCredentialsFile(map: Record<string, string>): void {
  mkdirSync(designStewardDir(), { recursive: true });
  atomicWrite(credentialsFile(), `${JSON.stringify(map, null, 2)}\n`, 0o600);
  try { chmodSync(credentialsFile(), 0o600); } catch { /* best-effort on odd fs */ }
}

export function setRouteCredential(provider: string, key: string | null): void {
  // one cross-process cycle: both faces re-read INSIDE the lock, so a
  // concurrent writer's keys can no longer be lost to a stale read
  withBridgeLock(dshCredentialsYaml(), () => {
    let map: Record<string, string> = {};
    try {
      const parsed: unknown = JSON.parse(readFileSync(credentialsFile(), 'utf8'));
      if (isObj(parsed)) map = parsed as Record<string, string>;
    } catch { /* fresh */ }
    if (key === null) delete map[provider];
    else map[provider] = key;
    writeCredentialsFile(map);
    syncDshRouteCredential(provider, key);
  });
}

/** the API-safe view: routes + active model + per-route key presence */
export function settingsView(): DshSettings & { readonly keyPresence: Readonly<Record<string, boolean>> } {
  const settings = loadDshSettings();
  let stored: Record<string, string> = {};
  try {
    const parsed: unknown = JSON.parse(readFileSync(credentialsFile(), 'utf8'));
    if (isObj(parsed)) stored = parsed as Record<string, string>;
  } catch { /* fresh */ }
  const keyPresence: Record<string, boolean> = {};
  for (const route of settings.modelRoutes) keyPresence[route.provider] = typeof stored[route.provider] === 'string' && stored[route.provider]!.length > 0;
  return { ...settings, keyPresence };
}

/** save + revision bump + bridge sync (one transaction: JSON first, YAML
 *  after — the private face is the truth; a YAML miss self-heals next write) */
export function saveDshSettings(next: DshSettings): DshSettings {
  if (!validSettings(next)) throw new Error('invalid dsh settings payload');
  // the whole revision-bump + both-face write is one locked cycle — two
  // servers can no longer read the same revision and clobber each other
  return withBridgeLock(dshSettingsYaml(), () => {
    const current = loadDshSettings();
    const bumped: DshSettings = { ...next, revision: current.revision + 1 };
    mkdirSync(designStewardDir(), { recursive: true });
    atomicWrite(settingsFile(), `${JSON.stringify(bumped, null, 2)}\n`);
    syncDshModelRoutes(bumped.modelRoutes, bumped.model);
    return bumped;
  });
}

/* ── the DSH face (structured YAML — the `yaml` package owns all escaping
   and shaping; hand-rolled line surgery was retired with Codex r4-2) ── */

function providersDocOf(routes: readonly DshModelRoute[]): Record<string, unknown> {
  const providers: Record<string, unknown> = {};
  for (const route of routes) {
    providers[route.provider] = {
      apiKeyEnv: dshRouteApiKeyEnv(route.provider),
      ...(route.api !== undefined ? { api: route.api } : {}),
      baseURL: route.baseURL,
      models: route.models.map((m) => ({
        id: m.id,
        ...(m.contextWindow !== undefined ? { contextWindow: m.contextWindow } : {}),
        // the saved effort must be OFFERED by the model or the kernel
        // rejects the whole profile (UNSUPPORTED_REASONING_EFFORT, live
        // smoke 2026-09-21); the dict's value is the wire spelling —
        // the level's own name is the honest dispatch for custom gateways
        ...(m.efforts !== undefined && m.efforts.length > 0
          ? { reasoningEfforts: Object.fromEntries(m.efforts.map((level) => [level, level])) }
          : {}),
      })),
    };
  }
  return providers;
}

function defaultModelDocOf(model: DshActiveModel | null): Record<string, unknown> | undefined {
  if (model === null) return undefined;
  return {
    provider: model.provider,
    model: model.model,
    ...(model.reasoningEffort !== undefined ? { reasoningEffort: model.reasoningEffort } : {}),
  };
}

/**
 * Structured sync of the kernel's settings document (Codex r4-2 P2-2/P1-3:
 * hand-rolled line surgery could not survive quoted keys, control chars, or
 * duplicate-section corruption). The whole document is PARSED, our two
 * sections are REPLACED as data, unknown sections ride through SEMANTICALLY,
 * and the write is gated by a re-parse — a document we cannot round-trip
 * never reaches disk as a "successful" save.
 */
function syncDshModelRoutes(routes: readonly DshModelRoute[], model: DshActiveModel | null): void {
  mkdirSync(designDshHome(), { recursive: true });
  let doc: Record<string, unknown> = {};
  try {
    const parsed: unknown = YAML.parse(readFileSync(dshSettingsYaml(), 'utf8'));
    if (isObj(parsed)) doc = parsed;
  } catch { /* absent or corrupt — a fresh document is the honest rebuild */ }
  const llm = isObj(doc['llm-pi-ai']) ? { ...doc['llm-pi-ai'] } : {};
  const nextLlm = { ...llm, providers: providersDocOf(routes) };
  const next: Record<string, unknown> = { ...doc, 'llm-pi-ai': nextLlm };
  const savedSelection = defaultModelDocOf(model);
  if (savedSelection === undefined) delete next['agent-default-model'];
  else next['agent-default-model'] = savedSelection;
  const text = YAML.stringify(next);
  YAML.parse(text); // the transaction gate — unparseable output is a bug, not a save
  atomicWrite(dshSettingsYaml(), text);
}

/**
 * Structured credential sync (Codex r4-2 P2-1/P1-3): the version-1
 * document — only `version`/`refs`/`records` may live at top level (flat
 * keys kill the next kernel boot), and every write PARSES the current
 * document, MIGRATES any legacy flat top-level keys into `refs` (the
 * pre-bridge format), applies the set/clear, and stringifies back. An
 * unparseable or half-migrated document can never stand.
 */
function syncDshRouteCredential(provider: string, key: string | null): void {
  mkdirSync(designDshHome(), { recursive: true });
  let parsedTop: Record<string, unknown> = {};
  try {
    const parsed: unknown = YAML.parse(readFileSync(dshCredentialsYaml(), 'utf8'));
    if (isObj(parsed)) parsedTop = parsed;
  } catch { /* absent or corrupt — rebuild fresh */ }
  // legacy migration: a top-level string key that is not part of the
  // version-1 vocabulary is a pre-bridge flat ref — fold it into refs
  // (refs wins when both exist) and drop the flat spelling
  const refs: Record<string, string> = {};
  for (const [k, v] of Object.entries(parsedTop)) {
    if (k !== 'version' && k !== 'refs' && k !== 'records' && typeof v === 'string' && v.length > 0) refs[k] = v;
  }
  if (isObj(parsedTop['refs'])) {
    for (const [k, v] of Object.entries(parsedTop['refs'])) {
      if (typeof v === 'string' && v.length > 0) refs[k] = v;
    }
  }
  const ref = dshRouteApiKeyEnv(provider);
  if (key === null) delete refs[ref];
  else refs[ref] = key;
  // `records` is version-1 vocabulary owned by OTHER dsh components
  // (tagged api-key records) — it rides through untouched (Codex r4-3 P2-1)
  const doc: Record<string, unknown> = { version: 1, refs };
  if (isObj(parsedTop['records'])) doc['records'] = parsedTop['records'];
  const text = YAML.stringify(doc);
  YAML.parse(text); // the transaction gate
  atomicWrite(dshCredentialsYaml(), text, 0o600);
  try { chmodSync(dshCredentialsYaml(), 0o600); } catch { /* best-effort */ }
}

/* ── connection test ────────────────────────────────────────────────── */

export interface RouteTestResult {
  readonly ok: boolean;
  readonly latencyMs?: number;
  readonly detail: string;
}

/** probe a route's endpoint with its key — /v1/models is the broad
 *  compatibility surface across the protocol family.
 *
 *  NON-DISCLOSURE LAW (Codex r4 P1-3): the upstream body NEVER crosses
 *  into `detail` — gateways echo request headers (the key) in error
 *  bodies, and detail rides the API + panel verbatim. Status code +
 *  latency only; the stored key is scrubbed from every detail string
 *  as the belt-and-braces pass. */
export async function testRouteConnection(route: DshModelRoute): Promise<RouteTestResult> {
  const key = loadRouteCredential(route.provider);
  const scrub = (text: string): string => (key !== null ? text.replaceAll(key, 'sk-***') : text);
  const started = Date.now();
  try {
    const url = new URL('v1/models', route.baseURL.endsWith('/') ? route.baseURL : `${route.baseURL}/`);
    const response = await fetch(url, {
      headers: { ...(key !== null ? { authorization: `Bearer ${key}`, 'x-api-key': key } : {}) },
      signal: AbortSignal.timeout(10_000),
    });
    const latencyMs = Date.now() - started;
    if (response.ok) return { ok: true, latencyMs, detail: scrub(`${response.status} in ${latencyMs}ms`) };
    return { ok: false, latencyMs, detail: scrub(`HTTP ${response.status} in ${latencyMs}ms`) };
  } catch (cause) {
    return { ok: false, detail: scrub(cause instanceof Error ? cause.message : String(cause)) };
  }
}

/** the dsh adapter's bridge query: is there a fully-configured active route
 *  whose BRIDGE FACE is actually live? Private faces alone are not enough
 *  (Codex r4 P1-5: a failed dsh-home sync — e.g. the path is a regular
 *  file — leaves the private model+key intact while the kernel face is
 *  missing; riding DSH_HOME then spawns a dead turn). The query verifies
 *  both bridge files exist, parse, and still carry the active provider/
 *  model/key ref; ANY gap → null → the adapter falls back to env+patch. */
export function activeBridgeRoute(): { route: DshModelRoute; model: string; effort?: string; dshHome: string } | null {
  const settings = loadDshSettings();
  const active = settings.model;
  if (active === null) return null;
  const route = settings.modelRoutes.find((candidate) => candidate.provider === active.provider);
  if (route === undefined || !route.models.some((m) => m.id === active.model)) return null;
  if (loadRouteCredential(active.provider) === null) return null;
  // bridge face: settings.yaml parses and carries the active provider+model
  let bridge: unknown;
  try {
    bridge = YAML.parse(readFileSync(dshSettingsYaml(), 'utf8'));
  } catch {
    return null; // missing or unparseable — the sync never landed
  }
  if (!isObj(bridge)) return null;
  const llm = bridge['llm-pi-ai'];
  const providers = isObj(llm) && isObj(llm['providers']) ? llm['providers'] : null;
  const bridgeRoute = providers !== null && isObj(providers[active.provider]) ? providers[active.provider] : null;
  if (bridgeRoute === null) return null;
  const bridgeModels = Array.isArray(bridgeRoute['models']) ? bridgeRoute['models'] : null;
  const bridgeModel = bridgeModels === null ? null : (bridgeModels.find((m) => isObj(m) && m['id'] === active.model) ?? null);
  if (bridgeModel === null) return null;
  // the saved selection section must EXIST and match the private active
  // selection field-for-field (Codex r4-2 P1-2: a missing or diverged
  // agent-default-model silently falls back to the kernel bundle default
  // — deepseek-official — instead of our route)
  const saved = isObj(bridge['agent-default-model']) ? bridge['agent-default-model'] : null;
  if (saved === null) return null;
  if (saved['provider'] !== active.provider || saved['model'] !== active.model) return null;
  const savedEffort = typeof saved['reasoningEffort'] === 'string' ? saved['reasoningEffort'] : undefined;
  if (savedEffort !== active.reasoningEffort) return null;
  // a saved effort must be OFFERED by the bridge model's reasoningEfforts
  // dict — the kernel refuses the profile otherwise (r4-2 P1-1's third leg)
  if (active.reasoningEffort !== undefined) {
    const offered = isObj(bridgeModel['reasoningEfforts']) ? bridgeModel['reasoningEfforts'] : null;
    if (offered === null || !(active.reasoningEffort in offered)) return null;
  }
  // bridge face: the credential document is STRUCTURALLY version-1, the
  // ref exists with a non-empty value, and that value is the PRIVATE key
  // (a stale/diverged ref would route requests on the wrong credential)
  let credDoc: unknown;
  try {
    credDoc = YAML.parse(readFileSync(dshCredentialsYaml(), 'utf8'));
  } catch {
    return null;
  }
  if (!isObj(credDoc) || credDoc['version'] !== 1 || !isObj(credDoc['refs'])) return null;
  const refValue = credDoc['refs'][dshRouteApiKeyEnv(active.provider)];
  if (typeof refValue !== 'string' || refValue.length === 0) return null;
  if (refValue !== loadRouteCredential(active.provider)) return null;
  return { route, model: active.model, ...(active.reasoningEffort !== undefined ? { effort: active.reasoningEffort } : {}), dshHome: designDshHome() };
}

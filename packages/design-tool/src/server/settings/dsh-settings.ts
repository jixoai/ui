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
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync, chmodSync, renameSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

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
    && (m.efforts === undefined || (Array.isArray(m.efforts) && m.efforts.every(isStr)))
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
  return isObj(m) && isStr(m.provider) && isStr(m.model) && (m.reasoningEffort === undefined || isStr(m.reasoningEffort));
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
  const target = credentialsFile() + '.tmp';
  writeFileSync(target, `${JSON.stringify(map, null, 2)}\n`, { mode: 0o600 });
  renameSync(target, credentialsFile());
  try { chmodSync(credentialsFile(), 0o600); } catch { /* best-effort on odd fs */ }
}

export function setRouteCredential(provider: string, key: string | null): void {
  let map: Record<string, string> = {};
  try {
    const parsed: unknown = JSON.parse(readFileSync(credentialsFile(), 'utf8'));
    if (isObj(parsed)) map = parsed as Record<string, string>;
  } catch { /* fresh */ }
  if (key === null) delete map[provider];
  else map[provider] = key;
  writeCredentialsFile(map);
  syncDshRouteCredential(provider, key);
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
  const current = loadDshSettings();
  const bumped: DshSettings = { ...next, revision: current.revision + 1 };
  mkdirSync(designStewardDir(), { recursive: true });
  const target = settingsFile() + '.tmp';
  writeFileSync(target, `${JSON.stringify(bumped, null, 2)}\n`);
  renameSync(target, settingsFile());
  syncDshModelRoutes(bumped.modelRoutes, bumped.model);
  return bumped;
}

/* ── the DSH face (yaml emit, no external dep — our own fixed shapes) ── */

/** single-quoted YAML scalar (the only escaping the shape needs) */
const yq = (value: string): string => `'${value.replaceAll(/'/g, "''")}'`;

function emitProvidersYaml(routes: readonly DshModelRoute[]): string {
  if (routes.length === 0) return '';
  const blocks = routes.map((route) => {
    const models = route.models.map((m) => {
      const fields = [`id: ${yq(m.id)}`];
      if (m.contextWindow !== undefined) fields.push(`contextWindow: ${m.contextWindow}`);
      return `        { ${fields.join(', ')} }`;
    });
    const api = route.api !== undefined ? `\n      api: ${yq(route.api)}` : '';
    return `    ${yq(route.provider)}:\n      apiKeyEnv: ${yq(dshRouteApiKeyEnv(route.provider))}${api}\n      baseURL: ${yq(route.baseURL)}\n      models:\n${models.join('\n')}`;
  });
  return `llm-pi-ai:\n  providers:\n${blocks.join('\n')}\n`;
}

/** the kernel's settings section for the saved default selection — the
 *  dsh-agent-default-model package installs namespace `agent-default-model`
 *  (schema {provider, model, reasoningEffort}) whose user layer overrides
 *  the bundle row live: the headless CLI reads it at Agent creation, so
 *  NO patch row is needed in bridge mode */
function emitDefaultModelYaml(model: DshActiveModel | null): string {
  if (model === null) return '';
  const effort = model.reasoningEffort !== undefined ? `\n  reasoningEffort: ${yq(model.reasoningEffort)}` : '';
  return `agent-default-model:\n  provider: ${yq(model.provider)}\n  model: ${yq(model.model)}${effort}\n`;
}

/** preserve unknown TOP-LEVEL yaml sections verbatim (the home is ours,
 *  but the kernel may have written its own keys — never clobber them) */
function replaceTopLevelSection(raw: string, section: string, replacement: string): string {
  const lines = raw.split('\n');
  const kept: string[] = [];
  let skipping = false;
  for (const line of lines) {
    if (!line.startsWith(' ') && line.trimEnd().endsWith(':')) {
      const name = line.trimEnd().slice(0, -1);
      skipping = name === section;
      if (!skipping) kept.push(line);
      continue;
    }
    if (line.startsWith(' ') || line.trim() === '') {
      if (!skipping) kept.push(line);
    } else if (!skipping && line.trim() !== '') {
      kept.push(line); // a top-level scalar — keep as-is
    }
  }
  const body = kept.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd();
  return replacement.length === 0 ? `${body}\n` : `${body}\n${replacement}`;
}

function syncDshModelRoutes(routes: readonly DshModelRoute[], model: DshActiveModel | null): void {
  mkdirSync(designDshHome(), { recursive: true });
  let raw = '';
  try { raw = readFileSync(dshSettingsYaml(), 'utf8'); } catch { /* first write */ }
  let next = replaceTopLevelSection(raw, 'llm-pi-ai', emitProvidersYaml(routes));
  next = replaceTopLevelSection(next, 'agent-default-model', emitDefaultModelYaml(model));
  const target = dshSettingsYaml() + '.tmp';
  writeFileSync(target, next);
  renameSync(target, dshSettingsYaml());
}

function syncDshRouteCredential(provider: string, key: string | null): void {
  mkdirSync(designDshHome(), { recursive: true });
  let raw = '';
  try { raw = readFileSync(dshCredentialsYaml(), 'utf8'); } catch { /* first write */ }
  const ref = dshRouteApiKeyEnv(provider);
  // the version-1 layout: only version/refs/records at top level; keys
  // MUST live under refs (flat top-level keys kill the next boot)
  const refRe = new RegExp(`^(  ${ref}:).*?$`, 'm');
  let next: string;
  if (key === null) {
    next = raw.split('\n').filter((l) => !refRe.test(l)).join('\n');
  } else if (refRe.test(raw)) {
    next = raw.replace(refRe, `  ${ref}: ${yq(key)}`);
  } else {
    const block = `version: 1\nrefs:\n  ${ref}: ${yq(key)}\n`;
    const hasRefs = /^refs:$/m.test(raw);
    next = hasRefs
      ? raw.replace(/^refs:$/m, (m) => `${m}\n  ${ref}: ${yq(key)}`)
      : `${raw.trim()}\n${block}`;
    if (!/^version: 1$/m.test(next)) next = `version: 1\n${next.replace(/^version:.*$\n?/m, '')}`;
  }
  const target = dshCredentialsYaml() + '.tmp';
  writeFileSync(target, next.endsWith('\n') ? next : `${next}\n`, { mode: 0o600 });
  renameSync(target, dshCredentialsYaml());
  try { chmodSync(dshCredentialsYaml(), 0o600); } catch { /* best-effort */ }
}

/* ── connection test ────────────────────────────────────────────────── */

export interface RouteTestResult {
  readonly ok: boolean;
  readonly latencyMs?: number;
  readonly detail: string;
}

/** probe a route's endpoint with its key — /v1/models is the broad
 *  compatibility surface across the protocol family */
export async function testRouteConnection(route: DshModelRoute): Promise<RouteTestResult> {
  const key = loadRouteCredential(route.provider);
  const started = Date.now();
  try {
    const url = new URL('v1/models', route.baseURL.endsWith('/') ? route.baseURL : `${route.baseURL}/`);
    const response = await fetch(url, {
      headers: { ...(key !== null ? { authorization: `Bearer ${key}`, 'x-api-key': key } : {}) },
      signal: AbortSignal.timeout(10_000),
    });
    const latencyMs = Date.now() - started;
    if (response.ok) return { ok: true, latencyMs, detail: `${response.status} in ${latencyMs}ms` };
    const body = await response.text().catch(() => '');
    return { ok: false, latencyMs, detail: `HTTP ${response.status}${body.length > 0 ? ` — ${body.slice(0, 140)}` : ''}` };
  } catch (cause) {
    return { ok: false, detail: cause instanceof Error ? cause.message : String(cause) };
  }
}

/** the dsh adapter's bridge query: is there a fully-configured active route?
 *  (active model set + route exists + key stored → the spawn can ride
 *  DSH_HOME; otherwise the adapter falls back to its env+patch legacy) */
export function activeBridgeRoute(): { route: DshModelRoute; model: string; effort?: string; dshHome: string } | null {
  const settings = loadDshSettings();
  const active = settings.model;
  if (active === null) return null;
  const route = settings.modelRoutes.find((candidate) => candidate.provider === active.provider);
  if (route === undefined || !route.models.some((m) => m.id === active.model)) return null;
  if (loadRouteCredential(active.provider) === null) return null;
  return { route, model: active.model, ...(active.reasoningEffort !== undefined ? { effort: active.reasoningEffort } : {}), dshHome: designDshHome() };
}

/**
 * @jixoai/ui-design (server) — the settings panel's dsh lane: the HTTP
 * surface `/__design__/api/settings/dsh*` (design-settings-panel S2,
 * Owner walkthrough-r4 2026-09-21).
 *
 * Routes (collab-api.ts's middleware posture — JSON in, envelope out):
 *   GET  dsh.json        — settingsView(): routes + active model + key
 *                          PRESENCE booleans (a key itself never crosses
 *                          this API; the steward's non-disclosure law)
 *   POST dsh.json        — full settings save (revision bump + bridge
 *                          sync happen inside saveDshSettings)
 *   POST dsh-credential  — {provider, key|null}: set/clear ONE key (0600
 *                          private face + kernel credentials bridge)
 *   POST dsh-test        — {provider}: live /v1/models probe, latency
 *                          and detail ride the envelope
 *
 * Original need: Owner 2026-09-21 — "将 skill-creator-v2 的 Model 配置
 * 移植过来" (the panel's transport talks to this lane only).
 */

import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  DSH_ROUTE_API_PROTOCOLS,
  DSH_THINKING_LEVELS,
  dshRouteApiKeyEnv,
  loadDshSettings,
  saveDshSettings,
  setRouteCredential,
  settingsView,
  testRouteConnection,
  type DshActiveModel,
  type DshModelEntry,
  type DshModelRoute,
  type DshSettings,
} from './dsh-settings.ts';

/** the lane's mount base — every route below it is ours
 *  (`${DSH_SETTINGS_API_BASE}/dsh.json` | `…/dsh-credential` | `…/dsh-test`) */
export const DSH_SETTINGS_API_BASE = '/__design__/api/settings';

const isObj = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isStr = (value: unknown): value is string => typeof value === 'string' && value.length > 0;
const isInt = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value > 0;
const isStrArr = (value: unknown): value is string[] => Array.isArray(value) && value.every(isStr);

/** narrow an untrusted model entry (unknown fields dropped — the panel's
 *  local-only icon/iconColor fields never reach the server face) */
function modelFromJson(value: unknown, field: string): DshModelEntry {
  if (!isObj(value) || !isStr(value.id)) throw new RequestError(`${field}.id (non-empty string) is required`);
  let entry: DshModelEntry = { id: value.id };
  if (value.name !== undefined) {
    if (!isStr(value.name)) throw new RequestError(`${field}.name must be a non-empty string`);
    entry = { ...entry, name: value.name };
  }
  if (value.efforts !== undefined) {
    if (!isStrArr(value.efforts)) throw new RequestError(`${field}.efforts must be an array of non-empty strings`);
    const illegal = value.efforts.filter((level) => !(DSH_THINKING_LEVELS as readonly string[]).includes(level));
    if (illegal.length > 0) throw new RequestError(`${field}.efforts entries must be kernel thinking levels (${DSH_THINKING_LEVELS.join(', ')}); got ${illegal.join(', ')}`);
    entry = { ...entry, efforts: value.efforts };
  }
  if (value.contextWindow !== undefined) {
    if (!isInt(value.contextWindow)) throw new RequestError(`${field}.contextWindow must be a positive integer`);
    entry = { ...entry, contextWindow: value.contextWindow };
  }
  if (value.maxOutputTokens !== undefined) {
    if (!isInt(value.maxOutputTokens)) throw new RequestError(`${field}.maxOutputTokens must be a positive integer`);
    entry = { ...entry, maxOutputTokens: value.maxOutputTokens };
  }
  return entry;
}

function routeFromJson(value: unknown, field: string): DshModelRoute {
  if (!isObj(value)) throw new RequestError(`${field} must be an object`);
  if (!isStr(value.provider)) throw new RequestError(`${field}.provider (non-empty string) is required`);
  if (!isStr(value.baseURL) || !/^https?:\/\//.test(value.baseURL)) {
    throw new RequestError(`${field}.baseURL must be an http(s) URL`);
  }
  if (value.api !== undefined && !(typeof value.api === 'string' && (DSH_ROUTE_API_PROTOCOLS as readonly string[]).includes(value.api))) {
    throw new RequestError(`${field}.api must be one of: ${DSH_ROUTE_API_PROTOCOLS.join(', ')}`);
  }
  if (!Array.isArray(value.models) || value.models.length === 0) {
    throw new RequestError(`${field}.models (non-empty array) is required`);
  }
  const models = value.models.map((model, index) => modelFromJson(model, `${field}.models[${index}]`));
  const base: DshModelRoute = { provider: value.provider, baseURL: value.baseURL, models };
  return value.api === undefined ? base : { ...base, api: value.api };
}

function activeFromJson(value: unknown): DshActiveModel | null {
  if (value === null || value === undefined) return null;
  if (!isObj(value) || !isStr(value.provider) || !isStr(value.model)) {
    throw new RequestError('model must be {provider, model} (non-empty strings) or null');
  }
  const base: DshActiveModel = { provider: value.provider, model: value.model };
  if (value.reasoningEffort === undefined) return base;
  if (!isStr(value.reasoningEffort)) throw new RequestError('model.reasoningEffort must be a non-empty string');
  if (!(DSH_THINKING_LEVELS as readonly string[]).includes(value.reasoningEffort)) {
    throw new RequestError(`model.reasoningEffort must be a kernel thinking level (${DSH_THINKING_LEVELS.join(', ')})`);
  }
  return { ...base, reasoningEffort: value.reasoningEffort };
}

/** control characters can break the bridge's YAML scalars even quoted —
 *  rejected at the door (Codex r4-2 P2-2's provider/baseURL newline case) */
function assertCleanString(value: string, field: string): void {
  if (/[\u0000-\u001f\u007f]/.test(value)) throw new RequestError(`${field} must not contain control characters`);
}

function settingsFromBody(value: unknown): DshSettings {
  if (!isObj(value)) throw new RequestError('body must be a JSON object');
  if (!Array.isArray(value.modelRoutes)) throw new RequestError('modelRoutes (array) is required');
  const modelRoutes = value.modelRoutes.map((route, index) => routeFromJson(route, `modelRoutes[${index}]`));
  // UNIQUENESS gates (Codex r4-2 P1-3): duplicate providers/model ids/
  // efforts would emit duplicate YAML mappings the kernel cannot parse,
  // and providers collapsing onto ONE credential ref (a-b vs a_b) would
  // cross-wire their keys on the bridge
  const providersSeen = new Set<string>();
  const refOwners = new Map<string, string>();
  for (const route of modelRoutes) {
    assertCleanString(route.provider, 'provider');
    assertCleanString(route.baseURL, 'baseURL');
    if (providersSeen.has(route.provider)) throw new RequestError(`duplicate provider "${route.provider}" in modelRoutes`);
    providersSeen.add(route.provider);
    const ref = dshRouteApiKeyEnv(route.provider);
    const owner = refOwners.get(ref);
    if (owner !== undefined) throw new RequestError(`providers "${owner}" and "${route.provider}" collapse onto the same credential ref ${ref} — rename one`);
    refOwners.set(ref, route.provider);
    const idsSeen = new Set<string>();
    for (const entry of route.models) {
      assertCleanString(entry.id, 'models[].id');
      if (entry.name !== undefined) assertCleanString(entry.name, 'models[].name');
      if (idsSeen.has(entry.id)) throw new RequestError(`duplicate model id "${entry.id}" in route "${route.provider}"`);
      idsSeen.add(entry.id);
      if (entry.efforts !== undefined) {
        const levelsSeen = new Set<string>();
        for (const level of entry.efforts) {
          if (levelsSeen.has(level)) throw new RequestError(`duplicate effort "${level}" on model "${entry.id}"`);
          levelsSeen.add(level);
        }
      }
    }
  }
  const model = activeFromJson(value.model);
  // the active model must reference a route we are saving (referential
  // integrity at the door — the bridge query relies on it)
  if (model !== null) {
    const route = modelRoutes.find((candidate) => candidate.provider === model.provider);
    if (route === undefined) throw new RequestError(`model.provider "${model.provider}" has no route in modelRoutes`);
    const entry = route.models.find((candidate) => candidate.id === model.model);
    if (entry === undefined) throw new RequestError(`model.model "${model.model}" is not in route "${model.provider}".models`);
    // UNIFORM effort law (Codex r4-2 P1-1): a saved effort requires the
    // model to DECLARE efforts including it — an undeclared capability
    // gets the whole profile refused by the kernel at spawn time
    if (model.reasoningEffort !== undefined && (entry.efforts === undefined || !entry.efforts.includes(model.reasoningEffort))) {
      throw new RequestError(`model.reasoningEffort "${model.reasoningEffort}" is not offered by "${model.model}" (the model must declare it in efforts)`);
    }
  }
  return { configVersion: 1, revision: loadDshSettings().revision, model, modelRoutes };
}

class RequestError extends Error {}

/* ── the route resolver (pure — the in-process test surface) ─────────── */

/** one lane answer: the HTTP status + the JSON body verbatim */
export interface ApiResponse { readonly status: number; readonly body: unknown }

/**
 * Resolve one settings-lane request. `route` is the bare segment after
 * `/__design__/api/settings/` (`dsh.json` | `dsh-credential` |
 * `dsh-test`); `body` is the PARSED JSON (undefined for GET). Returns
 * the view envelope (GET/POST dsh.json, credential), the probe result
 * (dsh-test), or a `{ok:false, reason, message}` 400/404/500 — never
 * throws for request-shape faults.
 */
export async function resolveDshSettingsApiRequest(route: string, method: string, body: unknown): Promise<ApiResponse> {
  try {
    if (route === 'dsh.json' && method === 'GET') {
      return { status: 200, body: settingsView() };
    }
    if (route === 'dsh.json' && method === 'POST') {
      saveDshSettings(settingsFromBody(body));
      // the VIEW (with keyPresence) — the panel treats every response
      // as its whole document; a bare doc would crash the rail
      return { status: 200, body: settingsView() };
    }
    if (route === 'dsh-credential' && method === 'POST') {
      if (!isObj(body) || !isStr(body.provider)) throw new RequestError('provider (non-empty string) is required');
      // omitted key === explicit null === clear (the panel's clear button
      // sends {provider} — `undefined !== null` was rejecting it, Codex r4 P1-2)
      const key = body.key === undefined || body.key === null ? null : body.key;
      if (key !== null && !(isStr(key))) throw new RequestError('key must be a non-empty string or null');
      setRouteCredential(body.provider, key);
      return { status: 200, body: settingsView() };
    }
    if (route === 'dsh-test' && method === 'POST') {
      if (!isObj(body) || !isStr(body.provider)) throw new RequestError('provider (non-empty string) is required');
      const stored = loadDshSettings().modelRoutes.find((candidate) => candidate.provider === body.provider);
      if (stored === undefined) throw new RequestError(`no route named "${body.provider}"`);
      // the panel probes its DRAFT endpoint when dirty (what save would
      // persist) — an http(s) override is honored, anything else rejected
      const override = body.baseURL;
      const route_ = typeof override === 'string'
        ? (() => {
            if (!/^https?:\/\//.test(override)) throw new RequestError('baseURL override must be an http(s) URL');
            return { ...stored, baseURL: override };
          })()
        : stored;
      return { status: 200, body: await testRouteConnection(route_) };
    }
    return { status: 404, body: { ok: false, reason: 'not-found', message: route } };
  } catch (error) {
    if (error instanceof RequestError) return { status: 400, body: { ok: false, reason: 'bad-request', message: error.message } };
    return { status: 500, body: { ok: false, reason: 'internal', message: error instanceof Error ? error.message : String(error) } };
  }
}

/* ── the connect middleware (create.ts mounts it before studio assets) ── */

/**
 * The connect middleware for the settings lane: GET/POST bodies are
 * collected with a 256KB cap, parsed, and handed to the resolver; GETs
 * pass straight through. Non-lane paths/methods fall to `next()` —
 * the studio's static assets keep ownership of everything else.
 */
export function dshSettingsApiMiddleware(): (req: IncomingMessage, res: ServerResponse, next: () => void) => void {
  return (req, res, next) => {
    const pathname = (req.url ?? '').split('?')[0]!;
    if (!pathname.startsWith(`${DSH_SETTINGS_API_BASE}/`)) return next();
    const route = pathname.slice(DSH_SETTINGS_API_BASE.length + 1);
    if (route !== 'dsh.json' && route !== 'dsh-credential' && route !== 'dsh-test') return next();
    if (req.method !== 'GET' && req.method !== 'POST') return next();

    if (req.method === 'GET') {
      void resolveDshSettingsApiRequest(route, 'GET', undefined)
        .then((response) => respond(res, response))
        .catch(next);
      return;
    }
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > 256 * 1024) {
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      let body: unknown;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch {
        respond(res, { status: 400, body: { ok: false, reason: 'bad-request', message: 'invalid JSON body' } });
        return;
      }
      void resolveDshSettingsApiRequest(route, 'POST', body)
        .then((response) => respond(res, response))
        .catch(next);
    });
  };
}

function respond(res: ServerResponse, response: ApiResponse): void {
  res.statusCode = response.status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(response.body));
}

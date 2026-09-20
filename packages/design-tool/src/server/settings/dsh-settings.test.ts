/**
 * dsh-settings.test.ts — the settings store + DSH bridge tests
 * (design-settings-panel S6, Owner walkthrough-r4 2026-09-21).
 *
 * The two-face persistence law is the load-bearing surface (ported from
 * skill-creator-v2's steward):
 *  1. the PRIVATE face (steward-store JSON + 0600 credentials) is the
 *     rich-field truth — schema-checked on read, revision-bumped on save;
 *  2. the DSH face (~app/dsh-home) is the kernel's NATIVE shape —
 *     llm-pi-ai providers (whitelist id+contextWindow ONLY), the
 *     agent-default-model saved-selection section (the kernel's settings
 *     namespace), and .credentials.yaml's version-1 refs layout (flat
 *     top-level keys would kill the next kernel boot);
 *  3. unknown top-level settings.yaml sections survive a bridge sync;
 *  4. the bridge query (activeBridgeRoute) is honest: no model / no
 *     route / no key → null (the adapter falls back to its legacy lane).
 * Every test runs in its own JIXOAI_DESIGN_HOME (mkdtemp).
 */

import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer, type AddressInfo } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import YAML from 'yaml';

import {
  activeBridgeRoute,
  dshRouteApiKeyEnv,
  designDshHome,
  designStewardDir,
  loadDshSettings,
  saveDshSettings,
  setRouteCredential,
  settingsView,
  type DshModelRoute,
  type DshSettings,
} from './dsh-settings.ts';
import { resolveDshSettingsApiRequest } from './dsh-settings-api.ts';

/* ── scaffolding ──────────────────────────────────────────────────────── */

const ROUTE: DshModelRoute = {
  provider: 'my-gateway',
  api: 'anthropic-messages',
  baseURL: 'https://api.example.com/anthropic',
  models: [
    { id: 'glm-5.3', name: 'GLM 5.3', efforts: ['low', 'high'], contextWindow: 200000, maxOutputTokens: 8192 },
    { id: 'glm-5.3-flash', contextWindow: 131072 },
  ],
};

function freshHome(): string {
  return mkdtempSync(join(tmpdir(), 'jixoai-design-settings-'));
}

/** per-test isolation: relocate the whole two-face tree (async-aware:
 *  the env restore must wait for the body's awaits, not the promise) */
async function inHome<T>(home: string, run: () => T | Promise<T>): Promise<T> {
  const previous = process.env.JIXOAI_DESIGN_HOME;
  process.env.JIXOAI_DESIGN_HOME = home;
  try {
    return await run();
  } finally {
    if (previous === undefined) delete process.env.JIXOAI_DESIGN_HOME;
    else process.env.JIXOAI_DESIGN_HOME = previous;
  }
}

const settingsYaml = (): string => readFileSync(join(designDshHome(), 'settings.yaml'), 'utf8');
const credentialsYaml = (): string => readFileSync(join(designDshHome(), '.credentials.yaml'), 'utf8');

/* ── the private face ─────────────────────────────────────────────────── */

test('an untouched home loads the empty doc and bridges nothing', () => {
  const home = freshHome();
  try {
    inHome(home, () => {
      assert.deepEqual(loadDshSettings(), { configVersion: 1, revision: 0, model: null, modelRoutes: [] });
      assert.equal(activeBridgeRoute(), null);
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('save bumps the revision and carries the doc verbatim', () => {
  const home = freshHome();
  try {
    inHome(home, () => {
      const first = saveDshSettings({ configVersion: 1, revision: 0, model: { provider: ROUTE.provider, model: 'glm-5.3' }, modelRoutes: [ROUTE] });
      assert.equal(first.revision, 1);
      const second = saveDshSettings(first);
      assert.equal(second.revision, 2);
      assert.deepEqual(loadDshSettings().modelRoutes, [ROUTE]);
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('persisted input is untrusted — a corrupt file degrades to empty, never crashes', () => {
  const home = freshHome();
  try {
    inHome(home, () => {
      mkdirSync(designStewardDir(), { recursive: true });
      writeFileSync(join(designStewardDir(), 'dsh-settings.json'), '{not json', { flag: 'w' });
      assert.deepEqual(loadDshSettings(), { configVersion: 1, revision: 0, model: null, modelRoutes: [] });
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

/* ── the DSH face (settings.yaml) ─────────────────────────────────────── */

test('the bridge writes the kernel-native llm-pi-ai whitelist — models PARSE as an array (Codex r4 P1-1)', () => {
  const home = freshHome();
  try {
    inHome(home, () => {
      saveDshSettings({ configVersion: 1, revision: 0, model: { provider: ROUTE.provider, model: 'glm-5.3' }, modelRoutes: [ROUTE] });
      const yaml = settingsYaml();
      // the load-bearing shape: a REAL parse (the `yaml` package, the same
      // parser family the kernel uses) must see models as an ARRAY of
      // {id, contextWindow[, reasoningEfforts]} — structured stringify
      // guarantees the round-trip; assertions are parse-based end to end
      const parsed = YAML.parse(yaml) as {
        'llm-pi-ai'?: { providers?: Record<string, { apiKeyEnv?: string; api?: string; baseURL?: string; models?: unknown[] }> };
      };
      const bridgeRoute = parsed['llm-pi-ai']?.providers?.['my-gateway'];
      assert.ok(bridgeRoute, 'provider block parses');
      assert.equal(bridgeRoute!.apiKeyEnv, dshRouteApiKeyEnv('my-gateway'));
      assert.equal(bridgeRoute!.api, 'anthropic-messages');
      assert.equal(bridgeRoute!.baseURL, 'https://api.example.com/anthropic');
      assert.ok(Array.isArray(bridgeRoute!.models), 'models is an ARRAY');
      assert.deepEqual(
        bridgeRoute!.models,
        [
          { id: 'glm-5.3', contextWindow: 200000, reasoningEfforts: { low: 'low', high: 'high' } },
          { id: 'glm-5.3-flash', contextWindow: 131072 },
        ],
        'declared efforts ride the kernel-legal reasoningEfforts dict (wire = level name)',
      );
      // the kernel rejects unknown provider keys — name/maxOutputTokens
      // MUST NOT cross the bridge (efforts crosses only as reasoningEfforts)
      const rawProvider = JSON.stringify(parsed['llm-pi-ai']!.providers!['my-gateway']);
      assert.equal(rawProvider.includes('"name"') || rawProvider.includes('maxOutputTokens'), false);
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('the bridge writes the agent-default-model saved-selection section (effort included)', () => {
  const home = freshHome();
  try {
    inHome(home, () => {
      saveDshSettings({
        configVersion: 1,
        revision: 0,
        model: { provider: ROUTE.provider, model: 'glm-5.3', reasoningEffort: 'high' },
        modelRoutes: [ROUTE],
      });
      const parsed = YAML.parse(settingsYaml()) as { 'agent-default-model'?: Record<string, unknown> };
      assert.deepEqual(parsed['agent-default-model'], { provider: 'my-gateway', model: 'glm-5.3', reasoningEffort: 'high' });
      // a null model drops the section (the kernel row default stands)
      saveDshSettings({ configVersion: 1, revision: 1, model: null, modelRoutes: [ROUTE] });
      assert.equal('agent-default-model' in (YAML.parse(settingsYaml()) as Record<string, unknown>), false);
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('unknown top-level settings.yaml sections survive a bridge sync (semantically)', () => {
  const home = freshHome();
  try {
    inHome(home, () => {
      saveDshSettings({ configVersion: 1, revision: 0, model: null, modelRoutes: [ROUTE] });
      const withForeign = `${settingsYaml()}some-kernel-section:\n  nested: value\n`;
      writeFileSync(join(designDshHome(), 'settings.yaml'), withForeign, { flag: 'w' });
      saveDshSettings({ configVersion: 1, revision: 1, model: { provider: ROUTE.provider, model: 'glm-5.3' }, modelRoutes: [ROUTE] });
      const parsed = YAML.parse(settingsYaml()) as Record<string, unknown>;
      assert.deepEqual(parsed['some-kernel-section'], { nested: 'value' });
      assert.ok('agent-default-model' in parsed);
      assert.ok('llm-pi-ai' in parsed);
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

/* ── the credentials face ─────────────────────────────────────────────── */

test('a stored key rides the version-1 refs layout at 0600 and never crosses the view', () => {
  const home = freshHome();
  try {
    inHome(home, () => {
      saveDshSettings({ configVersion: 1, revision: 0, model: { provider: ROUTE.provider, model: 'glm-5.3' }, modelRoutes: [ROUTE] });
      setRouteCredential(ROUTE.provider, 'sk-secret-123');
      // the private face: 0600
      assert.equal(statSync(join(designStewardDir(), 'dsh-credentials.json')).mode & 0o777, 0o600);
      // the kernel face: version + refs structurally, NEVER a flat key
      const cred = YAML.parse(credentialsYaml()) as { version?: number; refs?: Record<string, string> };
      assert.equal(cred.version, 1);
      assert.deepEqual(cred.refs, { [dshRouteApiKeyEnv('my-gateway')]: 'sk-secret-123' });
      assert.equal(Object.keys(cred).every((k) => k === 'version' || k === 'refs'), true, 'no top-level keys beyond the version-1 vocabulary');
      // the API-safe view: presence only
      const view = settingsView() as { keyPresence: Record<string, boolean> };
      assert.equal(view.keyPresence['my-gateway'], true);
      assert.equal(JSON.stringify(view).includes('sk-secret-123'), false);
      // clear removes the ref
      setRouteCredential(ROUTE.provider, null);
      const cleared = YAML.parse(credentialsYaml()) as { refs?: Record<string, string> };
      assert.equal(cleared.refs?.[dshRouteApiKeyEnv('my-gateway')], undefined);
      assert.equal((settingsView() as { keyPresence: Record<string, boolean> }).keyPresence['my-gateway'], false);
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('the bridge query needs model + route + key — any gap is a null', () => {
  const home = freshHome();
  try {
    inHome(home, () => {
      const base: DshSettings = { configVersion: 1, revision: 0, model: { provider: ROUTE.provider, model: 'glm-5.3' }, modelRoutes: [ROUTE] };
      saveDshSettings(base);
      // no key yet
      assert.equal(activeBridgeRoute(), null);
      setRouteCredential(ROUTE.provider, 'sk-live');
      const withKey = activeBridgeRoute();
      assert.notEqual(withKey, null);
      assert.equal(withKey!.model, 'glm-5.3');
      assert.equal(withKey!.route.provider, 'my-gateway');
      assert.equal(withKey!.dshHome, designDshHome());
      // a model missing from the route breaks referential integrity → null
      saveDshSettings({ ...base, revision: 1, model: { provider: ROUTE.provider, model: 'gone-model' } });
      assert.equal(activeBridgeRoute(), null);
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

/* ── the API resolver ─────────────────────────────────────────────────── */

const API_ROUTE_BODY = {
  provider: 'api-route',
  baseURL: 'https://api.internal/v1',
  api: 'openai-completions',
  models: [{ id: 'm1', contextWindow: 64000 }],
};

test('the API lane saves, echoes the bumped view, and gates referential integrity', async () => {
  const home = freshHome();
  try {
    await inHome(home, async () => {
      const saved = await resolveDshSettingsApiRequest('dsh.json', 'POST', {
        model: { provider: 'api-route', model: 'm1', reasoningEffort: 'high' },
        modelRoutes: [{ ...API_ROUTE_BODY, models: [{ id: 'm1', contextWindow: 64000, efforts: ['low', 'high'] }] }],
      });
      assert.equal(saved.status, 200);
      const doc = saved.body as DshSettings;
      assert.equal(doc.revision, 1);
      assert.equal(doc.model?.reasoningEffort, 'high');
      // GET → the presence view
      const view = await resolveDshSettingsApiRequest('dsh.json', 'GET', undefined);
      assert.equal(view.status, 200);
      assert.deepEqual((view.body as { keyPresence: Record<string, boolean> }).keyPresence, { 'api-route': false });
      // the active model must live in the routes being saved
      const rejected = await resolveDshSettingsApiRequest('dsh.json', 'POST', {
        model: { provider: 'ghost', model: 'm1' },
        modelRoutes: [API_ROUTE_BODY],
      });
      assert.equal(rejected.status, 400);
      // the effort must be offered by the model when the model declares efforts
      const effortGate = await resolveDshSettingsApiRequest('dsh.json', 'POST', {
        model: { provider: 'api-route', model: 'm1', reasoningEffort: 'ultra' },
        modelRoutes: [{ ...API_ROUTE_BODY, models: [{ id: 'm1', efforts: ['low', 'high'] }] }],
      });
      assert.equal(effortGate.status, 400);
      // the kernel's fixed effort vocabulary — a non-level effort name is
      // rejected at the door (it would poison the whole provider profile)
      const levelGate = await resolveDshSettingsApiRequest('dsh.json', 'POST', {
        model: { provider: 'api-route', model: 'm1', reasoningEffort: 'turbo' },
        modelRoutes: [{ ...API_ROUTE_BODY, models: [{ id: 'm1', efforts: ['turbo'] }] }],
      });
      assert.equal(levelGate.status, 400);
      const levelGate2 = await resolveDshSettingsApiRequest('dsh.json', 'POST', {
        model: null,
        modelRoutes: [{ ...API_ROUTE_BODY, models: [{ id: 'm1', efforts: ['low', 'warp'] }] }],
      });
      assert.equal(levelGate2.status, 400);
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('the API lane rejects malformed routes with 400 envelopes', async () => {
  const home = freshHome();
  try {
    await inHome(home, async () => {
      const cases: unknown[] = [
        { modelRoutes: [{ provider: 'x', baseURL: 'ftp://nope', models: [{ id: 'm' }] }] }, // non-http baseURL
        { modelRoutes: [{ provider: 'x', baseURL: 'https://ok', api: 'not-a-protocol', models: [{ id: 'm' }] }] },
        { modelRoutes: [{ provider: 'x', baseURL: 'https://ok', models: [] }] }, // empty models
        { modelRoutes: [{ provider: 'x', baseURL: 'https://ok', models: [{ id: '' }] }] }, // empty id
        { model: { provider: 'x' }, modelRoutes: [] }, // half an active model
        'not an object',
      ];
      for (const body of cases) {
        const response = await resolveDshSettingsApiRequest('dsh.json', 'POST', body);
        assert.equal(response.status, 400, `expected 400 for ${JSON.stringify(body).slice(0, 60)}`);
      }
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('the credential lane writes through both faces; the test lane honors the baseURL override', async () => {
  const home = freshHome();
  try {
    await inHome(home, async () => {
      await resolveDshSettingsApiRequest('dsh.json', 'POST', { model: null, modelRoutes: [API_ROUTE_BODY] });
      const write = await resolveDshSettingsApiRequest('dsh-credential', 'POST', { provider: 'api-route', key: 'sk-api-1' });
      assert.equal(write.status, 200);
      assert.equal((write.body as { keyPresence: Record<string, boolean> }).keyPresence['api-route'], true);
      // a probe against a dead port with the override → honest failure envelope
      const probe = await resolveDshSettingsApiRequest('dsh-test', 'POST', { provider: 'api-route', baseURL: 'http://127.0.0.1:1/v1' });
      assert.equal(probe.status, 200);
      assert.equal((probe.body as { ok: boolean }).ok, false);
      // a non-http override is rejected at the door
      const badOverride = await resolveDshSettingsApiRequest('dsh-test', 'POST', { provider: 'api-route', baseURL: 'file:///etc' });
      assert.equal(badOverride.status, 400);
      // unknown provider
      const unknown = await resolveDshSettingsApiRequest('dsh-test', 'POST', { provider: 'ghost' });
      assert.equal(unknown.status, 400);
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

/* ── Codex r4 counter-examples — each one was a live P1 ───────────────── */

test('P1-2: clearing via an OMITTED key field is a 200 clear (not a 400)', async () => {
  const home = freshHome();
  try {
    await inHome(home, async () => {
      await resolveDshSettingsApiRequest('dsh.json', 'POST', { model: null, modelRoutes: [API_ROUTE_BODY] });
      await resolveDshSettingsApiRequest('dsh-credential', 'POST', { provider: 'api-route', key: 'sk-api-1' });
      // the panel's clear button shape: {provider} with NO key field
      const clear = await resolveDshSettingsApiRequest('dsh-credential', 'POST', { provider: 'api-route' });
      assert.equal(clear.status, 200);
      assert.equal((clear.body as { keyPresence: Record<string, boolean> }).keyPresence['api-route'], false);
      // all three faces dropped the secret: private JSON, kernel refs, view
      const privateFace = readFileSync(join(designStewardDir(), 'dsh-credentials.json'), 'utf8');
      assert.equal(privateFace.includes('sk-api-1'), false);
      assert.equal(credentialsYaml().includes('sk-api-1'), false);
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('P1-3: an upstream that echoes the key in its error body never leaks it into detail', async () => {
  const home = freshHome();
  // a mock gateway that reflects the Authorization header in the body —
  // the exact disclosure vector Codex demonstrated
  const upstream = createServer((req, res) => {
    const auth = req.headers.authorization ?? '';
    res.statusCode = 401;
    res.end(`invalid token ${auth}`);
  });
  await new Promise<void>((resolve) => upstream.listen(0, '127.0.0.1', resolve));
  const port = (upstream.address() as AddressInfo).port;
  try {
    await inHome(home, async () => {
      const route = { ...API_ROUTE_BODY, baseURL: `http://127.0.0.1:${port}/v1` };
      await resolveDshSettingsApiRequest('dsh.json', 'POST', { model: null, modelRoutes: [route] });
      await resolveDshSettingsApiRequest('dsh-credential', 'POST', { provider: route.provider, key: 'sk-LEAK-123' });
      const probe = await resolveDshSettingsApiRequest('dsh-test', 'POST', { provider: route.provider });
      assert.equal(probe.status, 200);
      const result = JSON.stringify(probe.body);
      assert.equal(result.includes('sk-LEAK-123'), false);
      assert.match(result, /HTTP 401/);
    });
  } finally {
    upstream.close();
    rmSync(home, { recursive: true, force: true });
  }
});

test('P1-5: private faces alone never ride the bridge — a dead/corrupt dsh-home means fallback', async () => {
  const home = freshHome();
  try {
    await inHome(home, async () => {
      // the full happy path first: bridge is live, query answers
      await resolveDshSettingsApiRequest('dsh.json', 'POST', {
        model: { provider: API_ROUTE_BODY.provider, model: 'm1' },
        modelRoutes: [API_ROUTE_BODY],
      });
      await resolveDshSettingsApiRequest('dsh-credential', 'POST', { provider: 'api-route', key: 'sk-live' });
      assert.notEqual(activeBridgeRoute(), null);
      // fault A: the bridge settings.yaml vanishes (sync never landed /
      // deleted) — the private faces stay intact
      rmSync(join(designDshHome(), 'settings.yaml'));
      assert.equal(activeBridgeRoute(), null, 'missing bridge settings → null');
      // restore via a fresh save, then fault B: corrupt yaml
      await resolveDshSettingsApiRequest('dsh.json', 'POST', {
        model: { provider: 'api-route', model: 'm1' },
        modelRoutes: [API_ROUTE_BODY],
      });
      writeFileSync(join(designDshHome(), 'settings.yaml'), 'llm-pi-ai: [unclosed', { flag: 'w' });
      assert.equal(activeBridgeRoute(), null, 'unparseable bridge settings → null');
      // fault C: settings fine but the credential ref is gone
      await resolveDshSettingsApiRequest('dsh.json', 'POST', {
        model: { provider: 'api-route', model: 'm1' },
        modelRoutes: [API_ROUTE_BODY],
      });
      writeFileSync(join(designDshHome(), '.credentials.yaml'), 'version: 1\nrefs: {}\n', { flag: 'w' });
      assert.equal(activeBridgeRoute(), null, 'credential ref missing → null');
      // and the self-heal: a clean credential write brings the bridge back
      await resolveDshSettingsApiRequest('dsh-credential', 'POST', { provider: 'api-route', key: 'sk-live' });
      assert.notEqual(activeBridgeRoute(), null, 're-synced bridge → live again');
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('P2-2: a cold-start clear still writes the canonical empty version-1 document', () => {
  const home = freshHome();
  try {
    inHome(home, () => {
      saveDshSettings({ configVersion: 1, revision: 0, model: null, modelRoutes: [ROUTE] });
      // clear on a home whose credentials file does not exist yet
      setRouteCredential(ROUTE.provider, null);
      const raw = credentialsYaml();
      const parsed = YAML.parse(raw) as { version?: number; refs?: Record<string, string> };
      assert.equal(parsed.version, 1);
      assert.deepEqual(parsed.refs, {});
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

/* ── Codex r4 round-2 counter-examples — each was a live P1 ───────────── */

test('r4-2 P1-1: a saved effort requires the model to DECLARE it (undeclared capability is rejected)', async () => {
  const home = freshHome();
  try {
    await inHome(home, async () => {
      // the exact user path: effort picked while efforts existed, then
      // the model's efforts were cleared — the save must 400, not strand
      // an effort the kernel will refuse at spawn time
      const rejected = await resolveDshSettingsApiRequest('dsh.json', 'POST', {
        model: { provider: 'api-route', model: 'm1', reasoningEffort: 'low' },
        modelRoutes: [{ ...API_ROUTE_BODY, models: [{ id: 'm1' }] }],
      });
      assert.equal(rejected.status, 400);
      assert.match(String((rejected.body as { message: string }).message), /not offered/);
      // declared-but-missing level still rejects
      const missing = await resolveDshSettingsApiRequest('dsh.json', 'POST', {
        model: { provider: 'api-route', model: 'm1', reasoningEffort: 'high' },
        modelRoutes: [{ ...API_ROUTE_BODY, models: [{ id: 'm1', efforts: ['low'] }] }],
      });
      assert.equal(missing.status, 400);
      // declared + offered passes
      const ok = await resolveDshSettingsApiRequest('dsh.json', 'POST', {
        model: { provider: 'api-route', model: 'm1', reasoningEffort: 'low' },
        modelRoutes: [{ ...API_ROUTE_BODY, models: [{ id: 'm1', efforts: ['low'] }] }],
      });
      assert.equal(ok.status, 200);
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('r4-2 P1-3: uniqueness gates — duplicate providers/ids/efforts, ref collisions, control chars', async () => {
  const home = freshHome();
  try {
    await inHome(home, async () => {
      const dupProvider = await resolveDshSettingsApiRequest('dsh.json', 'POST', {
        model: null,
        modelRoutes: [API_ROUTE_BODY, { ...API_ROUTE_BODY }],
      });
      assert.equal(dupProvider.status, 400);
      const dupModel = await resolveDshSettingsApiRequest('dsh.json', 'POST', {
        model: null,
        modelRoutes: [{ ...API_ROUTE_BODY, models: [{ id: 'm1' }, { id: 'm1' }] }],
      });
      assert.equal(dupModel.status, 400);
      const dupEffort = await resolveDshSettingsApiRequest('dsh.json', 'POST', {
        model: null,
        modelRoutes: [{ ...API_ROUTE_BODY, models: [{ id: 'm1', efforts: ['low', 'low'] }] }],
      });
      assert.equal(dupEffort.status, 400);
      // a-b vs a_b collapse onto the same credential ref — cross-wiring
      // two providers' keys on the bridge must be impossible
      const collision = await resolveDshSettingsApiRequest('dsh.json', 'POST', {
        model: null,
        modelRoutes: [
          { ...API_ROUTE_BODY, provider: 'a-b' },
          { ...API_ROUTE_BODY, provider: 'a_b' },
        ],
      });
      assert.equal(collision.status, 400);
      assert.match(String((collision.body as { message: string }).message), /credential ref/);
      // control characters never reach the YAML scalars
      const newline = await resolveDshSettingsApiRequest('dsh.json', 'POST', {
        model: null,
        modelRoutes: [{ ...API_ROUTE_BODY, provider: 'bad\nprovider' }],
      });
      assert.equal(newline.status, 400);
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('r4-2 P1-2: the bridge query verifies credential structure/value and the saved-selection section', async () => {
  const home = freshHome();
  try {
    await inHome(home, async () => {
      await resolveDshSettingsApiRequest('dsh.json', 'POST', {
        model: { provider: 'api-route', model: 'm1' },
        modelRoutes: [API_ROUTE_BODY],
      });
      await resolveDshSettingsApiRequest('dsh-credential', 'POST', { provider: 'api-route', key: 'sk-live' });
      assert.notEqual(activeBridgeRoute(), null, 'happy path');
      const credPath = join(designDshHome(), '.credentials.yaml');
      const settingsPath = join(designDshHome(), 'settings.yaml');

      // fault: ref VALUE diverges from the private key (stale bridge doc)
      writeFileSync(credPath, `version: 1\nrefs:\n  ${dshRouteApiKeyEnv('api-route')}: sk-STALE\n`, { flag: 'w' });
      assert.equal(activeBridgeRoute(), null, 'stale ref value → fallback');

      // fault: a flat top-level ref (pre-bridge shape) with empty refs
      writeFileSync(credPath, `version: 1\nrefs: {}\n${dshRouteApiKeyEnv('api-route')}: sk-live\n`, { flag: 'w' });
      assert.equal(activeBridgeRoute(), null, 'flat top-level ref → fallback');

      // fault: refs entry present but empty
      writeFileSync(credPath, `version: 1\nrefs:\n  ${dshRouteApiKeyEnv('api-route')}: ''\n`, { flag: 'w' });
      assert.equal(activeBridgeRoute(), null, 'empty ref value → fallback');

      // heal credentials, then fault: agent-default-model section removed
      await resolveDshSettingsApiRequest('dsh-credential', 'POST', { provider: 'api-route', key: 'sk-live' });
      const parsed = YAML.parse(readFileSync(settingsPath, 'utf8')) as Record<string, unknown>;
      delete parsed['agent-default-model'];
      writeFileSync(settingsPath, YAML.stringify(parsed), { flag: 'w' });
      assert.equal(activeBridgeRoute(), null, 'missing saved-selection section → fallback');

      // fault: section points at another provider
      const parsed2 = YAML.parse(readFileSync(settingsPath, 'utf8')) as Record<string, unknown>;
      parsed2['agent-default-model'] = { provider: 'someone-else', model: 'm9' };
      writeFileSync(settingsPath, YAML.stringify(parsed2), { flag: 'w' });
      assert.equal(activeBridgeRoute(), null, 'diverged saved selection → fallback');

      // full self-heal via clean saves
      await resolveDshSettingsApiRequest('dsh.json', 'POST', {
        model: { provider: 'api-route', model: 'm1' },
        modelRoutes: [API_ROUTE_BODY],
      });
      assert.notEqual(activeBridgeRoute(), null, 'clean re-save → live again');
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('r4-2 P2-1: legacy flat top-level keys migrate into refs on the next credential write', () => {
  const home = freshHome();
  try {
    inHome(home, () => {
      saveDshSettings({ configVersion: 1, revision: 0, model: null, modelRoutes: [ROUTE] });
      // the pre-bridge shape: a flat top-level key (which the kernel's
      // credentials-local refuses as an unknown top-level key)
      const ref = dshRouteApiKeyEnv('my-gateway');
      writeFileSync(join(designDshHome(), '.credentials.yaml'), `${ref}: old-key\n`, { flag: 'w' });
      setRouteCredential('my-gateway', 'new-key');
      const parsed = YAML.parse(credentialsYaml()) as { version?: number; refs?: Record<string, string> };
      assert.equal(parsed.version, 1);
      assert.deepEqual(parsed.refs, { [ref]: 'new-key' });
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

/* ── Codex r4 round-3 counter-examples ────────────────────────────────── */

test('r4-3 P2-1: a kernel-owned records section survives set/clear untouched', () => {
  const home = freshHome();
  try {
    inHome(home, () => {
      saveDshSettings({ configVersion: 1, revision: 0, model: null, modelRoutes: [ROUTE] });
      // the tagged-record shape other dsh components write (scope/id →
      // kind api-key + key + env) — version-1 vocabulary, not ours to touch
      const doc = [
        'version: 1',
        'refs: {}',
        'records:',
        '  skill/foo:',
        '    kind: api-key',
        '    key: preserved-record',
        '    env:',
        '      RECORD_ENV: preserved-env',
        ''].join('\n');
      writeFileSync(join(designDshHome(), '.credentials.yaml'), doc, { flag: 'w' });
      setRouteCredential(ROUTE.provider, 'sk-mine');
      let parsed = YAML.parse(credentialsYaml()) as { refs?: Record<string, string>; records?: Record<string, unknown> };
      assert.deepEqual(parsed.refs, { [dshRouteApiKeyEnv('my-gateway')]: 'sk-mine' });
      assert.deepEqual(parsed.records, { 'skill/foo': { kind: 'api-key', key: 'preserved-record', env: { RECORD_ENV: 'preserved-env' } } });
      setRouteCredential(ROUTE.provider, null);
      parsed = YAML.parse(credentialsYaml()) as { refs?: Record<string, string>; records?: Record<string, unknown> };
      assert.deepEqual(parsed.refs, {});
      assert.deepEqual(parsed.records, { 'skill/foo': { kind: 'api-key', key: 'preserved-record', env: { RECORD_ENV: 'preserved-env' } } });
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('r4-3 P2-2: concurrent multi-process credential writes lose no keys (lock + unique tmp)', async () => {
  const home = freshHome();
  try {
    await inHome(home, async () => {
      saveDshSettings({
        configVersion: 1,
        revision: 0,
        model: null,
        modelRoutes: Array.from({ length: 20 }, (_, i) => ({
          provider: `p${i}`,
          baseURL: 'https://api.internal/v1',
          models: [{ id: 'm' }],
        })),
      });
      // 20 real subprocesses racing setRouteCredential — the fixed .tmp
      // cross-rename ENOENT + lost-update class Codex demonstrated
      const script = [
        "import { setRouteCredential } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui-design-tool/packages/design-tool/src/server/settings/dsh-settings.ts';",
        `setRouteCredential(process.argv[1], 'sk-' + process.argv[1]);`,
      ].join('\n');
      const procs = Array.from({ length: 20 }, (_, i) =>
        spawn(process.execPath, ['--input-type=module', '-e', script, '--', `p${i}`], {
          env: { ...process.env, JIXOAI_DESIGN_HOME: home },
        }),
      );
      const codes = await Promise.all(procs.map((p) => new Promise<number>((resolve) => p.on('exit', resolve))));
      assert.deepEqual(codes, Array.from({ length: 20 }, () => 0), 'every writer exited clean');
      // private face: all 20 keys
      const stored = JSON.parse(readFileSync(join(designStewardDir(), 'dsh-credentials.json'), 'utf8')) as Record<string, string>;
      for (let i = 0; i < 20; i += 1) assert.equal(stored[`p${i}`], `sk-p${i}`, `private key p${i}`);
      // bridge face: all 20 refs
      const cred = YAML.parse(credentialsYaml()) as { refs?: Record<string, string> };
      for (let i = 0; i < 20; i += 1) assert.equal(cred.refs?.[`JIXOAI_DESIGN_ROUTE_KEY_P${i}`], `sk-p${i}`, `bridge ref p${i}`);
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

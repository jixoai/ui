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
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

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

test('the bridge writes the kernel-native llm-pi-ai whitelist (id + contextWindow only)', () => {
  const home = freshHome();
  try {
    inHome(home, () => {
      saveDshSettings({ configVersion: 1, revision: 0, model: { provider: ROUTE.provider, model: 'glm-5.3' }, modelRoutes: [ROUTE] });
      const yaml = settingsYaml();
      assert.match(yaml, /llm-pi-ai:\n  providers:\n    'my-gateway':/);
      assert.match(yaml, new RegExp(`apiKeyEnv: '${dshRouteApiKeyEnv('my-gateway')}'`));
      assert.match(yaml, /api: 'anthropic-messages'/);
      assert.match(yaml, /baseURL: 'https:\/\/api\.example\.com\/anthropic'/);
      assert.match(yaml, /\{ id: 'glm-5\.3', contextWindow: 200000 \}/);
      // the kernel rejects unknown provider keys — name/efforts/maxOutputTokens MUST NOT cross the bridge
      assert.doesNotMatch(yaml, /name:|efforts:|maxOutputTokens:/);
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
      const yaml = settingsYaml();
      assert.match(yaml, /agent-default-model:\n  provider: 'my-gateway'\n  model: 'glm-5\.3'\n  reasoningEffort: 'high'/);
      // a null model drops the section (the kernel row default stands)
      saveDshSettings({ configVersion: 1, revision: 1, model: null, modelRoutes: [ROUTE] });
      assert.doesNotMatch(settingsYaml(), /agent-default-model:/);
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('unknown top-level settings.yaml sections survive a bridge sync', () => {
  const home = freshHome();
  try {
    inHome(home, () => {
      saveDshSettings({ configVersion: 1, revision: 0, model: null, modelRoutes: [ROUTE] });
      const withForeign = `${settingsYaml()}\nsome-kernel-section:\n  nested: value\n`;
      writeFileSync(join(designDshHome(), 'settings.yaml'), withForeign, { flag: 'w' });
      saveDshSettings({ configVersion: 1, revision: 1, model: { provider: ROUTE.provider, model: 'glm-5.3' }, modelRoutes: [ROUTE] });
      const yaml = settingsYaml();
      assert.match(yaml, /some-kernel-section:\n  nested: value/);
      assert.match(yaml, /agent-default-model:/);
      assert.match(yaml, /llm-pi-ai:/);
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
      // the kernel face: version + refs, NEVER a flat top-level key
      const yaml = credentialsYaml();
      assert.match(yaml, /^version: 1$/m);
      assert.match(yaml, new RegExp(`^refs:\\n  ${dshRouteApiKeyEnv('my-gateway')}: 'sk-secret-123'$`, 'm'));
      assert.doesNotMatch(yaml, /^sk-secret-123/m);
      // the API-safe view: presence only
      const view = settingsView() as { keyPresence: Record<string, boolean> };
      assert.equal(view.keyPresence['my-gateway'], true);
      assert.equal(JSON.stringify(view).includes('sk-secret-123'), false);
      // clear removes the ref
      setRouteCredential(ROUTE.provider, null);
      assert.doesNotMatch(credentialsYaml(), new RegExp(dshRouteApiKeyEnv('my-gateway')));
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
        modelRoutes: [API_ROUTE_BODY],
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

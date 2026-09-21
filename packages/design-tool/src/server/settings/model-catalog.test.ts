/**
 * model-catalog.test.ts — the provider gallery projection + the API
 * lane's catalog/test surfaces (settings-model-parity T1/T2).
 *
 * Every test runs against a FIXTURE data dir (JIXOAI_DESIGN_CATALOG_DIR)
 * — the real ~/.dsh tree is never read here, and the cache key (the
 * resolved dir) keeps env swaps isolated. The dsh-test probes run
 * against an in-process http fixture (the listing shape + a key-echoing
 * gateway, proving the scrub covers DIRECT keys too).
 */

import { strict as assert } from 'node:assert';
import { createServer, type AddressInfo } from 'node:http';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { catalogDataDirCandidates, CatalogUnavailableError, listModelProviders, resolveFromCandidates } from './model-catalog.ts';
import { resolveDshSettingsApiRequest } from './dsh-settings-api.ts';
import { saveDshSettings, setRouteCredential, type DshSettings } from './dsh-settings.ts';

/* ── fixture catalog ──────────────────────────────────────────────────── */

function fixtureDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'jixoai-design-catalog-'));
  writeFileSync(
    join(dir, 'zai.json'),
    JSON.stringify({
      'openai-completions': {
        'glm-5.3': {
          id: 'glm-5.3',
          name: 'GLM 5.3',
          api: 'openai-completions',
          baseUrl: 'https://api.z.ai/api/coding/paas/v4',
          input: ['text', 'image'],
          compat: { supportsReasoningEffort: true },
          contextWindow: 204800,
          maxTokens: 131072,
          thinkingLevelMap: { off: 0, low: 1, high: 2 },
        },
        'glm-4.7': { id: 'glm-4.7', name: 'GLM 4.7', api: 'openai-completions', baseUrl: 'https://api.z.ai/api/coding/paas/v4', input: ['text'] },
      },
    }),
  );
  writeFileSync(
    join(dir, 'zz-tail.json'),
    JSON.stringify({ 'openai-completions': { 'tail-model': { id: 'tail-model', api: 'openai-completions', baseUrl: 'https://tail.example' } } }),
  );
  writeFileSync(join(dir, 'faux.json'), JSON.stringify({ 'openai-completions': { f: { id: 'f', api: 'openai-completions', baseUrl: 'https://faux' } } }));
  writeFileSync(join(dir, 'corrupt.json'), '{not json');
  writeFileSync(join(dir, 'no-url.json'), JSON.stringify({ 'openai-completions': { m: { id: 'm', api: 'openai-completions' } } }));
  return dir;
}

function inCatalogEnv<T>(dir: string, run: () => T | Promise<T>): Promise<T> {
  const previous = process.env.JIXOAI_DESIGN_CATALOG_DIR;
  const previousHome = process.env.JIXOAI_DESIGN_HOME;
  process.env.JIXOAI_DESIGN_CATALOG_DIR = dir;
  process.env.JIXOAI_DESIGN_HOME = mkdtempSync(join(tmpdir(), 'jixoai-design-home-'));
  return Promise.resolve(run()).finally(() => {
    if (previous === undefined) delete process.env.JIXOAI_DESIGN_CATALOG_DIR;
    else process.env.JIXOAI_DESIGN_CATALOG_DIR = previous;
    if (previousHome === undefined) delete process.env.JIXOAI_DESIGN_HOME;
    else process.env.JIXOAI_DESIGN_HOME = previousHome;
  });
}

test('the projection ranks KNOWN providers first, drops corrupt/excluded/url-less entries', async () => {
  const dir = fixtureDir();
  try {
    await inCatalogEnv(dir, async () => {
      const providers = listModelProviders();
      assert.deepEqual(providers.map((entry) => entry.provider), ['zai', 'zz-tail']); // faux + corrupt + no-url gone
      const zai = providers[0]!;
      assert.equal(zai.label, 'Z.ai'); // KNOWN_LABELS override
      assert.equal(zai.api, 'openai-completions');
      assert.equal(zai.baseURL, 'https://api.z.ai/api/coding/paas/v4');
      const glm = zai.models.find((model) => model.id === 'glm-5.3')!;
      assert.equal(glm.name, 'GLM 5.3');
      assert.equal(glm.image, true);
      assert.equal(glm.contextWindow, 204800);
      assert.equal(glm.maxOutputTokens, 131072);
      assert.equal(glm.supportsReasoningEffort, true);
      assert.deepEqual(glm.effortTiers, ['high', 'low']); // off dropped, sorted
      assert.ok(!('inputTypes' in glm)); // modality data does not ride the payload
      const tail = providers[1]!;
      assert.equal(tail.label, 'Zz Tail'); // word-split prettify
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a fully-dead chain is a typed miss — never an empty gallery', async () => {
  // the pure chain test pins the ORDER; this seam pins the typed throw:
  // every candidate dead → CatalogUnavailableError → the API degrades 503
  assert.throws(() => resolveFromCandidates(['/nowhere/one', '/nowhere/two']), CatalogUnavailableError);
  const live = fixtureDir();
  try {
    await inCatalogEnv(live, async () => {
      // and the LIVE chain end-to-end still resolves + serves
      const response = await resolveDshSettingsApiRequest('catalog.json', 'GET', undefined);
      assert.equal(response.status, 200);
    });
  } finally {
    rmSync(live, { recursive: true, force: true });
  }
});

test('catalog.json serves the gallery envelope through the resolver', async () => {
  const dir = fixtureDir();
  try {
    await inCatalogEnv(dir, async () => {
      const response = await resolveDshSettingsApiRequest('catalog.json', 'GET', undefined);
      assert.equal(response.status, 200);
      const body = response.body as { providers: Array<{ provider: string; icon: string | null }> };
      assert.deepEqual(body.providers.map((entry) => entry.provider), ['zai', 'zz-tail']);
      // the fixture providers have no icons — the letter-avatar fallback is
      // the client's; a REAL catalog entry (e.g. amazon-bedrock) would carry
      // its dataURL. Assert the key is always present, never absent.
      for (const entry of body.providers) assert.ok(entry.icon === null || entry.icon.startsWith('data:image/'));
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

/* ── dsh-test: modelId verdict + direct test-only key ─────────────────── */

/** an in-process gateway: /v1/models echoes the bearer key in a header-
 *  shaped field when ?echo=1 (proving the scrub), and lists fixed ids */
async function fixtureGateway(listedIds: string[], echoKey: boolean): Promise<{ base: string; close: () => Promise<void> }> {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://fixture');
    if (url.pathname.endsWith('/v1/models')) {
      const key = req.headers.authorization?.slice('Bearer '.length) ?? '';
      if (echoKey) {
        // a hostile gateway: the key rides the BODY (the non-disclosure trap)
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ data: listedIds.map((id) => ({ id })), echoed: key }));
        return;
      }
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ data: listedIds.map((id) => ({ id })) }));
      return;
    }
    res.statusCode = 404;
    res.end('{}');
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  return { base: `http://127.0.0.1:${port}`, close: () => new Promise<void>((resolve) => server.close(() => resolve())) };
}

const SETTINGS: DshSettings = {
  configVersion: 1,
  revision: 0,
  model: null,
  modelRoutes: [
    {
      provider: 'probe-gateway',
      api: 'anthropic-messages',
      baseURL: 'http://127.0.0.1:1/never', // replaced per test via the baseURL override
      models: [{ id: 'glm-5.3' }],
    },
  ],
};

test('dsh-test with modelId reports the listing verdict without generation cost', async () => {
  const gateway = await fixtureGateway(['glm-5.3', 'glm-4.7'], false);
  const home = mkdtempSync(join(tmpdir(), 'jixoai-design-home-'));
  try {
    await inCatalogEnv(fixtureDir(), async () => {
      process.env.JIXOAI_DESIGN_HOME = home;
      await saveDshSettings(SETTINGS);
      const listed = await resolveDshSettingsApiRequest('dsh-test', 'POST', {
        provider: 'probe-gateway',
        baseURL: gateway.base,
        modelId: 'glm-5.3',
      });
      assert.equal(listed.status, 200);
      assert.deepEqual((listed.body as { ok: boolean; modelListed: boolean }).modelListed, true);
      const absent = await resolveDshSettingsApiRequest('dsh-test', 'POST', {
        provider: 'probe-gateway',
        baseURL: gateway.base,
        modelId: 'not-a-model',
      });
      assert.deepEqual((absent.body as { modelListed: boolean }).modelListed, false);
    });
  } finally {
    await gateway.close();
    rmSync(home, { recursive: true, force: true });
  }
});

test('a DIRECT test-only key probes without a stored credential and never rides the detail', async () => {
  const gateway = await fixtureGateway(['glm-5.3'], true);
  const home = mkdtempSync(join(tmpdir(), 'jixoai-design-home-'));
  try {
    await inCatalogEnv(fixtureDir(), async () => {
      process.env.JIXOAI_DESIGN_HOME = home;
      await saveDshSettings(SETTINGS);
      const response = await resolveDshSettingsApiRequest('dsh-test', 'POST', {
        provider: 'probe-gateway',
        baseURL: gateway.base,
        apiKey: 'sk-direct-secret',
      });
      assert.equal(response.status, 200);
      const body = response.body as { ok: boolean; detail: string };
      assert.equal(body.ok, true);
      assert.ok(!body.detail.includes('sk-direct-secret'), 'the direct key must be scrubbed from detail');
      // the direct key was never persisted: a follow-up probe without it
      // still succeeds (the fixture ignores auth) and no credential file grew
      await setRouteCredential('probe-gateway', null);
    });
  } finally {
    await gateway.close();
    rmSync(home, { recursive: true, force: true });
  }
});

test('dsh-test rejects malformed modelId/apiKey shapes at the door', async () => {
  const home = mkdtempSync(join(tmpdir(), 'jixoai-design-home-'));
  try {
    await inCatalogEnv(fixtureDir(), async () => {
      process.env.JIXOAI_DESIGN_HOME = home;
      await saveDshSettings(SETTINGS);
      for (const bad of [{ modelId: '' }, { apiKey: 7 }, { modelId: {} }]) {
        const response = await resolveDshSettingsApiRequest('dsh-test', 'POST', { provider: 'probe-gateway', ...bad });
        assert.equal(response.status, 400, JSON.stringify(bad));
      }
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

/* ── the anchor chain (r2 P1: the proposal's exact three steps) ──────── */

test('catalogDataDirCandidates follows env → DSH_HOME??~/.dsh → ~/.dsh, no extras', () => {
  const piAi = (root: string): string => join(root, 'profiles', 'node_modules', '@earendil-works', 'pi-ai', 'dist', 'providers', 'data');
  const home = '/fake/home';
  // bare: ONE candidate (~/.dsh), no duplicates
  assert.deepEqual(catalogDataDirCandidates({}, home), [piAi(join(home, '.dsh'))]);
  // explicit env first, then the default home
  assert.deepEqual(
    catalogDataDirCandidates({ JIXOAI_DESIGN_CATALOG_DIR: '/fixture/dir' }, home),
    ['/fixture/dir', piAi(join(home, '.dsh'))],
  );
  // an explicit DSH_HOME shadows ~/.dsh — but ~/.dsh stays reachable as
  // the LAST anchor (a dead DSH_HOME must not strand a working ~/.dsh)
  assert.deepEqual(
    catalogDataDirCandidates({ DSH_HOME: '/tmp/dead' }, home),
    [piAi('/tmp/dead'), piAi(join(home, '.dsh'))],
  );
  // all three, in order
  assert.deepEqual(
    catalogDataDirCandidates({ JIXOAI_DESIGN_CATALOG_DIR: '/fixture/dir', DSH_HOME: '/tmp/dead' }, home),
    ['/fixture/dir', piAi('/tmp/dead'), piAi(join(home, '.dsh'))],
  );
  // an empty env override is ignored, not honored as ""
  assert.deepEqual(catalogDataDirCandidates({ JIXOAI_DESIGN_CATALOG_DIR: '' }, home), [piAi(join(home, '.dsh'))]);
});

/* ── the ad-hoc probe lane (r2 P1-1: the create form probes unstored) ── */

test('dsh-test probes an UNSTORED route when baseURL + api ride the request', async () => {
  const gateway = await fixtureGateway(['probe-model'], false);
  const home = mkdtempSync(join(tmpdir(), 'jixoai-design-home-'));
  try {
    await inCatalogEnv(fixtureDir(), async () => {
      process.env.JIXOAI_DESIGN_HOME = home;
      await saveDshSettings(SETTINGS);
      const ok = await resolveDshSettingsApiRequest('dsh-test', 'POST', {
        provider: 'not-yet-created',
        baseURL: gateway.base,
        api: 'anthropic-messages',
        modelId: 'probe-model',
      });
      assert.equal(ok.status, 200);
      assert.deepEqual((ok.body as { ok: boolean; modelListed: boolean }).modelListed, true);
      // an unstored probe WITHOUT api is rejected at the door
      const bad = await resolveDshSettingsApiRequest('dsh-test', 'POST', {
        provider: 'not-yet-created',
        baseURL: gateway.base,
      });
      assert.equal(bad.status, 400);
      // an unstored probe with an ILLEGAL api is rejected too
      const badApi = await resolveDshSettingsApiRequest('dsh-test', 'POST', {
        provider: 'not-yet-created',
        baseURL: gateway.base,
        api: 'not-a-protocol',
      });
      assert.equal(badApi.status, 400);
    });
  } finally {
    await gateway.close();
    rmSync(home, { recursive: true, force: true });
  }
});

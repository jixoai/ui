/**
 * settings-panel-lib.test.ts — the panel's pure helpers (settings-model-
 * parity T3). Every ported behavior gets its skill-creator twin asserted,
 * plus the kernel adaptations (effort clamping, dropped modality fields).
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';

import {
  API_PROTOCOLS,
  THINKING_LEVELS,
  asCatalogDoc,
  avatarHue,
  catalogModelCandidates,
  catalogModelDefaults,
  catalogRouteDraft,
  clampModelEfforts,
  formatTokenCount,
  hueAvatarColor,
  isNamespaceModelId,
  nextRouteSlug,
  numberedSlugParts,
  parseTokenShorthand,
  readableModelName,
  routeDisplayLabel,
} from './settings-panel-lib.ts';
import type { CatalogProvider } from '../server/settings/model-catalog.ts';

/* ── deterministic avatars ────────────────────────────────────────────── */

test('avatarHue is deterministic and bounded; hueAvatarColor composes the CSS', () => {
  assert.equal(avatarHue('zai'), avatarHue('zai'));
  assert.ok(avatarHue('zai') >= 0 && avatarHue('zai') < 360);
  assert.match(hueAvatarColor('zai'), /^hsl\(\d+ 55% 45%\)$/);
});

/* ── readable names + token shorthand ─────────────────────────────────── */

test('readableModelName uppercases short alpha segments (glm → GLM)', () => {
  assert.equal(readableModelName('glm-5.3-flash'), 'GLM 5.3 Flash');
  assert.equal(readableModelName('gpt_4o_mini'), 'GPT 4o Mini');
});

test('parseTokenShorthand accepts numbers/k/M and rejects guesses', () => {
  assert.equal(parseTokenShorthand('131072'), 131072);
  assert.equal(parseTokenShorthand('253k'), 253 * 1024);
  assert.equal(parseTokenShorthand('0.5M'), Math.round(0.5 * 1024 * 1024));
  assert.equal(parseTokenShorthand(' 128K '), 131072);
  assert.equal(parseTokenShorthand('abc'), null);
  assert.equal(parseTokenShorthand('-5k'), null);
  assert.equal(parseTokenShorthand(''), null);
});

test('formatTokenCount is parseTokenShorthand’s display inverse', () => {
  assert.equal(formatTokenCount(131072), '128k');
  assert.equal(formatTokenCount(204800), '200k');
  assert.equal(formatTokenCount(2097152), '2M');
  assert.equal(formatTokenCount(512), '512');
  assert.equal(formatTokenCount(parseTokenShorthand('0.5M')!), '512k');
});

/* ── numbered slugs + display labels ──────────────────────────────────── */

test('nextRouteSlug numbers only when taken and never backfills holes', () => {
  const routes = (names: string[]) => names.map((provider) => ({ provider }));
  assert.equal(nextRouteSlug('zai', routes([])), 'zai');
  assert.equal(nextRouteSlug('zai', routes(['zai'])), 'zai-2');
  assert.equal(nextRouteSlug('zai', routes(['zai', 'zai-2'])), 'zai-3');
  assert.equal(nextRouteSlug('zai', routes(['zai', 'zai-2', 'zai-4'])), 'zai-5');
});

test('numberedSlugParts parses suffixes from 2 up', () => {
  assert.deepEqual(numberedSlugParts('zai-2'), { base: 'zai', n: 2 });
  assert.equal(numberedSlugParts('zai'), null);
  assert.equal(numberedSlugParts('glm-5.3'), null); // non-numeric tail is not a suffix
});

test('routeDisplayLabel projects numbered slugs back onto the catalog label', () => {
  const catalog = {
    providers: [
      { provider: 'zai', label: 'Z.ai', api: 'openai-completions', baseURL: 'https://api.z.ai', icon: null, models: [] },
    ] as CatalogProvider[],
  };
  assert.equal(routeDisplayLabel({ provider: 'zai' }, catalog), 'Z.ai');
  assert.equal(routeDisplayLabel({ provider: 'zai-2' }, catalog), 'Z.ai (1)');
  assert.equal(routeDisplayLabel({ provider: 'my-gateway' }, catalog), 'my-gateway');
  assert.equal(routeDisplayLabel({ provider: 'zai-2' }, null), 'zai-2');
});

/* ── the completion pool ──────────────────────────────────────────────── */

test('namespace ids stay only on their host provider; the current provider ranks first', () => {
  const catalog = {
    providers: [
      {
        provider: 'zai',
        label: 'Z.ai',
        api: 'openai-completions',
        baseURL: 'https://api.z.ai',
        icon: null,
        models: [
          { id: 'glm-5.3', image: false },
          { id: '@cf/zai-org/glm-5.3', image: false },
        ],
      },
      {
        provider: 'openai',
        label: 'OpenAI',
        api: 'openai-responses',
        baseURL: 'https://api.openai.com/v1',
        icon: null,
        models: [
          { id: 'gpt-5.2', image: true },
          { id: '@cf/zai-org/glm-5.3', image: false }, // foreign namespace id on another host
        ],
      },
    ] as CatalogProvider[],
  };
  const forZai = catalogModelCandidates(catalog, 'zai').map((entry) => entry.id);
  assert.deepEqual(forZai.slice(0, 2).sort(), ['@cf/zai-org/glm-5.3', 'glm-5.3'].sort());
  assert.ok(forZai.includes('gpt-5.2'));
  assert.equal(forZai.filter((id) => id === '@cf/zai-org/glm-5.3').length, 1); // host copy wins, no dupe
  const forOpenai = catalogModelCandidates(catalog, 'openai').map((entry) => entry.id);
  assert.ok(forOpenai.includes('@cf/zai-org/glm-5.3')); // own namespace id kept
  assert.ok(!catalogModelCandidates(catalog, 'zai').some((entry) => isNamespaceModelId(entry.id) && entry.id.startsWith('openai/')));
});

/* ── catalog prefills (the kernel adaptations) ────────────────────────── */

test('catalogModelDefaults clamps efforts to the kernel vocabulary', () => {
  const clamped = catalogModelDefaults({ id: 'glm-5.3', image: false, effortTiers: ['off', 'low', 'thinking', 'high'] });
  assert.deepEqual(clamped.efforts, ['high', 'low']); // off + "thinking" dropped, sorted
  const empty = catalogModelDefaults({ id: 'm', image: false });
  assert.deepEqual(empty.efforts, ['low', 'high', 'max']); // the default three
});

test('catalogModelDefaults carries the kernel’s model fields and drops modality data', () => {
  const entry = catalogModelDefaults({
    id: 'glm-5.3',
    image: true,
    name: 'GLM 5.3',
    contextWindow: 204800,
    maxOutputTokens: 131072,
    supportsReasoningEffort: true,
  });
  assert.equal(entry.id, 'glm-5.3');
  assert.equal(entry.name, 'GLM 5.3');
  assert.equal(entry.contextWindow, 204800);
  assert.equal(entry.maxOutputTokens, 131072);
  assert.ok(!('inputTypes' in entry) && !('outputTypes' in entry));
});

test('catalogRouteDraft numbers the slug and prefills image-capable models first (top 4)', () => {
  const entry = {
    provider: 'zai',
    label: 'Z.ai',
    api: 'openai-completions',
    baseURL: 'https://api.z.ai/api/coding/paas/v4',
    icon: null,
    models: [
      { id: 'text-only', image: false },
      { id: 'vision-a', image: true },
      { id: 'vision-b', image: true },
      { id: 'vision-c', image: true },
      { id: 'vision-d', image: true },
      { id: 'text-two', image: false },
    ],
  } as CatalogProvider;
  const draft = catalogRouteDraft(entry, [{ provider: 'zai' }]);
  assert.equal(draft.provider, 'zai-2');
  assert.equal(draft.api, entry.api);
  assert.equal(draft.baseURL, entry.baseURL);
  assert.equal(draft.models.length, 4);
  assert.deepEqual(draft.models.map((model) => model.id), ['vision-a', 'vision-b', 'vision-c', 'vision-d']);
  assert.ok(draft.models.every((model) => model.efforts !== undefined));
});

/* ── the vocabulary twins stay in lockstep ────────────────────────────── */

test('the kernel vocabulary and protocol twins match the server exports', async () => {
  const server = await import('../server/settings/dsh-settings.ts');
  assert.deepEqual([...THINKING_LEVELS], [...server.DSH_THINKING_LEVELS]);
  assert.deepEqual(new Set(API_PROTOCOLS), new Set(server.DSH_ROUTE_API_PROTOCOLS));
});

/* ── the catalog fetch boundary (r2 P1: strict decode or degrade) ─────── */

test('asCatalogDoc accepts a well-formed gallery payload', () => {
  const doc = asCatalogDoc({
    providers: [
      {
        provider: 'zai',
        label: 'Z.ai',
        api: 'openai-completions',
        baseURL: 'https://api.z.ai',
        icon: 'data:image/svg+xml;base64,AAAA',
        models: [{ id: 'glm-5.3', name: 'GLM 5.3', image: true, contextWindow: 204800, effortTiers: ['low', 'high'] }],
      },
    ],
  });
  assert.notEqual(doc, null);
  assert.equal(doc!.providers[0]!.models[0]!.effortTiers!.length, 2);
});

test('asCatalogDoc rejects hostile shapes wholesale (icon/baseURL/types/caps)', () => {
  const ok = { providers: [{ provider: 'p', label: 'P', api: 'a', baseURL: 'https://p.example', icon: null, models: [{ id: 'm', image: false }] }] };
  const cases: unknown[] = [
    { providers: 'no' },
    { providers: [{ ...ok.providers[0], icon: 'javascript:alert(1)' }] },
    { providers: [{ ...ok.providers[0], icon: 'data:text/html,hi' }] },
    { providers: [{ ...ok.providers[0], baseURL: 'ftp://nope' }] },
    { providers: [{ ...ok.providers[0], provider: 'bad\u0000name' }] },
    { providers: [{ ...ok.providers[0], models: [{ id: 'm', image: 'yes' }] }] },
    { providers: [{ ...ok.providers[0], models: [{ id: 'm', image: false, contextWindow: -5 }] }] },
    { providers: [{ ...ok.providers[0], models: [{ id: 'm', image: false, effortTiers: ['ok', 7] }] }] },
    { providers: [{ ...ok.providers[0], label: '' }] },
    { providers: Array.from({ length: 1001 }, () => ok.providers[0]) },
  ];
  for (const [index, value] of cases.entries()) {
    assert.equal(asCatalogDoc(value), null, `case ${index} must reject`);
  }
});

test('clampModelEfforts is the single clamp (off dropped, vocabulary clamped, default three)', () => {
  assert.deepEqual(clampModelEfforts(['off', 'low', 'high']), ['high', 'low']);
  assert.deepEqual(clampModelEfforts(['thinking', 'minimal']), ['minimal']);
  assert.deepEqual(clampModelEfforts(undefined), ['low', 'high', 'max']);
  assert.deepEqual(clampModelEfforts([]), ['low', 'high', 'max']);
});

test('asCatalogDoc rejects duplicate provider and model ids (r3)', () => {
  const provider = { provider: 'p', label: 'P', api: 'a', baseURL: 'https://p.example', icon: null, models: [{ id: 'm', image: false }] };
  assert.equal(asCatalogDoc({ providers: [provider, { ...provider }] }), null);
  const dupModels = { ...provider, models: [{ id: 'm', image: false }, { id: 'm', image: true }] };
  assert.equal(asCatalogDoc({ providers: [dupModels] }), null);
  const ctrlUrl = { ...provider, baseURL: 'https://p.example/\u0001bad' };
  assert.equal(asCatalogDoc({ providers: [ctrlUrl] }), null);
});

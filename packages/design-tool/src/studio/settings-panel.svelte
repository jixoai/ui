<!--
  @jixoai/ui-design (studio) — the dsh Model settings panel
  (design-settings-panel S5, Owner walkthrough-r4 2026-09-21: "左下角
  需要一个设置入口…参考 skill-creator-v2 的 Model 配置，将它移植过来").

  The ported UX (skill-creator-v2 ModelSettingsSection/RouteTabContent,
  re-dressed in the studio's own language — registry #jixoai components +
  studio CSS, no Tailwind):
  1. LIST-DETAIL — the rail lists model routes (letter avatar + name +
     key-missing dot + active badge); the detail edits ONE route:
     credential (password input + eye; the server NEVER echoes a stored
     key — presence only, the steward non-disclosure law), endpoint
     (baseURL + api protocol select), models (full-field rows + add).
  2. ACTIVE MODEL — provider/model/effort selects fed by the routes;
     unlike skill-creator (composer-owned) the studio has no model
     picker, so the selection lives HERE.
  3. WRITE PATH — one global Save per route detail (dirty-gated POST of
     the whole settings doc); credentials bypass via the dedicated
     set/clear lane; test connection probes /v1/models with latency.

  The dialog frame is studio chrome (fixed overlay + panel, Esc/backdrop
  close) — the registry has no dialog the studio already mounts.
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import Input from '#jixoai/input';
  import Badge from '#jixoai/badge';

  /** the API protocols the kernel's pi-ai family speaks (contracts twin) */
  const API_PROTOCOLS = [
    'anthropic-messages',
    'azure-openai-responses',
    'bedrock-converse-stream',
    'google-generative-ai',
    'google-vertex',
    'mistral-conversations',
    'openai-completions',
    'openai-responses',
    'openai-codex-responses',
  ] as const;

  /** the kernel's fixed reasoning-effort vocabulary (contracts twin) —
   *  efforts outside this set make the kernel refuse the whole profile */
  const THINKING_LEVELS = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'] as const;

  interface ModelEntry {
    id: string;
    name?: string;
    efforts?: string[];
    contextWindow?: number;
    maxOutputTokens?: number;
  }
  /** the editable draft: optional fields are ALWAYS initialized ('' rather
   *  than undefined) — the registry Input is uncontrolled while its bound
   *  value is null/undefined (input.svelte's `controlled = value != null`),
   *  which would swallow the first keystroke into a fresh field */
  interface ModelDraftEntry {
    id: string;
    name?: string;
    efforts?: string[];
    contextWindow?: number | string;
    maxOutputTokens?: number | string;
  }
  interface ModelRoute {
    provider: string;
    api?: string;
    baseURL: string;
    models: ModelEntry[];
  }
  interface ActiveModel {
    provider: string;
    model: string;
    reasoningEffort?: string;
  }
  interface SettingsDoc {
    configVersion: number;
    revision: number;
    model: ActiveModel | null;
    modelRoutes: ModelRoute[];
    keyPresence: Record<string, boolean>;
  }

  interface Props {
    settingsUrl?: string;
    onclose: () => void;
  }

  let {
    settingsUrl = '/__design__/api/settings/dsh.json',
    onclose,
  }: Props = $props();

  /* ── document state ─────────────────────────────────────────────── */

  let doc = $state<SettingsDoc | null>(null);
  let loadError = $state<string | null>(null);
  let saving = $state(false);
  let rejection = $state<string | null>(null);
  let savedFlash = $state(false);
  let savedTimer: ReturnType<typeof setTimeout> | null = null;

  /** the rail's selected route (null = the new-route form / onboarding) */
  let selected = $state<string | null>(null);
  let newOpen = $state(false);

  /* ── drafts (reset per {#key selected} remount — the skill-creator law) */

  let baseURLDraft = $state('');
  let apiDraft = $state<string>(API_PROTOCOLS[0]);
  let modelsDraft = $state<ModelDraftEntry[]>([]);
  let activeProvider = $state('');
  let activeModel = $state('');
  let activeEffort = $state('');
  /** credential lane (never part of the settings POST) */
  let keyDraft = $state('');
  let keyVisible = $state(false);
  let keyBusy = $state(false);
  /** per-route test result */
  let testing = $state(false);
  let testResult = $state<{ ok: boolean; latencyMs?: number; detail: string } | null>(null);

  const routes = $derived(doc?.modelRoutes ?? []);
  const selectedRoute = $derived(routes.find((route) => route.provider === selected) ?? null);
  const keyPresent = $derived(selected !== null && (doc?.keyPresence[selected] ?? false));
  const activeRoute = $derived(routes.find((route) => route.provider === activeProvider) ?? null);
  const activeModelEntry = $derived(activeRoute?.models.find((entry) => entry.id === activeModel) ?? null);
  // the effort select's options read the DRAFT when the model is open in
  // the editor (its capabilities ARE the draft's — a cleared efforts list
  // is the capability being REMOVED, and the normalization effect drops
  // the saved selection with it); other routes fall back to the saved entry
  const activeModelDraft = $derived(modelsDraft.find((entry) => entry.id === activeModel) ?? null);
  const effortOptions = $derived(activeModelDraft !== null ? (activeModelDraft.efforts ?? []) : (activeModelEntry?.efforts ?? []));

  const endpointDirty = $derived(
    selectedRoute !== null && (baseURLDraft.trim() !== selectedRoute.baseURL || apiDraft !== (selectedRoute.api ?? API_PROTOCOLS[0])),
  );
  const modelsDirty = $derived(selectedRoute !== null && canonical(modelsDraft) !== canonical(selectedRoute.models));
  const modelsValid = $derived(modelsDraft.length > 0 && modelsDraft.every((entry) => normalizedModel(entry) !== null));
  const activeDirty = $derived(activeSelection() !== null);
  const saveDisabled = $derived(saving || !modelsValid || !(endpointDirty || modelsDirty || activeDirty));

  /** dirty comparison through the SAME normalizer the save uses — an
   *  empty-string draft field and its absent stored twin must compare
   *  equal, or a freshly opened tab would look eternally dirty */
  function canonical(models: readonly (ModelEntry | ModelDraftEntry)[]): string {
    return JSON.stringify(models.map((entry) => normalizedModel(entry) ?? { ...entry, efforts: entry.efforts ?? [] }));
  }

  /** typed-UI boundary (Codex r4 P1-4): the registry Input syncs number
   *  fields back as STRINGS (its oninput writes el.value) — parse strictly
   *  at the commit edge: empty → undefined, anything not a finite positive
   *  integer → null (= invalid, blocks save) */
  function coercePositiveInt(value: unknown): number | undefined | null {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = typeof value === 'number' ? value : Number(String(value).trim());
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  /** one model entry in its POSTable shape; null = invalid (blocks save) */
  function normalizedModel(entry: ModelEntry | ModelDraftEntry): ModelEntry | null {
    const contextWindow = coercePositiveInt(entry.contextWindow);
    const maxOutputTokens = coercePositiveInt(entry.maxOutputTokens);
    if (contextWindow === null || maxOutputTokens === null) return null;
    const id = entry.id.trim();
    if (id === '') return null;
    // efforts are the kernel's fixed vocabulary — an illegal level would
    // make the kernel refuse the whole provider profile
    if (entry.efforts !== undefined && entry.efforts.some((level) => !(THINKING_LEVELS as readonly string[]).includes(level))) return null;
    const name = entry.name === undefined ? '' : entry.name.trim();
    return {
      id,
      ...(name !== '' ? { name } : {}),
      ...(entry.efforts !== undefined && entry.efforts.length > 0 ? { efforts: entry.efforts } : {}),
      ...(contextWindow !== undefined ? { contextWindow } : {}),
      ...(maxOutputTokens !== undefined ? { maxOutputTokens } : {}),
    };
  }

  /** runtime decoder for every settings response (the fetch boundary —
   *  no `payload as SettingsDoc` leaps; field-level so a malformed route
   *  entry dies HERE as a rejection, not later in a derived as a pageerror.
   *  Codex r4-2 P2-3) */
  function asSettingsDoc(value: unknown): SettingsDoc | null {
    if (typeof value !== 'object' || value === null) return null;
    const doc = value as Record<string, unknown>;
    if (doc.configVersion !== 1 || !Array.isArray(doc.modelRoutes) || typeof doc.revision !== 'number') return null;
    const presence = doc.keyPresence;
    if (typeof presence !== 'object' || presence === null) return null;
    for (const [k, v] of Object.entries(presence)) {
      if (typeof k !== 'string' || typeof v !== 'boolean') return null;
    }
    for (const route of doc.modelRoutes) {
      if (typeof route !== 'object' || route === null) return null;
      const r = route as Record<string, unknown>;
      if (typeof r.provider !== 'string' || typeof r.baseURL !== 'string' || !Array.isArray(r.models)) return null;
      if (r.api !== undefined && typeof r.api !== 'string') return null;
      for (const model of r.models) {
        if (typeof model !== 'object' || model === null) return null;
        const m = model as Record<string, unknown>;
        if (typeof m.id !== 'string') return null;
      }
    }
    const active = doc.model;
    if (active !== null && active !== undefined) {
      if (typeof active !== 'object' || typeof (active as Record<string, unknown>).provider !== 'string' || typeof (active as Record<string, unknown>).model !== 'string') return null;
    }
    return value as SettingsDoc;
  }

  function activeSelection(): ActiveModel | null {
    if (doc === null) return null;
    const current = doc.model;
    const next: ActiveModel = {
      provider: activeProvider,
      model: activeModel,
      ...(activeEffort.trim() !== '' ? { reasoningEffort: activeEffort.trim() } : {}),
    };
    const same = (a: ActiveModel | null): boolean =>
      a !== null && a.provider === next.provider && a.model === next.model && (a.reasoningEffort ?? '') === (next.reasoningEffort ?? '');
    if (same(current)) return null;
    return next;
  }

  /** load drafts from a route (the {#key} remount calls this via init()) */
  function initDrafts(route: ModelRoute): void {
    baseURLDraft = route.baseURL;
    apiDraft = route.api ?? API_PROTOCOLS[0];
    modelsDraft = route.models.map((entry) => ({
      id: entry.id,
      name: entry.name ?? '',
      efforts: entry.efforts ? [...entry.efforts] : undefined,
      contextWindow: entry.contextWindow ?? '',
      maxOutputTokens: entry.maxOutputTokens ?? '',
    }));
    keyDraft = '';
    keyVisible = false;
    testResult = null;
    const active = doc?.model;
    if (active !== null) {
      activeProvider = active.provider;
      activeModel = active.model;
      activeEffort = active.reasoningEffort ?? '';
    }
  }

  /* ── document lifecycle ─────────────────────────────────────────── */

  async function load(): Promise<void> {
    try {
      const response = await fetch(settingsUrl, { headers: { accept: 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const next = asSettingsDoc(await response.json());
      if (next === null) throw new Error('unexpected settings payload');
      doc = next;
      loadError = null;
      // rail normalization: drop selections that no longer exist
      if (selected !== null && !routes.some((route) => route.provider === selected)) selected = null;
      if (selected === null && !newOpen && routes.length > 0) selected = routes[0]!.provider;
      const active = doc.model;
      if (active !== null && activeProvider === '') {
        activeProvider = active.provider;
        activeModel = active.model;
        activeEffort = active.reasoningEffort ?? '';
      }
      if (active === null && activeProvider === '' && routes.length > 0) {
        activeProvider = routes[0]!.provider;
        activeModel = routes[0]!.models[0]?.id ?? '';
      }
    } catch (cause) {
      loadError = cause instanceof Error ? cause.message : String(cause);
    }
  }

  async function save(): Promise<void> {
    if (doc === null || selectedRoute === null || saving) return;
    saving = true;
    rejection = null;
    try {
      const modelRoutes = doc.modelRoutes.map((route) =>
        route.provider === selectedRoute.provider
          ? {
              ...route,
              baseURL: baseURLDraft.trim(),
              api: apiDraft,
              models: modelsDraft.map((entry) => normalizedModel(entry)!),
            }
          : route,
      );
      const body = { model: activeSelection() ?? doc.model, modelRoutes };
      const response = await fetch(settingsUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message = typeof payload === 'object' && payload !== null && 'message' in payload ? String((payload as { message: unknown }).message) : `HTTP ${response.status}`;
        throw new Error(message);
      }
      const next = asSettingsDoc(payload);
      if (next === null) throw new Error('unexpected settings payload');
      doc = next;
      savedFlash = true;
      if (savedTimer !== null) clearTimeout(savedTimer);
      savedTimer = setTimeout(() => (savedFlash = false), 1600);
    } catch (cause) {
      rejection = cause instanceof Error ? cause.message : String(cause);
    } finally {
      saving = false;
    }
  }

  async function writeKey(key: string | null): Promise<void> {
    if (selected === null || keyBusy) return;
    keyBusy = true;
    rejection = null;
    try {
      // key rides EXPLICITLY (null included) — the API treats omitted and
      // null alike now, but the explicit form is the contract (Codex r4 P1-2)
      const response = await fetch(`${settingsUrl.replace(/dsh\.json$/, 'dsh-credential')}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ provider: selected, key }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message = typeof payload === 'object' && payload !== null && 'message' in payload ? String((payload as { message: unknown }).message) : `HTTP ${response.status}`;
        throw new Error(message);
      }
      const next = asSettingsDoc(payload);
      if (next === null) throw new Error('unexpected settings payload');
      doc = next;
      if (key !== null) keyDraft = '';
    } catch (cause) {
      rejection = cause instanceof Error ? cause.message : String(cause);
    } finally {
      keyBusy = false;
    }
  }

  async function testConnection(): Promise<void> {
    if (selected === null || testing) return;
    testing = true;
    testResult = null;
    try {
      // test the DRAFT endpoint when dirty (what save would persist)
      const route: ModelRoute = selectedRoute !== null && endpointDirty
        ? { ...selectedRoute, baseURL: baseURLDraft.trim() }
        : selectedRoute!;
      const response = await fetch(`${settingsUrl.replace(/dsh\.json$/, 'dsh-test')}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ provider: route.provider, baseURL: route.baseURL }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message = typeof payload === 'object' && payload !== null && 'message' in payload ? String((payload as { message: unknown }).message) : `HTTP ${response.status}`;
        throw new Error(message);
      }
      if (typeof payload !== 'object' || payload === null || typeof (payload as { ok?: unknown }).ok !== 'boolean' || typeof (payload as { detail?: unknown }).detail !== 'string') {
        throw new Error('unexpected test payload');
      }
      testResult = payload as { ok: boolean; latencyMs?: number; detail: string };
    } catch (cause) {
      testResult = { ok: false, detail: cause instanceof Error ? cause.message : String(cause) };
    } finally {
      testing = false;
    }
  }

  async function removeRoute(): Promise<void> {
    if (doc === null || selected === null || saving) return;
    saving = true;
    rejection = null;
    try {
      const modelRoutes = doc.modelRoutes.filter((route) => route.provider !== selected);
      // removing the active route's home leaves the active model
      // dangling → clear it honestly (the server's referential gate
      // would reject the save otherwise)
      const model = doc.model !== null && modelRoutes.some((route) => route.provider === doc.model!.provider && route.models.some((entry) => entry.id === doc.model!.model))
        ? doc.model
        : null;
      const response = await fetch(settingsUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model, modelRoutes }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message = typeof payload === 'object' && payload !== null && 'message' in payload ? String((payload as { message: unknown }).message) : `HTTP ${response.status}`;
        throw new Error(message);
      }
      const next = asSettingsDoc(payload);
      if (next === null) throw new Error('unexpected settings payload');
      doc = next;
      selected = null;
    } catch (cause) {
      rejection = cause instanceof Error ? cause.message : String(cause);
    } finally {
      saving = false;
    }
  }

  /* ── new route form ─────────────────────────────────────────────── */

  let newProvider = $state('');
  let newBaseURL = $state('');
  let newApi = $state<string>(API_PROTOCOLS[0]);
  let newModelId = $state('');

  const newValid = $derived(
    newProvider.trim() !== ''
      && /^https?:\/\//.test(newBaseURL.trim())
      && newModelId.trim() !== ''
      && !routes.some((route) => route.provider === newProvider.trim()),
  );

  async function createRoute(): Promise<void> {
    if (doc === null || !newValid || saving) return;
    saving = true;
    rejection = null;
    try {
      const route: ModelRoute = {
        provider: newProvider.trim(),
        api: newApi,
        baseURL: newBaseURL.trim(),
        models: [{ id: newModelId.trim(), name: newModelId.trim() }],
      };
      const response = await fetch(settingsUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model: doc.model, modelRoutes: [...doc.modelRoutes, route] }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message = typeof payload === 'object' && payload !== null && 'message' in payload ? String((payload as { message: unknown }).message) : `HTTP ${response.status}`;
        throw new Error(message);
      }
      const next = asSettingsDoc(payload);
      if (next === null) throw new Error('unexpected settings payload');
      doc = next;
      newOpen = false;
      newProvider = '';
      newBaseURL = '';
      newApi = API_PROTOCOLS[0];
      newModelId = '';
      selected = route.provider;
    } catch (cause) {
      rejection = cause instanceof Error ? cause.message : String(cause);
    } finally {
      saving = false;
    }
  }

  /* ── mount + keyboard ───────────────────────────────────────────── */

  $effect(() => {
    void load();
    return () => {
      if (savedTimer !== null) clearTimeout(savedTimer);
    };
  });

  // draft re-init on RAIL SELECTION change only (the skill-creator {#key}
  // remount law): a doc refresh after save/create must NOT reset the
  // credential draft, so everything but `selected` is read untracked
  $effect(() => {
    void selected;
    const route = untrack(() => selectedRoute);
    if (route !== null) untrack(() => initDrafts(route));
  });

  // active-model selects always point at REAL routes/models — covers the
  // post-create moment (doc arrives, selects still empty) and provider
  // switches (the model list refreshes with it)
  $effect(() => {
    if (routes.length === 0) return;
    if (!routes.some((route) => route.provider === activeProvider)) {
      activeProvider = routes[0]!.provider;
      activeModel = '';
    }
    const route = routes.find((candidate) => candidate.provider === activeProvider);
    if (route !== undefined && !route.models.some((entry) => entry.id === activeModel)) {
      activeModel = route.models[0]?.id ?? '';
      activeEffort = '';
    } else if (route !== undefined && !effortOptions.includes(activeEffort)) {
      // capability REMOVED (efforts cleared or no longer offering the
      // saved level) — the saved effort must drop with it (Codex r4-2
      // P1-1: a stranded effort gets the profile refused at spawn time)
      activeEffort = '';
    }
  });
</script>

<svelte:window onkeydown={(event) => { if (event.key === 'Escape') onclose(); }} />

<div class="dsh-backdrop" onclick={onclose}>
  <section
    class="dsh-panel"
    role="dialog"
    aria-modal="true"
    aria-label="model settings"
    onclick={(event) => event.stopPropagation()}
  >
    <header class="dsh-head">
      <span class="dsh-title">settings</span>
      <span class="dsh-sub">dsh model routes — changes apply to the agent's next turn, no restart</span>
      <button type="button" class="dsh-close" onclick={onclose} aria-label="close settings">close</button>
    </header>

    {#if loadError !== null}
      <p class="dsh-error" role="alert">settings failed: {loadError} <button type="button" class="dsh-link" onclick={() => void load()}>retry</button></p>
    {:else if doc === null}
      <p class="dsh-muted">loading…</p>
    {:else}
      <div class="dsh-body">
        <!-- the rail: one row per route + new -->
        <aside class="dsh-rail" role="listbox" aria-label="model routes">
          {#each routes as route (route.provider)}
            {@const active = doc.model?.provider === route.provider}
            {@const hasKey = doc.keyPresence[route.provider] === true}
            <button
              type="button"
              role="option"
              aria-selected={!newOpen && selected === route.provider}
              class="dsh-rail-row"
              class:is-selected={!newOpen && selected === route.provider}
              onclick={() => {
                selected = route.provider;
                newOpen = false;
              }}
              title="{route.provider} — {route.baseURL}"
            >
              <span class="dsh-avatar" aria-hidden="true">{route.provider.slice(0, 1).toUpperCase()}</span>
              <span class="dsh-rail-name">{route.provider}</span>
              {#if !hasKey}<span class="dsh-key-dot" title="API key missing"></span>{/if}
              {#if active}<Badge variant="tonal" class="jx-hue-success dsh-active-badge">active</Badge>{/if}
            </button>
          {/each}
          <button
            type="button"
            class="dsh-rail-new"
            class:is-selected={newOpen}
            aria-selected={newOpen}
            role="option"
            onclick={() => {
              newOpen = true;
              selected = null;
            }}
          >+ new route</button>
        </aside>

        <!-- the detail -->
        <div class="dsh-detail">
          {#if newOpen}
            <div class="dsh-block">
              <p class="dsh-block-title">new route</p>
              <label class="dsh-field">
                <span class="dsh-label">provider</span>
                <Input placeholder="my-gateway" bind:value={newProvider} />
              </label>
              <label class="dsh-field">
                <span class="dsh-label">baseURL</span>
                <Input placeholder="https://api.example.com/anthropic" bind:value={newBaseURL} />
              </label>
              <label class="dsh-field">
                <span class="dsh-label">api</span>
                <select class="dsh-select" bind:value={newApi}>
                  {#each API_PROTOCOLS as protocol (protocol)}<option value={protocol}>{protocol}</option>{/each}
                </select>
              </label>
              <label class="dsh-field">
                <span class="dsh-label">first model id</span>
                <Input placeholder="glm-5.3" bind:value={newModelId} />
              </label>
              <div class="dsh-actions">
                <button type="button" class="dsh-primary" disabled={!newValid || saving} onclick={() => void createRoute()}>create</button>
                <button type="button" class="dsh-ghost" onclick={() => (newOpen = false)}>cancel</button>
              </div>
            </div>
          {:else if selectedRoute !== null}
            {#key selectedRoute.provider}
              {@const hasKey = doc.keyPresence[selectedRoute.provider] === true}
              <div class="dsh-scroll">
                <!-- active model -->
                <div class="dsh-block">
                  <p class="dsh-block-title">active model</p>
                  <div class="dsh-grid">
                    <label class="dsh-field">
                      <span class="dsh-label">provider</span>
                      <select class="dsh-select" bind:value={activeProvider}>
                        {#each routes as route (route.provider)}<option value={route.provider}>{route.provider}</option>{/each}
                      </select>
                    </label>
                    <label class="dsh-field">
                      <span class="dsh-label">model</span>
                      <select class="dsh-select" bind:value={activeModel}>
                        {#each activeRoute?.models ?? [] as entry (entry.id)}<option value={entry.id}>{entry.name ?? entry.id}</option>{/each}
                      </select>
                    </label>
                    <label class="dsh-field">
                      <span class="dsh-label">effort</span>
                      <!-- a select over the model's DECLARED efforts only —
                           the kernel rejects an effort the model does not
                           offer (UNSUPPORTED_REASONING_EFFORT); models with
                           no declared efforts run at provider default -->
                      <select class="dsh-select" bind:value={activeEffort}>
                        <option value="">default</option>
                        {#each effortOptions as effort (effort)}<option value={effort}>{effort}</option>{/each}
                      </select>
                    </label>
                  </div>
                </div>

                <!-- credential -->
                <div class="dsh-block">
                  <p class="dsh-block-title">credential {#if hasKey}<span class="dsh-ok">· key stored</span>{/if}</p>
                  <div class="dsh-cred">
                    <Input
                      type={keyVisible ? 'text' : 'password'}
                      placeholder={hasKey ? 'stored — paste a new key to replace' : 'paste the API key'}
                      bind:value={keyDraft}
                    />
                    <button type="button" class="dsh-ghost" onclick={() => (keyVisible = !keyVisible)} aria-label="toggle key visibility">{keyVisible ? 'hide' : 'show'}</button>
                    <button type="button" class="dsh-ghost" disabled={keyDraft.trim() === '' || keyBusy} onclick={() => void writeKey(keyDraft.trim())}>save key</button>
                    {#if hasKey}<button type="button" class="dsh-ghost" disabled={keyBusy} onclick={() => void writeKey(null)}>clear</button>{/if}
                  </div>
                </div>

                <!-- endpoint -->
                <div class="dsh-block">
                  <p class="dsh-block-title">endpoint</p>
                  <div class="dsh-grid">
                    <label class="dsh-field dsh-span2">
                      <span class="dsh-label">baseURL</span>
                      <Input placeholder="https://api.example.com/anthropic" bind:value={baseURLDraft} />
                    </label>
                    <label class="dsh-field">
                      <span class="dsh-label">api</span>
                      <select class="dsh-select" bind:value={apiDraft}>
                        {#each API_PROTOCOLS as protocol (protocol)}<option value={protocol}>{protocol}</option>{/each}
                      </select>
                    </label>
                  </div>
                </div>

                <!-- models -->
                <div class="dsh-block">
                  <p class="dsh-block-title">models</p>
                  {#each modelsDraft as model, index (index)}
                    <div class="dsh-model">
                      <div class="dsh-grid">
                        <label class="dsh-field">
                          <span class="dsh-label">id</span>
                          <Input bind:value={model.id} />
                        </label>
                        <label class="dsh-field">
                          <span class="dsh-label">name</span>
                          <Input bind:value={model.name} placeholder={model.id} />
                        </label>
                        <label class="dsh-field">
                          <span class="dsh-label">context</span>
                          <Input type="number" min="1" bind:value={model.contextWindow} placeholder="200000" />
                        </label>
                        <label class="dsh-field">
                          <span class="dsh-label">max out</span>
                          <Input type="number" min="1" bind:value={model.maxOutputTokens} placeholder="8192" />
                        </label>
                      </div>
                      <label class="dsh-field">
                        <span class="dsh-label">efforts (comma-separated, {THINKING_LEVELS.join('/')})</span>
                        <Input
                          placeholder="low, high"
                          value={model.efforts?.join(', ') ?? ''}
                          oninput={(event) => {
                            const raw = (event.currentTarget as HTMLInputElement).value;
                            modelsDraft[index] = {
                              ...model,
                              efforts: raw.trim() === '' ? undefined : raw.split(',').map((part) => part.trim()).filter((part) => part !== ''),
                            };
                          }}
                        />
                      </label>
                      <div class="dsh-model-actions">
                        {#if modelsDraft.length > 1}
                          <button
                            type="button"
                            class="dsh-ghost"
                            onclick={() => (modelsDraft = modelsDraft.filter((_, i) => i !== index))}
                          >remove model</button>
                        {/if}
                      </div>
                    </div>
                  {/each}
                  <button
                    type="button"
                    class="dsh-ghost dsh-add-model"
                    onclick={() => (modelsDraft = [...modelsDraft, { id: '', name: '', contextWindow: '', maxOutputTokens: '' }])}
                  >+ add model</button>
                </div>
              </div>

              <footer class="dsh-foot">
                <button type="button" class="dsh-ghost" disabled={testing} onclick={() => void testConnection()}>test{testing ? '…' : ''}</button>
                {#if testResult !== null}
                  <span class={testResult.ok ? 'dsh-ok' : 'dsh-error-inline'}>{testResult.ok ? 'ok' : 'failed'} — {testResult.detail}</span>
                {/if}
                <span class="dsh-foot-spacer"></span>
                {#if savedFlash}<span class="dsh-ok">saved</span>{/if}
                <button type="button" class="dsh-danger" disabled={saving} onclick={() => void removeRoute()}>remove route</button>
                <button type="button" class="dsh-primary" disabled={saveDisabled} onclick={() => void save()}>save</button>
              </footer>
            {/key}
          {:else}
            <div class="dsh-onboard">
              <p class="dsh-onboard-title">add your first model route</p>
              <p class="dsh-muted">point at any OpenAI/Anthropic-compatible endpoint — the route feeds the design agent's dsh kernel directly.</p>
              <button type="button" class="dsh-primary" onclick={() => (newOpen = true)}>+ new route</button>
            </div>
          {/if}
        </div>
      </div>
      {#if rejection !== null}
        <p class="dsh-error" role="alert">{rejection}</p>
      {/if}
    {/if}
  </section>
</div>

<style>
  .dsh-backdrop {
    position: fixed;
    inset: 0;
    z-index: 60;
    background: rgb(12 11 10 / 0.62);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  .dsh-panel {
    display: flex;
    flex-direction: column;
    width: min(680px, 100%);
    max-height: min(600px, 100%);
    background: #141312;
    border: 1px solid #262320;
    border-radius: 6px;
    box-shadow: 0 18px 48px rgb(0 0 0 / 0.5);
  }
  .dsh-head {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #262320;
  }
  .dsh-title {
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.6875rem;
    color: #ded8cc;
  }
  .dsh-sub {
    flex: 1;
    min-width: 0;
    font-size: 0.6875rem;
    color: #6f6759;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dsh-close {
    font-size: 0.6875rem;
    color: #b9b2a6;
    background: none;
    border: none;
    cursor: pointer;
  }
  .dsh-close:hover {
    color: #ded8cc;
  }
  .dsh-body {
    display: flex;
    min-height: 0;
    flex: 1;
  }
  .dsh-rail {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 176px;
    flex-shrink: 0;
    padding: 0.5rem;
    border-right: 1px solid #262320;
    overflow-y: auto;
  }
  .dsh-rail-row,
  .dsh-rail-new {
    display: flex;
    align-items: center;
    gap: 0.4375rem;
    width: 100%;
    padding: 0.375rem 0.5rem;
    background: none;
    border: none;
    border-radius: 4px;
    color: #b9b2a6;
    font-size: 0.75rem;
    text-align: left;
    cursor: pointer;
  }
  .dsh-rail-row:hover,
  .dsh-rail-new:hover {
    background: #1b1917;
    color: #ded8cc;
  }
  .dsh-rail-row.is-selected,
  .dsh-rail-new.is-selected {
    background: #1b1917;
    color: #ded8cc;
  }
  .dsh-rail-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dsh-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 3px;
    background: #2a2724;
    color: #ded8cc;
    font-size: 9px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .dsh-key-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #d9a25f;
    flex-shrink: 0;
  }
  .dsh-active-badge {
    font-size: 9px;
    flex-shrink: 0;
  }
  .dsh-rail-new {
    color: #6f6759;
    border-top: 1px dashed #262320;
    border-radius: 0;
    margin-top: 0.375rem;
    padding-top: 0.5rem;
  }
  .dsh-detail {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }
  .dsh-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 0.75rem 1rem;
  }
  .dsh-block {
    padding-bottom: 0.875rem;
  }
  .dsh-block + .dsh-block {
    border-top: 1px solid #201e1b;
    padding-top: 0.75rem;
  }
  .dsh-block-title {
    margin: 0 0 0.5rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.625rem;
    color: #6f6759;
  }
  .dsh-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
  }
  .dsh-span2 {
    grid-column: span 2;
  }
  .dsh-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    font-size: 0.6875rem;
  }
  .dsh-label {
    color: #6f6759;
  }
  .dsh-select {
    width: 100%;
    padding: 0.3125rem 0.5rem;
    background: #1b1917;
    border: 1px solid #262320;
    border-radius: 3px;
    color: #ded8cc;
    font-size: 0.75rem;
  }
  .dsh-select:focus-visible {
    outline: 1px solid #4a453e;
  }
  .dsh-cred {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }
  .dsh-cred :global(.jx-field) {
    flex: 1;
    min-width: 0;
  }
  .dsh-model {
    padding: 0.5rem 0;
  }
  .dsh-model + .dsh-model {
    border-top: 1px dashed #262320;
  }
  .dsh-model .dsh-grid {
    margin-bottom: 0.5rem;
  }
  .dsh-model-actions {
    display: flex;
    justify-content: flex-end;
  }
  .dsh-add-model {
    margin-top: 0.25rem;
  }
  .dsh-actions,
  .dsh-foot {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .dsh-actions {
    padding: 0.5rem 1rem 0.875rem;
  }
  .dsh-foot {
    padding: 0.625rem 1rem;
    border-top: 1px solid #262320;
  }
  .dsh-foot-spacer {
    flex: 1;
  }
  .dsh-primary,
  .dsh-ghost,
  .dsh-danger {
    font-size: 0.6875rem;
    border-radius: 3px;
    padding: 0.3125rem 0.75rem;
    cursor: pointer;
    border: 1px solid #262320;
    background: none;
  }
  .dsh-primary {
    background: #ded8cc;
    border-color: #ded8cc;
    color: #141312;
    font-weight: 600;
  }
  .dsh-primary:disabled {
    background: #26241f;
    border-color: #26241f;
    color: #6f6759;
    cursor: not-allowed;
  }
  .dsh-ghost {
    color: #b9b2a6;
  }
  .dsh-ghost:hover:not(:disabled) {
    background: #1b1917;
    color: #ded8cc;
  }
  .dsh-ghost:disabled {
    color: #4a453e;
    cursor: not-allowed;
  }
  .dsh-danger {
    color: #e08585;
  }
  .dsh-danger:hover:not(:disabled) {
    background: rgb(224 133 133 / 0.12);
  }
  .dsh-danger:disabled {
    color: #5c4444;
    cursor: not-allowed;
  }
  .dsh-ok {
    color: #a9c4a9;
    font-size: 0.6875rem;
  }
  .dsh-error,
  .dsh-error-inline {
    color: #e08585;
  }
  .dsh-error {
    margin: 0;
    padding: 0.5rem 1rem;
    border-top: 1px solid #262320;
    font-size: 0.6875rem;
  }
  .dsh-error-inline {
    font-size: 0.6875rem;
  }
  .dsh-muted {
    margin: 0;
    padding: 0.75rem 1rem;
    color: #6f6759;
    font-size: 0.75rem;
  }
  .dsh-link {
    background: none;
    border: none;
    color: #ded8cc;
    cursor: pointer;
    font-size: 0.6875rem;
    text-decoration: underline;
  }
  .dsh-onboard {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 2.5rem 2rem;
    text-align: center;
  }
  .dsh-onboard-title {
    margin: 0;
    font-size: 0.8125rem;
    font-weight: 600;
    color: #ded8cc;
  }
  .dsh-onboard .dsh-muted {
    padding: 0;
    max-width: 340px;
  }
</style>

<!--
  @jixoai/ui-design (studio) — the Model settings panel
  (design-settings-panel S5, Owner walkthrough-r4 2026-09-21; the
  capability parity round settings-model-parity same day: "对于 model
  配置的支持，和我在 skill-creator-v2 我打磨的那套，差距还是非常大的"
  + "不要去强调 dsh"; Codex r2 hardening: the five P1s).

  The skill-creator-v2 polished set, re-dressed in the studio's own
  language (registry #jixoai components + layout-only studio CSS):
  1. GALLERY — the new-route view opens on the provider catalog (the
     pi-ai models.dev mirror served by catalog.json — STRICTLY decoded
     at the fetch boundary, Codex r2 P1: a malformed payload degrades
     to the typed notice, never a half-trusted list): search + card
     grid (icon/letter avatar, label, host, model count, added ✓);
     a card CLICK creates the route immediately — numbered slug,
     catalog baseURL/api, top-4 image-first models richly prefilled.
  2. CUSTOM FORM PARITY (Codex r2 P1) — "custom endpoint" is the SAME
     editing machinery as the route detail: model cards (completion,
     prefill, token shorthand, per-model probes with a test-only key),
     a route key that lands FIRST (a failed key write aborts the
     create — the reference's R13 law), probes against the not-yet-
     stored route ride the dsh-test ad-hoc lane (baseURL+api required).
  3. RAIL — one Item row per route: avatar (catalog icon on a
     hue-tinted tile, or the deterministic hue letter), display label
     (numbered slugs project back: zai-2 → "Z.ai (1)"), key-missing
     amber dot, active badge.
  4. MODEL CARDS — each model is a collapsible SettingsModelCard keyed
     by a stable NONCE (Codex r2 P1: index keys rebound a card onto
     its neighbor's local state on delete), with its SAVED twin for
     the dirty dot, id completion over the purified pool, catalog-hit
     prefill (switching ids re-derives EVERY untouched field — efforts
     included, r2 P1), token shorthand, per-model probe.
  5. ACTIVE MODEL — provider/model/effort selects fed by the routes
     (DRAFT-aware for the open route: a renamed model re-points the
     selection before the save — the referential gate never sees a
     dangling reference). The studio has no composer picker, so the
     selection lives HERE.
  6. WRITE PATH — one global Save per route detail; credentials bypass
     the dedicated set/clear lane (the server NEVER echoes a stored
     key — presence only, this repo's non-disclosure law, a deliberate
     divergence from skill-creator's objective echo); creation lands
     a PENDING-KEY FOCUS (the reference's sticky guidance: focus the
     credential input + a hint line, r2 Spec-P1); route removal is a
     TWO-STEP footer arm (studio language — no nested confirm dialog);
     load/loadCatalog run behind request-generation gates (r2 P2: a
     stale response never overwrites a newer one).

  No kernel name appears in user-visible copy (the Owner's ruling).
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import Badge from '#jixoai/badge';
  import Dialog from '#jixoai/dialog';
  import Input from '#jixoai/input';
  import NativeSelect from '#jixoai/native-select';
  import PressButton from '#jixoai/press-button';
  import { CardFooter } from '#jixoai/card';
  import { Item, ItemContent, ItemTitle } from '#jixoai/list-item';

  import SettingsModelCard from './settings-model-card.svelte';
  import {
    API_PROTOCOLS,
    THINKING_LEVELS,
    asCatalogDoc,
    catalogModelCandidates,
    catalogRouteDraft,
    hueAvatarColor,
    numberedSlugParts,
    routeDisplayLabel,
    type CatalogProvider,
  } from './settings-panel-lib.ts';

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
  interface ModelTestResult {
    ok: boolean;
    latencyMs?: number;
    detail: string;
    modelListed?: boolean;
  }

  interface Props {
    settingsUrl?: string;
    onclose: () => void;
  }

  let {
    settingsUrl = '/__design__/api/settings/dsh.json',
    onclose,
  }: Props = $props();

  /** the native <dialog>'s bindable open — mounted OPEN; any close path
   *  (Esc via cancel, the × seat) notifies the shell through onclose */
  let open = $state(true);
  $effect(() => {
    if (!open) onclose();
  });

  /* ── document state ─────────────────────────────────────────────── */

  let doc = $state<SettingsDoc | null>(null);
  let loadError = $state<string | null>(null);
  let saving = $state(false);
  let rejection = $state<string | null>(null);
  let savedFlash = $state(false);
  let savedTimer: ReturnType<typeof setTimeout> | null = null;
  /** request-generation gates (Codex r2 P2: a retry or fast close/reopen
   *  must never let a STALE response overwrite newer state) */
  let loadSeq = 0;
  let catalogSeq = 0;

  /** the rail's selected route (null = the new-route view / onboarding) */
  let selected = $state<string | null>(null);
  let newOpen = $state(false);
  let newMode = $state<'pick' | 'form'>('pick');
  /** the creation follow-through: focus + hint the credential input of
   *  the freshly created route (the reference's pendingKeyFocus) */
  let pendingKeyFocus = $state<string | null>(null);
  /** one-shot focus guard — reset at every pendingKeyFocus assignment
   *  (a delete + recreate of the same slug focuses again, r2 partial) */
  let keyFocusDone = $state<string | null>(null);
  let credWrap = $state<HTMLElement | null>(null);

  /* ── the provider catalog (the gallery's data) ──────────────────── */

  let catalog = $state<{ providers: CatalogProvider[] } | null>(null);
  let catalogError = $state<string | null>(null);

  async function loadCatalog(): Promise<void> {
    const seq = ++catalogSeq;
    try {
      const response = await fetch(`${settingsUrl.replace(/dsh\.json$/, '')}catalog.json`, { headers: { accept: 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const decoded = asCatalogDoc(await response.json());
      if (decoded === null) throw new Error('unexpected catalog payload');
      if (seq !== catalogSeq) return;
      catalog = decoded;
      catalogError = null;
    } catch (cause) {
      if (seq !== catalogSeq) return;
      // typed degradation: the gallery shows the miss, the custom form
      // keeps working (the anchor chain resolved nothing)
      catalog = null;
      catalogError = cause instanceof Error ? cause.message : String(cause);
    }
  }

  /* ── drafts (reset per {#key selected} remount — the skill-creator law) */

  let baseURLDraft = $state('');
  let apiDraft = $state<string>(API_PROTOCOLS[0]);
  /** the draft triple: entries + their NONCES (the each-key — stable
   *  across deletes/reorders, unlike index; not the user-editable id,
   *  which would remount on every keystroke) + each entry's SAVED twin
   *  (null = brand-new) for the card's dirty dot (Codex r2 P1) */
  let modelsDraft = $state<ModelDraftEntry[]>([]);
  let modelsNonces = $state<string[]>([]);
  let modelsSaved = $state<(ModelEntry | null)[]>([]);
  /** per-card validity flags (the UX pre-gate; the commit-edge normalizer
   *  below remains the law) */
  let modelsValidFlags = $state<boolean[]>([]);
  let activeProvider = $state('');
  let activeModel = $state('');
  let activeEffort = $state('');
  /** credential lane (never part of the settings POST) */
  let keyDraft = $state('');
  let keyVisible = $state(false);
  let keyBusy = $state(false);
  /** route-level test result (the footer's probe) */
  let testing = $state(false);
  let testResult = $state<{ ok: boolean; latencyMs?: number; detail: string } | null>(null);
  /** two-step remove arm (studio's confirm — no nested dialog) */
  let removeArmed = $state(false);
  let removeArmTimer: ReturnType<typeof setTimeout> | null = null;

  const routes = $derived(doc?.modelRoutes ?? []);
  const selectedRoute = $derived(routes.find((route) => route.provider === selected) ?? null);
  const activeRoute = $derived(routes.find((route) => route.provider === activeProvider) ?? null);
  const activeModelEntry = $derived(activeRoute?.models.find((entry) => entry.id === activeModel) ?? null);
  /** the active-route's model list, DRAFT-AWARE: when the edited route IS
   *  the active route, its models ARE the draft's — a renamed/removed
   *  draft model must re-point (or drop) the active selection BEFORE the
   *  save, or the server's referential gate rejects the whole POST (the
   *  same law effortOptions already follows) */
  const activeRouteModels = $derived(
    selectedRoute !== null && activeRoute !== null && selectedRoute.provider === activeRoute.provider
      ? modelsDraft
      : (activeRoute?.models ?? []),
  );
  // the effort select's options read the DRAFT when the model is open in
  // the editor (its capabilities ARE the draft's — a cleared efforts list
  // is the capability being REMOVED, and the normalization effect drops
  // the saved selection with it); other routes fall back to the saved entry
  const activeModelDraft = $derived(modelsDraft.find((entry) => entry.id === activeModel) ?? null);
  const effortOptions = $derived(activeModelDraft !== null ? (activeModelDraft.efforts ?? []) : (activeModelEntry?.efforts ?? []));
  /** the completion pool for the open route's model cards (numbered
   *  slugs normalize to their catalog base; namespace ids stay only on
   *  their host provider) */
  const modelCandidates = $derived(
    selectedRoute !== null
      ? catalogModelCandidates(catalog, numberedSlugParts(selectedRoute.provider)?.base ?? selectedRoute.provider)
      : [],
  );

  const endpointDirty = $derived(
    selectedRoute !== null && (baseURLDraft.trim() !== selectedRoute.baseURL || apiDraft !== (selectedRoute.api ?? API_PROTOCOLS[0])),
  );
  const modelsDirty = $derived(selectedRoute !== null && canonical(modelsDraft) !== canonical(selectedRoute.models));
  const modelsValid = $derived(
    modelsDraft.length > 0
      && modelsValidFlags.length === modelsDraft.length
      && modelsValidFlags.every((flag) => flag)
      && modelsDraft.every((entry) => normalizedModel(entry) !== null),
  );
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

  /** the commit-edge normalizer over a whole draft list; null = invalid */
  function normalizedModels(drafts: readonly ModelDraftEntry[]): ModelEntry[] | null {
    const models: ModelEntry[] = [];
    for (const entry of drafts) {
      const normalized = normalizedModel(entry);
      if (normalized === null) return null;
      models.push(normalized);
    }
    return models;
  }

  /** runtime decoder for every settings response (the fetch boundary —
   *  no `payload as SettingsDoc` leaps; field-level down to optional model
   *  fields, matching the server's own gates so a malformed entry dies
   *  HERE as a rejection, never later in a derived as a pageerror. Codex
   *  r4-2/r4-3 P2-3 — the `efforts: {}` shape really crashed the panel) */
  function asSettingsDoc(value: unknown): SettingsDoc | null {
    if (typeof value !== 'object' || value === null) return null;
    const doc = value as Record<string, unknown>;
    if (doc.configVersion !== 1 || !Array.isArray(doc.modelRoutes) || typeof doc.revision !== 'number') return null;
    const presence = doc.keyPresence;
    if (typeof presence !== 'object' || presence === null) return null;
    for (const v of Object.values(presence)) {
      if (typeof v !== 'boolean') return null;
    }
    for (const route of doc.modelRoutes) {
      if (typeof route !== 'object' || route === null) return null;
      const r = route as Record<string, unknown>;
      if (typeof r.provider !== 'string' || r.provider === '') return null;
      if (typeof r.baseURL !== 'string' || !/^https?:\/\//.test(r.baseURL)) return null;
      if (r.api !== undefined && typeof r.api !== 'string') return null;
      if (!Array.isArray(r.models) || r.models.length === 0) return null;
      for (const model of r.models) {
        if (typeof model !== 'object' || model === null) return null;
        const m = model as Record<string, unknown>;
        if (typeof m.id !== 'string' || m.id === '') return null;
        if (m.name !== undefined && typeof m.name !== 'string') return null;
        if (m.efforts !== undefined && (!Array.isArray(m.efforts) || !m.efforts.every((e) => typeof e === 'string' && (THINKING_LEVELS as readonly string[]).includes(e)))) return null;
        for (const numField of ['contextWindow', 'maxOutputTokens'] as const) {
          const n = m[numField];
          if (n !== undefined && (typeof n !== 'number' || !Number.isInteger(n) || n <= 0)) return null;
        }
      }
    }
    const active = doc.model;
    if (active !== null && active !== undefined) {
      if (typeof active !== 'object') return null;
      const a = active as Record<string, unknown>;
      if (typeof a.provider !== 'string' || a.provider === '' || typeof a.model !== 'string' || a.model === '') return null;
      if (a.reasoningEffort !== undefined && !(typeof a.reasoningEffort === 'string' && (THINKING_LEVELS as readonly string[]).includes(a.reasoningEffort))) return null;
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
    modelsNonces = route.models.map(() => crypto.randomUUID());
    modelsSaved = route.models.map((entry) => entry);
    modelsValidFlags = route.models.map(() => true);
    keyDraft = '';
    keyVisible = false;
    testResult = null;
    removeArmed = false;
    const active = doc?.model;
    if (active !== null) {
      activeProvider = active.provider;
      activeModel = active.model;
      activeEffort = active.reasoningEffort ?? '';
    }
  }

  /* ── document lifecycle ─────────────────────────────────────────── */

  async function load(): Promise<void> {
    const seq = ++loadSeq;
    try {
      const response = await fetch(settingsUrl, { headers: { accept: 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const next = asSettingsDoc(await response.json());
      if (next === null) throw new Error('unexpected settings payload');
      if (seq !== loadSeq) return;
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
      if (seq !== loadSeq) return;
      loadError = cause instanceof Error ? cause.message : String(cause);
    }
  }

  async function save(): Promise<void> {
    if (doc === null || selectedRoute === null || saving) return;
    // explicit validity check at the commit edge — the disabled button is
    // UX, this is the law (Codex r4-4 P2-1)
    const models = normalizedModels(modelsDraft);
    if (models === null) {
      rejection = 'a model entry is invalid — fix the highlighted fields (id, numbers, effort levels) before saving';
      return;
    }
    saving = true;
    rejection = null;
    try {
      const modelRoutes = doc.modelRoutes.map((route) =>
        route.provider === selectedRoute.provider
          ? {
              ...route,
              baseURL: baseURLDraft.trim(),
              api: apiDraft,
              models,
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
      // the saved twins re-derive from the RESPONSE (positionally aligned
      // with the drafts we just posted) so the cards' dirty dots retire
      // (Codex r2 P1: the twins used to live forever at their init values)
      const savedRoute = next.modelRoutes.find((route) => route.provider === selectedRoute.provider);
      modelsSaved = modelsDraft.map((_, index) => savedRoute?.models[index] ?? null);
      savedFlash = true;
      if (savedTimer !== null) clearTimeout(savedTimer);
      savedTimer = setTimeout(() => (savedFlash = false), 1600);
    } catch (cause) {
      rejection = cause instanceof Error ? cause.message : String(cause);
    } finally {
      saving = false;
    }
  }

  /** the credential lane for an arbitrary provider (the create form's
   *  key-FIRST write and the detail view's set/clear share this) */
  async function writeKeyFor(provider: string, key: string | null): Promise<boolean> {
    if (keyBusy) return false;
    keyBusy = true;
    rejection = null;
    try {
      // key rides EXPLICITLY (null included) — the API treats omitted and
      // null alike now, but the explicit form is the contract (Codex r4 P1-2)
      const response = await fetch(`${settingsUrl.replace(/dsh\.json$/, 'dsh-credential')}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ provider, key }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message = typeof payload === 'object' && payload !== null && 'message' in payload ? String((payload as { message: unknown }).message) : `HTTP ${response.status}`;
        throw new Error(message);
      }
      const next = asSettingsDoc(payload);
      if (next === null) throw new Error('unexpected settings payload');
      doc = next;
      if (key !== null) {
        keyDraft = '';
        // the pending-key guidance retires once a key actually lands
        if (pendingKeyFocus === provider) pendingKeyFocus = null;
      }
      return true;
    } catch (cause) {
      rejection = cause instanceof Error ? cause.message : String(cause);
      return false;
    } finally {
      keyBusy = false;
    }
  }

  async function writeKey(key: string | null): Promise<void> {
    if (selected === null) return;
    await writeKeyFor(selected, key);
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

  /** the model cards' probe bridge for a STORED route: a per-model id
   *  verdict (the listing check rides the server), optional test-only key */
  async function testModel(modelId: string, directKey: string | null): Promise<ModelTestResult | null> {
    try {
      const response = await fetch(`${settingsUrl.replace(/dsh\.json$/, 'dsh-test')}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: selected,
          ...(selectedRoute !== null && endpointDirty ? { baseURL: baseURLDraft.trim() } : {}),
          modelId,
          ...(directKey !== null ? { apiKey: directKey } : {}),
        }),
      });
      return await decodeTestPayload(response);
    } catch (cause) {
      return { ok: false, detail: cause instanceof Error ? cause.message : String(cause) };
    }
  }

  /** the create-form's probe bridge: the route does not exist yet — the
   *  AD-HOC lane (baseURL + api + provider, Codex r2 P1-1) */
  async function testModelCreate(modelId: string, directKey: string | null): Promise<ModelTestResult | null> {
    try {
      const response = await fetch(`${settingsUrl.replace(/dsh\.json$/, 'dsh-test')}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: newProvider.trim(),
          baseURL: newBaseURL.trim(),
          api: newApi,
          modelId,
          ...(directKey !== null ? { apiKey: directKey } : {}),
        }),
      });
      return await decodeTestPayload(response);
    } catch (cause) {
      return { ok: false, detail: cause instanceof Error ? cause.message : String(cause) };
    }
  }

  async function decodeTestPayload(response: Response): Promise<ModelTestResult | null> {
    const payload: unknown = await response.json();
    if (!response.ok) {
      const message = typeof payload === 'object' && payload !== null && 'message' in payload ? String((payload as { message: unknown }).message) : `HTTP ${response.status}`;
      throw new Error(message);
    }
    if (typeof payload !== 'object' || payload === null || typeof (payload as { ok?: unknown }).ok !== 'boolean' || typeof (payload as { detail?: unknown }).detail !== 'string') {
      throw new Error('unexpected test payload');
    }
    return payload as ModelTestResult;
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

  /** the footer's two-step arm: first press arms (3s window), the second
   *  press commits — the studio's confirm, no nested dialog */
  function removeClick(): void {
    if (saving) return;
    if (!removeArmed) {
      removeArmed = true;
      if (removeArmTimer !== null) clearTimeout(removeArmTimer);
      removeArmTimer = setTimeout(() => (removeArmed = false), 3000);
      return;
    }
    if (removeArmTimer !== null) {
      clearTimeout(removeArmTimer);
      removeArmTimer = null;
    }
    removeArmed = false;
    void removeRoute();
  }

  /* ── the new-route view: gallery pick + custom form ──────────────── */

  let galleryFilter = $state('');
  let newProvider = $state('');
  let newBaseURL = $state('');
  let newApi = $state<string>(API_PROTOCOLS[0]);
  /** the create form's route key (R13 law: it lands FIRST — a failed
   *  write aborts the create) + the form's model cards */
  let newFormKey = $state('');
  let newFormKeyVisible = $state(false);
  let newModelsDraft = $state<ModelDraftEntry[]>([]);
  let newModelsNonces = $state<string[]>([]);
  let newModelsValidFlags = $state<boolean[]>([]);

  const galleryProviders = $derived.by(() => {
    const needle = galleryFilter.trim().toLowerCase();
    const providers = catalog?.providers ?? [];
    if (needle === '') return providers;
    return providers.filter((entry) =>
      entry.label.toLowerCase().includes(needle)
      || entry.provider.toLowerCase().includes(needle)
      || entry.baseURL.toLowerCase().includes(needle),
    );
  });

  const newCandidates = $derived(catalogModelCandidates(catalog, numberedSlugParts(newProvider.trim())?.base ?? newProvider.trim()));
  const newNameValid = $derived(newProvider.trim() !== '' && !routes.some((route) => route.provider === newProvider.trim()));
  const newUrlValid = $derived(/^https?:\/\//.test(newBaseURL.trim()));
  const newModelsValid = $derived(
    newModelsDraft.length > 0
      && newModelsValidFlags.length === newModelsDraft.length
      && newModelsValidFlags.every((flag) => flag)
      && normalizedModels(newModelsDraft) !== null,
  );
  const newValid = $derived(newNameValid && newUrlValid && newModelsValid);

  /** a catalog provider's existing copies (the added ✓ badge) */
  function copyCount(provider: string): number {
    return routes.filter((route) => route.provider === provider || numberedSlugParts(route.provider)?.base === provider).length;
  }

  function openNew(mode: 'pick' | 'form'): void {
    newMode = mode;
    newOpen = true;
    selected = null;
    removeArmed = false;
    if (mode === 'form') seedCreateForm();
  }

  /** reset + seed the custom form's model machinery (one empty card) */
  function seedCreateForm(): void {
    newProvider = '';
    newBaseURL = '';
    newApi = API_PROTOCOLS[0];
    newFormKey = '';
    newFormKeyVisible = false;
    newModelsDraft = [{ id: '', name: '', contextWindow: '', maxOutputTokens: '' }];
    newModelsNonces = [crypto.randomUUID()];
    newModelsValidFlags = [false];
    rejection = null;
  }

  /** the custom form's create (R13 key-first + full model set) */
  async function createRoute(): Promise<void> {
    if (doc === null || !newValid || saving) return;
    const provider = newProvider.trim();
    const models = normalizedModels(newModelsDraft);
    if (models === null) {
      rejection = 'a model entry is invalid — fix the highlighted fields before creating';
      return;
    }
    // the key lands FIRST: a failed write aborts the create (a successful
    // key with a failed create leaves an orphan credential — harmless, the
    // same slug reuses it on retry; the reference's R13 law)
    const key = newFormKey.trim();
    if (key !== '' && !(await writeKeyFor(provider, key))) return;
    saving = true;
    rejection = null;
    try {
      const route: ModelRoute = { provider, api: newApi, baseURL: newBaseURL.trim(), models };
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
      selected = provider;
      pendingKeyFocus = key !== '' ? null : provider;
      keyFocusDone = null;
    } catch (cause) {
      rejection = cause instanceof Error ? cause.message : String(cause);
    } finally {
      saving = false;
    }
  }

  /** a gallery card click = the route is created IMMEDIATELY (numbered
   *  slug + catalog baseURL/api + top-4 image-first models richly
   *  prefilled — catalogRouteDraft); the editor opens on the new tab
   *  with the pending-key guidance armed */
  async function createFromCatalog(entry: CatalogProvider): Promise<void> {
    if (doc === null || saving) return;
    saving = true;
    rejection = null;
    try {
      const draft = catalogRouteDraft(entry, doc.modelRoutes);
      const response = await fetch(settingsUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model: doc.model, modelRoutes: [...doc.modelRoutes, draft] }),
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
      selected = draft.provider;
      pendingKeyFocus = draft.provider;
      keyFocusDone = null;
    } catch (cause) {
      rejection = cause instanceof Error ? cause.message : String(cause);
    } finally {
      saving = false;
    }
  }

  /* ── mount + keyboard ───────────────────────────────────────────── */

  $effect(() => {
    void load();
    void loadCatalog();
    return () => {
      if (savedTimer !== null) clearTimeout(savedTimer);
      if (removeArmTimer !== null) clearTimeout(removeArmTimer);
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

  // the pending-key guidance: when the selected route is the freshly
  // created one, focus its credential input ONCE (a wrapper element
  // query — the registry Input exposes no ref prop; the guard keeps the
  // effect from re-stealing focus on later renders; the HINT itself
  // retires when a key actually lands, in writeKeyFor)
  $effect(() => {
    if (pendingKeyFocus === null || selectedRoute === null) return;
    if (pendingKeyFocus !== selectedRoute.provider || keyFocusDone === pendingKeyFocus) return;
    if (credWrap === null) return;
    credWrap.querySelector('input')?.focus();
    keyFocusDone = pendingKeyFocus;
  });

  // active-model selects always point at REAL routes/models — covers the
  // post-create moment (doc arrives, selects still empty), provider
  // switches (the model list refreshes with it), and DRAFT edits on the
  // active route (a renamed model re-points the selection — the save
  // must never carry a dangling reference)
  $effect(() => {
    if (routes.length === 0) return;
    if (!routes.some((route) => route.provider === activeProvider)) {
      activeProvider = routes[0]!.provider;
      activeModel = '';
    }
    if (!activeRouteModels.some((entry) => entry.id === activeModel)) {
      activeModel = activeRouteModels[0]?.id ?? '';
      activeEffort = '';
    } else if (!effortOptions.includes(activeEffort)) {
      // capability REMOVED (efforts cleared or no longer offering the
      // saved level) — the saved effort must drop with it (Codex r4-2
      // P1-1: a stranded effort gets the profile refused at spawn time)
      activeEffort = '';
    }
  });

  /** add a model row (expanded; validity starts false — the empty id) */
  function addModel(): void {
    modelsDraft = [...modelsDraft, { id: '', name: '', contextWindow: '', maxOutputTokens: '' }];
    modelsNonces = [...modelsNonces, crypto.randomUUID()];
    modelsSaved = [...modelsSaved, null];
    modelsValidFlags = [...modelsValidFlags, false];
  }

  function addNewModel(): void {
    newModelsDraft = [...newModelsDraft, { id: '', name: '', contextWindow: '', maxOutputTokens: '' }];
    newModelsNonces = [...newModelsNonces, crypto.randomUUID()];
    newModelsValidFlags = [...newModelsValidFlags, false];
  }
</script>

<!-- the r4-style pass (Owner 2026-09-21: "怎么风格都对不上"): every
     interactive face is a REGISTRY component — Dialog (native
     <dialog>: focus trap, Esc, scrim, the card structural kernel),
     PressButton, NativeSelect, the Item rail, Input, Badge. Studio CSS
     keeps ONLY layout geometry (rail width, the form grid, the gallery
     grid) and the studio's status ink — no hand-rolled chrome remains.
     User-visible copy names no kernel (Owner 2026-09-21) -->
<Dialog title="settings" bind:open class="dsh-dialog">
  <p class="dsh-sub">model routes — changes apply to the agent's next turn, no restart</p>

  {#if loadError !== null}
    <p class="dsh-error" role="alert">settings failed: {loadError} <PressButton variant="link" onclick={() => void load()}>retry</PressButton></p>
  {:else if doc === null}
    <p class="dsh-muted">loading…</p>
  {:else}
    <div class="dsh-body">
      <!-- the rail: one Item row per route + new -->
      <div class="dsh-rail" role="listbox" aria-label="model routes">
        {#each routes as route (route.provider)}
          {@const active = doc.model?.provider === route.provider}
          {@const hasKey = doc.keyPresence[route.provider] === true}
          {@const base = numberedSlugParts(route.provider)?.base ?? route.provider}
          {@const icon = catalog?.providers.find((candidate) => candidate.provider === base)?.icon ?? null}
          {@const label = routeDisplayLabel(route, catalog)}
          {@const hue = hueAvatarColor(route.provider)}
          <Item
            class="dsh-rail-row"
            variant="default"
            density="sm"
            selected={!newOpen && selected === route.provider}
            onclick={() => {
              selected = route.provider;
              newOpen = false;
            }}
            title="{label} ({route.provider}) — {route.baseURL}"
          >
            <ItemContent wrap="truncate">
              <ItemTitle>
                <span class="dsh-rail-line">
                  {#if icon}
                    <span class="dsh-avatar" style="background: color-mix(in srgb, {hue} 18%, transparent)"><img src={icon} alt="" /></span>
                  {:else}
                    <span class="dsh-avatar" style="background: {hue}">{label.slice(0, 1).toUpperCase()}</span>
                  {/if}
                  <span class="dsh-rail-name">{label}</span>
                  {#if !hasKey}<span class="dsh-key-dot" title="API key missing"></span>{/if}
                  {#if active}<Badge variant="tonal" class="jx-hue-success">active</Badge>{/if}
                </span>
              </ItemTitle>
            </ItemContent>
          </Item>
        {/each}
        <Item
          class="dsh-rail-new"
          variant="default"
          density="sm"
          selected={newOpen}
          onclick={() => openNew(catalog === null && catalogError !== null ? 'form' : 'pick')}
        >
          <ItemContent wrap="truncate">
            <ItemTitle>+ new route</ItemTitle>
          </ItemContent>
        </Item>
      </div>

      <!-- the detail -->
      <div class="dsh-detail">
        {#if newOpen}
          {#if newMode === 'pick'}
            <!-- the gallery (pick state) -->
            <div class="dsh-block">
              <div class="dsh-gal-bar">
                <Input class="dsh-gal-search" aria-label="search providers" placeholder="search providers…" bind:value={galleryFilter} />
                <PressButton onclick={() => openNew('form')}>custom endpoint →</PressButton>
              </div>
              {#if catalogError !== null}
                <p class="dsh-error" role="alert">catalog unavailable: {catalogError}</p>
                <p class="dsh-muted">add the endpoint by hand instead.</p>
                <div class="dsh-actions">
                  <PressButton onclick={() => openNew('form')}>custom endpoint →</PressButton>
                </div>
              {:else if catalog === null}
                <p class="dsh-muted">loading catalog…</p>
              {:else}
                <div class="dsh-gallery" role="listbox" aria-label="provider catalog">
                  {#each galleryProviders as entry (entry.provider)}
                    {@const copies = copyCount(entry.provider)}
                    {@const hue = hueAvatarColor(entry.provider)}
                    <button
                      type="button"
                      class="dsh-gal-card"
                      role="option"
                      aria-selected="false"
                      title="{entry.baseURL} · {entry.api}{copies > 0 ? ` · ${copies} cop${copies === 1 ? 'y' : 'ies'} added — click to add another` : ''}"
                      disabled={saving}
                      onclick={() => void createFromCatalog(entry)}
                    >
                      {#if entry.icon}
                        <span class="dsh-avatar dsh-avatar-lg" style="background: color-mix(in srgb, {hue} 18%, transparent)"><img src={entry.icon} alt="" /></span>
                      {:else}
                        <span class="dsh-avatar dsh-avatar-lg" style="background: {hue}">{entry.label.slice(0, 1).toUpperCase()}</span>
                      {/if}
                      <span class="dsh-gal-text">
                        <span class="dsh-gal-label">{entry.label}</span>
                        <span class="dsh-gal-host">{entry.baseURL.replace(/^https?:\/\//, '')}</span>
                      </span>
                      <span class="dsh-gal-meta">
                        {#if copies > 0}<Badge variant="tonal">added ✓{copies > 1 ? ` ×${copies}` : ''}</Badge>{/if}
                        <span class="dsh-gal-count" title="{entry.models.length} models in catalog">{entry.models.length}</span>
                      </span>
                    </button>
                  {/each}
                  {#if galleryProviders.length === 0}
                    <p class="dsh-muted dsh-gal-empty">no providers match “{galleryFilter}”.</p>
                  {/if}
                </div>
              {/if}
              {#if rejection !== null}
                <p class="dsh-error" role="alert">{rejection}</p>
              {/if}
              <div class="dsh-actions">
                <PressButton onclick={() => (newOpen = false)}>cancel</PressButton>
              </div>
            </div>
          {:else}
            <!-- the custom-endpoint form (Codex r2 P1: the SAME editing
                 machinery as the route detail — model cards, key-first) -->
            <div class="dsh-block">
              <p class="dsh-block-title">new route</p>
              <div class="dsh-grid">
                <label class="dsh-field">
                  <span class="dsh-label">provider</span>
                  <Input placeholder="my-gateway" bind:value={newProvider} />
                </label>
                <label class="dsh-field">
                  <span class="dsh-label">baseURL</span>
                  <Input placeholder="https://api.example.com/anthropic" bind:value={newBaseURL} />
                </label>
              </div>
              <NativeSelect label="api" bind:value={newApi}>
                {#each API_PROTOCOLS as protocol (protocol)}<option value={protocol}>{protocol}</option>{/each}
              </NativeSelect>
              {#if !newNameValid && newProvider.trim() !== ''}
                <p class="dsh-error-inline" role="alert">route “{newProvider.trim()}” already exists.</p>
              {/if}
              {#if !newUrlValid && newBaseURL.trim() !== ''}
                <p class="dsh-error-inline" role="alert">custom route needs an http(s) base URL.</p>
              {/if}
              <div class="dsh-block-title dsh-block-gap">models</div>
              <div class="dsh-models">
                {#each newModelsDraft as model, index (newModelsNonces[index])}
                  <SettingsModelCard
                    entry={model}
                    saved={null}
                    candidates={newCandidates}
                    provider={newProvider.trim() || 'new-route'}
                    keyPresent={false}
                    formKey={newFormKey}
                    disabled={saving}
                    onchange={(next) => (newModelsDraft[index] = next)}
                    onremove={() => {
                      newModelsDraft = newModelsDraft.filter((_, i) => i !== index);
                      newModelsNonces = newModelsNonces.filter((_, i) => i !== index);
                      newModelsValidFlags = newModelsValidFlags.filter((_, i) => i !== index);
                    }}
                    onvalidity={(valid) => (newModelsValidFlags[index] = valid)}
                    ontest={(modelId, directKey) => testModelCreate(modelId, directKey)}
                  />
                {/each}
              </div>
              <PressButton class="dsh-add-model" disabled={saving} onclick={() => addNewModel()}>+ add model</PressButton>
              <div class="dsh-block-title dsh-block-gap">credential</div>
              <div class="dsh-cred">
                <Input
                  type={newFormKeyVisible ? 'text' : 'password'}
                  placeholder="paste the API key (saved on create)"
                  bind:value={newFormKey}
                />
                <PressButton onclick={() => (newFormKeyVisible = !newFormKeyVisible)} aria-label="toggle key visibility">{newFormKeyVisible ? 'hide' : 'show'}</PressButton>
              </div>
              {#if rejection !== null}
                <p class="dsh-error" role="alert">{rejection}</p>
              {/if}
              <div class="dsh-actions">
                <PressButton onclick={() => openNew('pick')}>back to gallery</PressButton>
                <PressButton variant="fill" disabled={!newValid || saving} onclick={() => void createRoute()}>create</PressButton>
                <PressButton onclick={() => (newOpen = false)}>cancel</PressButton>
              </div>
            </div>
          {/if}
        {:else if selectedRoute !== null}
          {#key selectedRoute.provider}
            {@const hasKey = doc.keyPresence[selectedRoute.provider] === true}
            <!-- active model -->
            <div class="dsh-block">
              <p class="dsh-block-title">active model</p>
              <div class="dsh-grid">
                <NativeSelect label="provider" bind:value={activeProvider}>
                  {#each routes as route (route.provider)}<option value={route.provider}>{routeDisplayLabel(route, catalog)}</option>{/each}
                </NativeSelect>
                <NativeSelect label="model" bind:value={activeModel}>
                  {#each activeRouteModels as entry (entry.id)}<option value={entry.id}>{entry.name ?? entry.id}</option>{/each}
                </NativeSelect>
                <!-- a select over the model's DECLARED efforts only — the
                     kernel rejects an effort the model does not offer
                     (UNSUPPORTED_REASONING_EFFORT); models with no
                     declared efforts run at provider default -->
                <NativeSelect label="effort" bind:value={activeEffort}>
                  <option value="">default</option>
                  {#each effortOptions as effort (effort)}<option value={effort}>{effort}</option>{/each}
                </NativeSelect>
              </div>
            </div>

            <!-- credential -->
            <div class="dsh-block">
              <p class="dsh-block-title">credential {#if hasKey}<span class="dsh-ok">· key stored</span>{/if}</p>
              {#if pendingKeyFocus === selectedRoute.provider}
                <p class="dsh-ok dsh-key-hint">route “{selectedRoute.provider}” added — paste its API key to finish connecting.</p>
              {/if}
              <div class="dsh-cred" bind:this={credWrap}>
                <Input
                  type={keyVisible ? 'text' : 'password'}
                  placeholder={hasKey ? 'stored — paste a new key to replace' : 'paste the API key'}
                  bind:value={keyDraft}
                  onkeydown={(event) => {
                    if (event.key === 'Enter' && keyDraft.trim() !== '') void writeKey(keyDraft.trim());
                  }}
                />
                <PressButton onclick={() => (keyVisible = !keyVisible)} aria-label="toggle key visibility">{keyVisible ? 'hide' : 'show'}</PressButton>
                <PressButton disabled={keyDraft.trim() === '' || keyBusy} onclick={() => void writeKey(keyDraft.trim())}>save key</PressButton>
                {#if hasKey}<PressButton disabled={keyBusy} onclick={() => void writeKey(null)}>clear</PressButton>{/if}
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
                <NativeSelect label="api" bind:value={apiDraft}>
                  {#each API_PROTOCOLS as protocol (protocol)}<option value={protocol}>{protocol}</option>{/each}
                </NativeSelect>
              </div>
            </div>

            <!-- models (collapsible cards, keyed by their stable nonces) -->
            <div class="dsh-block">
              <p class="dsh-block-title">models</p>
              <div class="dsh-models">
                {#each modelsDraft as model, index (modelsNonces[index])}
                  <SettingsModelCard
                    entry={model}
                    saved={modelsSaved[index] ?? null}
                    candidates={modelCandidates}
                    provider={selectedRoute.provider}
                    keyPresent={hasKey}
                    disabled={saving}
                    onchange={(next) => (modelsDraft[index] = next)}
                    onremove={() => {
                      modelsDraft = modelsDraft.filter((_, i) => i !== index);
                      modelsNonces = modelsNonces.filter((_, i) => i !== index);
                      modelsSaved = modelsSaved.filter((_, i) => i !== index);
                      modelsValidFlags = modelsValidFlags.filter((_, i) => i !== index);
                    }}
                    onvalidity={(valid) => (modelsValidFlags[index] = valid)}
                    ontest={(modelId, directKey) => testModel(modelId, directKey)}
                  />
                {/each}
              </div>
              <PressButton class="dsh-add-model" disabled={saving} onclick={() => addModel()}>+ add model</PressButton>
            </div>
          {/key}
        {:else}
          <div class="dsh-onboard">
            <p class="dsh-onboard-title">add your first model route</p>
            <p class="dsh-muted">pick a provider from the catalog, or point at any OpenAI/Anthropic-compatible endpoint — the route feeds the design agent directly.</p>
            <div class="dsh-onboard-actions">
              <PressButton variant="fill" onclick={() => openNew('pick')}>browse providers</PressButton>
              <PressButton onclick={() => openNew('form')}>custom endpoint</PressButton>
            </div>
          </div>
        {/if}
      </div>
    </div>
    {#if rejection !== null}
      <p class="dsh-error" role="alert">{rejection}</p>
    {/if}
  {/if}

  {#snippet footer()}
    <CardFooter>
      {#if !newOpen && selectedRoute !== null}
        <PressButton disabled={testing} onclick={() => void testConnection()}>test{testing ? '…' : ''}</PressButton>
        {#if testResult !== null}
          <span class={testResult.ok ? 'dsh-ok' : 'dsh-error-inline'}>{testResult.ok ? 'ok' : 'failed'} — {testResult.detail}</span>
        {/if}
        <span class="dsh-foot-spacer"></span>
        {#if savedFlash}<span class="dsh-ok">saved</span>{/if}
        <PressButton class="dsh-remove" disabled={saving} onclick={() => removeClick()}>{removeArmed ? 'confirm remove' : 'remove route'}</PressButton>
        <PressButton variant="fill" disabled={saveDisabled} onclick={() => void save()}>save</PressButton>
      {:else}
        <span class="dsh-foot-spacer"></span>
      {/if}
    </CardFooter>
  {/snippet}
</Dialog>

<style>
  /* layout geometry ONLY — the interactive chrome is registry's */
  .dsh-dialog {
    width: min(46rem, 100%);
  }
  :global(.dsh-dialog) {
    width: min(46rem, 100%);
  }
  .dsh-sub {
    margin: 0 0 0.75rem;
    font-size: 0.6875rem;
    color: var(--muted-foreground, #6f6759);
  }
  .dsh-body {
    display: grid;
    grid-template-columns: 11rem 1fr;
    gap: 0 1rem;
    min-height: 0;
  }
  .dsh-rail {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    border-right: 1px solid var(--border, #262320);
    padding-right: 0.5rem;
  }
  .dsh-rail-line {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    min-width: 0;
  }
  .dsh-rail-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* the route/provider avatar: a catalog icon on a hue-tinted tile, or
     the deterministic hue letter (invert makes the dark-on-transparent
     catalog logos legible on the dark studio) */
  .dsh-avatar {
    position: relative;
    flex: none;
    width: 16px;
    height: 16px;
    border-radius: 2px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 600;
    line-height: 1;
    color: #fff;
    overflow: hidden;
  }
  .dsh-avatar img {
    width: 12px;
    height: 12px;
    filter: invert(1);
  }
  .dsh-avatar-lg {
    width: 22px;
    height: 22px;
  }
  .dsh-avatar-lg img {
    width: 16px;
    height: 16px;
  }
  .dsh-key-dot {
    flex: none;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--warning, #d9a25f);
  }
  .dsh-detail {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 1rem;
  }
  .dsh-block-title {
    margin: 0 0 0.5rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.625rem;
    color: var(--muted-foreground, #6f6759);
  }
  .dsh-block-gap {
    margin-top: 1rem;
  }
  .dsh-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem 0.75rem;
  }
  .dsh-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }
  .dsh-span2 {
    grid-column: span 2;
  }
  .dsh-label {
    font-size: 0.6875rem;
    color: var(--muted-foreground, #6f6759);
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
  .dsh-key-hint {
    margin: 0 0 0.375rem;
  }
  .dsh-models {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .dsh-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
  /* the gallery: a two-column card grid inside a bounded scroll region */
  .dsh-gal-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.625rem;
  }
  .dsh-gal-bar :global(.jx-field) {
    flex: 1;
    min-width: 0;
  }
  .dsh-gallery {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.375rem;
    max-height: 21rem;
    overflow-y: auto;
    padding-right: 2px;
  }
  .dsh-gal-card {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.5rem;
    border: 1px solid var(--border, #262320);
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    min-width: 0;
  }
  .dsh-gal-card:hover:not(:disabled) {
    border-color: var(--muted-foreground, #6f6759);
  }
  .dsh-gal-card:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .dsh-gal-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }
  .dsh-gal-label {
    font-size: 0.75rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dsh-gal-host {
    font-size: 0.625rem;
    color: var(--muted-foreground, #6f6759);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dsh-gal-meta {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    flex: none;
  }
  .dsh-gal-count {
    font-size: 0.625rem;
    color: var(--muted-foreground, #6f6759);
  }
  .dsh-gal-empty {
    grid-column: span 2;
  }
  .dsh-foot-spacer {
    flex: 1;
  }
  .dsh-ok {
    color: var(--success, #a9c4a9);
    font-size: 0.6875rem;
  }
  .dsh-error,
  .dsh-error-inline {
    color: var(--destructive, #e08585);
  }
  .dsh-error {
    margin: 0.5rem 0 0;
    font-size: 0.6875rem;
  }
  .dsh-error-inline {
    font-size: 0.6875rem;
    margin: 0.25rem 0 0;
  }
  .dsh-muted {
    margin: 0;
    color: var(--muted-foreground, #6f6759);
    font-size: 0.75rem;
  }
  .dsh-remove :global(*) {
    color: var(--destructive, #e08585);
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
  }
  .dsh-onboard .dsh-muted {
    max-width: 340px;
  }
  .dsh-onboard-actions {
    display: flex;
    gap: 0.5rem;
  }
</style>

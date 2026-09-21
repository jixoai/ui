/**
 * @jixoai/ui-design (studio) — the settings panel's pure helpers
 * (settings-model-parity T3, Owner walkthrough 2026-09-21: "对于 model
 * 配置的支持，和我在 skill-creator-v2 我打磨的那套，差距还是非常大的").
 *
 * Every function here is skill-creator-v2's polished set ported to this
 * repo's facts, adapted where the two kernels differ:
 * - route slugs + display labels (zai → zai-2 → "Z.ai (1)") — verbatim;
 * - deterministic hue avatars — verbatim;
 * - readable model names + token shorthand (253k / 0.5M) — verbatim;
 * - the completion pool's namespace purification — verbatim;
 * - catalog prefills DROP inputTypes/outputTypes (this kernel's bridge
 *   whitelist does not carry them) and CLAMP efforts to the kernel's
 *   thinking vocabulary (an out-of-vocabulary level would get the whole
 *   profile refused at spawn time — the server gate is the twin law).
 *
 * Browser-safe: no imports past the catalog TYPES (erased at compile).
 */

import type { CatalogModel, CatalogProvider } from '../server/settings/model-catalog.ts';

/** re-exported for the panel (type-only — erased in the browser bundle) */
export type { CatalogModel, CatalogProvider };

/** the kernel's fixed reasoning-effort vocabulary (contracts twin of
 *  DSH_THINKING_LEVELS) — efforts outside this set make the kernel
 *  refuse the whole profile */
export const THINKING_LEVELS = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'] as const;

/** the API protocols the kernel's pi-ai family speaks (contracts twin) */
export const API_PROTOCOLS = [
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

/* ── deterministic avatars (skill-creator route-icon.ts, verbatim) ──── */

/** provider id → deterministic hue */
export function avatarHue(provider: string): number {
  let hash = 0;
  for (const ch of provider) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  return hash;
}

/** the letter avatar's full CSS background */
export function hueAvatarColor(provider: string): string {
  return `hsl(${avatarHue(provider)} 55% 45%)`;
}

/* ── readable names + token shorthand (model-fields.ts, verbatim) ──── */

/** model id → display name: `-`/`_` segments; ≤3-letter all-alpha
 *  segments uppercase (glm → GLM), others Capitalized */
export function readableModelName(id: string): string {
  return id
    .split(/[-_]+/)
    .filter((token) => token.length > 0)
    .map((token) => (/^[a-z]{1,3}$/.test(token) ? token.toUpperCase() : token.slice(0, 1).toUpperCase() + token.slice(1)))
    .join(' ');
}

/** parse `0.5M`/`253k`/`131072` into a token count; null = invalid
 *  (never guessed). Binary magnitudes: k = 1024, M = 1024². */
export function parseTokenShorthand(input: string): number | null {
  const trimmed = input.trim();
  if (!/^\d+(\.\d+)?\s*[kKmM]?$/.test(trimmed)) return null;
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*([kKmM])?$/);
  if (match === null) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  const unit = match[2]?.toLowerCase();
  const scaled = unit === 'k' ? value * 1024 : unit === 'm' ? value * 1024 * 1024 : value;
  const rounded = Math.round(scaled);
  return Number.isSafeInteger(rounded) && rounded > 0 ? rounded : null;
}

/** the display-side inverse: 131072 → "128k", 2097152 → "2M" */
export function formatTokenCount(value: number): string {
  if (!Number.isSafeInteger(value) || value <= 0) return String(value);
  if (value % (1024 * 1024) === 0) return `${value / (1024 * 1024)}M`;
  if (value >= 1024) {
    const k = value / 1024;
    return `${Number.isInteger(k) ? k.toString() : k.toFixed(1)}k`;
  }
  return String(value);
}

/* ── numbered route slugs (route-naming.ts, verbatim) ───────────────── */

const NUMBERED_SUFFIX = /^(.*)-(\d+)$/;

/** the next slug when a provider is added again: unnumbered until
 *  taken, then max existing suffix + 1 (never backfills holes) */
export function nextRouteSlug(provider: string, existing: ReadonlyArray<{ provider: string }>): string {
  const taken = new Set(existing.map((route) => route.provider));
  if (!taken.has(provider)) return provider;
  let maxN = 1;
  for (const slug of taken) {
    if (slug === provider) continue;
    const match = NUMBERED_SUFFIX.exec(slug);
    if (match === null || match[1] !== provider) continue;
    const n = Number(match[2]);
    if (Number.isInteger(n) && n > maxN) maxN = n;
  }
  return `${provider}-${maxN + 1}`;
}

/** a slug's numbered suffix; null when absent or n < 2 */
export function numberedSlugParts(provider: string): { base: string; n: number } | null {
  const match = NUMBERED_SUFFIX.exec(provider);
  if (match === null) return null;
  const n = Number(match[2]);
  if (!Number.isInteger(n) || n < 2) return null;
  return { base: match[1]!, n };
}

/** the rail/gallery display name: numbered slug → the base's catalog
 *  label + " (n-1)"; otherwise the catalog label ?? the provider id */
export function routeDisplayLabel(
  route: { provider: string },
  catalog: { providers: CatalogProvider[] } | null,
): string {
  const parts = numberedSlugParts(route.provider);
  if (parts !== null) {
    const base = catalog?.providers.find((entry) => entry.provider === parts.base);
    if (base) return `${base.label} (${parts.n - 1})`;
  }
  const direct = catalog?.providers.find((entry) => entry.provider === route.provider);
  return direct?.label ?? route.provider;
}

/* ── the completion pool (model-fields.ts, adapted types) ───────────── */

/** namespace model ids (`@cf/org/model`, `org/model`) are valid only on
 *  their host provider — they never enter another provider's pool */
export function isNamespaceModelId(id: string): boolean {
  return id.includes('/') || id.includes('@');
}

/** pool entry: the catalog model's browser-facing projection */
export interface ModelCandidate {
  id: string;
  name?: string;
  image: boolean;
  contextWindow?: number;
  maxOutputTokens?: number;
  supportsReasoningEffort?: boolean;
  effortTiers?: string[];
}

/** the model-id completion pool: the current provider's catalog models
 *  first (namespace ids INCLUDED there — they are valid on their host),
 *  every other provider's models appended with namespace ids purged;
 *  each group deduped and sorted; manual entry stays free-form */
export function catalogModelCandidates(
  catalog: { providers: CatalogProvider[] } | null,
  currentProvider = '',
): ModelCandidate[] {
  const own = new Map<string, ModelCandidate>();
  const others = new Map<string, ModelCandidate>();
  const project = (model: CatalogModel): ModelCandidate => ({
    id: model.id,
    ...(model.name !== undefined ? { name: model.name } : {}),
    image: model.image,
    ...(model.contextWindow !== undefined ? { contextWindow: model.contextWindow } : {}),
    ...(model.maxOutputTokens !== undefined ? { maxOutputTokens: model.maxOutputTokens } : {}),
    ...(model.supportsReasoningEffort !== undefined ? { supportsReasoningEffort: model.supportsReasoningEffort } : {}),
    ...(model.effortTiers !== undefined ? { effortTiers: [...model.effortTiers] } : {}),
  });
  for (const provider of catalog?.providers ?? []) {
    const isCurrent = provider.provider === currentProvider;
    for (const model of provider.models) {
      if (isCurrent) {
        if (!own.has(model.id)) own.set(model.id, project(model));
        others.delete(model.id);
      } else if (!own.has(model.id) && !others.has(model.id)) {
        if (isNamespaceModelId(model.id)) continue;
        others.set(model.id, project(model));
      }
    }
  }
  const byId = (a: ModelCandidate, b: ModelCandidate): number => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  return [...own.values()].sort(byId).concat([...others.values()].sort(byId));
}

/* ── catalog prefills (adapted: kernel fields only, clamped efforts) ── */

/** a new model entry's default efforts (the skill-creator ruling:
 *  Low/High/Max — all inside the kernel's vocabulary) */
export const DEFAULT_MODEL_EFFORTS: readonly string[] = ['low', 'high', 'max'];

/** the SINGLE effort clamp (Codex r2 P2: the card had a local twin —
 *  drift risk): catalog tiers ∩ kernel vocabulary − 'off' (a switch,
 *  not a tier — the catalog's thinkingLevelMap keys include it),
 *  deduped, sorted; empty intersection → the default three */
export function clampModelEfforts(tiers: readonly string[] | undefined): string[] {
  const kept = (tiers ?? []).filter((tier) => tier !== 'off' && (THINKING_LEVELS as readonly string[]).includes(tier));
  return kept.length > 0 ? [...new Set(kept)].sort() : [...DEFAULT_MODEL_EFFORTS];
}

/** a catalog model → the panel's editable draft entry. Efforts ride
 *  clampModelEfforts. */
export function catalogModelDefaults(model: CatalogModel): {
  id: string;
  name?: string;
  contextWindow?: number;
  maxOutputTokens?: number;
  efforts?: string[];
} {
  return {
    id: model.id,
    ...(model.name !== undefined ? { name: model.name } : {}),
    ...(model.contextWindow !== undefined ? { contextWindow: model.contextWindow } : {}),
    ...(model.maxOutputTokens !== undefined ? { maxOutputTokens: model.maxOutputTokens } : {}),
    efforts: clampModelEfforts(model.effortTiers),
  };
}

/** a gallery card click → the new route: numbered slug + the catalog's
 *  baseURL/api + the top-4 models by image capability first, richly
 *  prefilled (skill-creator's createFromCatalog, kernel-adapted) */
export function catalogRouteDraft(
  entry: CatalogProvider,
  existing: ReadonlyArray<{ provider: string }>,
): { provider: string; api: string; baseURL: string; models: Array<ReturnType<typeof catalogModelDefaults>> } {
  return {
    provider: nextRouteSlug(entry.provider, existing),
    api: entry.api,
    baseURL: entry.baseURL,
    models: [...entry.models]
      .sort((a, b) => Number(b.image) - Number(a.image))
      .slice(0, 4)
      .map((model) => catalogModelDefaults(model)),
  };
}

/* ── the catalog fetch boundary (Codex r2 P1: strict decode or degrade) ── */

/** field caps — a hostile/buggy catalog payload dies HERE, never in a
 *  derived (the asSettingsDoc twin law for the gallery lane) */
const CATALOG_STRING_CAP = 512;
const CATALOG_ICON_CAP = 1_000_000; // dataURLs are large; anything past 1MB is hostile
const CATALOG_PROVIDERS_CAP = 1000;
const CATALOG_MODELS_PER_PROVIDER_CAP = 2000;

function isCleanStr(value: unknown, cap = CATALOG_STRING_CAP): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= cap && !/[\u0000-\u001f\u007f]/.test(value);
}
function isPosInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= Number.MAX_SAFE_INTEGER;
}

/** runtime decoder for the catalog response: field-level down to model
 *  optionals; ANY violation rejects the WHOLE payload (null) — the
 *  gallery degrades to its typed notice + the custom form, never
 *  renders a half-trusted provider list (icon src, baseURL, and the
 *  completion pool all consume this data) */
export function asCatalogDoc(value: unknown): { providers: CatalogProvider[] } | null {
  if (typeof value !== 'object' || value === null) return null;
  const doc = value as Record<string, unknown>;
  if (!Array.isArray(doc.providers) || doc.providers.length > CATALOG_PROVIDERS_CAP) return null;
  const providers: CatalogProvider[] = [];
  const providerIds = new Set<string>();
  for (const entry of doc.providers) {
    if (typeof entry !== 'object' || entry === null) return null;
    const p = entry as Record<string, unknown>;
    if (!isCleanStr(p.provider) || !isCleanStr(p.label) || !isCleanStr(p.api)) return null;
    // duplicate provider ids would break the gallery's keyed each and
    // the rail's identity — rejected wholesale (r2 partial)
    if (providerIds.has(p.provider)) return null;
    providerIds.add(p.provider);
    if (typeof p.baseURL !== 'string' || !/^https?:\/\//.test(p.baseURL) || p.baseURL.length > 2048 || /[\u0000-\u001f\u007f]/.test(p.baseURL)) return null;
    if (p.icon !== null && p.icon !== undefined) {
      if (typeof p.icon !== 'string' || !p.icon.startsWith('data:image/') || p.icon.length > CATALOG_ICON_CAP) return null;
    }
    if (!Array.isArray(p.models) || p.models.length === 0 || p.models.length > CATALOG_MODELS_PER_PROVIDER_CAP) return null;
    const models: CatalogModel[] = [];
    const modelIds = new Set<string>();
    for (const model of p.models) {
      if (typeof model !== 'object' || model === null) return null;
      const m = model as Record<string, unknown>;
      if (!isCleanStr(m.id)) return null;
      // duplicate model ids within a provider corrupt the completion
      // pool's dedup invariants — rejected wholesale (r2 partial)
      if (modelIds.has(m.id)) return null;
      modelIds.add(m.id);
      if (m.name !== undefined && !isCleanStr(m.name)) return null;
      if (typeof m.image !== 'boolean') return null;
      for (const numField of ['contextWindow', 'maxOutputTokens'] as const) {
        if (m[numField] !== undefined && !isPosInt(m[numField])) return null;
      }
      if (m.supportsReasoningEffort !== undefined && typeof m.supportsReasoningEffort !== 'boolean') return null;
      if (m.effortTiers !== undefined) {
        if (!Array.isArray(m.effortTiers) || !m.effortTiers.every((tier) => isCleanStr(tier, 64))) return null;
      }
      models.push(m as CatalogModel);
    }
    providers.push(p as unknown as CatalogProvider);
  }
  return { providers };
}

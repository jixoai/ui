/**
 * @jixoai/ui-design (server) — the model provider catalog (settings-
 * model-parity T1, Owner walkthrough 2026-09-21: "对于 model 配置的
 * 支持，和我在 skill-creator-v2 我打磨的那套，差距还是非常大的").
 *
 * The catalog is skill-creator-v2's daemon model-catalog.ts ported to
 * this repo's facts: the SAME pi-ai assembly data (the models.dev
 * mirror, `dist/providers/data/*.json`) that feeds the kernel's own
 * provider assembly, projected to the panel's gallery shape:
 *   {provider, label, api, baseURL, icon, models[{id, name?, image,
 *    contextWindow?, maxOutputTokens?, supportsReasoningEffort?,
 *    effortTiers?}]}
 *
 * Orthogonal intents:
 *   [1] ANCHOR CHAIN — the design agent spawns `dsh` as an external
 *       binary (agent/dsh.ts), so unlike skill-creator (which resolves
 *       through its own deps) the data dir is located by candidates:
 *       JIXOAI_DESIGN_CATALOG_DIR (exact dir; the test isolation path)
 *       → $DSH_HOME/profiles/node_modules → ~/.dsh/profiles/node_modules
 *       (the default dsh install the spawned binary heals its profiles
 *       into). Every candidate is checked for existence; the FIRST hit
 *       wins and a total miss is a typed CatalogUnavailableError —
 *       never a silent empty gallery.
 *   [2] PROJECTION — provider → label (KNOWN_LABELS override or
 *       word-split prettify), api/baseURL from the first model that
 *       carries them, models narrowed to the fields the panel consumes
 *       (inputTypes/outputTypes are DROPPED: the kernel's bridge
 *       whitelist does not carry them — shipping them would be dead
 *       data); icon from provider-icons.generated.ts (dataURL, the
 *       letter-avatar fallback is the client's). Internal faux
 *       providers are excluded; KNOWN providers rank to the top, the
 *       rest alphabetical.
 *   [3] CACHE — keyed by the RESOLVED dir (a test that swaps
 *       JIXOAI_DESIGN_CATALOG_DIR gets a fresh read; the process
 *       catalog is stable between spawns). Failures are NOT cached —
 *       the next panel open retries (skill-creator precedent).
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { PROVIDER_ICONS } from './provider-icons.generated.ts';

/** the gallery entry the panel consumes (browser-safe projection) */
export interface CatalogModel {
  id: string;
  name?: string;
  image: boolean;
  contextWindow?: number;
  maxOutputTokens?: number;
  supportsReasoningEffort?: boolean;
  effortTiers?: string[];
}
export interface CatalogProvider {
  provider: string;
  label: string;
  api: string;
  baseURL: string;
  icon: string | null;
  models: CatalogModel[];
}

/** resolve failure — the panel degrades to the custom-endpoint form */
export class CatalogUnavailableError extends Error {}

/** headline providers rank first + display overrides (skill-creator twin) */
const KNOWN_LABELS: ReadonlyArray<readonly [string, string]> = [
  ['zai-coding-cn', 'Z.ai (智谱)'],
  ['zai', 'Z.ai'],
  ['moonshotai-cn', 'Kimi (月之暗面)'],
  ['moonshotai', 'Kimi'],
  ['deepseek', 'DeepSeek'],
  ['minimax-cn', 'MiniMax'],
  ['minimax', 'MiniMax (Global)'],
  ['qwen-token-plan-cn', '阿里云百炼'],
  ['openai', 'OpenAI'],
  ['anthropic', 'Anthropic'],
  ['google', 'Google Gemini'],
];

/** internal/test providers never enter the gallery */
const EXCLUDED_PROVIDERS = new Set(['faux']);

function labelOf(provider: string): string {
  for (const [id, label] of KNOWN_LABELS) {
    if (id === provider) return label;
  }
  const cn = provider.endsWith('-cn');
  const base = cn ? provider.slice(0, -3) : provider;
  const pretty = base
    .split(/[-_]/)
    .map((word) => (word.length > 0 ? word[0]!.toUpperCase() + word.slice(1) : word))
    .join(' ');
  return cn ? `${pretty} · CN` : pretty;
}

/** the pi-ai data dir candidates, in the proposal's THREE-step chain
 *  order: [1] JIXOAI_DESIGN_CATALOG_DIR (exact dir; the test isolation
 *  path) → [2] $DSH_HOME/profiles/node_modules (the env-declared home,
 *  defaulting to ~/.dsh) → [3] ~/.dsh/profiles/node_modules (the
 *  default install — also tried when an explicit-but-dead DSH_HOME hid
 *  it; Codex r2 P1: the chain must match the spec exactly, no extra
 *  candidates). PURE in (env, home) for direct testing. */
export function catalogDataDirCandidates(
  env: { JIXOAI_DESIGN_CATALOG_DIR?: string | undefined; DSH_HOME?: string | undefined },
  home: string,
): string[] {
  const piAi = (...parts: string[]): string => path.join(...parts, '@earendil-works', 'pi-ai', 'dist', 'providers', 'data');
  const candidates: string[] = [];
  if (env.JIXOAI_DESIGN_CATALOG_DIR !== undefined && env.JIXOAI_DESIGN_CATALOG_DIR !== '') {
    candidates.push(env.JIXOAI_DESIGN_CATALOG_DIR);
  }
  const dshHome = env.DSH_HOME ?? path.join(home, '.dsh');
  const defaultDsh = path.join(home, '.dsh');
  candidates.push(piAi(dshHome, 'profiles', 'node_modules'));
  if (dshHome !== defaultDsh) candidates.push(piAi(defaultDsh, 'profiles', 'node_modules'));
  // order-preserving dedup (r2 partial: an env override equal to a home
  // anchor must not probe the same dir twice)
  return [...new Set(candidates)];
}

/** the first EXISTING directory among the candidates; a total miss is
 *  the typed error (exported as the resolver seam — the pure candidates
 *  function + this make the chain testable without touching the real
 *  home directory) */
export function resolveFromCandidates(candidates: readonly string[]): string {
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return candidate;
    } catch {
      // unreadable candidate = miss, try the next anchor
    }
  }
  throw new CatalogUnavailableError(`pi-ai catalog data not found (tried: ${candidates.join(' | ')})`);
}

function resolveCatalogDataDir(): string {
  return resolveFromCandidates(catalogDataDirCandidates(process.env, os.homedir()));
}

/** one catalog JSON narrowed at runtime: { [api]: { [modelId]: model } } */
interface RawModel {
  id: string;
  name?: string;
  api: string;
  baseUrl?: string;
  contextWindow?: number;
  input?: unknown;
  supportsReasoningEffort?: boolean;
  maxTokens?: number;
  effortTiers?: string[];
}
function parseCatalogFile(raw: unknown): RawModel[] {
  if (typeof raw !== 'object' || raw === null) return [];
  const models: RawModel[] = [];
  for (const byApi of Object.values(raw as Record<string, unknown>)) {
    if (typeof byApi !== 'object' || byApi === null) continue;
    for (const model of Object.values(byApi as Record<string, unknown>)) {
      if (typeof model !== 'object' || model === null) continue;
      const m = model as {
        id?: unknown;
        name?: unknown;
        api?: unknown;
        baseUrl?: unknown;
        contextWindow?: unknown;
        input?: unknown;
        compat?: unknown;
        maxTokens?: unknown;
        thinkingLevelMap?: unknown;
      };
      if (typeof m.id !== 'string' || typeof m.api !== 'string') continue;
      const compat = typeof m.compat === 'object' && m.compat !== null
        ? (m.compat as { supportsReasoningEffort?: unknown })
        : {};
      const effortTiers: string[] = [];
      if (typeof m.thinkingLevelMap === 'object' && m.thinkingLevelMap !== null && !Array.isArray(m.thinkingLevelMap)) {
        for (const tier of Object.keys(m.thinkingLevelMap)) {
          if (tier !== 'off' && tier.length > 0) effortTiers.push(tier);
        }
      }
      models.push({
        id: m.id,
        name: typeof m.name === 'string' ? m.name : undefined,
        api: m.api,
        baseUrl: typeof m.baseUrl === 'string' ? m.baseUrl : undefined,
        contextWindow:
          typeof m.contextWindow === 'number' && Number.isInteger(m.contextWindow) && m.contextWindow > 0
            ? m.contextWindow
            : undefined,
        input: m.input,
        supportsReasoningEffort:
          typeof compat.supportsReasoningEffort === 'boolean' ? compat.supportsReasoningEffort : undefined,
        maxTokens:
          typeof m.maxTokens === 'number' && Number.isInteger(m.maxTokens) && m.maxTokens > 0
            ? m.maxTokens
            : undefined,
        effortTiers: effortTiers.length > 0 ? [...new Set(effortTiers)].sort() : undefined,
      });
    }
  }
  return models;
}

/** success cache keyed by the resolved dir (env swaps get a fresh read) */
const cache = new Map<string, CatalogProvider[]>();

/** the full provider catalog (headline providers first, rest alphabetical) */
export function listModelProviders(): CatalogProvider[] {
  const dataDir = resolveCatalogDataDir();
  const hit = cache.get(dataDir);
  if (hit !== undefined) return hit;
  const entries: CatalogProvider[] = [];
  for (const file of fs.readdirSync(dataDir)) {
    if (!file.endsWith('.json')) continue;
    const provider = file.slice(0, -'.json'.length);
    if (EXCLUDED_PROVIDERS.has(provider)) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
    } catch {
      continue; // a corrupt entry is dropped, not fatal (set-read law)
    }
    const models = parseCatalogFile(parsed);
    if (models.length === 0) continue;
    const api = models[0]!.api;
    const baseURL = models.find((model) => model.baseUrl)?.baseUrl;
    if (baseURL === undefined) continue;
    entries.push({
      provider,
      label: labelOf(provider),
      api,
      baseURL,
      icon: PROVIDER_ICONS[provider] ?? null,
      models: models.map((model) => ({
        id: model.id,
        ...(model.name !== undefined ? { name: model.name } : {}),
        image: Array.isArray(model.input) && model.input.includes('image'),
        ...(model.contextWindow !== undefined ? { contextWindow: model.contextWindow } : {}),
        ...(model.maxTokens !== undefined ? { maxOutputTokens: model.maxTokens } : {}),
        ...(model.supportsReasoningEffort !== undefined ? { supportsReasoningEffort: model.supportsReasoningEffort } : {}),
        ...(model.effortTiers !== undefined ? { effortTiers: model.effortTiers } : {}),
      })),
    });
  }
  const rank = new Map(KNOWN_LABELS.map(([id], index) => [id, index]));
  entries.sort((a, b) => {
    const ra = rank.get(a.provider) ?? Number.MAX_SAFE_INTEGER;
    const rb = rank.get(b.provider) ?? Number.MAX_SAFE_INTEGER;
    return ra !== rb ? ra - rb : a.label.localeCompare(b.label);
  });
  cache.set(dataDir, entries);
  return entries;
}

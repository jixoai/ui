/**
 * @jixoai/ui-design (knowledge) — the runtime snapshot reader (T6).
 *
 * Orthogonal intent (1): read the COMMITTED snapshot.json (generated
 * at repository build time by build.ts) with zero dependency on
 * repository paths — consumers and the studio guide share this one
 * source. Node-side only (create.ts serves it to the browser at
 * /__design__/api/knowledge.json).
 *
 * Original need: Owner 2026-09-11 (design-studio T6).
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { KnowledgeSnapshot } from './build.ts';

export type { KnowledgeSnapshot, KnowledgeGroup, KnowledgeItem, PromptLayer } from './build.ts';

const SNAPSHOT_URL = new URL('./snapshot.json', import.meta.url);

let cached: KnowledgeSnapshot | null = null;

/** the committed knowledge pack (cached per process; snapshot changes need a restart) */
export function loadKnowledgePack(): KnowledgeSnapshot {
  cached ??= JSON.parse(readFileSync(fileURLToPath(SNAPSHOT_URL), 'utf8')) as KnowledgeSnapshot;
  return cached;
}

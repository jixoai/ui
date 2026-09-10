/**
 * @jixoai/ui-design — the public surface (design-studio T3).
 *
 * Orthogonal intent (1): the node-side exports for the design CLI and
 * embedding hosts (probe, server factory, scaffold, agent seam,
 * knowledge reader). BROWSER-side modules (the studio shell, the
 * mount helper) stay behind the `./studio` subpath — importing them
 * from node would drag .svelte files through the node loader.
 *
 * Original need: Owner 2026-09-11 (`jixoai-ui design`). Source-
 * distributed package (css-laws precedent): main points HERE, vite
 * transforms on serve, no dist build.
 */

export { probeDesignHost, ITEM_ALIAS_PREFIX } from './server/probe.ts';
export type { DesignHostInfo } from './server/probe.ts';
export { createDesignViteServer } from './server/create.ts';
export type { CreateDesignServerOptions } from './server/create.ts';
export { scanPrototypes } from './server/manifest.ts';
export type { ManifestEntry, ManifestFrame } from './server/manifest.ts';
export { resolvePackageEntry } from './server/resolver.ts';
export { scaffoldWorkspace } from './scaffold/scaffold.ts';
export type { ScaffoldResult } from './scaffold/scaffold.ts';
export { createEchoAgent, resolveDesignFile, DesignPathEscapeError } from './agent/echo.ts';
export { createNoneAgent } from './agent/none.ts';
export { createDshAgent, dshPreflight, composeDshJob } from './agent/dsh.ts';
export { agentMiddleware, CHAT_PATH, AGENT_INFO_PATH } from './agent/sse.ts';
export type { DesignAgent, AgentEvent, AgentInfo } from './agent/types.ts';
export { loadKnowledgePack } from './knowledge/knowledge.ts';
export { buildKnowledgePack } from './knowledge/build.ts';
export type { KnowledgeSnapshot, KnowledgeGroup, KnowledgeItem, PromptLayer } from './knowledge/build.ts';

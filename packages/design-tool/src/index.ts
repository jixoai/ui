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
export { createDshAgent, dshPreflight, composeDshJob, renderDesignPatch } from './agent/dsh.ts';
export { agentMiddleware, CHAT_PATH, AGENT_INFO_PATH } from './agent/sse.ts';
export type { DesignAgent, AgentEvent, AgentInfo } from './agent/types.ts';
export { loadKnowledgePack } from './knowledge/knowledge.ts';
export { buildKnowledgePack } from './knowledge/build.ts';
export type { KnowledgeSnapshot, KnowledgeGroup, KnowledgeItem, PromptLayer } from './knowledge/build.ts';
// pipeline (r2 rev2, git release model): design repo, design file
// artifacts, promotion, three-way apply via git merge-file
export {
  initDesignRepo,
  isDesignRepo,
  saveDesignCommit,
  releaseDesignTag,
  listReleaseTags,
  currentReleaseTag,
  runGit,
  listTree,
} from './pipeline/design-repo.ts';
export type { ReleaseTag, ReleaseResult, SaveCommitResult, MergeFileResult, ParsedConflict } from './pipeline/design-repo.ts';
export { DesignRepoError } from './pipeline/design-repo.ts';
export {
  openDesignFile,
  parseDesignFile,
  exportDesignFile,
  designFilePath,
  DESIGN_FILE_SCHEMA,
  DESIGN_FILE_TYPE,
  DESIGN_FILE_EXT,
  DESIGN_FILES_DIR,
} from './pipeline/design-file.ts';
export type { DesignFile, DesignChange, DesignFileEntry, OpenDesignFileResult } from './pipeline/design-file.ts';
export { DesignFileError } from './pipeline/design-file.ts';
export {
  rewriteSpecifiers,
  buildRewriteAliases,
  baseContentOf,
  repoPathOf,
  promote,
  promotionStatus,
  promotionsPath,
  readPromotions,
  PROMOTIONS_PATH,
  PROMOTED_SUBTREES,
  DEFAULT_PROMOTE_DIR,
} from './pipeline/promote.ts';
export type { PromotionRecord, PromoteOptions, PromoteResult, PromotionStatus, PromotionFileStatus, ChangelogEntry } from './pipeline/promote.ts';
export { PromotionExistsError } from './pipeline/promote.ts';
export { applyDrift } from './pipeline/apply.ts';
export type { ApplyReport, ApplyFileReport, ApplyDriftOptions, ApplySkipReason, AppliedConflict } from './pipeline/apply.ts';
export { unifiedDiff, diffHunks } from './pipeline/diff.ts';
export type { DiffHunk } from './pipeline/diff.ts';
// metadata + property editing (r2 T7/T8): the on-demand schema
// endpoint and the CAS-arbitrated source editor
export { metaMiddleware, resolveMetaResponse, META_PATH_PREFIX } from './server/meta/endpoint.ts';
export {
  extractItemSchema,
  XUI_KEYS,
  AnnotationValidationError,
  TypescriptUnavailableError,
} from './server/meta/extract.ts';
export type { ItemSchemaResult, SchemaObject, SchemaPropNode, XUIPanel, ExtractOptions } from './server/meta/extract.ts';
export {
  propEditMiddleware,
  resolvePropEditRequest,
  applyPropEdit,
  dryRunUsage,
  locateUsages,
  PROP_EDIT_PATH,
} from './server/prop-edit.ts';
export type { PropEditRequest, PropEditResponse, UsageValues, EditOutcome, EditValue, FileOps } from './server/prop-edit.ts';

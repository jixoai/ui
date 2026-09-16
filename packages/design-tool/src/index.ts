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
export type { ReleaseTag, ReleaseResult, SaveCommitResult, SaveDesignCommitOptions, MergeFileResult, ParsedConflict } from './pipeline/design-repo.ts';
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
// metadata (r2 T7): the on-demand schema endpoint
export { metaMiddleware, resolveMetaResponse, META_PATH_PREFIX } from './server/meta/endpoint.ts';
export {
  extractItemSchema,
  XUI_KEYS,
  AnnotationValidationError,
  TypescriptUnavailableError,
} from './server/meta/extract.ts';
export type { ItemSchemaResult, SchemaObject, SchemaPropNode, XUIPanel, ExtractOptions } from './server/meta/extract.ts';
// the §3 serializer authority (the prop-edit file-CAS lane retired by
// collab-protocol M7a; collab/bridge.ts consumes these two)
export { renderValue, serializeTemplateText } from './server/prop-edit.ts';
export type { EditValue } from './server/prop-edit.ts';
// the panel's collab op lane (M7a): usage/admit/sync/undo over the
// workspace's hosted kernel
export {
  collabApiMiddleware,
  resolveCollabApiRequest,
  resolveUsage,
  envelopeFromJson,
  admissionToJson,
  receiptToJson,
  errorToJson,
  pageOfFile,
  COLLAB_API_BASE,
  PANEL_ACTOR,
} from './server/collab-api.ts';
export type { CollabApiResponse, UsageResolution } from './server/collab-api.ts';
// the panel's browser-side collab client (M7a): the LoroDoc mirror +
// overlay + §6 conflict-card state machine
export {
  PanelCollabClient,
  fetchTransport,
  containerKeyOf,
  bufferSlugOf,
  diffText,
  parsePropLiteral,
  renderPropLiteral,
  bytesToB64,
  b64ToBytes,
  PANEL_ACTOR as PANEL_CLIENT_ACTOR,
} from './studio/panel-collab.ts';
export type {
  PanelTransport,
  PanelUsageInfo,
  PanelCollabSnapshot,
  PanelBufferState,
  PanelConflictState,
  TextDiff,
  PropValue,
  SyncCursorJson,
} from './studio/panel-collab.ts';
// the dogfooding inventory (r3 §2.3): the registry items the studio
// chrome imports via #jixoai/ — pure data, node-safe
export { STUDIO_CHROME_ITEMS } from './studio/chrome-items.ts';
// the prebuilt studio bundle (issue #18): input hashing, the build
// manifest, and the staleness oracle the CLI warns from — node-side
export {
  STUDIO_DIST_DIR,
  STUDIO_DIST_DIRNAME,
  computeStudioInputsHash,
  studioInputRoots,
  readStudioBuildManifest,
  writeStudioBuildManifest,
  studioDistStatus,
  mimeFor,
  serveStudioIndex,
  serveStudioAsset,
  resolveStudioAsset,
  studioMissingGuidance,
} from './server/studio-dist.ts';
export type {
  StudioBuildManifest,
  StudioDistState,
  StudioDistStatus,
} from './server/studio-dist.ts';
// the per-file svelte alias table shared by the dev server and the
// studio static build (scripts/build-studio.mjs)
export { svelteFileAliases } from './server/svelte-aliases.ts';


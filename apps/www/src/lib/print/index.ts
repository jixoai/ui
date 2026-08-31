/**
 * jixoai print layer barrel (lib/print/, print-pipeline 2026-08-30).
 *
 * The pipeline that replaced the parallel Paged* family: existing
 * pages keep their normal web flow; the print layer wraps the docs
 * content root, freezes one snapshot per transaction, and feeds a
 * DETACHED CLONE to the paged.js kernel (sim preview and direct
 * print share the one artifact).
 *
 * Site-only docs infrastructure — never a registry item; the pagedjs
 * dependency stays a www devDep consumed through one lazy,
 * client-only dynamic import (pipeline.svelte.ts).
 */
import './sim-shell.css';

export { default as PrintDoc } from './print-doc.svelte';
export { default as PrintControls } from './print-controls.svelte';

export {
  prepareSnapshot,
  transferDelay,
  parseTimeList,
  parseIterationList,
  slotIndexOf,
  elementPath,
  resolvePath,
  classifySlot,
  captureAnimations,
  makeRestoreToken,
  planFrameTransfer,
  applyFrameTransfer,
  splitPreLines,
  injectTocNav,
  hashString,
  hashSnapshot,
  type DiagnosticCode,
  type PrintDiagnostic,
  type FrozenSnapshot,
  type PrepareOptions,
  type PrintProgress,
  type ComputedAnimationInfo,
  type CapturedAnimation,
  type ElementWrite,
  type SlotWrite,
} from './freeze.svelte';

export {
  createPrintPipeline,
  type PrintPipeline,
  type PrintStatus,
  type PrintRunOptions,
  type PrintArtifactMetadata,
} from './pipeline.svelte';

export {
  parsePageConfig,
  compilePageCss,
  sheetMm,
  NAMED_SIZE_MM,
  PageConfigError,
  type PrintPageConfig,
  type PageSize,
  type StructuredSize,
  type StructuredMargin,
  type LengthUnit,
  type Marks,
  type HeaderFooterToken,
  type MarginBoxSlot,
} from './page-config';

export {
  printPlugins,
  printDensityPlugin,
  printHuePlugin,
  printMediumGate,
  PRINT_PINNED_HUE,
} from './context-plugin';

export { PRINT_PIPELINE_KEY, getPrintPipeline } from './print-context';

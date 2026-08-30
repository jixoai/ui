/**
 * jixoai paged-doc-family barrel (site-only, zero dependencies).
 *
 * The publication family for component documentation: PagedDoc and
 * its parts render one document tree whose web mode is a pageless
 * immersive flow and whose pagination is the print-media projection.
 * No pagedjs, no npm runtime — counters, floats and context only
 * (scripts/verify-print.mjs asserts the import surface).
 *
 * Part granularity per the tabs precedent: named exports, no Root
 * aliases; the medium contract and the registry ship alongside for
 * consumers that compose outside the family.
 */
import './print-projection.css';

export { default as PagedDoc } from './doc.svelte';
export { default as PagedSection } from './section.svelte';
export { default as PagedFigure } from './figure.svelte';
export { default as PagedAside } from './aside.svelte';
export { default as PagedRef } from './ref.svelte';
export { default as PagedToC } from './toc.svelte';
export { default as PagedTable } from './table.svelte';
export { default as PagedCode } from './code.svelte';
export { default as PagedBlock } from './block.svelte';

export {
  PAGED_KEY,
  getPagedDoc,
  type PagedCounterGroup,
  type PagedEntry,
  type PagedDocContext,
} from './registry.svelte';

export {
  MEDIUM_KEY,
  PRINT_SIM_ATTR,
  deriveMedium,
  isPrintProjection,
  getMedium,
  type MediumState,
  type MediumContext,
} from '../medium.svelte';

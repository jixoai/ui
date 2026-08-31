/**
 * jixoai print context key (lib/print/print-context.ts) — the tiny
 * seam the controls use to find their layer's pipeline instance
 * without import cycles.
 */
import { getContext } from 'svelte';
import type { PrintPipeline } from './pipeline.svelte';

export const PRINT_PIPELINE_KEY = Symbol('jx-print-pipeline');

/** the nearest print-doc's pipeline — undefined outside a layer */
export function getPrintPipeline(): PrintPipeline | undefined {
  return getContext<PrintPipeline | undefined>(PRINT_PIPELINE_KEY);
}

// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'watermark-live', label: 'watermark · live' },
  { id: 'recipe-aspect', label: 'aspect-ratio' },
  { id: 'recipe-data-table', label: 'data-table' },
  { id: 'recipe-chart', label: 'chart' },
  { id: 'recipe-sidebar', label: 'sidebar' },
  { id: 'recipe-watermark', label: 'watermark' },
  { id: 'recipe-image-preview', label: 'image preview' },
  { id: 'recipe-flexgrid', label: 'flex / grid' },
  { id: 'recipe-segmented', label: 'segmented' },
  { id: 'recipe-list', label: 'list' },
  { id: 'recipe-autocomplete', label: 'autoComplete' },
  { id: 'recipe-typography', label: 'typography' },
  { id: 'recipe-mentions', label: 'mentions' },
  { id: 'recipe-tour', label: 'tour' },
];

export const load = () => ({ toc });

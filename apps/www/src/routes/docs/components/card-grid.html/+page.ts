// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn
// task 19): +overview; the pre-existing ids kept for deep links; the
// universal-props demo folded into the axes section (task 19).
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'usage', label: 'Usage' },
  { id: 'subgrid-law', label: 'Rows live on the grid' },
  { id: 'types', label: 'Types' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'theming', label: 'Density and tokens' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'api', label: 'API' },
];

export const load = () => ({ toc });

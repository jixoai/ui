// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn task 36).
// install + see-also are chrome OUT of the toc; overview and the
// frame-width laws (law) are new; theming folded into the axes layer;
// the recipe suite keeps its ability-named entries (table-grid-toolbar).
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'table-workbench', label: 'live demo' },
  { id: 'usage', label: 'Usage' },
  { id: 'examples', label: 'Examples' },
  { id: 'table-sortable', label: 'with sortable headers' },
  { id: 'table-filter-row', label: 'with filter row and facets' },
  { id: 'table-pagination', label: 'with pagination footer' },
  { id: 'table-selection', label: 'with row selection' },
  { id: 'table-row-actions', label: 'with row actions and column visibility' },
  { id: 'table-sticky-header', label: 'with sticky header' },
  { id: 'table-tasks', label: 'the tasks table' },
  { id: 'table-semantic-set', label: 'semantic set' },
  { id: 'law', label: 'The frame-width laws' },
  { id: 'types', label: 'Responsive modes' },
  { id: 'api', label: 'API' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

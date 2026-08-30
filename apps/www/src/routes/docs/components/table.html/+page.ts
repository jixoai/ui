// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// 2026-08-30 (table-grid-toolbar): the recipe suite lands between
// usage and the semantic set — ability-named, one per demo.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'install', label: 'Install' },
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
  { id: 'types', label: 'Responsive modes' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'theming', label: 'Density and tokens' },
  { id: 'api', label: 'API' },
  { id: 'see-also', label: 'See also' },
];

export const load = () => ({ toc });

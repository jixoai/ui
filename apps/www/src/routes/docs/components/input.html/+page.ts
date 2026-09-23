// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

// DOM order (task 104: the rail now walks the page top-to-bottom —
// capabilities and picker-bridge were unrail-ed, the order was stale)
const toc: TocSection[] = [
  { id: 'true', label: 'The field, truly' },
  { id: 'deploy', label: 'Deploy field' },
  { id: 'all-types', label: 'All native types' },
  { id: 'slots', label: 'Slot system' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'error-wiring', label: 'Label + error wiring' },
  { id: 'picker-bridge', label: 'The picker bridge' },
  { id: 'types', label: 'Types' },
  { id: 'usage', label: 'Usage' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'theming', label: 'Theming' },
  { id: 'universal-props', label: 'Universal props' },
  { id: 'api', label: 'API' },
];

export const load = () => ({ toc });

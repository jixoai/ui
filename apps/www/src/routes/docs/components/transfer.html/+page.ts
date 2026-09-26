// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn task 46;
// install + see-also stay chrome OUT, the trio (theming → api → the
// eight axes → accessibility) closes the rail).
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'live-demo', label: 'Live demo' },
  { id: 'usage', label: 'Usage' },
  { id: 'examples', label: 'Examples' },
  { id: 'transfer-one-way', label: 'One-way moves' },
  { id: 'transfer-select-all', label: 'Batch select-all' },
  { id: 'types', label: 'Types' },
  { id: 'theming', label: 'Theming' },
  { id: 'api', label: 'API' },
  { id: 'universal-props', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

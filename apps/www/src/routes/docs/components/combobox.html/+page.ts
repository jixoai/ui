// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn
// task 24): +overview; every pre-existing id kept for deep links; the
// canvas carries no id and lists no entry.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'usage', label: 'Usage' },
  { id: 'demo', label: 'The searchable select' },
  { id: 'multiple', label: 'multiple + showClear' },
  { id: 'rtl', label: 'RTL geometry' },
  { id: 'types', label: 'Types' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'theming', label: 'Density and tokens' },
  { id: 'universal-props', label: 'The eight axes' },
  { id: 'api', label: 'API' },
];

export const load = () => ({ toc });

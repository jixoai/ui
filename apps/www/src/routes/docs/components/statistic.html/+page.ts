// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// 2026-08-30 (table-grid-toolbar): install + examples + the two recipes.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'install', label: 'Install' },
  { id: 'statistic-demo', label: 'live demo' },
  { id: 'usage', label: 'Usage' },
  { id: 'examples', label: 'Examples' },
  { id: 'statistic-countdown', label: 'with countdown' },
  { id: 'statistic-affix-precision', label: 'with prefix, suffix and precision' },
  { id: 'types', label: 'Metric states' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'theming', label: 'Density and tokens' },
  { id: 'api', label: 'API' },
  { id: 'see-also', label: 'See also' },
];

export const load = () => ({ toc });

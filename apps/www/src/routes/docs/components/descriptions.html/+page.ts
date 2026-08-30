// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// 2026-08-30 (table-grid-toolbar): install + examples + the three recipes.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'install', label: 'Install' },
  { id: 'descriptions-demo', label: 'live demo' },
  { id: 'usage', label: 'Usage' },
  { id: 'examples', label: 'Examples' },
  { id: 'descriptions-vertical', label: 'with vertical terms' },
  { id: 'descriptions-responsive', label: 'with responsive columns' },
  { id: 'descriptions-extra', label: 'with extra header actions' },
  { id: 'types', label: 'Description layouts' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'theming', label: 'Density and tokens' },
  { id: 'api', label: 'API' },
  { id: 'see-also', label: 'See also' },
];

export const load = () => ({ toc });

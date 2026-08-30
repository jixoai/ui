// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'install', label: 'Install' },
  { id: 'igroup-demo', label: 'live demo' },
  { id: 'usage', label: 'Usage' },
  { id: 'examples', label: 'Examples' },
  { id: 'igroup-select', label: 'with a select add-on' },
  { id: 'igroup-form', label: 'in a submitted form' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'api', label: 'API' },
  { id: 'theming', label: 'Theming' },
  { id: 'see-also', label: 'See also' },
];

export const load = () => ({ toc });

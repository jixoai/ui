// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'usage', label: 'Usage' },
  { id: 'demo', label: 'The painted switch' },
  { id: 'in-a-form', label: 'In a submitted form' },
  { id: 'types', label: 'Types' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'theming', label: 'Theming' },
  { id: 'universal-props', label: 'Universal props' },
  { id: 'api', label: 'API' },
  { id: 'see-also', label: 'See also' },
];

export const load = () => ({ toc });

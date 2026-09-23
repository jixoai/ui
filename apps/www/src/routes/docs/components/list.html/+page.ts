// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'usage', label: 'Usage' },
  { id: 'shapes', label: 'The two shapes' },
  { id: 'markers', label: 'The marker matrix' },
  { id: 'nav', label: 'Nav mode' },
  { id: 'task-items', label: 'Task lists' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'universal-props', label: 'Universal props' },
  { id: 'api', label: 'API' },
];

export const load = () => ({ toc });

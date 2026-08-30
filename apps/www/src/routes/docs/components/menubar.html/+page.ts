// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'menubar-demo', label: 'live demo' },
  { id: 'types', label: 'types' },
  { id: 'usage', label: 'usage' },
  { id: 'accessibility', label: 'accessibility' },
  { id: 'theming', label: 'theming' },
  { id: 'api', label: 'api' },
];

export const load = () => ({ toc });

// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'dropdown-menu-demo', label: 'live demo' },
  { id: 'dropdown-menu-base', label: 'platform / component split' },
];

export const load = () => ({ toc });

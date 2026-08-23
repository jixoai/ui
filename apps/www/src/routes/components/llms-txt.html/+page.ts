// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc.svelte';

const toc: TocSection[] = [
  { id: 'wiring', label: 'Wiring' },
  { id: 'laws', label: 'The laws' },
];

export const load = () => ({ toc });

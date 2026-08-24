// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'all-types', label: 'All native types' },
  { id: 'slots', label: 'Slot system' },
  { id: 'error-wiring', label: 'Label + error wiring' },
];

export const load = () => ({ toc });

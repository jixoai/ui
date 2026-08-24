// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'demo', label: 'Native first' },
  { id: 'error-wiring', label: 'Label + error wiring' },
  { id: 'in-a-form', label: 'In a submitted form' },
];

export const load = () => ({ toc });

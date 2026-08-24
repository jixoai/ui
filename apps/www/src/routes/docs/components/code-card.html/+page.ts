// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'code-card-workbench', label: 'workbench' },
  { id: 'code-card-scroll-law', label: 'scroll law' },
  { id: 'code-card-law', label: 'the Shiki contract' },
];

export const load = () => ({ toc });

// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc.svelte';

const toc: TocSection[] = [
  { id: 'no-flash', label: 'The no-flash bootstrap' },
  { id: 'theme-contract', label: 'The shared theme contract' },
];

export const load = () => ({ toc });

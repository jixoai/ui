// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc.svelte';

const toc: TocSection[] = [
  { id: 'table-workbench', label: 'frame-width workbench' },
  { id: 'table-semantic-set', label: 'semantic set' },
];

export const load = () => ({ toc });

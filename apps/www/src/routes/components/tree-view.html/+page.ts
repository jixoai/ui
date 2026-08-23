// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc.svelte';

const toc: TocSection[] = [
  { id: 'tree-view-effects', label: 'the seven effects' },
  { id: 'tree-view-extensions', label: 'suffix actions & disabled' },
  { id: 'tree-view-law', label: 'the tree keyboard contract' },
];

export const load = () => ({ toc });

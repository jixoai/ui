// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'tree-view-effects', label: 'the seven effects' },
  { id: 'tree-view-extensions', label: 'suffix actions & disabled' },
  { id: 'tree-view-law', label: 'the tree keyboard contract' },
  { id: 'types', label: 'Types' },
  { id: 'usage', label: 'Usage' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'theming', label: 'Theming' },
  { id: 'api', label: 'API' },
];

export const load = () => ({ toc });

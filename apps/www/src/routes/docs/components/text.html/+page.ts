// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'usage', label: 'Usage' },
  { id: 'matrix', label: 'The mark matrix' },
  { id: 'modifiers', label: 'Modifier playground' },
  { id: 'equivalence', label: 'Sugar ≡ base' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'api', label: 'API' },
];

export const load = () => ({ toc });

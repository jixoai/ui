// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'directions', label: 'direction' },
  { id: 'axis', label: 'axis' },
  { id: 'node', label: 'the 9-grid node' },
  { id: 'line', label: 'the line seam' },
  { id: 'animation', label: 'animation' },
  { id: 'types', label: 'types' },
  { id: 'usage', label: 'usage' },
  { id: 'accessibility', label: 'accessibility' },
  { id: 'theming', label: 'theming' },
  { id: 'api', label: 'api' },
];

export const load = () => ({ toc });

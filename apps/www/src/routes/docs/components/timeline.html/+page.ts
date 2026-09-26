// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'families-chronology', label: 'families · chronology' },
  { id: 'families-tracking', label: 'families · tracking' },
  { id: 'families-activity', label: 'families · git + activity' },
  { id: 'families-axis', label: 'families · axis forms' },
  { id: 'node', label: 'the 9-grid node' },
  { id: 'spine', label: 'the drawn spine' },
  { id: 'value', label: 'the value contract' },
  { id: 'directions', label: 'direction' },
  { id: 'matrix', label: 'geometry matrix' },
  { id: 'animation', label: 'animation' },
  { id: 'types', label: 'types' },
  { id: 'usage', label: 'usage' },
  { id: 'accessibility', label: 'accessibility' },
  { id: 'theming', label: 'theming' },
  { id: 'universal-props', label: 'Universal props' },
  { id: 'api', label: 'api' },
];

export const load = () => ({ toc });

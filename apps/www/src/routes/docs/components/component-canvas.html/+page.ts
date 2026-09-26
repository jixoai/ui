// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn task 7).
// Survivor ids from the W7-era page (canvas-workbench / usage /
// accessibility / api / same-source) are kept for deep links; the
// canvas-law content folded into Overview, types/theming into the axes
// section.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'usage', label: 'Usage' },
  { id: 'canvas-workbench', label: 'the recursive workbench' },
  { id: 'api', label: 'Props' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'same-source', label: 'Same-source' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

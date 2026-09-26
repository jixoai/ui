// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn r2;
// the r1 array predated the restructure — dead #theming anchor, no
// universal-props row, stale labels).
const toc: TocSection[] = [
  { id: 'accordion-base', label: 'Overview' },
  { id: 'usage', label: 'Usage' },
  { id: 'types', label: 'Postures' },
  { id: 'api', label: 'Props' },
  { id: 'universal-props', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

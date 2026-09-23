// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn task 32).
// install + see-also are chrome OUT of the toc; overview, the live demo,
// the composition shells, the scenery contract (law), and the axes are
// new; the old skeleton-base section folded into law + accessibility and
// theming folded into axes.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'skeleton-demo', label: 'live demo' },
  { id: 'shells', label: 'Composition shells' },
  { id: 'law', label: 'The scenery contract' },
  { id: 'types', label: 'Postures' },
  { id: 'usage', label: 'Usage' },
  { id: 'api', label: 'API' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

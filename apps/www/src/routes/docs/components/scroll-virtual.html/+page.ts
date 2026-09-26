// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn task 30).
// install + see-also are chrome OUT of the toc; overview, the live
// windowing demo, the thin-coupling contract (law), and the axes are new;
// the old skeleton's theming section folded into axes.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'virtual-demo', label: 'live demo' },
  { id: 'law', label: 'The thin-coupling contract' },
  { id: 'types', label: 'Postures' },
  { id: 'usage', label: 'Usage' },
  { id: 'api', label: 'API' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

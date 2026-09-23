// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn task 33).
// install + see-also are chrome OUT of the toc; overview, the scenery law,
// the postures, and the measured eight-axes layer are new; the old theming
// section folded into the axes TokenTable.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'stack-workbench', label: 'live demo' },
  { id: 'gap-ladder', label: 'The gap ladder' },
  { id: 'law', label: 'The flow primitive' },
  { id: 'postures', label: 'Postures' },
  { id: 'usage', label: 'Usage' },
  { id: 'api', label: 'API' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

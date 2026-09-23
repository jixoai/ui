// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn task 34).
// install + see-also are chrome OUT of the toc; overview, the anchored
// alert law, and the measured eight-axes layer are new; theming folded
// into the axes TokenTable; the parts tables are the api slot.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'system-dialog-demo', label: 'live demo' },
  { id: 'system', label: 'System trio' },
  { id: 'law', label: 'The anchored alert' },
  { id: 'types', label: 'Types' },
  { id: 'usage', label: 'Usage' },
  { id: 'parts', label: 'API (parts)' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

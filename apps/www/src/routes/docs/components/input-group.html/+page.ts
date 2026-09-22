// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn task 17).
// Survivor ids kept for deep links; theming folded into the axes section;
// overview is new.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'igroup-demo', label: 'The joined field' },
  { id: 'usage', label: 'Usage' },
  { id: 'examples', label: 'Examples' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'api', label: 'Props' },
  { id: 'see-also', label: 'See also' },
];

export const load = () => ({ toc });

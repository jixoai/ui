// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'usage', label: 'Usage' },
  { id: 'demo', label: 'The selector, redrawn' },
  { id: 'in-a-form', label: 'In a submitted form' },
  { id: 'api', label: 'Props' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'bare', label: 'The bare branch' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'see-also', label: 'See also' },
];

export const load = () => ({ toc });

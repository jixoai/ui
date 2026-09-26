// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn task 22).
// Survivor ids kept for deep links; types + theming + universal-props
// folded (usage / axes / axes); overview is new.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'navmenu-demo', label: 'live demo' },
  { id: 'usage', label: 'usage' },
  { id: 'indicator', label: 'indicator' },
  { id: 'accessibility', label: 'accessibility' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'api', label: 'Props' },
];

export const load = () => ({ toc });

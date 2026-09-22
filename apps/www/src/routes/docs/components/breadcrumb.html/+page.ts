// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn r2).
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'usage', label: 'Usage' },
  { id: 'breadcrumb-demo', label: 'live demo' },
  { id: 'breadcrumb-fold', label: 'fold a long trail' },
  { id: 'breadcrumb-dropdown', label: 'the sibling jump' },
  { id: 'props', label: 'Props' },
  { id: 'breadcrumb-axes', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

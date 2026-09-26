// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype; docs-eight-axes-mdn
// task 27). install folds out of the toc; see-also ships without a
// toc entry; both keep their anchor ids.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'badge-indicator-demo', label: 'The indicator' },
  { id: 'badge-indicator-law', label: 'Presence rules' },
  { id: 'types', label: 'Postures' },
  { id: 'usage', label: 'Usage' },
  { id: 'api', label: 'Props' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

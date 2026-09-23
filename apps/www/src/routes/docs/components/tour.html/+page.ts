// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn task 45;
// install + see-also stay chrome OUT, the trio (theming → api → the
// eight axes → accessibility) closes the rail).
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'live-demo', label: 'Live demo' },
  { id: 'usage', label: 'Usage' },
  { id: 'examples', label: 'Examples' },
  { id: 'tour-non-modal', label: 'Non-modal scroll' },
  { id: 'tour-placement', label: 'Placement control' },
  { id: 'tour-placement-table', label: 'The 12 placements' },
  { id: 'tour-indicators', label: 'Custom indicators' },
  { id: 'tour-card', label: 'The card(api) snippet' },
  { id: 'types', label: 'Types' },
  { id: 'theming', label: 'Theming' },
  { id: 'api', label: 'API' },
  { id: 'universal-props', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

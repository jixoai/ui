// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM exactly (MDN archetype, docs-eight-axes-mdn
// task 33) with the api → axes → accessibility trio LAST; chrome
// sections (install, see-also) are OUT of the toc — the BOARD ruling.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'live-demo', label: 'Live demo' },
  { id: 'zone', label: 'The ambient zone' },
  { id: 'anchors', label: 'Button or anchor' },
  { id: 'async', label: 'The async two-step' },
  { id: 'law', label: 'Why the shadow is the affordance' },
  { id: 'types', label: 'Types' },
  { id: 'usage', label: 'Usage' },
  { id: 'theming', label: 'Density and tokens' },
  { id: 'api', label: 'API' },
  { id: 'universal-props', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

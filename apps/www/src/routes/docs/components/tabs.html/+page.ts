// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn task 42;
// rebuilt from the outline-era data that listed five sections and missed
// seven — install + see-also stay chrome OUT, the trio (api → the eight
// axes → accessibility) closes the rail).
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'tabs-demo', label: 'Live demo' },
  { id: 'indicators', label: 'The indicator engine' },
  { id: 'anatomy', label: 'Trigger anatomy' },
  { id: 'layouts', label: 'Layouts' },
  { id: 'tabs-vertical', label: 'Vertical' },
  { id: 'custom-indicator', label: 'Own the paint' },
  { id: 'types', label: 'Activation' },
  { id: 'usage', label: 'Usage' },
  { id: 'theming', label: 'Theming' },
  { id: 'api', label: 'API' },
  { id: 'universal-props', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

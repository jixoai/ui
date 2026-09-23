// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn task 38).
// The outline-mode rail this page previously dogfooded retired — the
// data contract is the fleet-wide toc == DOM law; install + see-also
// stay chrome OUT; the trio (api → the eight axes → accessibility)
// closes the rail.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'live-demo', label: 'Live demo' },
  { id: 'capsule', label: 'The capsule law' },
  { id: 'chrome-params', label: 'Radius × width' },
  { id: 'platform-sibling', label: 'The platform sibling' },
  { id: 'the-kit', label: 'The shared kit' },
  { id: 'virtual-scrolling', label: 'Virtual scrolling' },
  { id: 'toc-metadata', label: 'Toc metadata' },
  { id: 'types', label: 'Types' },
  { id: 'usage', label: 'Usage' },
  { id: 'theming', label: 'Theming' },
  { id: 'api', label: 'API' },
  { id: 'universal-props', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

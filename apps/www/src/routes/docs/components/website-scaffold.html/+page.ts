// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM exactly (MDN archetype, docs-eight-axes-mdn
// task 70) with the api → axes → accessibility trio LAST; chrome
// sections (install, see-also) are OUT of the toc — the BOARD ruling.
//
// THE SELF-REFERENCE NOTE (the toc page's channel spine, inverted): this
// page RIDES the page-toc channel — the layout rail you see renders THIS
// array inside the scaffold's chrome cell, which is the component this
// page documents. The shell hosting it is website-scaffold — the family
// under the microscope. Host and documented, one surface, named.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'live-demo', label: 'This page is the demo' },
  { id: 'scaffold-base', label: 'What the platform gives' },
  { id: 'shell-law', label: 'The grid law' },
  { id: 'types', label: 'Types' },
  { id: 'usage', label: 'Usage' },
  { id: 'theming', label: 'Structural tokens' },
  { id: 'api', label: 'API' },
  { id: 'universal-props', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

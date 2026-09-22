// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM exactly (MDN archetype, docs-eight-axes-mdn
// task 27) with the api → axes → accessibility trio LAST; chrome
// sections (install, see-also) are OUT of the toc — the BOARD ruling.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'ghostty-term-workbench', label: 'live demo' },
  { id: 'degradation', label: 'Failure & degradation' },
  { id: 'density', label: 'Density & theming' },
  { id: 'ghostty-term-law', label: 'the wasm is the terminal' },
  { id: 'usage', label: 'Usage' },
  { id: 'api', label: 'API' },
  { id: 'universal-props', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

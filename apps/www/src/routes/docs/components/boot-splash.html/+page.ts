// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (docs-eight-axes-mdn task 34, MDN
// archetype): api → axes → accessibility; install/see-also are chrome
// and stay out; the toc ids match the page's section ids one for one.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'usage', label: 'Usage' },
  { id: 'boot-splash-workbench', label: 'The workbench' },
  { id: 'zero-css', label: 'The zero-css-file law' },
  { id: 'slots', label: 'The five slots' },
  { id: 'exits', label: 'Exit vocabulary' },
  { id: 'api', label: 'API' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

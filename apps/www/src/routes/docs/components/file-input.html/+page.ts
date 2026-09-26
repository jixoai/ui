// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn
// task 25): +overview; the pre-existing fi-* ids kept for deep links;
// the workbench canvas carries no toc entry.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'usage', label: 'Usage' },
  { id: 'fi-demo', label: 'live demo' },
  { id: 'fi-drop', label: 'The drop zone' },
  { id: 'fi-list', label: 'The file list' },
  { id: 'fi-variants', label: 'button variant · disabled' },
  { id: 'fi-overflow', label: 'Narrow hosts' },
  { id: 'types', label: 'Types' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'theming', label: 'Density and tokens' },
  { id: 'universal-props', label: 'The eight axes' },
  { id: 'api', label: 'API' },
];

export const load = () => ({ toc });

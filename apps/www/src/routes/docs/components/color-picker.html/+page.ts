// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// (docs-eight-axes-mdn task 16: the archetype order — the hand theming
// section retires into the axes table, the generated props lane lands.)
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'usage', label: 'Usage' },
  { id: 'demo', label: 'The picker' },
  { id: 'types', label: 'Lane shapes' },
  { id: 'catalogue', label: 'Bindings & errors' },
  { id: 'api', label: 'Props' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

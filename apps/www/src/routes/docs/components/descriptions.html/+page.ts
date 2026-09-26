// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// (docs-eight-axes-mdn task 17: the archetype order — install folds out
// of the toc, the hand theming section retires into the axes table, the
// generated props lane lands, see-also ships without a toc entry.)
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'usage', label: 'Usage' },
  { id: 'descriptions-demo', label: 'live demo' },
  { id: 'types', label: 'Description layouts' },
  { id: 'descriptions-vertical', label: 'with vertical terms' },
  { id: 'descriptions-responsive', label: 'with responsive columns' },
  { id: 'descriptions-extra', label: 'with extra header actions' },
  { id: 'api', label: 'Props' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

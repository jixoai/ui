// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn task 20).
// Survivor ids kept for deep links; universal-props folded into the axes
// section; overview is new.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'usage', label: 'Usage' },
  { id: 'lanes', label: 'The two lanes' },
  { id: 'icon', label: 'The suffix-icon lane' },
  { id: 'detection', label: 'Detection law' },
  { id: 'api', label: 'Props' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

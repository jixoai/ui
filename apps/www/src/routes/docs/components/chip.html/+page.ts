// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn r1).
// The stale 'hit-lane' entry is gone — the scale-ruling section is
// 'twin' now, and the axes section is its own stop.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'usage', label: 'Usage' },
  { id: 'ladder', label: 'The ladder, live' },
  { id: 'anchors', label: 'Button or anchor' },
  { id: 'slots', label: 'Slots' },
  { id: 'twin', label: 'The badge twin' },
  { id: 'hue', label: 'Hue and tokens' },
  { id: 'props', label: 'API' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'see-also', label: 'See also' },
];

export const load = () => ({ toc });

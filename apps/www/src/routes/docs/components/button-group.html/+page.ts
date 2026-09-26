// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn task 12;
// the old array predated the restructure — dead #install/#theming
// anchors, no overview/axes rows, stale labels).
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'usage', label: 'Usage' },
  { id: 'btngroup-demo', label: 'live demo' },
  { id: 'btngroup-scroll', label: 'with scroll overflow' },
  { id: 'variant-scope', label: 'ButtonVariantScope — the zone half' },
  { id: 'examples', label: 'Examples' },
  { id: 'btngroup-nesting', label: 'with nested clusters' },
  { id: 'btngroup-boundary', label: 'the toggle-group boundary' },
  { id: 'api', label: 'API' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

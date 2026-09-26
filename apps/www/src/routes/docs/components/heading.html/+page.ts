// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn task 12).
// Survivor ids from the W3-era page (usage/ladder/standalone/accessibility/
// api) are kept for deep links; universal-props folded into the axes
// section; overview is new.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'usage', label: 'Usage' },
  { id: 'ladder', label: 'The level ladder' },
  { id: 'standalone', label: 'Standalone' },
  { id: 'api', label: 'Props' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

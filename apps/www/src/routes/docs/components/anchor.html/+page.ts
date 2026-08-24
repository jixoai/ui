// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'anchor-what', label: 'what it does' },
  { id: 'anchor-pick', label: 'the line pick' },
  { id: 'anchor-vs-toc', label: 'anchor vs toc' },
  { id: 'anchor-usage', label: 'usage' },
];

export const load = () => ({ toc });

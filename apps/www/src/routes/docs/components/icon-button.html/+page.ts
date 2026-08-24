// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'icon-only', label: 'icon-only — the tooltip law' },
  { id: 'law', label: 'One label, two postures' },
];

export const load = () => ({ toc });

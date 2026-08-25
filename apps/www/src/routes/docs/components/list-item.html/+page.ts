// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'media-forms', label: 'Media: icon, avatar, image' },
  { id: 'group-list', label: 'Group, separators & link rows' },
  { id: 'header-footer', label: 'Header & footer full rows' },
  { id: 'variant-size-matrix', label: 'Variant × size matrix' },
  { id: 'usage', label: 'Usage' },
];

export const load = () => ({ toc });

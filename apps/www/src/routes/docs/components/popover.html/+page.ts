// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'popover-menu', label: 'menu type' },
  { id: 'popover-card', label: 'card type' },
  { id: 'popover-base', label: 'NativeHTML base' },
];

export const load = () => ({ toc });

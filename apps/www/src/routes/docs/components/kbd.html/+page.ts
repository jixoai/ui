// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'shortcut-rows', label: 'Shortcut rows' },
  { id: 'kbd-base', label: 'NativeHTML 基座' },
];

export const load = () => ({ toc });

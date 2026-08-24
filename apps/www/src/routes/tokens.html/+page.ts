// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'hue-lab', label: 'hue lab' },
  { id: 'palette', label: 'palette' },
  { id: 'semantics', label: 'semantics' },
  { id: 'primary-contrast', label: 'primary contrast' },
];

export const load = () => ({ toc });

// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'ghostty-term-workbench', label: 'live demo' },
  { id: 'install', label: 'install prerequisites' },
  { id: 'usage', label: 'usage' },
  { id: 'degradation', label: 'failure & degradation' },
  { id: 'density', label: 'density & theming' },
  { id: 'accessibility', label: 'accessibility' },
  { id: 'api', label: 'API' },
  { id: 'ghostty-term-law', label: 'the wasm is the terminal' },
];

export const load = () => ({ toc });

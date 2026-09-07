// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'usage', label: 'Usage' },
  { id: 'knobs', label: 'The knobs — scale & flow' },
  { id: 'indent-initial', label: 'Indent & the drop cap' },
  { id: 'ink-gradient-ground', label: 'Ink, gradient, ground' },
  { id: 'family', label: 'Family' },
  { id: 'sovereignty', label: 'Sovereignty' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'api', label: 'API' },
];

export const load = () => ({ toc });

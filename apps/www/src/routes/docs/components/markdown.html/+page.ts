// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'usage', label: 'Usage' },
  { id: 'examples', label: 'Examples' },
  { id: 'markdown-kitchen-sink', label: 'Kitchen sink' },
  { id: 'markdown-streaming', label: 'Streaming simulation' },
  { id: 'markdown-overrides', label: 'Custom components' },
  { id: 'markdown-static', label: 'Static document' },
  { id: 'api', label: 'API' },
];

export const load = () => ({ toc });

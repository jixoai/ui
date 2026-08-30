// Route-level toc policy: the sections ship as PAGE DATA.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'terminal', label: 'Terminal-window hero' },
  { id: 'ascii', label: 'ASCII-art hero' },
  { id: 'marquee', label: 'Badge-marquee hero' },
  { id: 'pick', label: 'Picking a form' },
  { id: 'usage', label: 'Usage' },
  { id: 'api', label: 'API' },
];

export const load = () => ({ toc });

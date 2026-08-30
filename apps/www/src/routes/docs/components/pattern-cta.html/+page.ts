// Route-level toc policy: the sections ship as PAGE DATA.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'demo', label: 'Live demo' },
  { id: 'usage', label: 'Usage' },
  { id: 'api', label: 'API' },
];

export const load = () => ({ toc });

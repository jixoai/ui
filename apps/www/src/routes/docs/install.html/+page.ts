// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell. Ids pair with the
// wrapper ids / SectionCard families in +page.svelte, in page order.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'one-entry', label: 'One css entry' },
  { id: 'compiled-payload', label: 'Compiled payload items' },
  { id: 'transitional', label: 'The transitional state' },
  { id: 'layer-law', label: 'Utilities always win' },
  { id: 'verify', label: 'Verify your install' },
];

export const load = () => ({ toc });

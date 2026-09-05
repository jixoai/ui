// Route-level toc policy (firstpaint era): the sections ship as PAGE
// DATA — the layout owns the toc in the scaffold's chrome snippet.
// Ids pair with the wrapper ids / SectionCard families in
// +page.svelte, in page order.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'scale', label: 'The five-rung scale' },
  { id: 'scene', label: 'The pro-tool scene' },
  { id: 'law', label: 'The adoption law' },
];

export const load = () => ({ toc });

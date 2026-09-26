// Route-level toc policy (firstpaint era): the sections ship as PAGE
// DATA — the layout owns the toc in the scaffold's chrome snippet.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'grammar', label: 'The grammar' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'resolution', label: 'Resolution & supply' },
];

export const load = () => ({ toc });

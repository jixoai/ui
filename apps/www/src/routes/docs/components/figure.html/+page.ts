// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell. The rail landed at the
// figure 1st review (quill 124): four entries + the live numbering
// canvas (the walkthrough is the page's spine).
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'usage', label: 'Usage' },
  { id: 'numbering-walkthrough', label: 'The numbering walkthrough' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'universal-props', label: 'Universal props' },
  { id: 'api', label: 'API' },
];

export const load = () => ({ toc });

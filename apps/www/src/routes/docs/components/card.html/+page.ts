// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell. The rail landed at the
// card 1st review (quill 124): the page predates the convention, it is
// not a concept page — eight teachable sections, eight entries.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'usage', label: 'Usage' },
  { id: 'foot-flexibility', label: 'Foot flexibility' },
  { id: 'grid-composition', label: 'Grid composition' },
  { id: 'types', label: 'Card types' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'theming', label: 'Theming' },
  { id: 'universal-props', label: 'Universal props' },
  { id: 'api', label: 'API' },
];

export const load = () => ({ toc });

// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell. Ids pair with the
// wrapper ids / SectionCard families in +page.svelte, in page order.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'ladder', label: 'The ladder' },
  { id: 'tokens', label: 'Tokens & recipes' },
  { id: 'injection', label: 'Hue injection' },
  { id: 'plugin', label: 'The @utility plugin' },
  { id: 'laws', label: 'TW4 laws' },
  { id: 'forced-colors', label: 'Forced colors' },
  { id: 'migration', label: 'Migration' },
  { id: 'guards', label: 'Guards & a11y' },
  { id: 'elevation', label: 'Elevation' },
  { id: 'entity', label: 'The entity law' },
];

export const load = () => ({ toc });

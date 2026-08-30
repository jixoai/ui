// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell. Ids pair with the
// wrapper ids / SectionCard families in +page.svelte, in page order.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'skeleton', label: 'The skeleton' },
  { id: 'ability-grammar', label: 'Ability naming' },
  { id: 'variant-suffix', label: 'Variant suffix' },
  { id: 'props-source', label: 'Props: one source' },
  { id: 'staged', label: 'Staged adoption' },
  { id: 'worked', label: 'Worked example' },
];

export const load = () => ({ toc });

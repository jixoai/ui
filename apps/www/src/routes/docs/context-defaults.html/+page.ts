// Route-level toc policy (firstpaint era): the sections ship as PAGE
// DATA — the layout owns the toc in the scaffold's chrome snippet,
// SSR-rendered in its final grid cell. Ids pair with the wrapper ids /
// SectionCard families in +page.svelte, in page order.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'recipes', label: "Recipes — change a subtree's defaults" },
  { id: 'why', label: 'Why — five dialects, one language' },
  { id: 'axes', label: 'The axes & coverage classes' },
  { id: 'author', label: 'Author how-to' },
  { id: 'guards', label: 'Guards — verify:context' },
];


export const load = () => ({ toc });

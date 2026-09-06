// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
//
// icon-component-pipeline (D1): the page leads with the component face
// (<Icon name>), then the generated library grid, then the plugin's
// library face (config + tiers + async semantics), and closes on the
// slot face — the two faces stay distinguishable sections.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'component', label: 'The Icon component' },
  { id: 'vocabulary', label: 'The named library' },
  { id: 'plugin', label: 'The library pipeline' },
  { id: 'css-slots', label: 'The slot face' },
];

export const load = () => ({ toc });

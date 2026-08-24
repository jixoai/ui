// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell. The index page's rail
// is the antd taxonomy itself (Owner ruling, 2026-08-25: no component
// tree on this route — the page IS the tree; the toc takes the chrome).
import type { TocSection } from '$lib/ui/toc/toc.svelte';
import { catalogByGroup } from '$lib/catalog';

const toc: TocSection[] = [
  ...catalogByGroup().map(({ group }) => ({ id: group.id, label: group.label })),
  { id: 'guides', label: 'Guides' },
];

export const load = () => ({ toc });

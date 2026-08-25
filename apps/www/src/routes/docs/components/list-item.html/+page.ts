// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'standalone-ladder', label: 'Standalone ladder' },
  { id: 'group-modes', label: 'Group modes' },
  { id: 'slot-topology', label: 'Slot topology' },
  { id: 'media-narrow', label: 'Media layout & the narrow law' },
  { id: 'settings-section', label: 'Settings section (adapters)' },
  { id: 'item-field-escape', label: 'ItemField escape hatch' },
  { id: 'selection-links', label: 'Selection & links' },
  { id: 'recipes', label: 'Recipes' },
  { id: 'usage', label: 'Usage' },
];

export const load = () => ({ toc });

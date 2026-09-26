// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell. The rail was rebuilt
// at the list-item 1st review (scribe 125): sixteen sections in DOM
// order — ten teachable sections were unrail-ed and types led usage.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'standalone-ladder', label: 'The standalone ladder' },
  { id: 'group-modes', label: 'Group modes' },
  { id: 'slot-topology', label: 'Slot topology' },
  { id: 'media-narrow', label: 'Media + the narrow law' },
  { id: 'density-ladder', label: 'Density' },
  { id: 'settings-section', label: 'The settings section' },
  { id: 'size-contract', label: 'The size contract' },
  { id: 'item-field-escape', label: 'The ItemField escape' },
  { id: 'selection-links', label: 'Selection links' },
  { id: 'recipes', label: 'Recipes' },
  { id: 'usage', label: 'Usage' },
  { id: 'types', label: 'Types' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'theming', label: 'Theming' },
  { id: 'universal-props', label: 'Universal props' },
  { id: 'api', label: 'API' },
];

export const load = () => ({ toc });

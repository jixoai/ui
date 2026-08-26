// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Hub era (2026-08-25): the ids are the LEGACY anchors of the old single
// page — every historical deep link keeps resolving onto its group.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'density-ladder', label: 'Density ladder' },
  { id: 'all-types', label: 'Native lanes & full customs' },
  { id: 'select-textarea', label: 'Select family & textarea' },
  { id: 'example-form', label: 'The pure-CSS selectors' },
  { id: 'native-base', label: 'the NativeHTML base' },
  { id: 'types', label: 'Types' },
  { id: 'usage', label: 'Usage' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'theming', label: 'Theming' },
  { id: 'api', label: 'API' },
];

export const load = () => ({ toc });

// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'types', label: 'Types' },
  { id: 'usage', label: 'Usage' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'theming', label: 'Theming' },
  { id: 'api', label: 'API' },
  { id: 'fi-demo', label: 'live demo' },
  { id: 'fi-drop', label: 'The drop zone' },
  { id: 'fi-list', label: 'The file list' },
  { id: 'fi-variants', label: 'button variant · disabled' },
  { id: 'fi-overflow', label: 'Narrow hosts' },
  { id: 'fi-usage', label: 'usage' },
];

export const load = () => ({ toc });

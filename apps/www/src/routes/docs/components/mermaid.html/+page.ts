// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'mermaid-workbench', label: 'workbench' },
  { id: 'mermaid-kinds', label: 'diagram kinds' },
  { id: 'mermaid-theme', label: 'theme follow & pins' },
  { id: 'mermaid-zoom', label: 'zoom & pan' },
  { id: 'mermaid-error', label: 'error floor' },
  { id: 'usage', label: 'Usage' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'theming', label: 'Theming' },
  { id: 'api', label: 'API' },
];

export const load = () => ({ toc });

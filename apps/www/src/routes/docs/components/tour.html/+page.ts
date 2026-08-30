// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// 2026-08-30 (table-grid-toolbar): install + examples + the three
// recipes (the stale 'tour-law' entry — a section that never rendered —
// died with this pass).
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'install', label: 'Install' },
  { id: 'tour-workbench', label: 'live demo' },
  { id: 'usage', label: 'Usage' },
  { id: 'examples', label: 'Examples' },
  { id: 'tour-non-modal', label: 'with non-modal scroll' },
  { id: 'tour-placement', label: 'with placement control' },
  { id: 'tour-placement-table', label: 'the 12 placements' },
  { id: 'tour-indicators', label: 'with custom indicators' },
  { id: 'tour-card', label: 'the card(api) snippet' },
  { id: 'types', label: 'Tour variants' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'theming', label: 'Theming' },
  { id: 'api', label: 'API' },
  { id: 'see-also', label: 'See also' },
];

export const load = () => ({ toc });

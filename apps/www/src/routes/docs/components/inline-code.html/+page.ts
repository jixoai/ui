// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM. Task 16 (docs-eight-axes-mdn, tier 3):
// +overview; the pre-existing section ids are kept for deep links and
// their DOM order is unchanged (the page was already canonical).
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'inline-code-variants', label: 'The ladder trio' },
  { id: 'inline-code-engine', label: 'The engine seam' },
  { id: 'inline-code-detection', label: 'The honest heuristic' },
  { id: 'inline-code-geometry', label: 'Geometry' },
  { id: 'inline-code-modifiers', label: 'Modifiers' },
  { id: 'types', label: 'The three language paths' },
  { id: 'usage', label: 'Usage' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'theming', label: 'Density and tokens' },
  { id: 'api', label: 'Props' },
];

export const load = () => ({ toc });

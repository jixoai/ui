// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn task 13).
// Survivor ids from the composition-first page (wide-form/slots/usage/
// accessibility/api) are kept for deep links; types/theming fold into
// the axes section; overview and demo are new.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'usage', label: 'Usage' },
  { id: 'demo', label: 'The hero' },
  { id: 'wide-form', label: 'The wide form' },
  { id: 'slots', label: 'What the slots own' },
  { id: 'api', label: 'Props' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

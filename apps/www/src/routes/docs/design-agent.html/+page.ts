// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell. Ids pair with the
// wrapper ids / SectionCard families in +page.svelte, in page order.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'what-it-is', label: 'What the design agent is' },
  { id: 'quickstart', label: 'Quickstart' },
  { id: 'agents', label: 'The three agent modes' },
  { id: 'workspace', label: 'The design/ workspace' },
  { id: 'styles', label: 'How it styles: the eight axes' },
  { id: 'interop', label: 'Boundaries & neighbors' },
];

export const load = () => ({ toc });

// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'dialog-basic', label: 'basic' },
  { id: 'dialog-form', label: 'form type' },
  { id: 'dialog-footer-clusters', label: 'footer clusters' },
  { id: 'dialog-head', label: 'custom head' },
  { id: 'dialog-scroll', label: 'scrolling body' },
  { id: 'dialog-base', label: 'NativeHTML base' },
  { id: 'types', label: 'Types' },
  { id: 'usage', label: 'Usage' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'theming', label: 'Theming' },
  { id: 'api', label: 'API' },
];

export const load = () => ({ toc });

// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc.svelte';

const toc: TocSection[] = [
    { id: 'getting-started', label: 'Getting started' },
    { id: 'typography', label: 'Typography' },
    { id: 'buttons', label: 'Buttons' },
    { id: 'forms', label: 'Forms' },
    { id: 'disclosure', label: 'details / summary' },
    { id: 'nav-lists', label: 'nav · lists · dl' },
    { id: 'tables', label: 'Tables' },
    { id: 'media-flow', label: 'progress · meter · figure' },
    { id: 'dark-mode', label: 'Dark mode' },
    { id: 'custom-element', label: 'CustomElement' },
    { id: 'scope-laws', label: 'Scope laws' },
  ];

export const load = () => ({ toc });

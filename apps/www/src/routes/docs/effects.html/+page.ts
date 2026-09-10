// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell. The effect home's
// outline (effect-attachments Lane C, 2026-09-09; Owner review
// 2026-09-08): glass keeps its carried anchors, and each press LOOP
// owns its gallery — the effect, not the button, is the entry.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'usage', label: 'Usage' },
  { id: 'glass', label: 'glass — the lens playground' },
  { id: 'two-layers', label: 'Two layers' },
  { id: 'degradation', label: 'Degradation' },
  { id: 'chrome', label: 'Element chrome' },
  { id: 'shimmer', label: 'shimmer — the conic spark' },
  { id: 'pulse', label: 'pulse — sonar rings' },
  { id: 'rainbow', label: 'rainbow — the aurora wash' },
  { id: 'ripple', label: 'ripple — press-point ink' },
  { id: 'theming', label: 'Theming' },
  { id: 'api', label: 'API' },
  { id: 'migration', label: 'Migrating to attachments' },
];

export const load = () => ({ toc });

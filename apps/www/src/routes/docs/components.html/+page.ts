// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell. The index page's rail
// is the antd taxonomy itself (Owner ruling, 2026-08-25: no component
// tree on this route — the sections rail + this toc own navigation).
// r2 (Codex P1-1): UI modules only — same source as the card grid.
import type { TocSection } from '$lib/ui/toc/toc.svelte';
import { docsComponentGroups } from '$lib/docs-route-model';

const toc: TocSection[] = docsComponentGroups.map(({ group }) => ({
  id: group.id,
  label: group.label,
}));

export const load = () => ({ toc });

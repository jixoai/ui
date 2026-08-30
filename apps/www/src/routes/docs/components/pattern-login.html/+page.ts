// Route-level toc policy: the sections ship as PAGE DATA — the layout
// owns the toc in the scaffold's chrome snippet, SSR-rendered.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'demo', label: 'Live demos' },
  { id: 'otp', label: 'The 2FA variant' },
  { id: 'usage', label: 'Usage' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'api', label: 'API' },
];

export const load = () => ({ toc });

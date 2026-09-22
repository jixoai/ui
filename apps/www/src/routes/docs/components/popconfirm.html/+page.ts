// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
// Order follows the page DOM (MDN archetype, docs-eight-axes-mdn task 24).
// install folds out of the toc; see-also ships without a toc entry; both
// keep their anchor ids. theming + universal-props folded into axes;
// overview + law are new. The old ToC's 'popconfirm-base' pointed at an
// id no section ever carried — the stale-entry defect the rewrite fixes.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'popconfirm-demo', label: 'live demo' },
  { id: 'popconfirm-override', label: 'composition' },
  { id: 'law', label: 'The state machine' },
  { id: 'types', label: 'types' },
  { id: 'usage', label: 'usage' },
  { id: 'api', label: 'Props' },
  { id: 'axes', label: 'The eight axes' },
  { id: 'accessibility', label: 'Accessibility' },
];

export const load = () => ({ toc });

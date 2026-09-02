/**
 * toast-viewport — the docs curation over the GENERATED meta
 * (docs-demo-standard pilot migration; zero-content-drift pinned by
 * test/props-table-meta-drift.spec.ts).
 *
 * toast-v2 added the stacking trio (expand / gap / swipeDirections,
 * adversarial R1 P2-3 regeneration). The page's two OTHER tables
 * (api.promise messages, push(init) ToastInit) document the STORE api,
 * not a component Props interface — they stay on the legacy `props`
 * array until the store grows a meta of its own.
 */
import type { PropsDocs } from '../from-meta';

export const TOAST_VIEWPORT_DOCS: PropsDocs = {
  overrides: {
    store: {
      description: 'The app-created store (createToastStore()) — never a module singleton.',
      required: true,
    },
    maxVisible: {
      description: 'Max toasts rendered at once; older ones stay queued behind the +N queued chip.',
    },
    expand: {
      description:
        'Pins the expanded posture — the full list, every card at its own height. Hover/touch still lifts into it while inside.',
    },
    gap: {
      description:
        'The stack’s rung spacing in px — the collapsed depth stairs and the expanded ladder both space by it.',
    },
    swipeDirections: {
      description:
        'Default swipe directions when a push names none — resolved per POSTURE toward the nearest screen edges (adopted top-right → right + up; standalone bottom-right → right + down).',
    },
    class: {
      description: 'Extra classes on the corner stack.',
    },
  },
};

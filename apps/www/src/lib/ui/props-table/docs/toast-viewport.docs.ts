/**
 * toast-viewport — the docs curation over the GENERATED meta
 * (docs-demo-standard pilot migration; zero-content-drift pinned by
 * test/props-table-meta-drift.spec.ts).
 *
 * Zero corrections: the viewport's three props extract exactly
 * (`ToastStore`, `4`, `''`). The page's two OTHER tables (api.promise
 * messages, push(init) ToastInit) document the STORE api, not a
 * component Props interface — they stay on the legacy `props` array
 * until the store grows a meta of its own.
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
    class: {
      description: 'Extra classes on the corner stack.',
    },
  },
};

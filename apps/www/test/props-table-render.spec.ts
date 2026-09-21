/**
 * PropsTable render contract (docs-demo-standard 4.1; jsdom +
 * @testing-library/svelte — the batch's screenshot-verification
 * replacement, per the no-playwright constraint).
 *
 * Two sources, one component:
 *   - meta mode: rows project from the GENERATED zone + docs curation
 *     (the pilot migration's path) — the table carries the skeleton
 *     lint's data-doc-props-table marker
 *   - legacy mode: the hand-written `props` array renders unchanged
 *     (the 72 unmigrated pages' path)
 */
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import PropsTable from '$lib/ui/props-table/props-table.svelte';
import { meta as selectMeta } from '$lib/meta/select.meta';
import { SELECT_DOCS } from '$lib/ui/props-table/docs/select.docs';

describe('PropsTable — meta mode (the single source)', () => {
  it('renders the projection with the lint marker and the four columns', () => {
    const { container } = render(PropsTable, {
      props: { meta: selectMeta, docs: SELECT_DOCS },
    });

    const table = container.querySelector('table[data-doc-props-table]');
    expect(table, 'data-doc-props-table marker (skeleton lint API anchor)').not.toBeNull();
    const headers = [...table!.querySelectorAll('thead th')].map((th) => th.textContent);
    expect(headers).toEqual(['Property', 'Type', 'Default', 'Description']);
  });

  it('renders select rows from the GENERATED truth (enum cells, defaults, badges)', () => {
    const { container } = render(PropsTable, {
      props: { meta: selectMeta, docs: SELECT_DOCS },
    });

    const rows = [...container.querySelectorAll('tbody tr')];
    // 11 = the 11 described props (onchange and disabled joined the
    // generated truth with 87496db9, the #6 commit hook fix — this
    // count pin was missed there; re-pinned 2026-09-13). W3-D3
    // (explicit-props, task 3.4 r3): 18 = the seven universal axis
    // rows joined the generated truth beside the migrated density
    // lane (the intended, additive drift — the pilot-nine drift
    // spec's UNIVERSAL_PILOTS carries select now)
    expect(rows.length).toBe(18);

    // enum + default straight from the GENERATED zone; the slot's
    // literal family surfaces the frozen three-state marker
    // (context-defaults-economy 4.3)
    const variant = rows.find((r) => r.textContent!.includes('variant'))!;
    expect(variant.textContent).toContain("'solid' | 'acrylic' | 'auto'");
    expect(variant.textContent).toContain("'auto' · Own default, not ambient");

    // opaque typeText is the Type column
    const options = rows.find((r) => r.textContent!.includes('options'))!;
    expect(options.textContent).toContain('SelectOption[]');
    expect(options.textContent).toContain('*'); // required badge

    // bindable badge on the committed-value seam (the name cell carries
    // the name plus its badges — match by prefix)
    const value = rows.find((r) => r.cells[0].textContent!.trim().startsWith('value'))!;
    expect(value.textContent).toContain('bind');

    // curation hides heritage rows
    const names = rows.map((r) => r.cells[0].textContent!.trim());
    expect(names).not.toContain('class');
    expect(names).not.toContain('rest');
    expect(names).not.toContain('id');

    // hidden rows really render nothing; the density slot has no own —
    // the ambient scope marker IS the Default cell (the `inherited`
    // display override retired with 4.3)
    const density = rows.find((r) => r.cells[0].textContent!.trim().startsWith('density'))!;
    expect(density.textContent).toContain('ambient scope');
    expect(density.textContent).not.toContain('inherited');
  });
});

describe('PropsTable — legacy fallback mode (unmigrated pages)', () => {
  it('renders the hand-written array unchanged', () => {
    const { container } = render(PropsTable, {
      props: {
        props: [
          { name: 'store', type: 'ToastStore', default: '—', description: 'the store', required: true },
        ],
      },
    });

    const table = container.querySelector('table[data-doc-props-table]');
    expect(table).not.toBeNull();
    const row = table!.querySelector('tbody tr')!;
    expect(row.cells[0].textContent).toContain('store');
    expect(row.cells[1].textContent).toContain('ToastStore');
  });
});

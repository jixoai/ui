/**
 * token-table-source — the Source column contract (docs-eight-axes-mdn
 * task 21, the hardening pattern: a fleet-wide render bug earns a pin).
 *
 * The bug this pins: sourceLabel mapped three of the four TokenEntry
 * source union members — `source: 'structural'` (accepted by the type)
 * rendered an EMPTY Source cell on 27 pages (input-group ×5,
 * button-group ×2, date-picker/dropdown-menu ×10 each, …). The fix adds
 * the structural arm ONE FOR ONE with the union; this spec locks both
 * halves:
 *   - every union member renders its own label (no silent blanks);
 *   - the no-source guard still drops the column entirely (the
 *     cascader posture: a [Token, Default] two-column table stays
 *     two-column).
 */
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import TokenTable from '../src/lib/ui/token-table/token-table.svelte';

describe('TokenTable — the Source column contract', () => {
  it('every union member renders its own label — no silent blanks', () => {
    const { container } = render(TokenTable, {
      props: {
        tokens: [
          { name: '--a', default: '1', source: 'density' },
          { name: '--b', default: '2', source: 'component' },
          { name: '--c', default: '3', source: 'color' },
          { name: '--d', default: '4', source: 'structural' },
        ],
      },
    });
    const rows = [...container.querySelectorAll('tbody tr')];
    expect(rows.map((r) => r.querySelectorAll('td')[2]?.textContent?.trim())).toEqual([
      'density',
      'component',
      'color',
      'structural',
    ]);
  });

  it('the no-source guard drops the column entirely (the cascader posture)', () => {
    const { container } = render(TokenTable, {
      props: {
        tokens: [
          { name: '--x', default: '1' },
          { name: '--y', default: '2' },
        ],
      },
    });
    const heads = [...container.querySelectorAll('th')].map((h) => h.textContent?.trim());
    expect(heads).toEqual(['Token', 'Default']);
    expect(container.querySelectorAll('tbody tr').length).toBe(2);
  });
});

/**
 * jixoai pageRange (registry/files/ui/pagination/pagination-range.ts,
 * composition-first, 2026-08-25).
 *
 * The page-window math of the old closed pagination component, ported
 * EXACTLY (parity is proven by tests) and surfaced as a pure helper:
 * the family renders links; THIS answers which pages to render.
 *
 * Sticky edges — the first and last page are always reachable;
 * `siblings` pages ride either side of the current one; everything
 * else collapses into the two ellipsis TOKENS, which consumers branch
 * on (rendering a PaginationEllipsis). siblings=0 collapses the
 * neighbor run entirely; negatives clamp to 0; tiny page counts never
 * grow ellipses.
 *
 * Signature is FROZEN (design.md r4):
 *   pageRange(opts: { current: number; total: number; siblings?: number })
 *     => (number | 'ellipsis-start' | 'ellipsis-end')[]
 */

export type PageRangeItem = number | 'ellipsis-start' | 'ellipsis-end';

export interface PageRangeOptions {
  /** the active page, 1-based */
  current: number;
  /** total number of pages */
  total: number;
  /** pages shown either side of the current one (default 1) */
  siblings?: number;
}

export function pageRange(opts: PageRangeOptions): PageRangeItem[] {
  const { current, total, siblings = 1 } = opts;
  const s = Math.max(0, Math.trunc(siblings));
  const items: PageRangeItem[] = [1];
  const from = Math.max(2, current - s);
  const to = Math.min(total - 1, current + s);
  if (from > 2) items.push('ellipsis-start');
  for (let p = from; p <= to; p++) items.push(p);
  if (to < total - 1) items.push('ellipsis-end');
  if (total > 1) items.push(total);
  return items;
}

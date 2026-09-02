/**
 * The nav filter kernel (nav-fuzzy-filter change, 2026-09-02; the N1
 * Owner ruling): the left rail's fuzzy filter over grouped page trees,
 * wrapping fuzzysort v4 the way engine-minisearch wraps minisearch —
 * the ENGINE is replaceable, the surface stays. The rail keeps its
 * data-source order: fuzzy only FILTERS, never reorders (the same law
 * as command.svelte's frozen CommandMatch — hide, don't shuffle).
 *
 * Semantics locked here (design §1):
 * - title (primary) and subtitle (secondary) both match; the better
 *   fuzzysort score wins the highlight field, ties prefer title
 * - the empty/whitespace query is the identity: the full tree back,
 *   zero highlights
 * - sections whose pages all dropped are dropped (empty-group hiding)
 * - every surviving page carries WHICH field matched plus the matched
 *   character indexes, for <mark> rendering
 *
 * fuzzysort v4 notes (verified against node_modules/fuzzysort, NOT
 * v3 memory): single() applies NO threshold — any in-order character
 * match returns a result, which is exactly the filter-not-rank
 * semantics this kernel wants (go() would default to threshold .5
 * and limit 10). single() caches prepared targets and queries
 * internally, so per-keystroke sweeps over the ~105-item rail are
 * cheap without snapshotting.
 */
import fuzzysort from 'fuzzysort';
import type { CommandMatch } from '$lib/ui/command/command.svelte';

/** a page line the kernel understands (DocsPage-compatible) */
export interface NavFilterPage {
  /** the primary match field */
  title: string;
  /** the secondary match field */
  subtitle?: string;
  href: string;
}

/** a group of pages (DocsSection- and the rail's RailGroup-compatible) */
export interface NavFilterSection<P extends NavFilterPage = NavFilterPage> {
  id: string;
  label: string;
  pages: P[];
}

/** where a page matched: the field + its matched character indexes */
export interface NavFilterHighlight {
  field: 'title' | 'subtitle';
  indexes: readonly number[];
}

/** a filtered section: every source prop rides along (count, …) and
 *  pages gain an OPTIONAL highlight — absent on the identity path */
export type NavFilterResult<S extends NavFilterSection> = Omit<S, 'pages'> & {
  pages: Array<S['pages'][number] & { highlight?: NavFilterHighlight }>;
};

/**
 * Filter a grouped page tree by a fuzzy query. Group order and
 * intra-group order ride the data source (no scoring sort); fuzzysort
 * only decides page KEEP/DROP and which field's chars to highlight.
 * The empty/whitespace query returns the input identity.
 */
export function navFilter<S extends NavFilterSection>(
  sections: readonly S[],
  query: string,
): readonly NavFilterResult<S>[] {
  const q = query.trim();
  if (q === '') return sections;

  const out: NavFilterResult<S>[] = [];
  for (const section of sections) {
    const pages: Array<S['pages'][number] & { highlight?: NavFilterHighlight }> = [];
    for (const page of section.pages) {
      const highlight = matchPage(page, q);
      if (highlight !== null) pages.push({ ...page, highlight });
    }
    if (pages.length > 0) out.push({ ...section, pages });
  }
  return out;
}

/** one page's best hit: the better score wins, title takes ties (it
 *  is the primary field — design §1) */
function matchPage(page: NavFilterPage, query: string): NavFilterHighlight | null {
  // single() returns null for a missing/empty target and for no match
  const titleHit = fuzzysort.single(query, page.title);
  const subtitleHit =
    page.subtitle === undefined || page.subtitle === ''
      ? null
      : fuzzysort.single(query, page.subtitle);
  const subtitleWins =
    subtitleHit !== null && (titleHit === null || subtitleHit.score > titleHit.score);
  const hit = subtitleWins ? subtitleHit : titleHit;
  if (hit === null) return null;
  return { field: subtitleWins ? 'subtitle' : 'title', indexes: hit.indexes };
}

/**
 * The CommandMatch-compatible exit (command.svelte's frozen contract,
 * annotated as such so a contract drift fails THIS file's compile):
 * the fuzzy projection of navFilter for flat {label, keywords?} lists
 * — a pure inclusion predicate, hidden never reordered. The empty
 * query shows everything (defaultCommandMatch's own law).
 */
export const toCommandMatch: CommandMatch = (item, query) => {
  const q = query.trim();
  if (q === '') return true;
  return (
    fuzzysort.single(q, item.label) !== null ||
    (item.keywords !== undefined &&
      item.keywords !== '' &&
      fuzzysort.single(q, item.keywords) !== null)
  );
};

/** a stretch of one link line: marked (a hit run) or plain */
export interface NavHighlightSegment {
  text: string;
  hit: boolean;
}

/**
 * Split a link line into segments, grouping CONTIGUOUS hit indexes
 * into one mark (fuzzysort's own highlight law, index-based so the
 * result tree stays plain serializable data). Defensive about
 * unsorted/duplicated indexes — callers may hand it raw arrays.
 */
export function navHighlightSegments(
  text: string,
  indexes: readonly number[],
): NavHighlightSegment[] {
  const sorted = [...new Set(indexes)].sort((a, b) => a - b);
  const segments: NavHighlightSegment[] = [];
  let lastIndex = 0;
  let i = 0;
  while (i < sorted.length) {
    const start = sorted[i] ?? 0;
    let end = start + 1;
    while (i + 1 < sorted.length && sorted[i + 1] === end) {
      i += 1;
      end += 1;
    }
    i += 1;
    if (start > lastIndex) segments.push({ text: text.slice(lastIndex, start), hit: false });
    segments.push({ text: text.slice(start, end), hit: true });
    lastIndex = end;
  }
  if (lastIndex < text.length) segments.push({ text: text.slice(lastIndex), hit: false });
  return segments;
}

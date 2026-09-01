/**
 * The engine-neutral search contract (search-corpus change,
 * 2026-09-02): the UI knows this interface and NOTHING else —
 * minisearch today, fuse or a server engine tomorrow, the corpus
 * and the palette untouched (the pluggable-engine Owner decision).
 */
export interface SearchHit {
  /** page url + section anchor — /docs/paged.html#transaction shape */
  href: string;
  pageTitle: string;
  heading: string;
  summary: string;
  /** the matched query terms (for snippet highlighting) */
  terms: string[];
  score: number;
}

export interface SearchEngine {
  search(query: string): Promise<SearchHit[]>;
}

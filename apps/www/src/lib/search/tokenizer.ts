/**
 * The search tokenizer (search-corpus change, 2026-09-02; Owner
 * decision Q4): CJK rides Intl.Segmenter at WORD granularity — the
 * standard API, no dictionaries, no bigram inflation — and the same
 * function serves BOTH the document and the query paths (a query
 * segmented differently from its documents can never match).
 *
 * Latin/numeric runs tokenize as lowercased words; everything the
 * segmenter marks word-like and non-space survives. Framework-free
 * by the lib law: string in, string[] out, zero listeners.
 */

const segmenters = new Map<string, Intl.Segmenter>();

function segmenterFor(locale: string): Intl.Segmenter {
  let segmenter = segmenters.get(locale);
  if (segmenter === undefined) {
    segmenter = new Intl.Segmenter(locale, { granularity: 'word' });
    segmenters.set(locale, segmenter);
  }
  return segmenter;
}

/** tokenize text for indexing or querying — one law, two callers */
export function tokenize(text: string, locale = 'zh'): string[] {
  if (text === '') return [];
  const out: string[] = [];
  for (const { segment, isWordLike } of segmenterFor(locale).segment(text)) {
    if (!isWordLike) continue;
    const token = segment.toLowerCase();
    if (token !== '') out.push(token);
  }
  return out;
}

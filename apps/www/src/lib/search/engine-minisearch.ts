/**
 * The minisearch engine adapter (search-corpus change, 2026-09-02;
 * the pluggable-engine decision): the corpus is engine-neutral JSON —
 * this adapter compiles it into a MiniSearch index IN THE BROWSER
 * (the VitePress topology: lazy corpus fetch, client-side build, the
 * builder stays zero-dep). Swapping engines means writing another
 * adapter against the same SearchEngine interface, never touching
 * the corpus or the UI.
 *
 * Field weighting rides MiniSearch's boost: the page title outranks
 * section headings, which outrank summaries, which outrank block
 * text. Documents = page × section (section-granularity results,
 * deep-linkable via the harvest's converging heading ids).
 */
import type { SearchEngine, SearchHit } from './engine-types';

export interface CorpusPage {
  url: string;
  title: string;
  description: string;
  preset: string | null;
  sections: {
    id: string;
    heading: string;
    level: number;
    summary: string;
    blocks: { kind: string; text: string; lang?: string; label?: string }[];
  }[];
}

interface EngineDoc {
  id: string;
  url: string;
  pageTitle: string;
  heading: string;
  summary: string;
  text: string;
}

export function createMinisearchEngine(
  tokenize: (text: string) => string[],
  loadCorpus: () => Promise<CorpusPage[]>,
): SearchEngine {
  let engine: {
    search(query: string, options: { fuzzy: number; prefix: boolean; boost: Record<string, number> }): {
      id: string;
      score: number;
      terms: string[];
    }[];
  } | undefined;
  let docsById = new Map<string, EngineDoc>();
  let loading: Promise<void> | undefined;

  const ensureIndex = async (): Promise<void> => {
    if (engine !== undefined) return;
    loading ??= (async () => {
      // a failed load must not poison the cache forever (the pre-review
      // catch): the next query retries; the UI reads it as no hits
      const [{ default: MiniSearch }, pages] = await Promise.all([
        import('minisearch'),
        loadCorpus(),
      ]);
      const docs: EngineDoc[] = [];
      for (const page of pages) {
        for (const section of page.sections) {
          const text = [
            section.summary,
            ...section.blocks.map((block) => `${block.label ?? ''} ${block.text}`),
          ].join('\n');
          docs.push({
            id: `${page.url}#${section.id}`,
            url: page.url,
            pageTitle: page.title,
            heading: section.heading,
            summary: section.summary,
            text,
          });
        }
      }
      docsById = new Map(docs.map((doc) => [doc.id, doc]));
      engine = new MiniSearch({
        fields: ['pageTitle', 'heading', 'summary', 'text'],
        storeFields: ['url', 'pageTitle', 'heading', 'summary'],
        // minisearch passes (term, fieldName) — the second arg must
        // never reach tokenize (it would be read as a locale)
        processTerm: (term: string) => tokenize(term),
        searchOptions: { prefix: true, fuzzy: 0.2, boost: { pageTitle: 3, heading: 2, summary: 1.5 } },
      }) as unknown as typeof engine;
      // the index adds documents AFTER construction (searchOptions
      // already carries the defaults the UI relies on)
      (engine as unknown as { addAll: (d: EngineDoc[]) => void }).addAll(docs);
    })().catch((error) => {
      loading = undefined;
      throw error;
    });
    await loading;
  };

  return {
    async search(query: string): Promise<SearchHit[]> {
      if (query.trim() === '') return [];
      try {
        await ensureIndex();
      } catch {
        return []; // a failed corpus load reads as no hits — retried next query
      }
      if (engine === undefined) return [];
      return engine.search(query, { fuzzy: 0.2, prefix: true, boost: { pageTitle: 3, heading: 2, summary: 1.5 } }).map(
        (result) => {
          const doc = docsById.get(result.id);
          return {
            href: result.id,
            pageTitle: doc?.pageTitle ?? '',
            heading: doc?.heading ?? '',
            summary: doc?.summary ?? '',
            terms: result.terms,
            score: result.score,
          };
        },
      );
    },
  };
}

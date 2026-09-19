<!-- search-corpus blueprint: the structured harvest — the final dist's
     semantic markers (heading tree, SectionCard shapes, figcaption) on
     the left, one pass keyed on STRUCTURE not guesses, and the
     engine-neutral corpus landing for any client engine (minisearch
     first) to compile. Terminal diagram idiom; no live component (it
     is a build tool). (tailwindless BP-B 2026-09-16: utilities →
     surface atoms.) -->
<script lang="ts">
  import { bpB } from '../../surface/blueprints-b.stylex';
  import Stack from '$lib/ui/stack';

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<Stack align="center" justify="center" class={cx(bpB.searchCorpusStage)}>
  <Stack direction="column" gap="12" class={cx(bpB.searchCorpusCard)} }>
    <Stack align="center" justify="between" class={cx(bpB.searchCorpusHead)} }>
      <span class={cx(bpB.searchCorpusTitle)}>search-corpus</span>
      <span class={cx(bpB.searchCorpusTag)}
        >structure, not guesses</span
      >
    </Stack>
    <div class={cx(bpB.searchCorpusGrid)}>
      <pre class={cx(bpB.searchCorpusTree)}>dist/*.html
├── h2/h3 (the tree law)
├── §eyebrow/title/summary
└── figure/figcaption</pre>
      <span class={cx(bpB.searchCorpusArrow)}>─▶</span>
      <pre>/search/corpus.json
  pages[] sections[] blocks[]
  kind: prose|code|table
  preset: null (点线面 ready)</pre>
    </div>
    <div class={cx(bpB.searchCorpusFoot)}>
      engine-pluggable (minisearch ▸ fuse ▸ …) · Intl.Segmenter CJK · byte-deterministic
    </div>
  </Stack>
</Stack>

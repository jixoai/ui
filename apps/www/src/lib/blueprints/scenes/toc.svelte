<!-- toc blueprint: the Combo ToC inside a miniature docs page — the
     desktop Rule Tracker rail (progress spine + weight-driven nodes)
     beside the tracked article it reads. The data-region / data-family
     marks are live: toc-engine runs for real and picks the entry that
     holds the line.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Toc from '$lib/ui/toc/toc.svelte';
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

<Stack align="center" justify="center" gap="40" class={cx(bpB.tocStage)}>
  <article class={cx(bpB.tocArticle)}>
    <Stack direction="column" gap="16" } data-family="bp-toc-law">
      <section id="bp-toc-law" class={cx(bpB.tocSection)} data-region="bp-toc-law">
        <h2 class={cx(bpB.tocH2)}>the rule tracker</h2>
        <p class={cx(bpB.tocBody)}>
          Nodes fill by IoM weight — how much of each block holds the viewport. The bold marker
          is the line pick.
        </p>
      </section>
      <section id="bp-toc-weights" class={cx(bpB.tocSection)} data-region="bp-toc-weights">
        <h3 class={cx(bpB.tocH3)}>IoM weights</h3>
        <p class={cx(bpB.tocBody)}>
          intersection ÷ min(block, viewport) — saturates to 1 in both directions.
        </p>
      </section>
    </Stack>
    <section id="bp-toc-rail" class={cx(bpB.tocSection)} data-region="bp-toc-rail">
      <h2 class={cx(bpB.tocH2)}>two surfaces, one engine</h2>
      <p class={cx(bpB.tocBody)}>
        Desktop spine, mobile glass rail — both read the same framework-free engine.
      </p>
    </section>
  </article>
  <aside class={cx(bpB.tocAside)} aria-label="On this page">
    <!-- embedded miniature demo inside the
         blueprint stage — the rail must stay beside its own article, not
         adopt into the site scaffold's real top layer -->
    <Toc
      title="on this page"
      sections={[
        {
          id: 'bp-toc-law',
          label: 'the rule tracker',
          children: [{ id: 'bp-toc-weights', label: 'IoM weights' }],
        },
        { id: 'bp-toc-rail', label: 'two surfaces, one engine' },
      ]}
    />
  </aside>
</Stack>

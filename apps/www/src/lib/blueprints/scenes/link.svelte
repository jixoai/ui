<!-- link blueprint: the two lanes — app route stays same-tab, the
     absolute http(s) href opens a new tab with rel=noreferrer. -->
<script lang="ts">
  import Link from '$lib/ui/link/link.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';
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

<Stack direction="column" align="center" justify="center" gap="16" class={cx(bpA.linkStage)}>
  <Stack direction="column" gap="12" class={cx(bpA.linkColumn)} }>
    <p class={cx(bpA.linkPara)}>
      Read <Link href="/docs/components/markdown.html">the markdown page</Link> in this tab, or
      leave for <Link href="https://github.com/jixoai/ui">the repository</Link> in a new one.
    </p>
    <p class={cx(bpA.linkParaMuted)}>
      The offset keeps the underline off the descenders —
      <Link href="https://commonmark.org">CommonMark</Link> inside muted prose.
    </p>
  </Stack>
  <div class={cx(bpA.linkRow)}>
    <Badge>http(s) → target=_blank</Badge>
    <Badge>rel=noreferrer</Badge>
    <Badge>app routes same-tab</Badge>
  </div>
</Stack>

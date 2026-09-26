<!-- inline-code blueprint: the code-reference chip in prose context —
     the neutral tonal default and outline rung next to explicit
     languages (tokens arrive async, SSR paints the plain chip), with
     the auto-detect lane mixed in. -->
<script lang="ts">
  import InlineCode from '$lib/ui/inline-code/inline-code.svelte';
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

<Stack direction="column" align="start" justify="center" gap="16" class={cx(bpA.inlineCodeStage)}>
  <Stack align="center" wrap gap="12">
    <InlineCode>var(--jx-hit)</InlineCode>
    <InlineCode variant="outline">--jx-tonal</InlineCode>
  </Stack>
  <Stack align="center" wrap gap="12">
    <InlineCode lang="ts">const ink = tokens.length</InlineCode>
    <InlineCode lang="css">{'.jx-press { box-shadow: var(--jx-press-shadow) }'}</InlineCode>
    <InlineCode lang="bash">npm run build:site</InlineCode>
  </Stack>
  <Stack align="center" wrap gap="12">
    <InlineCode>detectInlineLang('npm i')</InlineCode>
    <InlineCode>{'{#snippet slotStart()}'}</InlineCode>
  </Stack>
</Stack>

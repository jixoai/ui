<!-- blockquote blueprint: the frozen two-rung ladder plus one hue
     injection — the quote surface, the banner's shape. -->
<script lang="ts">
  import Blockquote from '$lib/ui/blockquote/blockquote.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import Stack from '$lib/ui/stack';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

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

<Stack direction="column" align="center" justify="center" gap="16" class={cx(bpA.blockquoteStage)}>
  <Stack direction="column" gap="12" class={cx(bpA.blockquoteColumn)}>
    <Blockquote label="Stevens" cite="Thirteen Ways of Looking, XIII">
      It was evening all afternoon. It was snowing, and it was going to snow.
    </Blockquote>
    <Blockquote variant="tonal" class="jx-hue-info" label="Note">
      The streaming prefix never remounts while chunks arrive.
    </Blockquote>
  </Stack>
  <Stack wrap gap="8" }>
    <Badge>outline · tonal — frozen</Badge>
    <Badge>no fill / no ghost</Badge>
    <Badge>cite = footer &gt; cite</Badge>
  </Stack>
</Stack>

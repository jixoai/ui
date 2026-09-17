<!-- avatar blueprint: three silhouettes × three sizes, initials fallback
     only (no network image — the serialization pass must stay
     deterministic). sm carries the halved one-code-point block. -->
<script lang="ts">
  import Avatar from '$lib/ui/avatar/avatar.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

  const variants = ['bevel', 'rounded', 'squircle'] as const;

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

<div class={cx(bpA.avatarStage)}>
  {#each variants as variant (variant)}
    <div class={cx(bpA.avatarRow)}>
      <Avatar name="JX AoI" {variant} size="sm" tooltip={false} />
      <Avatar name="JX AoI" {variant} size="md" tooltip={false} />
      <Avatar name="JX AoI" {variant} size="lg" tooltip={false} />
    </div>
  {/each}
</div>

<!-- avatar blueprint: three silhouettes × three sizes, initials fallback
     only (no network image — the serialization pass must stay
     deterministic). sm carries the halved one-code-point block. -->
<script lang="ts">
  import Avatar from '$lib/ui/avatar/avatar.svelte';

  const variants = ['bevel', 'rounded', 'squircle'] as const;
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-6 p-10">
  {#each variants as variant (variant)}
    <div class="flex items-center gap-5">
      <Avatar name="JX AoI" {variant} size="sm" tooltip={false} />
      <Avatar name="JX AoI" {variant} size="md" tooltip={false} />
      <Avatar name="JX AoI" {variant} size="lg" tooltip={false} />
    </div>
  {/each}
</div>

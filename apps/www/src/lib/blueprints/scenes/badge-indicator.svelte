<!-- badge-indicator blueprint: the live overlay — a dot on an initials
     avatar, a capped count on a real button, and the standalone chip. -->
<script lang="ts">
  import BadgeIndicator from '$lib/ui/badge-indicator.svelte';
  import Avatar from '$lib/ui/avatar.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
</script>

<div class="flex h-full w-full flex-col items-start justify-center gap-8 p-10">
  <div class="flex flex-wrap items-center gap-10">
    <BadgeIndicator dot label="2 unread reviews">
      <Avatar name="Grace Hopper" size="lg" alt="" />
    </BadgeIndicator>
    <BadgeIndicator count={5}>
      <PressButton variant="outline">inbox</PressButton>
    </BadgeIndicator>
    <BadgeIndicator count={250} />
  </div>
  <p class="text-muted-foreground text-sm">
    dot paints brand presence; counts paint destructive and cap at 99+.
  </p>
</div>

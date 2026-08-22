<!-- avatar blueprint: initials fallback (no network image — the
     serialization pass must stay deterministic), three sizes. -->
<script lang="ts">
  import Avatar from '$lib/ui/avatar.svelte';
</script>

<div class="flex h-full w-full items-center justify-center gap-5 p-10">
  <Avatar name="Gaubee" size="sm" />
  <Avatar name="JX AoI" size="md" />
  <Avatar name="Registry" size="lg" />
</div>

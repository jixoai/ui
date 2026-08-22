<!-- radio blueprint: one name group — the selected ring carries the
     primary dot, its siblings stay empty. -->
<script lang="ts">
  import Radio from '$lib/ui/radio.svelte';
</script>

<div class="flex h-full w-full flex-col items-start justify-center p-10">
  <div class="flex w-full max-w-[360px] flex-col gap-4">
    <span class="font-nav text-muted-foreground text-xs uppercase tracking-[0.2em]">plan</span>
    <Radio label="free — public projects" name="bp-plan" />
    <Radio label="pro — private registries" name="bp-plan" checked />
    <Radio label="team — sso + audit log" name="bp-plan" />
  </div>
</div>

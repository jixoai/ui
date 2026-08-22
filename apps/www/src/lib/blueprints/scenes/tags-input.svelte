<!-- tags-input blueprint: chips bound — three committed tags with remove
     affordances, and a capped field showing "3/3 tags" with a pinned
     (non-removable) chip. -->
<script lang="ts">
  import TagsInput, { type Tag } from '$lib/ui/tags-input.svelte';

  const suggestions: Tag[] = [
    { value: 'svelte' },
    { value: 'typescript' },
    { value: 'node' },
    { value: 'vite' },
    { value: 'playwright' },
  ];

  let stack = $state<Tag[]>([{ value: 'svelte' }, { value: 'typescript' }, { value: 'node' }]);
  let targets = $state<Tag[]>([
    { value: 'npm' },
    { value: 'jsr', removable: false },
    { value: 'github-pages', removable: false },
  ]);
</script>

<div class="flex h-full w-full flex-col justify-center p-10">
  <div class="flex w-full max-w-[460px] flex-col gap-6">
    <TagsInput id="bp-tags" label="stack" {suggestions} bind:tags={stack} />
    <TagsInput id="bp-tags-cap" label="targets" maxTags={3} bind:tags={targets} />
  </div>
</div>

<!-- tags-input blueprint: chips bound — three committed tags with remove
     affordances, and a capped field showing "3/3 tags" with a pinned
     (non-removable) chip.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import TagsInput, { type Tag } from '$lib/ui/tags-input/tags-input.svelte';
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

<Stack direction="column" justify="center" class={cx(bpB.tagsInputStage)}>
  <Stack direction="column" gap="24" class={cx(bpB.tagsInputCol)}>
    <TagsInput id="bp-tags" label="stack" {suggestions} bind:tags={stack} />
    <TagsInput id="bp-tags-cap" label="targets" maxTags={3} bind:tags={targets} />
  </Stack>
</Stack>

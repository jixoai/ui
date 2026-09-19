<!-- entity blueprint: the entity law — border is objecthood, but a
     well's edge is structure (r14-12). Depth 0 owns edge + ground;
     depth 1 keeps the well hairline and dissolves the ground; the
     force-spend restores the ground; the opt-out dissolves fully. -->
<script lang="ts">
  import Input from '$lib/ui/input/input.svelte';
  import { provideEntity } from '$lib/entity.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  const depth = provideEntity();

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

<Stack direction="column" justify="center" gap="16" class={cx(bpA.entityStage)}>
  <div class={cx(bpA.entityEyebrow)}>
    entity law · border = objecthood · the well edge is structure
  </div>
  <Stack align="start" wrap gap="24">
    <label class={cx(bpA.entityLabel)}>
      <span class={cx(bpA.entityLabelNote)}>page level (depth 0)</span>
      <Input type="text" value="owns its edge" />
    </label>
    <Stack direction="column" gap="12" class={cx(bpA.entityPanel)} } data-jx-entity={depth}>
      <div class={cx(bpA.entityEyebrow)}>
        the entity (depth 1) — one solid object
      </div>
      <label class={cx(bpA.entityLabelInner)}>
        <span class={cx(bpA.entityLabelNote)}>depth 1 — edge stays, ground dissolves</span>
        <Input type="text" value="hairline + inset, no ground" />
      </label>
      <label class={cx(bpA.entityLabelInner)}>
        <span class={cx(bpA.entityLabelNote)}>force-spend (data-assert-border)</span>
        <Input type="text" value="ground spent early" data-assert-border />
      </label>
      <label class={cx(bpA.entityLabelInner)}>
        <span class={cx(bpA.entityLabelNote)}>opt-out (data-dissolve-border)</span>
        <Input type="text" value="the inset alone" data-dissolve-border />
      </label>
    </Stack>
  </Stack>
</Stack>

<!-- form-field blueprint: the faceless bridge has no box (display:
     contents, aria-hidden) — the shot is the family it serves. Real
     filled controls: a native Input and the custom Select (which feeds
     the committed VALUE to <jx-form-field name value> through
     ElementInternals), plus the submit that lands them in FormData.
     Reset/disable flow back as jx-reset / jx-disabled events. -->
<script lang="ts">
  import Input from '$lib/ui/input/input.svelte';
  import Select from '$lib/ui/select/select.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
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

<div class={cx(bpA.formFieldStage)}>
  <form class={cx(bpA.formFieldForm)}>
    <Stack align="center" justify="between">
      <span class={cx(bpA.formFieldTitle)}>deploy form</span>
      <Badge>FormData</Badge>
    </Stack>
    <Input label="project" name="project" value="jixoai-www" />
    <Select
      label="environment"
      name="environment"
      value="production"
      options={[
        { value: 'preview', label: 'preview' },
        { value: 'production', label: 'production' },
      ]}
    />
    <div class={cx(bpA.formFieldFoot)}>
      <span class={cx(bpA.formFieldNote)}
        >&lt;jx-form-field&gt; · display: contents</span
      >
      <PressButton variant="fill" type="submit">submit</PressButton>
    </div>
  </form>
</div>

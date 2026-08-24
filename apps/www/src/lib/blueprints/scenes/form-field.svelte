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
</script>

<div class="flex h-full w-full items-center justify-center p-10">
  <form class="border-border bg-muted/30 flex w-full max-w-[400px] flex-col gap-5 border p-6">
    <div class="flex items-center justify-between">
      <span class="font-nav text-[11px] uppercase tracking-[0.24em]">deploy form</span>
      <Badge tone="primary">FormData</Badge>
    </div>
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
    <div class="mt-1 flex items-center justify-between gap-3">
      <span class="font-nav text-muted-foreground text-[10px]"
        >&lt;jx-form-field&gt; · display: contents</span
      >
      <PressButton variant="primary" type="submit">submit</PressButton>
    </div>
  </form>
</div>

<!-- section-card blueprint: the content atom itself, nested small cards. -->
<script lang="ts">
  import SectionCard from '$lib/ui/section-card.svelte';
  import Badge from '$lib/ui/badge.svelte';
</script>

<div class="flex h-full w-full items-center justify-center p-10">
  <div class="w-full max-w-[420px]">
    <SectionCard headingLevel={2} eyebrow="registry" title="section-card" summary="The content atom of the site grammar: bordered card, header block with eyebrow, title, summary.">
      <div class="flex gap-3">
        <Badge tone="primary">ui</Badge>
        <Badge>radius 0</Badge>
      </div>
    </SectionCard>
  </div>
</div>

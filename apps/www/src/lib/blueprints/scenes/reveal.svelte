<!-- reveal blueprint: the one-shot scroll entrance frozen at three
     successive stages — settled (is-revealed, risen), mid-transition
     (first pixel intersecting) and the static initial state below the
     fold. Real actions cannot show the timeline here (the render pass
     runs reduced-motion, where every entrance settles instantly), so the
     cards carry the stages with opacity/rise stands-ins — the exact
     visual vocabulary the action animates. The action itself is never
     mounted in this scene, per the serialization contract. -->
<script lang="ts">
  import SectionCard from '$lib/ui/section-card.svelte';
  import Badge from '$lib/ui/badge.svelte';
</script>

<div class="flex h-full w-full items-center justify-center gap-5 p-10">
  <div class="w-[164px]">
    <SectionCard
      eyebrow="t · settled"
      title="is-revealed"
      summary="Risen and fully opaque — the class stays forever after first intersection."
    >
      <Badge tone="primary">done</Badge>
    </SectionCard>
  </div>
  <div class="w-[164px] translate-y-2 opacity-60">
    <SectionCard
      eyebrow="t · entering"
      title="intersecting"
      summary="The first pixel just crossed the viewport edge — the transition is mid-flight."
    >
      <Badge>in view</Badge>
    </SectionCard>
  </div>
  <div class="w-[164px] translate-y-4 opacity-30">
    <SectionCard
      eyebrow="t · before"
      title="below the fold"
      summary="The static hidden initial state, authored in markup — zero mount-time flash."
    >
      <Badge>waiting</Badge>
    </SectionCard>
  </div>
</div>

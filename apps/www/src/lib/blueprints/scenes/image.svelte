<!-- image blueprint: deterministic inline SVG data-URL sources (no
     network) — a cover picture plus a two-thumb row, intrinsic
     width/height reserved on every one (the no-CLS contract). -->
<script lang="ts">
  import Image from '$lib/ui/image/image.svelte';

  const COVER_SRC =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 240'%3E%3Crect width='480' height='240' fill='%23e4e4e7'/%3E%3Cpath d='M0 190 120 90l80 70 90-110 190 140' fill='none' stroke='%23a1a1aa' stroke-width='8'/%3E%3Ccircle cx='390' cy='60' r='26' fill='%23a1a1aa'/%3E%3C/svg%3E";
  const THUMB_A_SRC =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 224 140'%3E%3Crect width='224' height='140' fill='%23d4d4d8'/%3E%3Crect x='24' y='24' width='176' height='92' fill='none' stroke='%2371717a' stroke-width='4'/%3E%3C/svg%3E";
  const THUMB_B_SRC =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 224 140'%3E%3Crect width='224' height='140' fill='%23e4e4e7'/%3E%3Cpath d='M20 120 112 40l92 80' fill='none' stroke='%2371717a' stroke-width='6'/%3E%3C/svg%3E";
</script>

<div class="flex h-full w-full flex-col justify-center gap-4 p-10">
  <Image src={COVER_SRC} alt="abstract gray ridgeline cover" width={480} height={240} class="w-full" />
  <div class="flex gap-4">
    <div class="flex min-w-0 flex-1 flex-col gap-1.5">
      <Image src={THUMB_A_SRC} alt="framed gray thumbnail" width={224} height={140} class="w-full" />
      <p class="font-mono text-xs text-muted-foreground">registry cover</p>
    </div>
    <div class="flex min-w-0 flex-1 flex-col gap-1.5">
      <Image src={THUMB_B_SRC} alt="angular gray thumbnail" width={224} height={140} class="w-full" />
      <p class="font-mono text-xs text-muted-foreground">og card</p>
    </div>
  </div>
</div>

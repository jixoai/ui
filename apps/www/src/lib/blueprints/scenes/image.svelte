<!-- image blueprint: deterministic inline SVG data-URL sources (no
     network) — a cover picture plus a two-thumb row, intrinsic
     width/height reserved on every one (the no-CLS contract). -->
<script lang="ts">
  import Image from '$lib/ui/image/image.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  const COVER_SRC =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 240'%3E%3Crect width='480' height='240' fill='%23e4e4e7'/%3E%3Cpath d='M0 190 120 90l80 70 90-110 190 140' fill='none' stroke='%23a1a1aa' stroke-width='8'/%3E%3Ccircle cx='390' cy='60' r='26' fill='%23a1a1aa'/%3E%3C/svg%3E";
  const THUMB_A_SRC =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 224 140'%3E%3Crect width='224' height='140' fill='%23d4d4d8'/%3E%3Crect x='24' y='24' width='176' height='92' fill='none' stroke='%2371717a' stroke-width='4'/%3E%3C/svg%3E";
  const THUMB_B_SRC =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 224 140'%3E%3Crect width='224' height='140' fill='%23e4e4e7'/%3E%3Cpath d='M20 120 112 40l92 80' fill='none' stroke='%2371717a' stroke-width='6'/%3E%3C/svg%3E";

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

<Stack direction="column" justify="center" gap="16" class={cx(bpA.imageStage)}>
  <Image src={COVER_SRC} alt="abstract gray ridgeline cover" width={480} height={240} class={cx(bpA.imageCover)} />
  <div class={cx(bpA.imageRow)}>
    <Stack direction="column" gap="6" class={cx(bpA.imageThumb)}>
      <Image src={THUMB_A_SRC} alt="framed gray thumbnail" width={224} height={140} class={cx(bpA.imageCover)} />
      <p class={cx(bpA.imageCaption)}>registry cover</p>
    </Stack>
    <Stack direction="column" gap="6" class={cx(bpA.imageThumb)}>
      <Image src={THUMB_B_SRC} alt="angular gray thumbnail" width={224} height={140} class={cx(bpA.imageCover)} />
      <p class={cx(bpA.imageCaption)}>og card</p>
    </Stack>
  </div>
</Stack>

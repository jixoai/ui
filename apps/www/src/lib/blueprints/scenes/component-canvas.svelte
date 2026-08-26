<!-- component-canvas blueprint: the documentation workbench itself —
     header (title + Source), the LIVE demo stage with a small real demo,
     and the `</> Code` bar over the collapsed tree+code drawer. The
     drawer's open state is internal to the component (no prop), so the
     shot shows the canvas in its landed reading form. -->
<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';

  const files: TreeFile[] = [
    {
      name: 'src/lib/ui/usage.svelte',
      lang: 'svelte',
      content: `<PressButton variant="fill">deploy</PressButton>
<PressButton variant="outline">cancel</PressButton>`,
    },
    {
      name: 'registry/files/ui/press-button/press-button.svelte',
      lang: 'svelte',
      content: `<!-- the brutalist press-physics button: lifts on hover, presses back on active -->`,
    },
  ];
</script>

<div class="flex h-full w-full items-center justify-center p-8">
  <ComponentCanvas title="press-button" files={files}>
    <div class="flex items-center gap-3">
      <PressButton variant="fill">deploy</PressButton>
      <PressButton variant="outline">cancel</PressButton>
      <Badge>live demo</Badge>
    </div>
  </ComponentCanvas>
</div>

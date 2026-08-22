<!-- steps blueprint: the wizard at step 2 of 4 — the done step is a link
     back (button marker with the check glyph), the current is aria-current,
     the future is inert. -->
<script lang="ts">
  import Steps from '$lib/ui/steps.svelte';
  import type { StepItem } from '$lib/ui/steps.svelte';

  const steps: StepItem[] = [
    { title: 'connect', description: 'link the git origin' },
    { title: 'build', description: 'install + typecheck' },
    { title: 'preview', description: 'deploy to staging' },
    { title: 'ship', description: 'promote to production' },
  ];
</script>

<div class="flex h-full w-full flex-col justify-center p-10">
  <Steps steps={steps} current={1} onstepclick={() => {}} />
</div>

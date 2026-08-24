<!-- date-picker blueprint: single mode with a committed date — the
     calendar panel forced open on the committed month, the picked day
     filled primary (use:forceShowPopovers). -->
<script lang="ts">
  import DatePicker from '$lib/ui/date-picker/date-picker.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import { forceShowPopovers } from '$lib/blueprints/force-show';

  // a month away from "today" keeps the today ring out of the frame —
  // the panel view follows the committed value, not the clock
  let deploy = $state('2026-03-18');
</script>

<div class="flex h-full w-full flex-col justify-center gap-5 p-10" use:forceShowPopovers>
  <div class="flex flex-col gap-3 opacity-60">
    <Skeleton class="h-3 w-1/2"></Skeleton>
    <Skeleton class="h-3 w-2/3"></Skeleton>
  </div>
  <div class="w-full max-w-[280px]">
    <DatePicker id="bp-date" label="deploy date" bind:value={deploy} />
  </div>
</div>

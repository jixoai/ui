<!-- input-group blueprint: the joined field shell — one bezel, addon
     seams, the native input member, a press-button riding the
     inline-end addon lane. -->
<script lang="ts">
  import InputGroup from '$lib/ui/input-group/input-group.svelte';
  import InputGroupAddon from '$lib/ui/input-group/input-group-addon.svelte';
  import InputGroupInput from '$lib/ui/input-group/input-group-input.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
</script>

<div class="flex h-full w-full flex-col items-start justify-center gap-5 p-10">
  <InputGroup label="repository url" class="w-[26rem]">
    <InputGroupAddon>https://</InputGroupAddon>
    <InputGroupInput name="bp-igroup-site" placeholder="github.com/owner/repo" />
  </InputGroup>
  <InputGroup label="deploy target" class="w-[26rem]">
    <InputGroupAddon>--host=</InputGroupAddon>
    <InputGroupInput name="bp-igroup-host" value="production" />
    <InputGroupAddon align="inline-end">
      <PressButton variant="tonal">check</PressButton>
    </InputGroupAddon>
  </InputGroup>
</div>

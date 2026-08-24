<!-- native-select blueprint: the platform picker — a committed value on
     the closed control, and the multiple listbox posture beside it. -->
<script lang="ts">
  import NativeSelect from '$lib/ui/native-select/native-select.svelte';

  let plan = $state('pro');
</script>

<div class="flex h-full w-full flex-col justify-center p-10">
  <div class="grid w-full max-w-[520px] grid-cols-2 gap-8">
    <NativeSelect id="bp-native-select" label="plan" bind:value={plan}>
      <option value="free">free</option>
      <option value="pro">pro</option>
      <option value="team">team</option>
    </NativeSelect>
    <NativeSelect id="bp-native-multi" label="targets" multiple size={4}>
      <option>origin/main</option>
      <option selected>github/pages</option>
      <option>npm/rc</option>
      <option>jsr/latest</option>
    </NativeSelect>
  </div>
</div>

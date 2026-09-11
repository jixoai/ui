<!-- spin blueprint (spin-ora-svg-lane D2): the one-name lane in three
     postures — the default text spinner (dots), the svg artifact lane
     (blocks-wave at its size slot), and the wrapping container. -->
<script lang="ts">
  import Spin from '$lib/ui/spin';
</script>

<div class="flex h-full w-full items-center justify-center gap-10 p-10">
  <Spin label="loading checks" />
  <Spin spinner="blocks-wave" label="building" size={24} />
  <Spin label="building" class="border border-border">
    <div class="text-muted-foreground p-6 text-sm">building apps/www…</div>
  </Spin>
</div>

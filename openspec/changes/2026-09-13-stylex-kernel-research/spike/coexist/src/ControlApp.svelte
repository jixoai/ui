<script lang="ts">
  // ControlApp.svelte — the TW-ONLY control build's page: the SAME
  // markup as App.svelte minus every stylex paint (zero stylex
  // imports — the plugin is absent from this build). K elements wear
  // the authored .k-replica (declarations identical to the stylex K
  // paint). This build records P_tw / P_dark / P_lg / the print pair
  // for every CONTROL-BUILD-EQUALITY criterion in the D2 manifest.
</script>

<div data-d2-root data-control>
  <div class="k-replica p-[42px]" data-kernel-root data-d2="d2-01">d2-01</div>

  <div class="jx-pure">
    <input class="jx-control p-[42px]" data-d2="d2-02" />
    <div data-density="default">
      <input class="jx-control p-[42px]" data-d2="d2-02s" />
    </div>
  </div>

  <label class="switch-host">
    <input type="checkbox" checked />
    <div class="rail" data-d2="d2-03-on">d2-03-on</div>
  </label>
  <label class="switch-host">
    <input type="checkbox" />
    <div class="rail bg-red-500" data-d2="d2-03-off-red">d2-03-off-red</div>
  </label>

  <div class="flex" data-jx-print="hide" data-d2="d2-04a">d2-04a (flex/print:none)</div>
  <div class="overflow-auto max-h-[32rem]" style="height: 40px" data-jx-canvas-scroll data-d2="d2-04b">
    d2-04b content line 1<br />line 2<br />line 3<br />line 4<br />line 5
  </div>

  <div class="jx-pure">
    <input class="jx-control p-[42px]" data-d2="d2-05" />
  </div>

  <div class="consumer-force" data-d2="d2-06">d2-06</div>

  <div class="p-[10px] p-[20px]" data-d2="d2-07">d2-07</div>

  <div style="--jx-glass-radius: 14px">
    <div class="k-glass-replica" data-d2="d2-08-in">d2-08-in</div>
  </div>
  <div class="k-glass-replica" data-d2="d2-08-out">d2-08-out</div>

  <div class="dark">
    <div data-density="lg">
      <div class="k-replica" data-d2="d2-10">d2-10</div>
    </div>
  </div>
  <div class="k-replica" data-d2="d2-10-base">d2-10-base</div>

  <div class="animate-pulse" data-d2="d2-11">d2-11</div>

  <div class="jx-pure">
    <input type="checkbox" checked data-d2="d2-12" />
  </div>

  <div data-jx-print-sim>
    <div class="sim-probe" data-d2="d2-13">d2-13</div>
  </div>

  <nav class="jx-nav" data-d2="d2-15" style="position: relative; height: 60px">
    <button popovertarget="d2-panel">open panel</button>
    <div id="d2-panel" popover class="jx-pop jx-subpanel" style="position-area: bottom span-left">
      <div data-d2="d2-15-panel">panel</div>
    </div>
    <div id="d2-mega" popover class="jx-pop jx-subpanel jx-subpanel-mega" style="position-area: bottom span-left">
      <div data-d2="d2-15-mega">mega</div>
    </div>
  </nav>
</div>

<script lang="ts">
  // App.svelte — the D2 fixture surface (coexist builds: O1/O2).
  // StyleX paints: the kernel K (padding var(--jx-inset) + background
  // var(--primary), longhands — StyleX 0.19 rejects the background
  // shorthand), the glass-radius consumer (D2-08), the probe color
  // (D2-09), the switch rail static paint (D2-03).
  // NOTE: spread BEFORE static class in every mixed element — the
  // static class must survive the attrs spread (verified in build
  // output; see README).
  import * as stylex from '@stylexjs/stylex';
  import { d2vars, d2green } from './d2.stylex';

  // Svelte 5 does NOT merge a static `class` with a spread class (the
  // later one REPLACES) — every TW+stylex mixed element goes through
  // this explicit merge so both class sets land on the element.
  const mix = (tw: string, s: { class: string }) => ({ ...s, class: `${tw} ${s.class}` });

  const styles = stylex.create({
    // K — the kernel element (D2-01/05/06/10)
    kernel: {
      paddingTop: 'var(--jx-inset)',
      paddingBottom: 'var(--jx-inset)',
      paddingInlineStart: 'var(--jx-inset)',
      paddingInlineEnd: 'var(--jx-inset)',
      backgroundColor: 'var(--primary)',
      width: '120px',
      minHeight: '24px',
    },
    // D2-08 — backdrop-filter consuming --jx-glass-radius with a 10px fallback
    glassConsumer: {
      backdropFilter: 'blur(var(--jx-glass-radius, 10px))',
      width: '80px',
      height: '24px',
      backgroundColor: '#334455',
    },
    // D2-09 — the probe color consuming the defineVars token
    probeColor: {
      color: d2vars['--d2-probe-color'],
    },
    // D2-03 — the switch rail's stylex STATIC paint
    rail: {
      backgroundColor: '#111111',
      width: '60px',
      height: '16px',
    },
  });
</script>

<div data-d2-root>
  <!-- D2-01 core-i: K + consumer utility p-[42px] (O1: utility WINS → 42px; O2-INV: 12px) -->
  <div {...mix('p-[42px]', stylex.attrs(styles.kernel))} data-kernel-root data-d2="d2-01">d2-01</div>

  <!-- D2-02 core-ii: .jx-pure subtree + jx-control alias + consumer utility (alias WINS → 8px 12px) -->
  <div class="jx-pure">
    <input class="jx-control p-[42px]" data-d2="d2-02" />
    <!-- D2-02 SECONDARY: the real-theme chain activated per-subtree -->
    <div data-density="default">
      <input class="jx-control p-[42px]" data-d2="d2-02s" />
    </div>
  </div>

  <!-- D2-03 core-iii: the switch carve-out (checked → rgb(255,0,0)) -->
  <label class="switch-host">
    <input type="checkbox" checked />
    <div {...mix('rail', stylex.attrs(styles.rail))} data-d2="d2-03-on">d2-03-on</div>
  </label>
  <!-- D2-03 unchecked + consumer bg-red-500 (O1: consumer WINS → rgb(239,68,68)) -->
  <label class="switch-host">
    <input type="checkbox" />
    <div {...mix('rail bg-red-500', stylex.attrs(styles.rail))} data-d2="d2-03-off-red">d2-03-off-red</div>
  </label>

  <!-- D2-04 core-iv: the print whitelist (screen: flex/auto; print: none/visible+none) -->
  <div class="flex" data-jx-print="hide" data-d2="d2-04a">d2-04a (flex/print:none)</div>
  <div class="overflow-auto max-h-[32rem]" style="height: 40px" data-jx-canvas-scroll data-d2="d2-04b">
    d2-04b content line 1<br />line 2<br />line 3<br />line 4<br />line 5
  </div>

  <!-- D2-05 negative-v: same as D2-02 primary, consumer utility LOSES -->
  <div class="jx-pure">
    <input class="jx-control p-[42px]" data-d2="d2-05" />
  </div>

  <!-- D2-06 !important: consumer-force beats the stylex layer -->
  <div {...mix('consumer-force', stylex.attrs(styles.kernel))} data-d2="d2-06">d2-06</div>

  <!-- D2-07 same-layer order: TW's own pair in ONE class string -->
  <div class="p-[10px] p-[20px]" data-d2="d2-07">d2-07</div>

  <!-- D2-08 inline channel: --jx-glass-radius via inline custom prop -->
  <div style="--jx-glass-radius: 14px">
    <div {...stylex.attrs(styles.glassConsumer)} data-d2="d2-08-in">d2-08-in</div>
  </div>
  <div {...stylex.attrs(styles.glassConsumer)} data-d2="d2-08-out">d2-08-out</div>

  <!-- D2-09 custom-prop precedence: defineVars default + createTheme override
       (createTheme yields a CompiledStyles OBJECT — it goes through
       stylex.attrs, never straight into class=) -->
  <div {...stylex.attrs(styles.probeColor)} data-d2="d2-09-out">d2-09-out</div>
  <div {...stylex.attrs(d2green)}>
    <div {...stylex.attrs(styles.probeColor)} data-d2="d2-09-scoped">d2-09-scoped</div>
  </div>

  <!-- D2-10 dark+density: real token blocks; K inside .dark + [data-density=lg] -->
  <div class="dark">
    <div data-density="lg">
      <div {...stylex.attrs(styles.kernel)} data-d2="d2-10">d2-10</div>
    </div>
  </div>
  <div {...stylex.attrs(styles.kernel)} data-d2="d2-10-base">d2-10-base</div>

  <!-- D2-11 reduced-motion: animate-pulse + the unlayered :where kill -->
  <div class="animate-pulse" data-d2="d2-11">d2-11</div>

  <!-- D2-12 forced-colors: .jx-pure + checkbox (real Part C law) -->
  <div class="jx-pure">
    <input type="checkbox" checked data-d2="d2-12" />
  </div>

  <!-- D2-13 print-sim exclusion -->
  <div data-jx-print-sim>
    <div class="sim-probe" data-d2="d2-13">d2-13</div>
  </div>

  <!-- D2-14 surface-kernel: the real override (content:none) + the :where variant that LOSES -->
  <div class="jx-tip jx-surface" data-arrow data-d2="d2-14a">
    <div class="jx-tip-shadow" data-d2="d2-14a-shadow">d2-14a</div>
  </div>
  <div class="jx-tipx jx-surface" data-arrow data-d2="d2-14w">
    <div class="jx-tip-shadow" data-d2="d2-14w-shadow">d2-14w</div>
  </div>

  <!-- D2-15 terminal-header: nav + subpanels with INLINE position-area -->
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

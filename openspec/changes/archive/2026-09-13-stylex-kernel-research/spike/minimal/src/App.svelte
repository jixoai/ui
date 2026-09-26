<script lang="ts">
  // App.svelte — the D1 probe surface for spike/minimal.
  // Every element is tagged data-d1="<fixture>" so the playwright
  // probes (scripts/probe-dev.mjs, scripts/probe-prod.mjs) can address
  // them without relying on class hashes.
  //
  // AUTHORING NOTE (spike finding): StyleX 0.19.0 does NOT support the
  // `background`/`border` SHORTHANDS — with the default silent
  // validation mode they are dropped without any diagnostic. All
  // paints here use longhands (backgroundColor, borderColor...) and
  // the vite config pins propertyValidationMode:'throw'.
  import * as stylex from '@stylexjs/stylex';
  import { tokens } from './tokens.stylex';

  // D1-08: $state-driven dynamic style value (runtime-decided width)
  let wide = $state(false);

  const spin = stylex.keyframes({
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  });

  const styles = stylex.create({
    // D1-01/D1-05/D1-07: static paint through tokens (defineVars —
    // consuming the VarGroup values applies the vars class, which is
    // what defines --probe-bg/--probe-fg on the element scope)
    probe: {
      backgroundColor: tokens['--probe-bg'],
      color: tokens['--probe-fg'],
      padding: '16px',
    },
    // D1-02: the HMR-edit target — probe-dev.mjs rewrites the literal
    // '#00aa33' in THIS object via a file write and expects the
    // computed background to follow without a full page reload.
    hmrTarget: {
      backgroundColor: '#00aa33',
      width: '240px',
      height: '24px',
    },
    // D1-09 pseudo-class
    hoverable: {
      padding: '8px',
      backgroundColor: '#0b0b0b',
      ':hover': {
        backgroundColor: '#ffcc00',
      },
    },
    // D1-09 keyframes
    spinner: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      borderWidth: '3px',
      borderStyle: 'solid',
      borderColor: '#223344',
      animationName: spin,
      animationDuration: '1.5s',
      animationIterationCount: 'infinite',
      animationTimingFunction: 'linear',
    },
    dynBox: {
      height: '24px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#999999',
    },
    // D1-08: the TYPED dynamic idiom — stylex.create accepts style
    // FACTORIES; the runtime-decided value flows as the call argument
    // and degrades to styleq + inline style (L1 §5's prediction).
    dynWidth: (width: string) => ({ width }),
  });

  function toggle() {
    wide = !wide;
  }
</script>

<div data-d1="root">
  <div {...stylex.attrs(styles.probe)} data-d1="probe">stylex probe (token bg)</div>

  <div {...stylex.attrs(styles.hmrTarget)} data-d1="hmr">hmr target</div>

  <div {...stylex.attrs(styles.hoverable)} data-d1="hover">hover me</div>

  <div {...stylex.attrs(styles.spinner)} data-d1="keyframes"></div>

  <!-- D1-08: factory form — runtime-decided width; the probe records
       whether the swap lands as inline style or class swap (expected:
       styleq + inline). -->
  <div
    {...stylex.attrs(styles.dynBox, styles.dynWidth(wide ? '220px' : '120px'))}
    data-d1="dyn"
  >dyn width: {wide ? '220px' : '120px'}</div>
  <button data-d1="dyn-toggle" onclick={toggle}>toggle width</button>
</div>

<script lang="ts">
  // /dynamic — the runtime-decided-styles route: widths/gaps from $state
  // through stylex.create FACTORIES (the typed dynamic idiom — degrades
  // to a CSS custom property + inline style at runtime).
  import * as stylex from '@stylexjs/stylex';

  let width = $state(160);
  let gap = $state(12);

  const styles = stylex.create({
    box: {
      height: '32px',
      backgroundColor: '#234a6b',
      color: '#ffffff',
    },
    dynWidth: (w: number) => ({ width: `${w}px` }),
    row: {
      display: 'flex',
      alignItems: 'center',
    },
    dynGap: (g: number) => ({ gap: `${g}px` }),
    lane: {
      width: '48px',
      height: '32px',
      backgroundColor: '#7c5cff',
    },
    input: {
      marginRight: '12px',
    },
  });
</script>

<div {...stylex.attrs(styles.box, styles.dynWidth(width))} data-ssg="dyn-box">
  dynamic width: {width}px
</div>

<div {...stylex.attrs(styles.row, styles.dynGap(gap))} data-ssg="dyn-row" style="margin-top: 16px">
  <div {...stylex.attrs(styles.lane)}></div>
  <div {...stylex.attrs(styles.lane)}></div>
  <div {...stylex.attrs(styles.lane)}></div>
</div>

<p>
  <label>
    width
    <input {...stylex.attrs(styles.input)} type="range" min="80" max="480" bind:value={width} />
    {width}px
  </label>
</p>
<p>
  <label>
    gap
    <input {...stylex.attrs(styles.input)} type="range" min="0" max="48" bind:value={gap} />
    {gap}px
  </label>
</p>

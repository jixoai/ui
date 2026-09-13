<script lang="ts">
  // +page.svelte — the static route: prerendered StyleX paints (the
  // D1-04 class-constant target), theme/density switcher (D1-10's
  // root toggles), hover + keyframes (D1-09 prod parity with
  // spike/minimal).
  import * as stylex from '@stylexjs/stylex';
  import { goto } from '$app/navigation';
  import { ssgVars } from '../lib/tokens.stylex';

  let { data } = $props();

  const spin = stylex.keyframes({
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  });

  const styles = stylex.create({
    hero: {
      backgroundColor: ssgVars['--ssg-card'],
      color: ssgVars['--ssg-card-fg'],
      padding: 'var(--jx-inset)',
      borderRadius: '8px',
      maxWidth: '560px',
    },
    probe: {
      backgroundColor: '#123456',
      color: '#abcdef',
      padding: '16px',
      marginTop: '12px',
    },
    hoverable: {
      padding: '8px',
      backgroundColor: '#0b0b0b',
      color: '#ffffff',
      ':hover': {
        backgroundColor: '#ffcc00',
      },
    },
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
    k: {
      padding: 'var(--jx-inset)',
      backgroundColor: 'var(--ssg-accent)',
      marginTop: '12px',
      color: '#ffffff',
    },
    btn: {
      marginRight: '8px',
      padding: '6px 10px',
    },
  });

  const setTheme = (t: 'light' | 'dark') => goto(`?theme=${t}&density=${data.density ?? 'default'}`);
  const setDensity = (d: 'default' | 'lg') => goto(`?theme=${data.theme ?? 'light'}&density=${d}`);
</script>

<div {...stylex.attrs(styles.hero)} data-ssg="hero">
  <h1>stylex spike ssg — static route</h1>
  <div {...stylex.attrs(styles.probe)} data-ssg="probe">probe (bg #123456)</div>
  <div {...stylex.attrs(styles.k)} data-ssg="k">K — padding var(--jx-inset) / bg var(--ssg-accent)</div>
  <div {...stylex.attrs(styles.hoverable)} data-ssg="hover">hover me</div>
  <div {...stylex.attrs(styles.spinner)} data-ssg="keyframes"></div>

  <p>
    theme/density switcher (D1-10 root toggles):
    <button {...stylex.attrs(styles.btn)} onclick={() => setTheme('light')}>light</button>
    <button {...stylex.attrs(styles.btn)} onclick={() => setTheme('dark')}>dark</button>
    <button {...stylex.attrs(styles.btn)} onclick={() => setDensity('default')}>density default</button>
    <button {...stylex.attrs(styles.btn)} onclick={() => setDensity('lg')}>density lg</button>
  </p>
  <p><a href="/dynamic">/dynamic — runtime-decided styles route</a></p>
</div>

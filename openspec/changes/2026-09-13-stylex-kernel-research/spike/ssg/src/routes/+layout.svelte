<script lang="ts">
  // +layout.svelte — the official dev-HMR boilerplate from
  // examples/example-sveltekit: the virtual runtime import keeps the
  // dev <style data-stylex> fresh under HMR; the /virtual:stylex.css
  // link covers the dev path where runtimeInjection alone would miss
  // server-rendered first paint.
  import * as stylex from '@stylexjs/stylex';
  import '../app.css';

  if (import.meta.env.DEV) {
    // @ts-expect-error virtual module not typed
    $effect(() => import('virtual:stylex:runtime'));
  }

  // root-level theme/density state (D1-10's toggleable .dark +
  // [data-density] on the ROOT element)
  let { data, children } = $props();

  $effect(() => {
    document.documentElement.classList.toggle('dark', data.theme === 'dark');
    document.documentElement.setAttribute(
      'data-density',
      data.density === 'lg' ? 'lg' : 'default',
    );
  });

  const styles = stylex.create({
    shell: {
      minHeight: '100vh',
      padding: 'var(--jx-inset)',
      fontFamily: 'system-ui, sans-serif',
    },
  });
</script>

<svelte:head>
  {#if import.meta.env.DEV}
    <link rel="stylesheet" href="/virtual:stylex.css" />
  {/if}
</svelte:head>

<div {...stylex.attrs(styles.shell)} data-ssg="layout">{@render children()}</div>

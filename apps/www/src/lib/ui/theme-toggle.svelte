<!--
  jixoai theme toggle (registry/files/ui/theme-toggle.svelte).
  light / dark / system cycler in Share Tech Mono; drives the shared theme
  module contract (localStorage "theme", .dark class + colorScheme on the
  root). Pair with the no-flash inline bootstrap in app.html.
-->
<script lang="ts">
  type Theme = 'light' | 'dark' | 'system';
  const ORDER: Theme[] = ['light', 'dark', 'system'];

  let current = $state<Theme>('system');

  const apply = (theme: Theme): void => {
    const dark =
      theme === 'dark' ||
      (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  };

  const init = (): void => {
    current = (localStorage.getItem('theme') as Theme | null) ?? 'system';
    apply(current);
  };

  const cycle = (): void => {
    current = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]!;
    localStorage.setItem('theme', current);
    apply(current);
  };

  $effect(() => {
    init();
    const media = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => current === 'system' && apply('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  });
</script>

<button
  type="button"
  onclick={cycle}
  class="font-nav border-terminal-foreground/30 text-terminal-foreground/70 hover:border-terminal-foreground/60 hover:text-terminal-foreground border px-2.5 py-1 text-[11px] transition-colors"
  aria-label={`theme: ${current}`}
>
  {current}
</button>

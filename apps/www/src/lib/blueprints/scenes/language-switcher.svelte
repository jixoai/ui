<!-- language-switcher blueprint: both variants on the terminal bezel —
     the pair segment twice (each locale taking its turn as the active
     brand-hue fill) and the menu trigger for three-or-more locale sets.
     The menu's dropdown itself is internal open state the scene cannot
     force, so the shot shows the closed trigger. -->
<script lang="ts">
  import LanguageSwitcher from '$lib/ui/language-switcher/language-switcher.svelte';

  const pairLocales = [
    { code: 'en', label: 'EN', href: '/en/blueprints' },
    { code: 'zh', label: '中文', href: '/zh/blueprints' },
  ];
  const menuLocales = [
    { code: 'en', label: 'English', href: '/en/blueprints' },
    { code: 'zh', label: '简体中文', href: '/zh/blueprints' },
    { code: 'ja', label: '日本語', href: '/ja/blueprints' },
  ];
</script>

<div class="flex h-full w-full items-center justify-center p-10">
  <div
    class="border-border bg-terminal text-terminal-foreground flex w-full max-w-[440px] flex-col gap-4 border p-6"
  >
    <div class="flex items-center justify-between gap-4">
      <span class="font-nav text-[10px] uppercase tracking-[0.24em] opacity-60">pair · en</span>
      <LanguageSwitcher variant="pair" current="en" locales={pairLocales} />
    </div>
    <div class="border-terminal-foreground/10 flex items-center justify-between gap-4 border-t pt-4">
      <span class="font-nav text-[10px] uppercase tracking-[0.24em] opacity-60">pair · zh</span>
      <LanguageSwitcher variant="pair" current="zh" locales={pairLocales} />
    </div>
    <div class="border-terminal-foreground/10 flex items-center justify-between gap-4 border-t pt-4">
      <span class="font-nav text-[10px] uppercase tracking-[0.24em] opacity-60">menu</span>
      <LanguageSwitcher variant="menu" current="en" ariaLabel="Language" locales={menuLocales} />
    </div>
  </div>
</div>

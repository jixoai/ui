<!-- language-switcher blueprint: both variants on the terminal bezel —
     the pair segment twice (each locale taking its turn as the active
     brand-hue fill) and the menu trigger for three-or-more locale sets.
     The menu's dropdown itself is internal open state the scene cannot
     force, so the shot shows the closed trigger. -->
<script lang="ts">
  import LanguageSwitcher from '$lib/ui/language-switcher/language-switcher.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  const pairLocales = [
    { code: 'en', label: 'EN', href: '/en/blueprints' },
    { code: 'zh', label: '中文', href: '/zh/blueprints' },
  ];
  const menuLocales = [
    { code: 'en', label: 'English', href: '/en/blueprints' },
    { code: 'zh', label: '简体中文', href: '/zh/blueprints' },
    { code: 'ja', label: '日本語', href: '/ja/blueprints' },
  ];

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<Stack align="center" justify="center" class={cx(bpA.languageSwitcherStage)}>
  <div class={cx(bpA.languageSwitcherPanel)}>
    <Stack align="center" justify="between" gap="16">
      <span class={cx(bpA.languageSwitcherRowLabel)}>pair · en</span>
      <LanguageSwitcher variant="pair" current="en" locales={pairLocales} />
    </Stack>
    <Stack align="center" justify="between" gap="16" class={cx(bpA.languageSwitcherDividerRow)}>
      <span class={cx(bpA.languageSwitcherRowLabel)}>pair · zh</span>
      <LanguageSwitcher variant="pair" current="zh" locales={pairLocales} />
    </Stack>
    <Stack align="center" justify="between" gap="16" class={cx(bpA.languageSwitcherDividerRow)}>
      <span class={cx(bpA.languageSwitcherRowLabel)}>menu</span>
      <LanguageSwitcher variant="menu" current="en" ariaLabel="Language" locales={menuLocales} />
    </Stack>
  </div>
</Stack>

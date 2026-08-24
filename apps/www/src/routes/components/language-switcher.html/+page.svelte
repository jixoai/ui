<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import LanguageSwitcher from '$lib/ui/language-switcher.svelte';
  import languageSwitcherSource from '$lib/ui/language-switcher.svelte?raw';
  import SectionCard from '$lib/ui/section-card.svelte';
  import NativeSelect from '$lib/ui/native-select.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // ToC outline: the live demo band + the law closing section.

  const usage = `<script lang="ts">
  import LanguageSwitcher from '@ui/language-switcher.svelte';
${close}

<!-- two locales: the segmented pair (active fills brand hue) -->
<LanguageSwitcher
  variant="pair"
  current="en"
  locales={[
    { code: 'en', label: 'EN', href: '/en/current-page' },
    { code: 'zh', label: '中文', href: '/zh/current-page' },
  ]}
/>

<!-- three or more: the dropdown menu (current in brand hue) -->
<LanguageSwitcher
  variant="menu"
  current="en"
  locales={[
    { code: 'en', label: 'English', href: '/en/current-page' },
    { code: 'zh', label: '简体中文', href: '/zh/current-page' },
    { code: 'ja', label: '日本語', href: '/ja/current-page' },
  ]}
/>`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/language-switcher.svelte', content: languageSwitcherSource },
    { name: 'src/lib/ui/language-switcher-usage.svelte', content: usage },
  ];

  // demo locale sets — hrefs point back at this page's anchor
  const pairLocales = [
    { code: 'en', label: 'EN', href: '#language-switcher-demo' },
    { code: 'zh', label: '中文', href: '#language-switcher-demo' },
  ];
  const menuLocales = [
    { code: 'en', label: 'English', href: '#language-switcher-demo' },
    { code: 'zh', label: '简体中文', href: '#language-switcher-demo' },
    { code: 'ja', label: '日本語', href: '#language-switcher-demo' },
    { code: 'de', label: 'Deutsch', href: '#language-switcher-demo' },
  ];

  // Playground protocol: snapshot + reset + echo + live usage follow the
  // page-owns-state contract (the canvas only calls back).
  const canvasInitial = { variant: 'pair' as 'pair' | 'menu' };
  type Variant = typeof canvasInitial.variant;
  let variant = $state<Variant>(canvasInitial.variant);
  function resetCanvas(): void {
    variant = canvasInitial.variant;
  }
  const q = (value: string): string => JSON.stringify(value);
  const usageLive = $derived(`<LanguageSwitcher
  variant=${q(variant)}
  current="en"
  locales={[/* { code, label, href } */]}
/>`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;
</script>

<svelte:head>
  <title>Language switcher · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai language-switcher component: locale switching in two variants — the bilingual segmented pair and the dropdown menu for three or more locales. Anchor-based navigation, so it works on fully prerendered sites."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: aside precedes the content in the DOM — desktop sticky right
       column, mobile the glass single-row bar under the scaffold header -->

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Interactive"
      title="language-switcher — anchors, not buttons"
      summary="Locales are links, not JavaScript state: every entry carries its own href, so the switcher works on fully prerendered sites with zero hydration owed. pair is the bilingual segmented group after the openspecui reference; menu is the dropdown for three or more locales — hard-shadow list on the terminal surface, closing on select, outside click, or Escape."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">pair · menu</span>
        <span class="pill">SSG-safe anchors</span>
        <span class="pill">outside click · Escape close</span>
        <span class="pill">bezel-born styling</span>
      </div>
    </SectionCard>
  </div>

  <div id="language-switcher-demo" data-region="language-switcher-demo" data-family="language-switcher-demo" data-reveal="">
    <ComponentCanvas
      title="language-switcher"
      description="Locale switching in two variants, shown on the terminal bezel surface they were born on — open the menu: the list drops with a hard offset shadow and the current locale in brand hue."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/language-switcher.svelte"
      {files}
      onreset={resetCanvas}
      echo={[{ label: 'variant', value: variant }]}
      resolveFileContent={resolveUsage}
    >
      <!-- the component speaks currentColor + terminal tokens; the dark
           bezel box is its native habitat -->
      <div class="flex w-full flex-col gap-6 border border-border bg-terminal p-5 text-terminal-foreground sm:p-6">
        <div class="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          <label class="flex items-center gap-2.5 text-xs text-terminal-foreground/70">
            <span>pair</span>
            <LanguageSwitcher variant="pair" current="en" locales={pairLocales} />
          </label>
          <label class="flex items-center gap-2.5 text-xs text-terminal-foreground/70">
            <span>menu</span>
            <LanguageSwitcher
              variant="menu"
              current="en"
              ariaLabel="Language"
              locales={menuLocales}
            />
          </label>
        </div>
        <div class="flex flex-col items-center gap-2.5 border-t border-terminal-foreground/15 pt-5">
          <span class="font-nav text-[10px] uppercase tracking-[0.24em] text-terminal-foreground/60">
            driven by the playground
          </span>
          {#if variant === 'pair'}
            <LanguageSwitcher variant="pair" current="en" locales={pairLocales} />
          {:else}
            <LanguageSwitcher variant="menu" current="en" ariaLabel="Language" locales={menuLocales} />
          {/if}
        </div>
      </div>
      {#snippet playground()}
        <div class="jx-play-fields">
          <div class="jx-play-field">
            <NativeSelect
              label="variant"
              onchange={(event) => {
                variant = event.currentTarget.value as Variant;
              }}
            >
              <option value="pair">pair</option>
              <option value="menu">menu</option>
            </NativeSelect>
          </div>
          <p class="jx-play-help">
            the switcher never mutates locale state — the anchors navigate. pair caps itself at two
            entries; menu handles three or more.
          </p>
        </div>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="language-switcher-law" data-reveal="">
    <SectionCard
      family="language-switcher-law"
      headerRegion="language-switcher-law"
      eyebrow="law"
      title="Why href, not onclick"
      summary="A locale switch is navigation, not state mutation. Each locale knows the localized path of the current page, so the anchor carries the full destination and the switcher stays a pure link — crawlable, restorable, and functional before hydration (or without it entirely)."
    >
      <ul class="flex flex-col gap-2 text-[13px] leading-6">
        <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
          <span><code class="text-accent">locales</code> is data:
            <code class="text-accent">&#123; code, label, href &#125;</code> — pair renders the
            first two, menu renders all of them</span></li>
        <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
          <span>menu semantics: <code class="text-accent">aria-haspopup="listbox"</code> on the
            trigger, <code class="text-accent">role="option"</code> +
            <code class="text-accent">aria-selected</code> on entries</span></li>
        <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
          <span>styling speaks <code class="text-accent">currentColor</code> and the terminal
            tokens — it drops onto any bezel or themed surface unchanged</span></li>
        <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
          <span>pair caps itself at two entries by design; the bilingual case is a distinct visual
            pattern, not a truncated menu</span></li>
      </ul>
    </SectionCard>
  </div>
  </div>
</div>

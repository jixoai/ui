<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import LanguageSwitcher from '$lib/ui/language-switcher/language-switcher.svelte';
  import languageSwitcherSource from '$lib/ui/language-switcher/language-switcher.svelte?raw';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayRow, PlaySegmented, PlayHelp } from '$lib/playground';

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
  const variantOptions: { value: Variant; label: string }[] = [
    { value: 'pair', label: 'pair' },
    { value: 'menu', label: 'menu' },
  ];
  const q = (value: string): string => JSON.stringify(value);
  const usageLive = $derived(`<LanguageSwitcher
  variant=${q(variant)}
  current="en"
  locales={[/* { code, label, href } */]}
/>`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  // canvas-everywhere sweep (2026-09-08): hand-authored mirror of the
  // types row below (locale data inlined, same hrefs) — the
  // same-source resolveRawCode migration is the recorded follow-up
  const languageSwitcherTypesDemo = `<script lang="ts">
  import LanguageSwitcher from '@ui/language-switcher.svelte';
${close}

<div class="flex flex-wrap items-start gap-6">
  <div class="flex flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">pair</span><LanguageSwitcher variant="pair" current="en" locales={[
      { code: 'en', label: 'EN', href: '#language-switcher-demo' },
      { code: 'zh', label: '中文', href: '#language-switcher-demo' },
    ]} /><span class="text-muted-foreground text-[12.5px]">segmented group — caps at two entries by design</span></div>
  <div class="flex flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">menu</span><LanguageSwitcher variant="menu" current="en" ariaLabel="Language" locales={[
      { code: 'en', label: 'English', href: '#language-switcher-demo' },
      { code: 'zh', label: '简体中文', href: '#language-switcher-demo' },
      { code: 'ja', label: '日本語', href: '#language-switcher-demo' },
      { code: 'de', label: 'Deutsch', href: '#language-switcher-demo' },
    ]} /><span class="text-muted-foreground text-[12.5px]">nav disclosure — three or more locales</span></div>
</div>`;

  const typesFiles: TreeFile[] = [
    { name: 'language-switcher-types-demo.svelte', content: languageSwitcherTypesDemo, kind: 'usage' },
  ];
  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
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
  // ---- the universal props demo (explicit-props W3-D1) --------------------
  const universalUsage = `<LanguageSwitcher size="medium">…</LanguageSwitcher>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/language-switcher-universal.svelte', content: universalUsage },
  ];

</script>

<svelte:head>
  <title>Language switcher · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai language-switcher component: locale switching in two variants — the bilingual segmented pair and the dropdown menu for three or more locales. Anchor-based navigation, so it works on fully prerendered sites."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <!-- ToC rail: aside precedes the content in the DOM — desktop sticky right
       column, mobile the glass single-row bar under the scaffold header -->

  <div class={cx(rt.shellCol)}>
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Interactive"
      title="language-switcher — anchors, not buttons"
      summary="Locales are links, not JavaScript state: every entry carries its own href, so the switcher works on fully prerendered sites with zero hydration owed. pair is the bilingual segmented group after the openspecui reference; menu is the dropdown for three or more locales — hard-shadow list on the terminal surface, closing on select, outside click, or Escape."
    >
      <div class={cx(rt.wrap12)}>
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
      stage="fill"
      onreset={resetCanvas}
      output={[{ label: 'variant', value: variant }]}
      resolveFileContent={resolveUsage}
    >
      <!-- the component speaks currentColor + terminal tokens; the dark
           bezel box is its native habitat -->
      <div class={cx(rt.lsStage)}>
        <div class={cx(rt.lsChips)}>
          <label class={cx(rt.lsLabel)}>
            <span>pair</span>
            <LanguageSwitcher variant="pair" current="en" locales={pairLocales} />
          </label>
          <label class={cx(rt.lsLabel)}>
            <span>menu</span>
            <LanguageSwitcher
              variant="menu"
              current="en"
              ariaLabel="Language"
              locales={menuLocales}
            />
          </label>
        </div>
        <div class={cx(rt.lsFoot)}>
          <span class={cx(rt.microEyebrow, rt.lsInk60)}>
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
        <PlayFields>
          <PlayRow label="variant">
            <PlaySegmented bind:value={variant} options={variantOptions} />
          </PlayRow>
          <PlayHelp>
            the switcher never mutates locale state — the anchors navigate. pair caps itself at two
            entries; menu handles three or more.
          </PlayHelp>
        </PlayFields>
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
      <ul class={cx(rt.col8, rt.body13)}>
        <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
          <span><code class={cx(rt.inkAccent)}>locales</code> is data:
            <code class={cx(rt.inkAccent)}>&#123; code, label, href &#125;</code> — pair renders the
            first two, menu renders all of them</span></li>
        <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
          <span>menu semantics: <code class={cx(rt.inkAccent)}>aria-haspopup="listbox"</code> on the
            trigger, <code class={cx(rt.inkAccent)}>role="option"</code> +
            <code class={cx(rt.inkAccent)}>aria-selected</code> on entries</span></li>
        <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
          <span>styling speaks <code class={cx(rt.inkAccent)}>currentColor</code> and the terminal
            tokens — it drops onto any bezel or themed surface unchanged</span></li>
        <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
          <span>pair caps itself at two entries by design; the bilingual case is a distinct visual
            pattern, not a truncated menu</span></li>
      </ul>
    </SectionCard>
  </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="Two variants split by locale count: pair for the bilingual case, menu for three or more.">
    <ComponentCanvas title="language-switcher · types" stage="fill" files={typesFiles}>
    <div class={cx(rt.wrapStart24)}>
      <div class={cx(rt.lsPanel)}><span class={cx(rt.eyebrowPrimary)}>pair</span><LanguageSwitcher variant="pair" current="en" locales={pairLocales} /><span class={cx(rt.noteSmall)}>segmented group — caps at two entries by design</span></div>
      <div class={cx(rt.lsPanel)}><span class={cx(rt.eyebrowPrimary)}>menu</span><LanguageSwitcher variant="menu" current="en" ariaLabel="Language" locales={menuLocales} /><span class={cx(rt.noteSmall)}>nav disclosure — three or more locales</span></div>
    </div>
    </ComponentCanvas>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="locales is data — every entry carries the localized href of the current page."><CodeBlock code={usage} lang="svelte" meta="LanguageSwitcher usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="pair is a group of links; menu is a nav-landmark popover of real anchors — links navigate, so no listbox/option fiction (honesty pass, 2026-09-02)."><A11yTable keys={[{ key: 'Tab', action: 'Moves focus through the locale anchors (pair) or the trigger then the open list (menu)' }, { key: 'Enter', action: 'Follows the focused locale anchor — navigation, not state' }, { key: 'Escape', action: 'Closes the menu; outside click closes it too' }]} aria={[{ name: 'aria-label', value: 'ariaLabel ("Language")', description: 'Accessible name for the menu trigger and pair group' }, { name: 'aria-expanded', value: 'true | false', description: 'On the menu trigger — a bare disclosure, no haspopup (the panel is navigation, not a select).' }, { name: 'role', value: 'group / navigation', description: 'pair is a link group; the menu panel is a nav landmark (aria-label) of plain anchors — the current locale carries aria-current="page".' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="Bezel-born: the switcher speaks currentColor and terminal surface tokens, so it inherits the surrounding chrome — no jx density tokens of its own."><div class={cx(rt.col24)}><DensityDemo><LanguageSwitcher variant="pair" current="en" locales={pairLocales} /></DensityDemo><TokenTable tokens={[{ name: 'currentColor', default: 'inherited', source: 'color', description: 'All strokes and fills track the surrounding text color' }, { name: 'terminal tokens', default: 'bg-terminal / text-terminal-foreground', source: 'color', description: 'Native habitat; drops onto any themed surface unchanged' }]} /></div></SectionCard></div>
  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive/container-conditional values. Migrated contract: the structural pair/menu literal keeps its slot; density joins FRESH (the no-density-prop era ends with the axis surface)."
    >
      <ComponentCanvas title="LanguageSwitcher · universal props" stage="fill" files={universalFiles}>
<div class={cx(rt.panel)}><p class={cx(rt.text13)}>Pure anchor navigation; the axes forward through the bezel.</p></div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the LanguageSwitcher Props interface; SwitcherLocale is the data contract. Persistence: a locale click writes its code to localStorage key `lang` — the site's language bootstrap reads the same key."><PropsTable props={[{ name: 'variant', type: "'pair' | 'menu'", default: "'pair' · Own default, not ambient", description: 'Segmented bilingual pair or dropdown menu. Defaults: literal slot — own \'pair\' (a structural selector, never a paint rung).' }, { name: 'locales', type: 'readonly SwitcherLocale[]', default: '—', description: '{ code, label, href } entries; pair renders the first two, menu renders all.', required: true }, { name: 'current', type: 'string', default: '—', description: 'Active locale code; matched against entry codes.', required: true }, { name: 'ariaLabel', type: 'string', default: "'Language'", description: 'Accessible name for the trigger / group.' }, { name: 'storage key', type: "'lang'", default: 'target locale code', description: 'Written on every locale click (try/catch, silent on storage failure); navigation stays pure anchors — the site\'s language-negotiation bootstrap reads this key.' }]} /></SectionCard></div>
</div>

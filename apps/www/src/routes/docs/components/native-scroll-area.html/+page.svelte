<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import NativeScrollArea from '$lib/ui/native-scroll-area/native-scroll-area.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayRow, PlaySegmented, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import nativeScrollAreaSource from '$lib/ui/native-scroll-area/native-scroll-area.svelte?raw';
  import nativeScrollAreaCssSource from '$lib/ui/native-scroll-area/native-scroll-area.css?raw';
  import capabilitySource from '$lib/scroll-area-kit/native-capability.css?raw';

  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // ---- canvas playground (the standard opening) ---------------------------
  type OrientationOpt = 'vertical' | 'horizontal';
  type WidthOpt = 'auto' | 'thin' | 'none';
  const canvasInitial = {
    orientation: 'vertical' as OrientationOpt,
    width: 'thin' as WidthOpt,
  };
  let canvasOrientation = $state(canvasInitial.orientation);
  let canvasWidth = $state(canvasInitial.width);

  function resetNativeCanvas(): void {
    canvasOrientation = canvasInitial.orientation;
    canvasWidth = canvasInitial.width;
  }

  const canvasUsage = $derived(
    [
      '<NativeScrollArea',
      '  label="config demo"',
      `  orientation="${canvasOrientation}"`,
      `  scrollbarWidth="${canvasWidth}"`,
      '  class="h-40"',
      '>',
      '  …scrolling content…',
      '</NativeScrollArea>',
    ]
      .flat()
      .join('\n'),
  );

  const resolveNativeUsage =
    (file: TreeFile): string =>
      file.name.endsWith('usage.svelte') ? canvasUsage : file.content;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/native-scroll-area/native-scroll-area.svelte', content: nativeScrollAreaSource },
    { name: 'registry/files/ui/native-scroll-area/native-scroll-area.css', content: nativeScrollAreaCssSource },
    { name: 'registry/files/lib/scroll-area-kit/native-capability.css', content: capabilitySource },
    // initial snapshot only — resolveNativeUsage serves the live state
    { name: 'src/lib/ui/native-scroll-area-usage.svelte', content: canvasUsage },
  ];

  // ---- usage snippets ----
  const close = '</' + 'script>';
  const basicUsage = `<script lang="ts">
  import NativeScrollArea from '@ui/native-scroll-area.svelte';
${close}

<!-- the platform scrollbar under the theme's scrollbar-token law -->
<NativeScrollArea class="h-72" label="release notes">
  {#each notes as note (note.id)}
    <article>…</article>
  {/each}
</NativeScrollArea>`;

  const tierUsage = `<!-- the width tiers: thin (default, the theme law) | auto | none -->
<NativeScrollArea scrollbarWidth="none" class="h-56" label="clip lane">
  <!-- still fully scrollable — keyboard, wheel, touch — just no visible bar -->
</NativeScrollArea>`;

  const kitUsage = `import { resolveThemeScope } from '@lib/scroll-area-kit/core';
import '$lib/scroll-area-kit/native-capability.css';

// the capability styles are a kit part consumed ONLY by this sibling;
// the styled component (scroll-area) consumes the hand-drawn adapter
// instead — the siblings share the core, never each other's halves.`;
  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(
        (style): style is string | { readonly [key: string]: string | object } =>
          Boolean(style),
      )
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
  // ---- the eight axes demos: code shown = code running -------------------
  const axesUsage = `<!-- size: CONSUMED through inheritance — the outer root's
     font-size is the stamp and the scrolling content inherits it -->
<NativeScrollArea label="axes" size={18}>…content…</NativeScrollArea>

<!-- theme: the scheme observer treats the lane's own .dark stamp as a
     stage scope — the viewport resolves data-scheme and the PLATFORM
     BAR re-schemes live, no re-mount -->
<NativeScrollArea label="dark island" theme="dark">…content…</NativeScrollArea>`;
  const axesFiles: TreeFile[] = [
    { name: 'src/lib/ui/native-scroll-area-axes.svelte', content: axesUsage, kind: 'usage' },
  ];

  // the ONE query() case: responsive size — the number lane goes bare
  // (results infer); string lanes need both generics. md = 48rem
  // (the registered VIEWPORT_SCALE — cite the key, not a guess).
  const responsiveSize = query({ md: 18 }, 14);

  const queryUsage = `<script lang="ts">
  import NativeScrollArea from '@ui/native-scroll-area.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (14px) applies; at 48rem+ the md case (18px)
     wins — the scrolling content inherits the stamp -->
<NativeScrollArea label="responsive region" class="h-40" size={query({ md: 18 }, 14)}>
  …scrolling content…
</NativeScrollArea>`;

  const queryFiles: TreeFile[] = [{ name: 'native-scroll-area-query-demo.svelte', content: queryUsage, kind: 'usage' }];

  // ---- the per-axis table (§2.5). Grep receipts: zero -effective
  // readers in ui/native-scroll-area/ AND in the kit's capability sheet;
  // the family's one raw theme read is the focus ring (--ring); the
  // scheme observer is family STATE, not a css channel.
  const axisRows = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "CONSUMED through inheritance, scoped by the declaration law — the §11 stamp sets the OUTER root's font-size (measured 16 → 14px) and unstyled flow inherits it; content that declares its OWN type (the demo rows' 12px voice) wins over the stamp. The scrollport's chrome is the platform bar, sized by the UA. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-shape-effective + --jx-radius-factor-effective; no family css reads them (grep receipt: zero carrier reads in ui/native-scroll-area/ and the capability sheet). The scrollport is square by the kit. Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-radius-effective; no family css reads it (grep receipt: zero readers). The region root is the §3 concentric ANCHOR for composed children — the supply is the point, the anchor is in reach. Number unit: px.",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — the named rung stamps data-density on the outer root; the family reads none of the re-based channels (grep receipt: the capability sheet and the atoms read no density channels — the region's rhythm is the platform's). The stamp supplies composed content. Number unit: coefficient.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-color-effective; no family css reads it (grep receipt: zero readers). The bar's paint is the theme's global scrollbar-token law (the currentColor chain) — this component never touches scrollbar-color. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "CONSUMED BY THE OBSERVER — the axis story this family makes strange. The lane's stamp (.dark on the outer root) IS a stage scope: the family's own scheme observer resolves the nearest [data-theme]/.dark/.jx-light scope (self included) into data-scheme on the viewport, and color-scheme follows — the PLATFORM BAR re-schemes live, no re-mount (measured). The family's one raw css read — the focus ring (--ring) — flips under any dark scope on the chain. Everything else is theme-free by contract: the atoms carry no theme slots at all. light and system stamp nothing — the observer falls through to the OS scheme (the honest fallback).",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-elevation-effective; no family css reads it (grep receipt: zero shadow declarations — zero drawn chrome by contract). Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-motion-effective; no family css reads it. The kit's reduced-motion block forces scroll-behavior: auto (the platform's smooth scrolling and bar fades are the OS's own); scrollTo() is a passthrough. Number unit: coefficient.",
    },
  ];

  // the capability sheet + the scrollbar token law (mixed TokenTable —
  // the capability rows carry the kit source, the token law its theme)
  const axisTokens = [
    { name: 'scrollbar-gutter', default: 'stable both-edges', source: 'component' as const, description: 'Vertical-capable axes reserve the gutter — overflow arriving never shifts layout (a horizontal-only port never grows a block-axis bar).' },
    { name: 'color-scheme', default: 'stage-scoped (data-scheme)', source: 'component' as const, description: 'The scheme observer resolves the nearest theme scope into data-scheme on the viewport; absent any scope, the OS scheme answers (no attribute, the UA default stands).' },
    { name: 'scrollbar-width', default: 'auto | thin | none (data-width)', source: 'component' as const, description: 'The consumer tiers — thin is the theme\'s global law (the default ships no data-width at all, the global rule stands).' },
    { name: 'overscroll-behavior', default: 'contain', source: 'component' as const, description: 'The family\'s standing posture — a boxed region\'s momentum stops at its edge; scroll chaining stays inside by explicit choice.' },
    { name: '--scrollbar-thumb / -hover / -active', default: 'currentColor steps', source: 'component' as const, description: 'The global token law painting the bar — this component never overrides scrollbar-color.' },
    { name: '--ring', default: 'raw theme token (the one read)', source: 'structural' as const, description: 'The scrollport\'s focus-visible inset ring — the family\'s only raw css read; flips under any dark scope on the chain.' },
  ];

</script>

<svelte:head>
  <title>Native scroll area · jixoai-ui</title>
  <meta
    name="description"
    content="The scroll-area family's platform sibling: zero drawn chrome — the platform scrollbar under the scrollbar-token law with the packaged capability styles (stable gutter, stage-scoped color-scheme, width tiers, overscroll containment). No custom scrollbar ARIA: the platform bar IS the accessibility contract."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · scroll-area family"
      title="native-scroll-area — the platform path, packaged best practices"
      summary="The 2026-09-15 family rework (Owner ruling): the styled component hand-draws always; this sibling ships the platform scrollbar under the site's scrollbar-token law — zero drawn chrome, zero custom scrollbar ARIA (the platform bar IS the accessibility contract) — with the native best practices packaged as capability styles from the shared scroll-area-kit kernel."
    >
      {#snippet headerAside()}
        <div data-doc-install="" aria-label="install native-scroll-area">
          <TerminalCard
            barTitle="install — native-scroll-area"
            command="npx jixoai-ui add native-scroll-area"
            outputs={['https://ui.jixoai.com/r/native-scroll-area.json']}
          />
        </div>
      {/snippet}

      <div class={cx(rt.wrap12)}>
        <span class="pill">zero drawn chrome</span>
        <span class="pill">stable gutter</span>
        <span class="pill">stage-scoped color-scheme</span>
        <span class="pill">scrollbar-width tiers</span>
        <span class="pill">overscroll containment</span>
      </div>
    </SectionCard>
  </div>

  <!-- install + overview (docs-eight-axes-mdn task 21, tier 2: the
       capabilities/usage sections were already law-grade; the archetype
       gains install/overview/see-also + the measured axes layer; the
       theming section folds into axes) -->

  <div id="overview" data-reveal="">
    <SectionCard
      eyebrow="overview"
      title="Overview"
      summary="The platform path, packaged: zero drawn chrome, the native best practices shipped as capability styles, and the platform scrollbar itself as the accessibility contract."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.measurePara)}>
          NativeScrollArea renders the scroll-area family's PLATFORM sibling: an outer region
          root (where the §11 carriers stamp) around a scrollport whose scrollable anatomy is
          the platform's own — <code>overflow</code> mapped from the
          <code>orientation</code> prop, <code>scrollbar-gutter: stable both-edges</code> so
          overflow arriving never shifts layout, <code>scrollbar-width</code> tiers
          (auto/thin/none — thin is the theme's global law), and
          <code>overscroll-behavior: contain</code> so a boxed region's momentum stops at its
          edge. The bar's paint is the theme's global scrollbar-token law (the currentColor
          chain); this component never touches <code>scrollbar-color</code>.
        </p>
        <p class={cx(rt.measurePara)}>
          Two state machines are the component's own. The stage-scope scheme: a
          MutationObserver resolves the nearest <code>[data-theme]</code>/<code>.dark</code>/
          <code>.jx-light</code> scope on the ancestor chain (self included) into
          <code>data-scheme</code> on the viewport — <code>color-scheme</code> follows the
          STAGE, not just the OS, and re-resolves live on scope flips without a re-mount; the
          theme lane's own <code>.dark</code> stamp is itself a scope the observer sees. The
          WAI scrollable-region pattern: <code>role="region"</code> + name + <code>tabindex="0"</code>
          makes the scrollport a keyboard scroll surface — and NO custom scrollbar ARIA mounts
          anywhere (a scrollbar role on a nonexistent thumb would be a violation, not a
          feature — the Gate-1 r1 ruling, probe-asserted absent).
        </p>
        <p class={cx(rt.measurePara)}>
          The eight axes resolve on the outer root all no-own (the native-wrapper batch A rule:
          the family owns only the axis names it destructures; the consumer style stays the
          viewport's own channel, the scrollbar tiers ride their own data-width hook, and no
          native size-like attribute collides). Size reaches the content through inheritance;
          the rest stamp-and-supply. The composed story is kit-shaped: the scroll-area-kit core
          is shared with the hand-drawn sibling — the siblings share the core, never each
          other's halves. Per-axis below; the shared grammar lives on the
          <a class="pill" href="/docs/universal-props.html">universal props</a> page.
        </p>
      </div>
    </SectionCard>
  </div>

  <!-- component canvas: the standard opening — live demo + PLAYGROUND -->
  <div data-reveal="">
    <ComponentCanvas
      title="native-scroll-area"
      description="the platform scrollbar, the theme's currentColor token law, and the packaged capability styles — flip the stage theme in the dock head and watch the bar follow the stage scope, not just the OS."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/native-scroll-area/native-scroll-area.svelte"
      files={canvasFiles}
      stage="center"
      onreset={resetNativeCanvas}
      output={[
        { label: 'orientation', value: canvasOrientation },
        { label: 'scrollbarWidth', value: canvasWidth },
      ]}
      resolveFileContent={resolveNativeUsage}
    >
      <div class={cx(rt.nsaLane)}>
        <NativeScrollArea
          label="config demo"
          orientation={canvasOrientation}
          scrollbarWidth={canvasWidth}
          class={cx(rt.nsaH40)}
        >
          <ol class={cx(rt.col8)}>
            {#each Array(12) as _, i (i)}
              <li class={cx(rt.nsaRow)}>
                item {i + 1} — the platform bar, themed by tokens
              </li>
            {/each}
          </ol>
        </NativeScrollArea>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="orientation">
            <PlaySegmented
              bind:value={canvasOrientation}
              options={[
                { value: 'vertical', label: 'vertical' },
                { value: 'horizontal', label: 'horizontal' },
              ]}
            />
          </PlayRow>
          <PlayRow label="scrollbarWidth">
            <PlaySegmented
              bind:value={canvasWidth}
              options={[
                { value: 'thin', label: 'thin' },
                { value: 'auto', label: 'auto' },
                { value: 'none', label: 'none' },
              ]}
            />
          </PlayRow>
          <PlayHelp>
            the width tiers dial the platform bar only — thin is the theme's global law,
            auto restores the platform-wide bar, none hides it (content still scrolls).
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="capabilities" data-reveal="">
    <SectionCard
      family="capabilities"
      headerRegion="capabilities"
      eyebrow="capabilities"
      title="The packaged best practices"
      summary="Four capabilities ship as the kit's native-capability.css — consumed by this sibling only."
    >
      <div class={cx(rt.col12)}>
        <ComponentCanvas
          title="native-scroll-area · capability law"
          stage="fill"
          files={[{ name: 'registry/files/lib/scroll-area-kit/native-capability.css', content: capabilitySource }]}
        >
          <div class={cx(rt.grid760b)}>
            <div class={cx(rt.nsaPanel)}>
              <span class={cx(rt.eyebrowPrimary)}>scrollbar-gutter: stable</span>
              <p class={cx(rt.m0, rt.text125, rt.lead6, rt.inkMuted)}>
                overflow arriving never shifts layout — the gutter is reserved on vertical-capable
                axes (a horizontal-only port never grows a block-axis bar; stable would reserve
                dead space forever, the scrollbar law's carve-out).
              </p>
              <NativeScrollArea class={cx(rt.nsaH36)} label="gutter demo">
                <ol class={cx(rt.col8)}>
                  {#each Array(10) as _, i (i)}<li class={cx(rt.nsaRow)}>row {i + 1}</li>{/each}
                </ol>
              </NativeScrollArea>
            </div>
            <div class={cx(rt.nsaPanel)}>
              <span class={cx(rt.eyebrowPrimary)}>scoped color-scheme</span>
              <p class={cx(rt.m0, rt.text125, rt.lead6, rt.inkMuted)}>
                the bar follows the STAGE scope, not just the OS: the nearest
                <code class={cx(rt.inkAccent)}>[data-theme]</code>/<code class={cx(rt.inkAccent)}>.dark</code>/<code class={cx(rt.inkAccent)}>.jx-light</code>
                resolves live (a class+attribute observer on the ancestor chain) — flip the stage theme
                in this canvas's dock head and the bar re-schemes without a re-mount.
              </p>
              <NativeScrollArea class={cx(rt.nsaH36)} label="scheme demo">
                <ol class={cx(rt.col8)}>
                  {#each Array(10) as _, i (i)}<li class={cx(rt.nsaRow)}>row {i + 1}</li>{/each}
                </ol>
              </NativeScrollArea>
            </div>
            <div class={cx(rt.nsaPanel)}>
              <span class={cx(rt.eyebrowPrimary)}>scrollbar-width tiers</span>
              <p class={cx(rt.m0, rt.text125, rt.lead6, rt.inkMuted)}>
                <code class={cx(rt.inkAccent)}>auto | thin | none</code> — thin is the theme's global law
                (the default, no channel at all); the tiers are the consumer's dial.
              </p>
              <div class={cx(rt.nsaTierGrid)}>
                <NativeScrollArea scrollbarWidth="auto" class={cx(rt.nsaH28)} label="auto tier"><div class={cx(rt.nsaTierContent)}>{#each Array(6) as _, i (i)}<p class={cx(rt.m0, rt.py2)}>row {i + 1}</p>{/each}</div></NativeScrollArea>
                <NativeScrollArea scrollbarWidth="thin" class={cx(rt.nsaH28)} label="thin tier"><div class={cx(rt.nsaTierContent)}>{#each Array(6) as _, i (i)}<p class={cx(rt.m0, rt.py2)}>row {i + 1}</p>{/each}</div></NativeScrollArea>
                <NativeScrollArea scrollbarWidth="none" class={cx(rt.nsaH28)} label="none tier"><div class={cx(rt.nsaTierContent)}>{#each Array(6) as _, i (i)}<p class={cx(rt.m0, rt.py2)}>row {i + 1}</p>{/each}</div></NativeScrollArea>
              </div>
            </div>
            <div class={cx(rt.nsaPanel)}>
              <span class={cx(rt.eyebrowPrimary)}>overscroll containment</span>
              <p class={cx(rt.m0, rt.text125, rt.lead6, rt.inkMuted)}>
                a boxed region's momentum stops at its edge —
                <code class={cx(rt.inkAccent)}>overscroll-behavior: contain</code>, the family's standing
                posture; the scroll chaining stays inside by explicit choice.
              </p>
              <NativeScrollArea class={cx(rt.nsaH28)} label="containment demo">
                <div class={cx(rt.nsaTierContent)}>{#each Array(6) as _, i (i)}<p class={cx(rt.m0, rt.py2)}>row {i + 1}</p>{/each}</div>
              </NativeScrollArea>
            </div>
          </div>
        </ComponentCanvas>
      </div>
    </SectionCard>
  </div>

  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Give it a height and a label; the platform does the rest under the token law."><div class={cx(rt.col16)}><CodeBlock code={basicUsage} lang="svelte" meta="basic" /><CodeBlock code={tierUsage} lang="svelte" meta="width tiers" /><CodeBlock code={kitUsage} lang="ts" meta="kit boundary" /></div></SectionCard></div>

  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The platform scrollbar IS the accessibility contract — no custom scrollbar ARIA mounts anywhere inside (probe-asserted absent)."><A11yTable keys={[{ key: 'Tab', action: 'Moves focus onto the scrollable region' }, { key: '↑ ↓ ← → / Home / End / PgUp / PgDn', action: 'Native scrollport scrolling once the region is focused' }, { key: 'platform bar', action: 'The OS scrollbar remains directly operable — dragging, clicking, its own keyboard path' }]} aria={[{ name: 'aria-label', value: 'label prop', description: 'Accessible name for the region (default "scrollable content")' }, { name: 'role', value: 'region', description: 'Plus tabindex=0 — the WAI scrollable-region pattern; the ONLY a11y surface here' }, { name: 'role="scrollbar"', value: 'ABSENT', description: 'No drawn thumb exists — a scrollbar role on a nonexistent thumb would be a violation, not a feature (the Gate-1 r1 ruling; probe-asserted)' }]} /></SectionCard></div>



  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on native-scroll-area"
      summary="The native-wrapper batch A rule realized: the family owns only the axis names it destructures on the OUTER root, the carriers stamp there (never the scrollport — the consumer style stays the viewport's own channel), and all eight lanes read zero family css (grep receipt across ui/native-scroll-area/ and the kit's capability sheet). The exceptions are structural, not painted: size reaches the content through inheritance, and theme is CONSUMED BY THE OBSERVER — the lane's own .dark stamp is a stage scope the family's scheme resolver sees, so the platform bar re-schemes live. Census: the D5 hole round (the sweep's 13 unlisted families)."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.note12, rt.inkMuted70)}>
          Reading the table: Property is the axis, Type is the real carrier or consumption it
          drives on THIS family, Default is the lane default — the named steps, number unit, and
          consumption are in each description.
        </p>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Deviations, cited: the adoption is the census D5 hole round (native-scroll-area was
          unlisted until the sweep — openspec/changes/explicit-props/research/
          migration-census.md). The §1 collision rule, native-wrapper form: no native
          size-like attribute exists on a region — the scrollbar tiers ride their own
          data-width hook, the consumer style stays the viewport's channel, and every axis
          name is the family's own destructured lane.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={axesUsage} lang="svelte" meta="the eight axes on native-scroll-area" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="axes" title="native-scroll-area · the inherited stamp and the scheme observer" files={axesFiles} stage="fill">
            <div class={cx(rt.gridSm2, rt.wFull)}>
              <div class={cx(rt.panel)} data-probe="nsa-auto">
                <span class={cx(rt.note11)}>size auto — the ambient scale</span>
                <NativeScrollArea label="auto region" class={cx(rt.nsaH28)}>
                  <div class={cx(rt.nsaTierContent)}>{#each Array(8) as _, i (i)}<p class={cx(rt.m0, rt.py2)}>row {i + 1}</p>{/each}</div>
                </NativeScrollArea>
              </div>
              <div class={cx(rt.panel)} data-probe="nsa-size-14">
                <span class={cx(rt.note11)}>size={"{14}"} — the root moves 16 → 14px; declared voices win (measured)</span>
                <NativeScrollArea label="stamped region" class={cx(rt.nsaH28)} size={14}>
                  <div class={cx(rt.nsaTierContent)}>{#each Array(8) as _, i (i)}<p class={cx(rt.m0, rt.py2)}>row {i + 1}</p>{/each}</div>
                </NativeScrollArea>
              </div>
              <div class={cx(rt.panel)} data-probe="nsa-light">
                <span class={cx(rt.note11)}>light — the ambient scheme</span>
                <NativeScrollArea label="light region" class={cx(rt.nsaH28)}>
                  <div class={cx(rt.nsaTierContent)}>{#each Array(8) as _, i (i)}<p class={cx(rt.m0, rt.py2)}>row {i + 1}</p>{/each}</div>
                </NativeScrollArea>
              </div>
              <div class={cx(rt.panel)} data-probe="nsa-dark">
                <span class={cx(rt.note11)}>theme="dark" — the stamp IS a scope: data-scheme flips, the bar re-schemes (measured)</span>
                <NativeScrollArea label="dark region" class={cx(rt.nsaH28)} theme="dark">
                  <div class={cx(rt.nsaTierContent)}>{#each Array(8) as _, i (i)}<p class={cx(rt.m0, rt.py2)}>row {i + 1}</p>{/each}</div>
                </NativeScrollArea>
              </div>
            </div>
            <p class={cx(rt.mt8, rt.note12, rt.inkMuted70)}>
              The size pair is the consumed lane, measured: the stamped region's root font-size
              moves 16 → 14px exactly — and the demo rows' own 12px type voice WINS over the
              stamp, the declaration law live: inheritance reaches only unstyled flow. The theme
              pair is the observer story, measured: the dark region's viewport resolves
              data-scheme="dark" (color-scheme: dark — the platform bar re-schemes in place)
              because the lane's own stamp is a scope the ancestor-chain observer reads; the
              light panels resolve the page's ambient light scope. No scrollbar ARIA mounts
              anywhere in the page's raw DOM — the Gate-1 r1 ruling holds.
            </p>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="native-scroll-area · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <NativeScrollArea label="responsive region" class={cx(rt.nsaH28)} size={responsiveSize}>
                <div class={cx(rt.nsaTierContent)}>{#each Array(8) as _, i (i)}<p class={cx(rt.m0, rt.py2)}>row {i + 1}</p>{/each}</div>
              </NativeScrollArea>
              <p class={cx(rt.para)}>
                Media keys are min-width: below 48rem the base applies — 14px; at 48rem and
                wider the md case wins — 18px, the content inheriting the stamp. The number lane
                goes bare (results infer); string lanes take both generics. Resize across 48rem.
              </p>
            </div>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <TokenTable tokens={axisTokens} />
        </div>
      </div>
    </SectionCard>
  </div>
  </div>

  <!-- the API section (RESTORED — integration-blocked incident, task 21:
       the theming-fold surgery ate this section along with the hand
       universal table, dropping the page's data-jx-props-table-universal
       marker and redding docs-universal 109/110. The hand table with the
       bare `universal` directive is the image model — no generated meta
       exists for this family yet.) -->
  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="Props from the NativeScrollArea Props interface (克制原则 — the API stays small); getViewport()/scrollTo() are the imperative exports. Every other attribute rides restProps through to the scrollport."
    >
      <PropsTable
        universal
        props={[
          { name: 'orientation', type: "'vertical' | 'horizontal' | 'both'", default: "'vertical'", description: 'Which axes scroll: overflow-y/x mapping (vertical hides overflow-x, horizontal hides overflow-y, both shows both bars).' },
          { name: 'scrollbarWidth', type: "'auto' | 'thin' | 'none'", default: "'thin'", description: 'The scrollbar-width tier — thin rides the theme\'s global law (the default ships no data-width attribute at all); auto restores the platform-wide bar; none hides it (content still scrolls).' },
          { name: 'label', type: 'string', default: "'scrollable content'", description: 'The a11y name for the scrollable region (role=region + aria-label + tabindex — the WAI scrollable-region pattern).' },
          { name: 'class', type: 'string', default: "''", description: 'Class passthrough (the height utility lands here — give the region a block size).' },
          { name: 'style', type: 'string', default: '—', description: 'Style passthrough — the VIEWPORT\'s own channel (the §11 carriers stamp the outer root, never the scrollport).' },
          { name: 'onscroll', type: '(event: ViewportScrollEvent) => void', default: '—', description: 'Scroll callback from the scrollport.' },
          { name: 'children', type: 'Snippet', default: '—', description: 'The scrolling content — stretched to fill the scrollport.', required: true },
          { name: 'getViewport()', type: '() => HTMLDivElement | null', default: 'export', description: 'The scrollport element — the family\'s ToC pairing works here too.' },
          { name: 'scrollTo()', type: '(options?: ScrollToOptions) => void', default: 'export', description: 'Thin passthrough to the native scrollport scrollTo.' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="native-scroll-area" />
  </div>
</div>

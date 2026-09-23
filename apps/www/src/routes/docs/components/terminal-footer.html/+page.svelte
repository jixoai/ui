<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TerminalFooter from '$lib/ui/terminal-footer/terminal-footer.svelte';
  import TerminalFooterColumn from '$lib/ui/terminal-footer/terminal-footer-column.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayRow, PlayText, PlayToggle, PlaySegmented, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import terminalFooterSource from '$lib/ui/terminal-footer/terminal-footer.svelte?raw';
  import terminalFooterCssSource from '$lib/ui/terminal-footer/terminal-footer.css?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import TerminalFooter from '@ui/terminal-footer/terminal-footer.svelte';
  import TerminalFooterColumn from '@ui/terminal-footer/terminal-footer-column.svelte';
${close}

<!-- the meta row is composed: columns carry a title + FREE links -->
<TerminalFooter ghost="JIXOAI/UI" copyright="© 2026 jixoai · MIT">
  <TerminalFooterColumn title="project">
    <a href="https://github.com/jixoai/ui" target="_blank" rel="noreferrer">GitHub</a>
    <a href="/r/registry.json">Registry JSON</a>
  </TerminalFooterColumn>
  <TerminalFooterColumn title="docs">
    <a href="/docs.html">Docs</a>
  </TerminalFooterColumn>
</TerminalFooter>`;

  const canvasUsage = `<TerminalFooter {ghost} {copyright}>
  <TerminalFooterColumn title="project">…free links…</TerminalFooterColumn>
  {#if extraColumn}<TerminalFooterColumn title="docs">…</TerminalFooterColumn>{/if}
</TerminalFooter>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/terminal-footer/terminal-footer.svelte', content: terminalFooterSource },
    { name: 'registry/files/ui/terminal-footer/terminal-footer.css', content: terminalFooterCssSource },
    { name: 'src/lib/ui/terminal-footer-usage.svelte', content: canvasUsage, kind: 'usage' },
  ];

  // playground state (P1): the page owns the snapshot
  const canvasInitial = { ghost: 'JIXOAI-UI', extraColumn: false, copyright: 'default' };
  let ghost = $state(canvasInitial.ghost);
  let extraColumn = $state(canvasInitial.extraColumn);
  let copyright = $state(canvasInitial.copyright);
  const copyrightText = $derived(copyright === 'default' ? `© ${new Date().getFullYear()}` : '© 2026 jixoai · MIT');
  function resetCanvas(): void {
    ghost = canvasInitial.ghost;
    extraColumn = canvasInitial.extraColumn;
    copyright = canvasInitial.copyright;
  }

  // the states pair (types section): titled column vs the untitled stack
  const typesUsage = `<script lang="ts">
  import TerminalFooterColumn from '@ui/terminal-footer/terminal-footer-column.svelte';
${close}

<div class="flex flex-wrap items-start gap-6">
  <div class="flex min-w-56 flex-1 flex-col gap-3 border border-border p-4">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">titled column</span>
    <TerminalFooterColumn title="project">
      <a href="https://github.com/jixoai/ui">GitHub</a>
    </TerminalFooterColumn>
    <span class="text-muted-foreground text-[12.5px]">title + free link children</span>
  </div>
  <div class="flex min-w-56 flex-1 flex-col gap-3 border border-border p-4">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">untitled stack</span>
    <TerminalFooterColumn>
      <a href="/docs.html">Docs</a>
      <a href="/recipes.html">Recipes</a>
    </TerminalFooterColumn>
    <span class="text-muted-foreground text-[12.5px]">omit title for a bare link stack</span>
  </div>
</div>`;

  const typesFiles: TreeFile[] = [
    { name: 'terminal-footer-types-demo.svelte', content: typesUsage, kind: 'usage' },
  ];

  // the page's local join (the separator serialize law): plain strings
  // pass through whole; stylex objects contribute their string members
  // ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined)[]
  ): string =>
    styles
      .filter((style): style is { readonly [key: string]: string | object } => Boolean(style))
      .map((style) =>
        Object.entries(style ?? {}).flatMap(([key, value]) =>
          key !== '$$css' && typeof value === 'string' ? [value] : [],
        ).join(' '),
      )
      .join(' ');

  // ── the measured per-axis table (task 67) — every cell measured on the
  // served DOM (probe) or negative-grepped over ui/terminal-footer/ ──
  const axisRows = [
    {
      name: 'density',
      type: `'2xs' | 'xs' | 'sm' | 'default' | 'lg' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "MANAGED BUT PAINT-INVARIANT — the rung attr stamps the footer root (data-density), and the shell's measure + rhythm is fixed elsewhere: the padding steps are space tokens re-pinned by the sm/lg media seams and the meta gaps are fixed steps (measured an identical shell at the 2xs and lg rungs). Zero --jx-density-effective readers (grep receipt). Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "INHERITED ECHO, FREE TEXT ONLY — the §1 stamp sets the root font-size; NOTHING the family renders follows it: the © line, the column links and the titles all ride the metaRow atom's fixed --jx-text-small step (12.5/12.5/11px, measured CONSTANT under an 18px stamp — the earlier 30px receipt was the root font-size itself, not the © line). Only consumer-authored FREE text outside the family atoms inherits; the ghost ignores it too (clamp(3rem, 11vw, 9rem) viewport/root-relative, measured unmoved). Zero --jx-size-effective readers (grep receipt). Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero shape-channel readers (grep receipt: no corner-shape or factor consumer in ui/terminal-footer/); the shell is square chrome (measured border-radius 0). Number unit: none.',
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero radius-effective readers (grep receipt); the footer carries no border-radius to re-shape (measured 0px — flat chrome, no card surface). Number unit: px.',
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — the family's one brand paint (the free-link hover) reads var(--primary) straight from the legacy chain (measured muted → primary on hover), so the global brand-hue runtime moves it while the hue AXIS never reaches the component: zero --jx-color-effective readers (grep receipt). Quote the ink by lightness/chroma — the hue digits rotate with the runtime. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "DECLARATIVE, AND THE HOST DECIDES — the family split: unlike the terminal bezel twins (header/card, whose shell-theme literal owns the name), the footer carries NO theme literal; theme=\"dark\" only stamps the .dark class on the root. What re-derives is split and measured: the ghost's stroke rides color-mix over var(--border), so it re-derives under a .dark scope (1px oklab(0 0 0 / 0.55) → oklab(1 0 0 / 0.55)) while the meta/title ink keeps its light --jx-muted-foreground under the scope (the island tier of the alias-theme law — and at root-level dark the UNPINNED ink re-derives, the body-level clone reading the dark 0.8452). And the host lesson, pin site named: the component-canvas stage div[data-theme=\"light\"].jx-light re-pins the light profile, so the served demo stays black-stroked under page-dark — the SAME rendered footer moved to body level re-derives white. Location decides; system/auto = tree inheritance. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero elevation-carrier readers (grep receipt); the footer is flat page chrome (measured box-shadow none). Number unit: dp.',
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "ONE SEAM, RM-SAFE — the family's single transition is the free-link hover: var(--motion-150) var(--motion-ease-out) (measured 0.15s ease-out; re-timing the token re-times the hover — measured 2s under a --motion-150 injection, the seam governs). A color transition has no motion path, so it survives prefers-reduced-motion (measured 0.15s under RM emulation — no kill authored, none needed). Zero --jx-motion-effective readers (grep receipt). Number unit: coefficient.",
    },
  ];

  // the ONE query() case: responsive size — the number lane goes bare;
  // md = 48rem (the registered VIEWPORT_SCALE — cite the key).
  const responsiveSize = query({ md: 18 }, 13);

  const queryUsage = `<script lang="ts">
  import TerminalFooter from '@ui/terminal-footer/terminal-footer.svelte';
  import TerminalFooterColumn from '@ui/terminal-footer/terminal-footer-column.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (13px root) applies; at 48rem+ the md case (18px)
     wins — the free text (© line, links) echoes it, the ghost stays clamped -->
<TerminalFooter ghost="JIXOAI/UI" size={query({ md: 18 }, 13)}>
  <TerminalFooterColumn title="project"><a href="/docs.html">Docs</a></TerminalFooterColumn>
</TerminalFooter>`;

  const queryFiles: TreeFile[] = [
    { name: 'terminal-footer-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

</script>

<svelte:head>
  <title>Terminal footer · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai terminal-footer: the ghost wordmark that closes the narrative — a huge hollow brand word via text-stroke with an @supports fallback — over a composed meta row of TerminalFooterColumn parts (title + free links) and the © line."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>

  <div class={cx(rt.shellCol)}>
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Layout"
      title="terminal-footer — the ghost wordmark"
      summary="Composition-first: the root is a real <footer> landmark, the meta row composes TerminalFooterColumn parts (a title plus FREE link children — the closed links[] data prop died with the data-driven form), and the ghost word is decorative by declaration — aria-hidden, unselectable, pure sign-off. The family carries no theme literal: the paint follows the page, and the axes are a first-time all-no-own contract."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">composition-first</span>
        <span class="pill">free link children</span>
        <span class="pill">text-stroke recipe</span>
        <span class="pill">aria-hidden · unselectable</span>
        <span class="pill">declarative theme</span>
      </div>
    </SectionCard>
  </div>

  <!-- install (the archetype's install anchor; chrome — out of the toc) -->
  <div id="install" data-reveal="">
    <DocsInstall name="terminal-footer" />
  </div>

  <!-- overview -->
  <div id="overview" data-reveal="">
    <SectionCard
      family="overview"
      headerRegion="overview"
      eyebrow="overview"
      title="Overview"
      summary="The platform gives the landmark; the family gives the ghost recipe, the composed meta row, and a split theme story — all measured."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.para)}>
          The semantics are the platform's and the composition law is the family's: the root is a
          real <code class={cx(rt.inkPrimary)}>&lt;footer&gt;</code> (the contentinfo landmark —
          zero ARIA wiring authored), and the meta row is not data. The old closed
          <code class={cx(rt.inkPrimary)}>links[]</code> prop died: columns compose as
          <code class={cx(rt.inkPrimary)}>TerminalFooterColumn</code> children — a title span plus
          FREE anchor children the consumer authors, external-link attributes
          (<code class={cx(rt.inkPrimary)}>target</code>/<code class={cx(rt.inkPrimary)}>rel</code>)
          included. The component owns the shell (a 90rem measure with auto margins and
          three-step padding seams — 16px base, 24px at 40rem, 32px at 64rem, measured), the ghost
          recipe, and the column voices; the content is entirely yours.
        </p>
        <p class={cx(rt.para)}>
          The ghost is three declarations and an honesty clause. Scale:
          <code class={cx(rt.inkPrimary)}>clamp(3rem, 11vw, 9rem)</code> — measured 140.8px at a
          1280 viewport (11vw below the cap) and 144px (the 9rem cap) at 1600. Hollow: transparent
          fill with a 1px text-stroke of the border token at 55%. Fallback:
          <code class={cx(rt.inkPrimary)}>@supports not (-webkit-text-stroke)</code> swaps a 35%
          border-tinted solid fill for engines without the stroke. Etiquette:
          <code class={cx(rt.inkPrimary)}>aria-hidden</code> +
          <code class={cx(rt.inkPrimary)}>user-select: none</code> — decorative by construction,
          never information. And the theme story is a measured split: the stroke rides
          <code class={cx(rt.inkPrimary)}>color-mix</code> over <code class={cx(rt.inkPrimary)}>var(--border)</code>,
          so it re-derives under a .dark scope (black tint → white tint, measured) while the
          meta and title inks keep their light <code class={cx(rt.inkPrimary)}>--jx-muted-foreground</code>
          (the --jx-* set is :root-only — frozen). One host lesson worth carrying: inside a
          component-canvas stage a <code class={cx(rt.inkPrimary)}>data-theme="light"</code> island
          re-pins the light profile, so the served demo stays black-stroked under page-dark while
          the same rendered footer at body level re-derives white — location decides.
        </p>
        <p class={cx(rt.para)}>
          The eight axes are a FIRST-TIME all-no-own contract — zero effective-carrier readers
          (grep receipt). Density stamps the rung and moves nothing (paint-invariant shell,
          measured at the 2xs and lg rungs); size is an inherited echo (the free text scales with
          the root voice, the ghost does not); shape/radius/color/elevation supply unread (flat
          square chrome whose only brand paint is the link hover); motion rides one seam (the
          hover's 150ms ease-out token — re-timed by injection, measured, and RM-safe since a color
          change has no motion path); theme is declarative (above). Kinship:
          <code class={cx(rt.inkPrimary)}>terminal-header</code> and
          <code class={cx(rt.inkPrimary)}>terminal-card</code> (the dark-locked bezel twins — the
          footer is the light-following sibling of the family),
          <code class={cx(rt.inkPrimary)}>website-scaffold</code> (the page shell this closes).
        </p>
      </div>
    </SectionCard>
  </div>

  <div id="live-demo" data-reveal="">
    <ComponentCanvas
      title="terminal-footer"
      stage="fill"
      description="A real footer renders here — composed from columns with free links, staged inline at the canvas width. The ghost scales with the viewport (11vw between clamps), so narrow the window and watch the wordmark breathe."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/terminal-footer/terminal-footer.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      output={[{ label: '© line', value: copyrightText }]}
    >
      <div class={cx(rt.wFull)}>
        <p class={cx(rt.inkMuted, rt.mb16, rt.textCenter, rt.text125)}>
          ↓ a live footer, rendered directly — the stage is its viewport
        </p>
        <TerminalFooter {ghost} copyright={copyrightText}>
          <TerminalFooterColumn title="project">
            <a href="https://github.com/jixoai/ui" target="_blank" rel="noreferrer">GitHub</a>
            <a href="/r/registry.json">Registry JSON</a>
          </TerminalFooterColumn>
          {#if extraColumn}
            <TerminalFooterColumn title="docs">
              <a href="/docs.html">Docs</a>
              <a href="/recipes.html">Recipes</a>
            </TerminalFooterColumn>
          {/if}
        </TerminalFooter>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="ghost">
            <PlayText bind:value={ghost} placeholder="JIXOAI-UI" />
          </PlayRow>
          <PlayRow label="second column">
            <PlayToggle bind:value={extraColumn} />
          </PlayRow>
          <PlayRow label="© line">
            <PlaySegmented
              bind:value={copyright}
              options={[
                { value: 'default', label: 'live year' },
                { value: 'custom', label: 'authored' },
              ]}
            />
          </PlayRow>
          <PlayHelp>
            hover a link inside a column — it warms from muted to the brand hue (a layered
            descendant rule; the anchors are free children, so no utility slot exists on them).
            The © line defaults to the live year; author <code>copyright</code> to replace it.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="terminal-footer-base" data-reveal="">
    <SectionCard
      family="terminal-footer-base"
      headerRegion="terminal-footer-base"
      eyebrow="W3C foundation"
      title="What the platform gives"
      summary="The root is the native <footer> — the contentinfo landmark, free by default: no role wiring, no names to manage. The free links are real anchors (crawlable, focusable, in composed order); the ghost is hidden from the tree, so the landmark reads exactly as composed."
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="One column part, two postures: titled (an uppercase eyebrow over the stack) or untitled (a bare link stack)."><ComponentCanvas title="terminal-footer · columns" stage="fill" files={typesFiles}>
    <div class={cx(rt.wrapStart24)}>
      <div class={cx(rt.col12, rt.panel, rt.grow, rt.tfMinW56)}><span class={cx(rt.eyebrowPrimary)}>titled column</span><TerminalFooterColumn title="project"><a href="https://github.com/jixoai/ui" target="_blank" rel="noreferrer">GitHub</a><a href="/r/registry.json">Registry JSON</a></TerminalFooterColumn><span class={cx(rt.inkMuted, rt.text125)}>title + free link children</span></div>
      <div class={cx(rt.col12, rt.panel, rt.grow, rt.tfMinW56)}><span class={cx(rt.eyebrowPrimary)}>untitled stack</span><TerminalFooterColumn><a href="/docs.html">Docs</a><a href="/recipes.html">Recipes</a></TerminalFooterColumn><span class={cx(rt.inkMuted, rt.text125)}>omit title for a bare link stack</span></div>
    </div>
  </ComponentCanvas></SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Compose the footer from column parts; ghost and copyright are the shell's own strings — everything inside the columns is yours."><CodeBlock code={usage} lang="svelte" meta="TerminalFooter usage" /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="Viewport-scaled chrome, not density-scaled: the ghost breathes by 11vw (density paint-invariant, measured at the 2xs and lg rungs), the paint is three text-stroke declarations with an @supports fallback, and the single transition rides a motion token a consumer can re-time."><div class={cx(rt.col24)}><DensityDemo scopes={['2xs', 'xs', 'sm', 'default', 'lg']}><TerminalFooter ghost="JIXOAI-UI" copyright="© 2026 jixoai · MIT"><TerminalFooterColumn title="project"><a href="https://github.com/jixoai/ui" target="_blank" rel="noreferrer">GitHub</a></TerminalFooterColumn></TerminalFooter></DensityDemo><div class={cx(rt.mt20)}><TokenTable tokens={[{ name: 'ghost scale', default: 'clamp(3rem, 11vw, 9rem)', source: 'component', description: 'Measured 140.8px at 1280 (11vw under the cap), 144px at 1600 (the cap).' }, { name: '-webkit-text-stroke', default: '1px border @ 55%', source: 'color', description: 'The hollow word — color-mix over var(--border); re-derives under a .dark scope (measured black tint → white tint).' }, { name: '@supports fallback', default: '35% border-tinted fill', source: 'color', description: 'The unlayered carve-out for engines without text-stroke.' }, { name: '--motion-150 / --motion-ease-out', default: '0.15s ease-out', source: 'structural', description: 'The free-link hover seam (re-timed by the token, measured).' }, { name: 'shell measure', default: '90rem + auto margins', source: 'component', description: 'The footer caps at 1440px and centers (measured at a 1600 viewport).' }, { name: '--jx-muted-foreground', default: 'light literal', source: 'color', description: 'The meta/title ink — frozen under .dark (the --jx-* set is :root-only).' }]} /></div></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="The declared surface is 12 named props on the shell (ghost, copyright, children, class, style + the eight axes) and 3 on the column (title, children, class). The residual is NOT dropped — both components spread the rest onto their real elements (HTMLAttributes passthrough, 'color' withheld on the shell), so the footer is attribute-transparent: id, data-*, aria-* and handlers land on the landmark you composed."><PropsTable universal props={[{ name: 'ghost', type: 'string', default: '—', description: 'The ghost wordmark (decorative, aria-hidden, unselectable).', required: true }, { name: 'copyright', type: 'string', default: `© {live year}`, description: 'The © row text.' }, { name: 'children', type: 'Snippet', default: '—', description: 'The meta row — compose TerminalFooterColumn parts.', required: true }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough to the footer root.' }, { name: 'style', type: 'string', default: "''", description: 'Style passthrough, joined after the axis carriers.' }, { name: '…rest', type: 'HTMLAttributes<HTMLElement>', default: '—', description: 'Forwarded onto the <footer> element — the shell is attribute-transparent (id, data-*, aria-*, handlers; the color ATTRIBUTE is withheld, the color AXIS is not).' }, { name: 'Column: title', type: 'string', default: '—', description: 'The column heading (an uppercase eyebrow span); omit for an untitled link stack.' }, { name: 'Column: children', type: 'Snippet', default: '—', description: 'FREE link children — anchors are yours to author (target/rel included).', required: true }, { name: 'Column: …rest', type: 'HTMLAttributes<HTMLDivElement>', default: '—', description: 'Forwarded onto the column div.' }]} /></SectionCard></div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="The eight axes on terminal-footer"
      summary="The FIRST-TIME all-no-own contract, measured honestly: density stamps the root and moves nothing (paint-invariant shell — the measure and rhythm live in the family css, media seams and all); size is an inherited echo on the free text (the ghost stays clamped); shape/radius/color/elevation supply unread (flat square chrome, one brand hover); motion rides a single re-timable hover seam; theme is DECLARATIVE — no shell literal, the paint follows the page, and a canvas light-island can pin the demo."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Receipts: the shell (90rem cap with auto margins — measured 1440px wide, centered, at a
          1600 viewport; padding seams 16/24/32px at base/40rem/64rem) and the ghost (140.8px at
          1280, 144px at 1600 — the 9rem cap; transparent fill, 1px stroke at 55%) were measured on
          this page's served DOM (probe, task 67); the theme split (stroke
          oklab(0 0 0 / 0.55) → oklab(1 0 0 / 0.55) under a .dark scope while the meta ink stayed
          oklch(0.3211 0 0); the canvas data-theme="light" island pinning the served demo; the same
          footer re-derived at body level) and the hover seam (0.15s ease-out muted → primary;
          2s under a --motion-150 injection; 0.15s preserved under RM emulation) were measured the
          same way; the unread rows carry grep receipts over ui/terminal-footer/. The query() seat
          below rides the md viewport key (48rem) on the size lane.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="terminal-footer · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWMd)}>
              <TerminalFooter ghost="JIXOAI/UI" size={responsiveSize}>
                <TerminalFooterColumn title="project"><a href="/docs.html">Docs</a></TerminalFooterColumn>
              </TerminalFooter>
              <p class={cx(rt.para)}>
                Media keys are min-width: below 48rem the base (13px root) applies; at 48rem and
                wider the md case wins (18px) — the free text (© line, links) echoes it while the
                ghost stays clamped. The number lane goes bare. Resize across 48rem.
              </p>
            </div>
          </ComponentCanvas>
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="TerminalFooter · universal props" stage="fill" files={queryFiles}>
            <div class={cx(rt.panel)}><TerminalFooter ghost="JIXOAI-UI" size={18} density="small"><TerminalFooterColumn title="project"><a href="/docs.html">Docs</a></TerminalFooterColumn></TerminalFooter></div>
          </ComponentCanvas>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The landmark is the platform's; the ghost is decorative by declaration; everything readable is composed by you — including the external-link attributes."><A11yTable keys={[{ key: 'Tab', action: 'Moves through the column links in composed order — the free anchors are real links, focusable by default' }]} aria={[{ name: 'footer (implicit)', value: 'contentinfo landmark', description: 'The root is a real <footer> element — zero ARIA authored; screen readers list it as the page contentinfo' }, { name: 'aria-hidden', value: 'true', description: 'On the ghost wordmark, with user-select: none — decorative by construction: pure sign-off, never information' }, { name: 'column titles', value: 'spans, not headings', description: 'The uppercase eyebrows carry no heading semantics — the landmark and its links carry the structure' }, { name: 'target / rel', value: 'yours', description: 'External-link attributes are authored by the caller on the free anchors' }, { name: 'hover', value: 'color-only', description: 'The link warming is a color transition (measured 0.15s ease-out) — no motion path, so it survives prefers-reduced-motion; never the only affordance (focus and activation are native)' }]} /></SectionCard></div>

  <!-- see-also (chrome — out of the toc) -->
  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="terminal-footer" />
  </div>
</div>

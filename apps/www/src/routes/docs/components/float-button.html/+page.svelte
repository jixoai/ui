<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import FloatButton from '$lib/ui/float-button/float-button.svelte';
  import Icon from '$lib/ui/icon';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // ToC outline: the menu-idiom demo + the closing law, in page order.

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import floatbuttonSource from '$lib/ui/float-button/float-button.svelte?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import FloatButton from '@ui/float-button.svelte';
${close}

<!-- plain idiom: a lone fixed action (compose, support, back-to-top) -->
<FloatButton label="back to top" onclick={() => scrollToTop()}>
  <span aria-hidden="true">↑</span>
</FloatButton>

<!-- menu idiom: children + an actions snippet — the button toggles a
     popover=auto stack above itself (native light dismiss, Escape, top layer) -->
<FloatButton label="quick actions" corner="bottom-right" class="fab-lift-a">
  <span aria-hidden="true">+</span>
  {#snippet actions()}
    <button type="button" role="menuitem" onclick={compose}>compose</button>
    <button type="button" role="menuitem" onclick={support}>support</button>
  {/snippet}
</FloatButton>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/float-button.svelte', content: floatbuttonSource },
    { name: 'src/lib/ui/float-button-usage.svelte', content: usage },
  ];

  // canvas-everywhere sweep (2026-09-08): the menu-idiom demo's usage
  // mirror — hand-authored to match the stage markup (same-source
  // migration is the recorded follow-up).
  const floatButtonMenuDemo = `<script lang="ts">
  import FloatButton from '@ui/float-button.svelte';
${close}

<!-- menu idiom: children + an actions snippet — the button toggles a
     popover=auto stack above itself (native light dismiss, Escape, top layer) -->
<FloatButton label="quick actions" corner="bottom-right" class="fab-lift-a">
  <span aria-hidden="true">+</span>
  {#snippet actions()}
    <button type="button" role="menuitem" onclick={backToTop}>back to top</button>
    <button type="button" role="menuitem" onclick={copyPageLink}>copy this page link</button>
    <a role="menuitem" href="https://github.com/jixoai/ui" target="_blank" rel="noreferrer">github ↗</a>
  {/snippet}
</FloatButton>`;

  // the overlay shell scrolls on .jx-shell-body, not the window — the
  // back-top action must ride the REAL scroll plane (motion-aware)
  function scrollToTop(): void {
    const body = document.querySelector('.jx-shell-body');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    body?.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }
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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
  // ---- the universal props demo (explicit-props W3-C) --------------------
  const universalUsage = `<FloatButton label="Actions" corner="bottom-right" class="fab-lift-b" elevation="level4">…</FloatButton>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/float-button-universal.svelte', content: universalUsage },
  ];

</script>

<style>
  /* scrollable stage: the back-top action is demonstrable in place;
     no reveal wrapper — a transformed ancestor hijacks position:fixed
     during the transition window (walkthrough-3 note) */
  .jx-fab-stage {
    position: relative;
    max-height: 14rem;
    overflow-y: auto;
    border: 1px dashed var(--border);
    padding: 0.875rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  /* the stacked-fab seats ride the class prop's geometry-only channel (the
     documented API): three live fabs share the bottom-right column, antd
     stack style — the default at the corner, the menu one rung up, the
     universal seat two rungs up. Scoped rules cannot reach the family's
     internal elements, so the lifts are :global by name. */
  :global(.fab-lift-a) {
    bottom: 7.5rem;
  }
  :global(.fab-lift-b) {
    bottom: 13.5rem;
  }
  /* menu idiom items: the popover carries role=menu; rows are menuitems */
  .jx-fab-menu-item {
    display: block;
    width: 100%;
    border: none;
    background: none;
    color: inherit;
    font-size: 12.5px;
    text-align: left;
    padding: 0.45rem 0.6rem;
    cursor: pointer;
  }
  .jx-fab-menu-item:hover {
    background: var(--muted);
    color: var(--primary);
  }
  .jx-fab-menu-item:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
</style>

<svelte:head>
  <title>FloatButton · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai float-button component: the floating action button in two idioms — plain (a lone fixed action) and menu (an actions snippet toggling a popover stack above). Corner is a prop; your layout is never touched."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (height 0, see toc.css) -->

  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="float-button — the fixed corner action"
        summary="The floating action button in two idioms: plain (a lone fixed action) and menu (an actions snippet toggling a popover stack above). Corner is a prop — your layout is never touched."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">plain · menu idioms</span>
          <span class="pill">corner is a prop</span>
          <span class="pill">popover=auto menu</span>
          <span class="pill">label always required</span>
        </div>
      </SectionCard>
    </div>

    <!-- no reveal here by the page's own :99 law — a scroll-driven reveal
         keeps a containing-block transform on the section for the
         animation's lifetime, hijacking the fixed fabs inside it (measured:
         fill-mode does not help; only animation-less sections free them) -->
    <div>
      <ComponentCanvas
        title="float-button"
        description="float-button — the fixed corner action: scroll this box (or the page), then press the corner button to ride back to the top."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/float-button.svelte"
        files={canvasFiles}
        stage="fill"
      >
        <div class="jx-fab-stage">
          <p class={cx(rt.inkMuted, rt.text125, rt.lead6)}>
            scroll inside this box or the page itself — the button stays pinned to the viewport
            corner. Press it and the page rides back to its top.
          </p>
          {#each Array(12) as _, i (i)}
            <p class={cx(rt.text125, rt.lead6, rt.inkMuted70)}>filler row {i + 1}</p>
          {/each}
          <FloatButton label="back to top" onclick={scrollToTop}>
            <span aria-hidden="true">↑</span>
          </FloatButton>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              the button is fixed bottom-right of the viewport — no wrapper, no portal:
              <code>corner</code> picks the fixed point and your layout is
              never touched. label is REQUIRED: an icon-only button must say itself.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <!-- no reveal (same law as the stage section above): the menu stack
         must keep its viewport containing block -->
    <div id="menu-idiom">
      <SectionCard
        family="menu-idiom"
        headerRegion="menu-idiom"
        eyebrow="demo"
        title="The menu idiom"
        summary="Pass an actions snippet and the same button becomes a menu trigger: a popover=auto stack opens above it with native light dismiss, Escape, and top-layer rendering — the component adds only the aria wiring (aria-haspopup=menu, aria-expanded) and the anchor geometry."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.body13)}>
            A second live instance sits in the
            <strong class={cx(rt.semibold)}>bottom-right column, one rung above the stage demo's
            fab</strong> (the <code class={cx(rt.inkAccent)}>class</code> prop's geometry-only
            channel — the documented stack idiom) — press the
            <span aria-hidden="true">+</span> button there to open its stack; the panel anchors
            above the stack, END-aligned, with position-try fallbacks flipping it when the viewport
            edge is near. Items are ordinary
            buttons carrying <code class={cx(rt.inkAccent)}>role="menuitem"</code>; the popover itself
            already carries <code class={cx(rt.inkAccent)}>role="menu"</code>. The other corners are
            deliberately not demoed — both are contested lanes on scaffold-based docs pages
            (measured): the sections-nav column owns the left 256px full-height, and the page-toc
            rail owns the top-right block (x1231–1421, y94–358) — a fab there paints under the rail
            and its hit area is covered. Consumers embedding in the scaffold should float
            right-side, below the rail (the lane question is queued for the Owner, W-next).
          </p>
          <ComponentCanvas
            title="float-button · menu"
            stage="fill"
            files={[{ name: 'float-button-menu-demo.svelte', content: floatButtonMenuDemo, kind: 'usage' }]}
          >
            <FloatButton label="quick actions" corner="bottom-right" class="fab-lift-a">
              <span aria-hidden="true">+</span>
              {#snippet actions()}
                <button type="button" role="menuitem" class="jx-fab-menu-item" onclick={scrollToTop}>
                  back to top
                </button>
                <button
                  type="button"
                  role="menuitem"
                  class="jx-fab-menu-item"
                  onclick={() => void navigator.clipboard?.writeText('https://ui.jixoai.com')}
                >
                  copy this page link
                </button>
                <a
                  role="menuitem"
                  class="jx-fab-menu-item"
                  href="https://github.com/jixoai/ui"
                  target="_blank"
                  rel="noreferrer"
                >
                  github ↗
                </a>
              {/snippet}
            </FloatButton>
          </ComponentCanvas>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>

    <div id="fab-law" data-reveal="">
      <SectionCard
        family="fab-law"
        headerRegion="fab-law"
        eyebrow="law"
        title="Corner is a prop, label is the law"
        summary="Positioning is a prop, not a wrapper: the component owns its fixed point and the consumer's layout is never touched. The surface follows the press-button laws at a fixed size, and the accessible name is mandatory."
      >
        <ul class={cx(rt.col8, rt.body13)}>
          <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span><code class={cx(rt.inkAccent)}>label</code> is required — an icon-only button must say
              itself; the glyph is decorative and <code class={cx(rt.inkAccent)}>aria-hidden</code></span></li>
          <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span><code class={cx(rt.inkAccent)}>corner</code> picks one of four fixed points
              (bottom-right default); no wrapper element, no consumer layout change</span></li>
          <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span>the menu idiom rides <code class={cx(rt.inkAccent)}>popover="auto"</code>: light
              dismiss, Escape, and the top layer belong to the browser; CSS anchor positioning
              keeps the stack glued to its button with flip fallbacks</span></li>
          <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span>the press law is shared with press-button (.jx-press at float scale): hover grows
              the shadow (--shadow → --shadow-md) without moving the body, active presses +1px,+1px
              on the anchored shadow layer, <code class={cx(rt.inkAccent)}>:focus-visible</code> keeps
              the ring</span></li>
        </ul>
      </SectionCard>
    </div>
  </div>

  <div id="types" data-reveal="">
    <SectionCard eyebrow="types" title="Plain action or action menu" summary="A FloatButton remains one corner-anchored control; passing actions changes it into a native popover menu trigger.">
      <div class={cx(rt.fbGridSm2)}>
        <div class={cx(rt.panel60P12)}><p class={cx(rt.fontNav, rt.textSm)}>Plain</p><p class={cx(rt.mt4, rt.text12, rt.inkMuted)}>A single fixed command via onclick.</p></div>
        <div class={cx(rt.panel60P12)}><p class={cx(rt.fontNav, rt.textSm)}>Menu</p><p class={cx(rt.mt4, rt.text12, rt.inkMuted)}>An actions snippet opens an anchored popover menu.</p></div>
      </div>
    </SectionCard>
  </div>

  <div id="usage" data-reveal="">
    <SectionCard eyebrow="usage" title="Usage" summary="Set the accessible label, choose the viewport corner, then supply either a direct action or an actions snippet — the full usage file, as the canvas above runs it.">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal="">
    <SectionCard eyebrow="a11y" title="Menu semantics" summary="The visible glyph is decorative; label names the trigger. Native popover behavior provides the expected dismissal path.">
      <A11yTable
        keys={[{ key: 'Tab', action: 'Focus the floating action or an open menu item' }, { key: 'Enter / Space', action: 'Activate the plain action or toggle the menu' }, { key: 'Escape', action: 'Dismiss the popover menu' }]}
        aria={[{ name: 'aria-label', value: 'label', description: 'Names the icon-only floating action.' }, { name: 'aria-haspopup', value: 'menu when actions exist', description: 'Announces the menu trigger.' }, { name: 'aria-expanded', value: 'open state', description: 'Reports whether the menu is visible.' }]}
      />
    </SectionCard>
  </div>

  <div id="theming" data-reveal="">
    <SectionCard eyebrow="theming" title="Corner geometry and density" summary="The fixed control consumes the shared density scale and locally repoints the press-shadow poses for its elevated surface.">
      <div class={cx(rt.col20)}>
        <DensityDemo>
          <button type="button" class={cx('jx-press', rt.fbDemoBtn)} aria-label="example floating action">+</button>
        </DensityDemo>
        <TokenTable tokens={[
          { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density', description: 'Minimum floating action target.' },
          { name: '--jx-gap', default: '8 / 8 / 12 / 16px', source: 'density', description: 'Offset between fixed button and menu stack.' },
          { name: '--jx-press-shadow', default: 'var(--shadow)', source: 'component', description: 'Resting float elevation.' },
          { name: '--jx-press-shadow-hover', default: 'var(--shadow-md)', source: 'component', description: 'Hover elevation.' },
          { name: '--jx-press-shadow-active', default: 'var(--shadow-md-press)', source: 'component', description: 'Pressed elevation pose.' },
        ]} />
      </div>
    </SectionCard>
  </div>

  <!-- no reveal (the Compose fab below is fixed — same law as above) -->
  <div id="universal-props">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive/container-conditional values. The fab carries its OWN elevation STAMP — level3 (6dp, M3's FAB rung) reaches the root (--jx-elevation-effective = 6, measured), but the shadow RECIPE is unwired on the served surface (--jx-shadow-effective ships empty; no shadow channel paints on the button or the menu panel — the menu's shadow child renders a translucent wash). The wire-or-retire decision is the family owner's — W-next. The carriers stamp the family root (the stack wrapper / the fixed button); the panel's promotion keeps the DOM, so the stamps inherit down."
    >
      <ComponentCanvas title="FloatButton · universal props" stage="fill" files={universalFiles}>
<div class={cx(rt.panel)}><FloatButton label="Compose · level3 default" corner="bottom-right" class="fab-lift-b"><Icon name="plus" /></FloatButton></div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard eyebrow="api" title="Props" summary="FloatButton owns position and popover wiring while leaving command content to the caller.">
      <PropsTable universal props={[
        { name: 'label', type: 'string', required: true, description: 'Accessible name for the icon-only control.' },
        { name: 'density', type: 'Density', default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.' },
        { name: 'corner', type: "'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'", default: "'bottom-right'", description: 'Viewport corner for the fixed control. On scaffold-based docs pages the sections-nav column owns the left 256px full-height (measured) — left corners are covered there; float right-side corners when embedding in the scaffold (the lane question is queued W-next).' },
        { name: 'onclick', type: '() => void', default: '—', description: 'Plain-action handler.' },
        { name: 'actions', type: 'Snippet', default: '—', description: 'Turns the control into a popover menu trigger.' },
        { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto' · Own default, not ambient", description: 'Menu panel surface treatment. Defaults: literal slot — own ’auto’, ambient when an axis opens.' },
        { name: 'children', type: 'Snippet', required: true, description: 'Decorative icon or glyph.' },
      ]} />
    </SectionCard>
  </div>
</div>

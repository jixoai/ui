<!--
  alert — docs page (docs-eight-axes-mdn, tier-2 refactor, 2026-09-22).
  MDN archetype order: H1 → Overview → Live example → Props →
  The eight axes on THIS component → Accessibility → See also.
  The W3-era single universal demo card is replaced by the per-axis
  table + grouped runnable examples + one real query() case.
-->
<script lang="ts">
  import Alert from '$lib/ui/alert/alert.svelte';
  import Card from '$lib/ui/card/card.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { PropEntry } from '$lib/ui/props-table/props-table.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
  // The canvas same-source lane (typography-context-and-parts §7, the
  // quill idiom): the axes drawer composes from THIS page's own canvas
  // markup — resolveRawCode('axes') extracts the stage children at
  // build time. One source, two surfaces; the hand-mirrored literal
  // had drifted from its stage at birth (review finding 1).
  import { usageFile } from '$lib/canvas-usage';
  import { resolveRawCode } from 'virtual:jixoai-canvas/docs/components/alert.html/+page';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import alertSource from '$lib/ui/alert/alert.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Alert from '@ui/alert.svelte';
${close}

<Alert title="Deployed">
  Build 4f2a shipped to production — 0 checks failed.
</Alert>

<Alert variant="tonal" title="Scheduled maintenance">
  The registry pauses syncs Sunday 02:00–02:30 UTC.
</Alert>

<Alert variant="tonal" class="jx-hue-error" assertive={true} title="Build failed">
  Exit 1 — the bundle exceeded the size budget by 12 KB.
</Alert>

<Alert variant="tonal" title="dark profile" theme="dark">theme="dark" stamps the .dark class bridge on this banner only — a partial re-theme: the tonal pair re-scopes to the island's dark profile; the semantic ink layer stays root-anchored (W-next #1).</Alert>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/alert/alert.svelte', content: alertSource },
    { name: 'src/lib/ui/alert-usage.svelte', content: usage },
  ];

  // ── the eight axes on alert — grouped runnable examples ────────────────
  // The drawer's usage file composes from the stage markup in the axes
  // canvas below (the same-source lane — the stage is THE source; the
  // explanatory comments ride inside the stage children so both
  // surfaces carry them). The query() case keeps its hand file: its
  // drawer teaches the explicit call form while the stage carries the
  // page's own const (a deliberate teaching difference, copy-checked).
  const axesUsage = usageFile({ Alert: '@ui/alert', Card: '@ui/card' }, resolveRawCode('axes'));

  const axesFiles: TreeFile[] = [{ name: 'alert-axes-demo.svelte', content: axesUsage, kind: 'usage' }];

  // the ONE query() case: responsive density on a dismissible notice —
  // the base (large, the touch-generous 48px × lane) applies below the
  // 40rem viewport; at ≥40rem the sm case wins and the × steps down to
  // the compact 32px lane. The explicit generics pin the cases AND the
  // base to the lane (the one-generic form leaves B inferred
  // undefined, and 'large' fails its assignment — scribe finding 5)
  const responsiveDensity = query<{ sm: DensityLane }, DensityLane>({ sm: 'small' }, 'large');

  const queryUsage = `<script lang="ts">
  import Alert from '@ui/alert.svelte';
  import { query } from '@lib/universal-props-query.svelte';
  import type { DensityLane } from '@lib/defaults.svelte';
${close}

<Alert title="Responsive dismiss target" dismiss="manual" density={query<{ sm: DensityLane }, DensityLane>({ sm: 'small' }, 'large')}>
  Media keys are min-width: below 40rem the base applies — the large
  rung and its 48px × lane (touch); at 40rem and wider the sm case
  wins — the compact small rung (pointer). Resize the window.
</Alert>`;

  const queryFiles: TreeFile[] = [{ name: 'alert-query-demo.svelte', content: queryUsage, kind: 'usage' }];

  // ── the per-axis table (§2.5): what each axis drives on THIS family.
  // Mechanism names are the family's real carriers (alert.svelte stamps
  // through stampCarriersForLanes; the atoms live in alert.stylex.ts);
  // named steps/units mirror universal-props.schema.ts.
  const axisRows: PropEntry[] = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'Stamps --jx-size-effective and the root font-size on the banner — the ambient reference for em-sized content inside the notice. The banner\'s own type voices are rem-anchored (the fixed 13px --jx-text-base rhythm) and do not scale. Steps resolve var(--jx-size-*) — 14 / 16 / 18px.',
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        'Stamps --jx-shape-effective and --jx-radius-factor-effective, supplied downward. The banner\'s own corners never read the pair — supply-only on this family. The degrade table is the universal props page\'s.',
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'Stamps --jx-radius-effective — the concentric anchor: a nested part at radius="auto" computes max(0px, R − inset) off it (the demo below resolves 6px from 20). The banner\'s own corners stay the theme\'s --radius (0px; 8px where corner-shape is supported).',
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        'A named rung stamps the data-density scope (small/medium/large alias sm/default/lg; the five legacy spellings keep working); a number stamps --jx-density-coefficient — inert on this banner: nothing here scales by the coefficient, and only the named rungs move --jx-hit, the × affordance\'s hit lane (a bare number declares no scope block, so nothing re-declares AT the banner). The banner\'s type and padding rhythm are static tokens — var(--jx-text-base), var(--space-12), calc(var(--jx-unit) * 3.5) — and none of them reads a density channel. The declaration-only density posture retired at explicit-props D5 (migration-census.md, W3 CLOSE).',
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        'Stamps --jx-color-effective, supplied downward. The banner\'s own hue seam is the tonal token pair (--jx-tonal / --jx-outline) retargeted by the jx-hue-* utilities — inject hue through class (jx-hue-error), not this prop. A number is hue degrees through the oklch formula; a raw string passes through verbatim.',
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        'A PARTIAL re-theme on this banner, measured (the drift ledger\'s W-next #1): dark stamps the .dark class bridge on the root, and the variant-grammar slots re-scope — the sheet declares --jx-tonal and --jx-outline on every theme scope (the canvas-bug law), so the tonal ground, border and its title/body inks follow the island\'s dark profile. The stylex semantic ink layer does NOT follow: --jx-foreground, --jx-muted-foreground, --jx-ring and the shadow ink stay :root-anchored — the outline rung\'s ramp, the × affordance and its focus ring keep the light values inside a dark island (documented supply-side until the protocol pass). system resolves the JS-mutable global; auto inherits the tree.',
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        'Stamps --jx-elevation-effective (level-1…level5 are exact dp; a number snaps down to the enclosing rung). The banner\'s shadow is the fixed hard-offset shadow-2xs — the site\'s terminal material law — so the axis is supply-only here.',
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        'Stamps --jx-motion-effective (a coefficient; named steps resolve var(--jx-motion-*)). The banner ships no motion kernels — nothing to scale — supply-only here.',
    },
  ];

  const alertProps = [
    { name: 'variant', type: "'outline' | 'tonal'", default: "'outline' · ambient zone", description: 'Ladder prominence: outline paints a transparent ground with the --jx-outline border; tonal paints the 12% tinted ground with the tonal title ink. Hue comes from token injection, not variant names. Omitted → the ambient paint zone (ButtonGroup / zone scope), else the frozen own.' },
    { name: 'assertive', type: 'boolean', default: 'false', description: 'true → role=alert (immediate); false → role=status (polite).' },
    { name: 'title', type: 'string', default: '—', description: 'One-line heading; omitted renders a bare body block.' },
    { name: 'icon', type: 'Snippet', default: '—', description: 'Rendered inline-start of the title — bring your own glyph (sized 1em by the family css).' },
    { name: 'dismiss', type: "'manual' | 'auto'", default: '— (persistent)', description: "The lifecycle axis, orthogonal to variant and assertive: undefined = persistent (no button, no timer); 'manual' = a × button at the title row's inline-end firing onDismiss('button'); 'auto' = manual + a mount-armed timer firing onDismiss('timer'). The alert only signals — presence is the caller's ({#if} unmount). The button rides inside the live region (the toast-viewport family precedent)." },
    { name: 'dismissAfter', type: 'number', default: '6000', description: "'auto' duration in ms; a change re-arms the timer. A same-instance message swap does NOT reset the clock — key the alert ({#key notice}) when each message deserves a fresh deadline. Pairing 'auto' with assertive (immediate announcement that evaporates in 6s) reads aggressive to screen-reader users; polite (the default) is the companion." },
    { name: 'onDismiss', type: "(how: 'button' | 'timer') => void", default: '—', description: "The dismissal signal: how='button' (× click) or how='timer' (auto deadline). Teardown cancels the timer — an unmounted alert never fires." },
    { name: 'dismissLabel', type: 'string', default: "'dismiss'", description: "The × button's aria-label." },
    { name: 'children', type: 'Snippet', default: '—', description: 'Body copy; omit for a title-only notice.' },
    { name: 'class', type: 'string', default: "''", description: 'Forwarded to the banner element; intent utilities like jx-hue-error (or arbitrary token injections outside the closed set) land here.' },
  ];

  // ToC outline: pairs with the section ids below, in page order.
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
</script>

<svelte:head>
  <title>Alert · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai alert: an inline notice block with live-region semantics as a prop — role=status by default, role=alert when assertive. The variant ladder is the surface (outline plain, tonal tinted); hue is injection through the global tokens; the eight universal axes resolve on the same banner."
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
      eyebrow="registry:ui · NativeHTML"
      title="alert — the inline notice"
      summary="An in-flow notice block for state announcements: the variant ladder is its surface (outline plain, tonal tinted), the live-region role is a prop (status polite by default, alert assertive), and hue injects through the global tokens — never a variant name. Not the modal surface (that is system-dialog) and not the transient toast."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">role=status | role=alert</span>
        <span class="pill">outline · tonal</span>
        <span class="pill">persistent · manual · auto</span>
      </div>
    </SectionCard>
  </div>

  <div id="overview" data-reveal="">
    <SectionCard
      family="overview"
      headerRegion="overview"
      eyebrow="overview"
      title="Overview"
      summary="State news that belongs to the page's flow — a deploy landed, a budget failed, maintenance is scheduled. The notice stays until the caller removes it; the banner itself is the live region."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.para)}>
          The banner composes four optional parts around its body copy: an icon inline-start of
          the title, the title, the body, and a × dismissal control at the title row's inline-end.
          Title-only and body-only notices are first-class — no part is required.
        </p>
        <p class={cx(rt.para)}>
          Two decisions are the author's, as props. The surface — <code>variant</code>: outline,
          the transparent ground with the neutral border, or tonal, the 12% tinted emphasis. The
          announcement — <code>assertive</code>: role=status announces politely when the reader is
          idle; role=alert interrupts immediately. Hardcoding either role would be the guess this
          component refuses to make.
        </p>
        <p class={cx(rt.para)}>
          The dismissal lifecycle is the third axis: persistent (default), manual (the × fires
          <code>onDismiss('button')</code>), or auto (a <code>dismissAfter</code> timer, default
          6000 ms, fires <code>onDismiss('timer')</code>). The alert only signals — presence stays
          the caller's (<code>{'{#if}'}</code> unmount), and teardown cancels the timer.
        </p>
        <p class={cx(rt.para)}>
          Hue is injection: the tonal slot reads <code>--jx-tonal</code> (the brand tint by
          default) and utilities like <code class="jx-hue-error">jx-hue-error</code> retarget it —
          failed statuses inject <code>--error</code>; the destructive hue is an action hue, never
          a status. The eight universal style axes resolve on the same banner — documented per-axis
          below; the shared grammar lives on the
          <a class="pill" href="/docs/universal-props.html">universal props</a> page.
        </p>
      </div>
    </SectionCard>
  </div>

  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="The minimal working example, live: the variant pair across both live-region roles, plus the dark bridge on one notice. The icon snippet composes inline-start of the title — bring your own glyph; the drawer shows the exact registry copy this page runs."
    >
      <ComponentCanvas
        title="alert"
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/alert/alert.svelte"
        files={canvasFiles}
        stage="fill"
      >
        <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
          <Alert title="Deployed">Build 4f2a shipped to production — 0 checks failed.</Alert>
          <Alert variant="tonal" title="Scheduled maintenance">
            The registry pauses syncs Sunday 02:00–02:30 UTC.
          </Alert>
          <Alert variant="tonal" class="jx-hue-error" assertive={true} title="Build failed">
            Exit 1 — the bundle exceeded the size budget by 12 KB.
          </Alert>
          <Alert variant="tonal" title="dark profile" theme="dark">theme=&quot;dark&quot; stamps the .dark class bridge on this banner only — a partial re-theme: the tonal pair re-scopes to the island's dark profile; the semantic ink layer stays root-anchored (W-next #1).</Alert>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              <code>assertive</code> swaps role=status for role=alert — pair it with
              the error injection (<code class="jx-hue-error">jx-hue-error</code>)
              for failures, where the announcement should be immediate. The body is
              optional; title-only notices are first-class.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </SectionCard>
  </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="props" title="Props" summary="Ten props: variant sets the ladder surface, assertive swaps the live-region role, and the dismiss axis owns the lifecycle — presence stays the caller's. The eight universal axes ride the same banner (their per-axis story is the next section)."><PropsTable universal props={alertProps} /></SectionCard></div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on alert"
      summary="Alert resolves all eight universal axes through its family Defaults (AlertDefaults) and stamps the resolved carriers on the banner root. What each axis drives on THIS family differs: theme partially re-themes the banner (the tonal pair re-scopes under the .dark island; the semantic ink layer stays root-anchored), density moves the × hit lane, radius supplies the concentric anchor for nested parts — and four axes stamp-and-supply without touching the banner's own paint. The lane grammar (named · auto · number · query()) is the universal props page's."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />

        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="axes" title="alert · on the axes" files={axesFiles}>
            <div class={cx(rt.col16, rt.wFull)}>
              <!-- radius: the banner SUPPLIES the concentric anchor; size stamps the root -->
              <Alert variant="tonal" title="concentric anchor" radius={20} size={18}>
                <Card radius="auto">child at auto — corners resolve max(0px, 20 − 14) = 6px off the banner's anchor</Card>
              </Alert>
              <!-- density: the named rung moves the × hit lane -->
              <div class={cx(rt.gridSm2)}>
                <div class={cx(rt.panel)}><Alert title="large rung" density="lg" dismiss="manual">The × affordance rides the lg hit lane.</Alert></div>
                <div class={cx(rt.panel)}><Alert title="2xs rung" density="2xs" dismiss="manual">The × affordance rides the 2xs hit lane.</Alert></div>
              </div>
            </div>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="alert · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <Alert title="Responsive dismiss target" dismiss="manual" density={responsiveDensity}>
                Media keys are min-width: below 40rem the base applies — the large rung and its
                48px × lane (touch); at 40rem and wider the sm case wins — the compact small rung
                (pointer). Resize the window.
              </Alert>
            </div>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <p class={cx(rt.para)}>
            The supply-only rows are documented absences, not gaps: the banner's corners read the
            theme's <code>--radius</code>, its shadow is the fixed hard-offset
            <code>--jx-shadow-2xs</code>, its hue seam is <code>--jx-tonal</code>, and it ships no
            motion kernels — so shape, color, elevation, and motion stamp their carriers and feed
            nested consumers without repainting this banner. The fleet classification and the
            density-posture retirement are recorded in explicit-props'
            <code>migration-census.md</code> (W3 CLOSE, LANDED D5).
          </p>
        </div>

        <div class={cx(rt.mt20)}>
          <TokenTable tokens={[{ name: '--jx-tonal', default: 'var(--primary)', source: 'color', description: 'Tonal ground/border/title hue source — inject per intent (error, success…).' }, { name: '--jx-outline', default: 'var(--border)', source: 'color', description: 'Outline border source.' }, { name: '--jx-hit', default: '24 / 28 / 32 / 40 / 48px (2xs → lg)', source: 'density', description: 'The × affordance\'s hit lane — the density axis\'s consumption point on this family (measured rungs).' }, { name: 'border', default: '1px', source: 'structural' }, { name: 'shadow', default: 'shadow-2xs (hard offset)', source: 'structural' }, { name: 'title rhythm', default: '13px, fixed utility', source: 'structural' }]} />
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The banner is itself the live region — screen readers announce it when it appears, and it never takes focus. The × is the one focusable control: a real button inside the live region (the toast-viewport family precedent), labeled by dismissLabel (default dismiss), with a 1px --jx-ring focus-visible outline and the --jx-hit minimum target (28px floor; 24px at the 2xs scope, the WCAG 2.5.8 AA note)."><A11yTable keys={[{ key: '—', action: 'Not focusable — an inline live region, not a control' }, { key: '× (dismiss)', action: 'The one focusable control when dismiss is set — a real button inside the live region (the toast-viewport family precedent), aria-label dismissLabel (default dismiss)' }]} aria={[{ name: 'role', value: 'status | alert', description: 'status announces politely (default); alert interrupts immediately (assertive).' }, { name: 'data-jx-alert', value: 'variant', description: 'Hook attribute carrying the ladder variant (outline | tonal) for styling.' }]} /></SectionCard></div>

  <div id="see-also" data-reveal="">
    <SectionCard
      family="see-also"
      headerRegion="see-also"
      eyebrow="see also"
      title="See also"
      summary="The surfaces around the notice."
    >
      <div class={cx(rt.wrap12)}>
        <a class="pill" href="/docs/components/toast.html">toast — the transient overlay sibling (same live-region law)</a>
        <a class="pill" href="/docs/components/system-dialog.html">system-dialog — the modal surface</a>
        <a class="pill" href="/docs/universal-props.html">universal props — the eight-axis grammar</a>
      </div>
    </SectionCard>
  </div>
</div>

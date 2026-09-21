<script lang="ts">
  import Alert from '$lib/ui/alert/alert.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import Toc from '$lib/ui/toc/toc.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

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
</Alert>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/alert/alert.svelte', content: alertSource },
    { name: 'src/lib/ui/alert-usage.svelte', content: usage },
  ];

  // the variants matrix (types section), swept through a canvas: both
  // ladder variants, both live-region roles, and the optional-parts
  // notices in one pass (hand-authored mirror of the stage markup)
  const alertVariantsDemo = `<script lang="ts">
  import Alert from '@ui/alert.svelte';
${close}

<Alert title="outline — polite">role=status, transparent ground, --jx-outline border. The plain notice.</Alert>

<Alert variant="tonal" title="tonal — the brand tint">12% tinted ground, 45% border, tonal ink; --jx-tonal defaults to the brand hue.</Alert>

<Alert variant="tonal" class="jx-hue-error" assertive={true} title="error status — assertive">role=alert, immediate announcement; failed statuses inject --error — destructive is an action hue, not a status.</Alert>

<Alert>Body-only and title-only notices are first-class — no heading required.</Alert>`;

  const alertVariantsFiles: TreeFile[] = [
    { name: 'alert-variants-demo.svelte', content: alertVariantsDemo, kind: 'usage' },
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
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
  // ---- the universal props demo (explicit-props W3-D5) --------------------
  const universalUsage = `<Alert title="Deployed" size={18}>Build 4f2a shipped to production.</Alert>
<Alert variant="tonal" title="Maintenance" size="medium" radius="large">
  The registry pauses syncs Sunday 02:00–02:30 UTC.
</Alert>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/universal-props-demo.svelte', content: universalUsage },
  ];

</script>

<svelte:head>
  <title>Alert · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai alert: an inline notice block with live-region semantics as a prop — role=status by default, role=alert when assertive. The variant ladder is the surface (outline plain, tonal tinted); hue is injection through the global tokens — brand tint by default, --error for failed statuses."
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
      title="alert — semantics you choose, not a guess"
      summary="An inline notice block: 1px border, hard offset shadow, and the variant ladder as its surface — outline (transparent ground, neutral border) for the plain notice, tonal (12% tinted ground) for emphasis. Live-region behavior is a prop — role=status (polite) by default, role=alert (assertive) when the news is an error. Hue is injection, not a variant: the tonal slot defaults to the brand hue; failed statuses inject --error (a status, never the destructive action hue)."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">role=status | role=alert</span>
        <span class="pill">outline · tonal</span>
        <span class="pill">icon snippet</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <ComponentCanvas
      title="alert"
      description="The variant pair with both live-region roles: outline neutral, tonal in the brand tint, tonal with the error-status injection. The icon snippet composes inline-start of the title — bring your own glyph."
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
  </div>

  <div id="alert-base" data-reveal="">
    <SectionCard
      family="alert-base"
      headerRegion="alert-base"
      eyebrow="W3C foundation"
      title="The live-region split"
      summary="role=status announces politely (when the reader is idle); role=alert interrupts immediately. Choosing is the author's semantic decision — hardcoding either would be the guess this component refuses to make. Not the modal one: that surface is system-dialog, a later registry item."
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Alert variants" summary="Two ladder variants and two live-region roles; title and body are each optional. Hue is injected, never a variant name.">
    <ComponentCanvas title="alert · variants" stage="fill" files={alertVariantsFiles}>
      <div class={cx(rt.gridSm2)}>
        <div class={cx(rt.panel)}><Alert title="outline — polite">role=status, transparent ground, --jx-outline border. The plain notice.</Alert></div>
        <div class={cx(rt.panel)}><Alert variant="tonal" title="tonal — the brand tint">12% tinted ground, 45% border, tonal ink; --jx-tonal defaults to the brand hue.</Alert></div>
        <div class={cx(rt.panel)}><Alert variant="tonal" class="jx-hue-error" assertive={true} title="error status — assertive">role=alert, immediate announcement; failed statuses inject --error — destructive is an action hue, not a status.</Alert></div>
        <div class={cx(rt.panel)}><Alert>Body-only and title-only notices are first-class — no heading required.</Alert></div>
      </div>
    </ComponentCanvas>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Choose the role deliberately: status for expected news, alert for errors; choose the surface by prominence — outline neutral, tonal emphasis — and inject the hue the intent needs."><CodeBlock code={usage} lang="svelte" meta="Alert usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The banner is itself the live region — screen readers announce it when it appears; no focus is taken."><A11yTable keys={[{ key: '—', action: 'Not focusable — an inline live region, not a control' }, { key: '× (dismiss)', action: 'The one focusable control when dismiss is set — a real button inside the live region (the toast-viewport family precedent), aria-label dismissLabel (default dismiss)' }]} aria={[{ name: 'role', value: 'status | alert', description: 'status announces politely (default); alert interrupts immediately (assertive).' }, { name: 'data-jx-alert', value: 'variant', description: 'Hook attribute carrying the ladder variant (outline | tonal) for styling.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="Utility-authored paint — the banner rhythm is fixed literals, so density scopes leave it unchanged; the grammar tokens are the hue seam."><div class={cx(rt.col20)}><DensityDemo><Alert title="density sample">The 1px border, shadow-2xs, and 13px rhythm are fixed across scopes.</Alert></DensityDemo><TokenTable tokens={[{ name: '--jx-tonal', default: 'var(--primary)', source: 'color', description: 'Tonal ground/border/title hue source — inject per intent (error, success…).' }, { name: '--jx-outline', default: 'var(--border)', source: 'color', description: 'Outline border source.' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }, { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' }, { name: '--jx-stack', default: '4 / 4 / 8 / 8px', source: 'density' }, { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density' }, { name: 'border', default: '1px', source: 'structural' }, { name: 'shadow', default: 'shadow-2xs (hard offset)', source: 'structural' }, { name: 'title rhythm', default: '13px, fixed utility', source: 'structural' }]} /></div></SectionCard></div>
  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query(). The banner is a no-own in-flow surface: the size axis scales the whole notice (title, body and the × affordance), a radius lane supplies the concentric anchor."
    >
      <ComponentCanvas title="alert · universal props" stage="fill" files={universalFiles}>
<div class={cx(rt.panel)}><Alert title="axes joined" size={18}>Build 4f2a shipped to production — 0 checks failed.</Alert></div>
      <div class={cx(rt.panel)}><Alert variant="tonal" title="named steps" size="medium" radius="large">The registry pauses syncs Sunday 02:00–02:30 UTC.</Alert></div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Ten props; variant sets the ladder surface (ground, border, title ink), assertive swaps the live-region role, and the dismiss axis (manual | auto) owns the dismissal lifecycle — presence stays the caller's."><PropsTable universal props={[{ name: 'variant', type: "'outline' | 'tonal'", default: "'outline' · ambient zone", description: 'Ladder prominence: outline paints a transparent ground with the --jx-outline border; tonal paints the 12% tinted ground with the tonal title ink. Hue comes from token injection, not variant names. Omitted → the ambient paint zone (ButtonGroup / zone scope), else the frozen own.' }, { name: 'assertive', type: 'boolean', default: 'false', description: 'true → role=alert (immediate); false → role=status (polite).' }, { name: 'title', type: 'string', default: '—', description: 'One-line heading; omitted renders a bare body block.' }, { name: 'icon', type: 'Snippet', default: '—', description: 'Rendered inline-start of the title — bring your own glyph.' }, { name: 'dismiss', type: "'manual' | 'auto'", default: '— (persistent)', description: "The lifecycle axis, orthogonal to variant and assertive: undefined = persistent (no button, no timer); 'manual' = a × button at the title row's inline-end firing onDismiss('button'); 'auto' = manual + a mount-armed timer firing onDismiss('timer'). The alert only signals — presence is the caller's ({#if} unmount). The button rides inside the live region (the toast-viewport family precedent)." }, { name: 'dismissAfter', type: 'number', default: '6000', description: "'auto' duration in ms; a change re-arms the timer. A same-instance message swap does NOT reset the clock — key the alert ({#key notice}) when each message deserves a fresh deadline. Pairing 'auto' with assertive (immediate announcement that evaporates in 6s) reads aggressive to screen-reader users; polite (the default) is the companion." }, { name: 'onDismiss', type: "(how: 'button' | 'timer') => void", default: '—', description: "The dismissal signal: how='button' (× click) or how='timer' (auto deadline). Teardown cancels the timer — an unmounted alert never fires." }, { name: 'dismissLabel', type: 'string', default: "'dismiss'", description: "The × button's aria-label." }, { name: 'children', type: 'Snippet', default: '—', description: 'Body copy; omit for a title-only notice.' }, { name: 'class', type: 'string', default: "''", description: 'Forwarded to the banner element; intent utilities like jx-hue-error (or arbitrary token injections outside the closed set) land here.' }]} /></SectionCard></div>
</div>

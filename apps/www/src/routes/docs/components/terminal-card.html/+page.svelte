<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import terminalCardSource from '$lib/ui/terminal-card/terminal-card.svelte?raw';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayRow, PlayRange, PlayHelp } from '$lib/playground';

  const usage = `<!-- command is a plain string prop; outputs surface line by
     line after the typing completes. One-shot entrance, never looping. -->
<TerminalCard
  barTitle="quick-start — zsh"
  command="npx jixoai-ui add terminal-card"
  outputs={[
    'terminal-card.svelte → src/lib/ui/',
    'one-shot typing · static cursor · no blink',
  ]}
/>

<!-- pace: speed multiplies the typing rhythm (2 = twice as fast);
     pacing is read on mount, so re-mount to apply ({#key} works) -->
{#key replay}
  <TerminalCard {barTitle} {command} {outputs} speed={2} />
{/key}`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/terminal-card.svelte', content: terminalCardSource },
    { name: 'src/lib/ui/terminal-card-usage.svelte', content: usage },
  ];

  // playground state (P1): the page owns the snapshot (replay re-mounts)
  const canvasInitial = { speed: 1 };
  let replay = $state(0);
  let speed = $state(canvasInitial.speed);
  function resetCanvas(): void {
    speed = canvasInitial.speed;
    replay += 1;
  }

  // ToC outline: pairs with the region ids below, in page order.

  // ---- canvas-everywhere sweep (2026-09-08): hand-authored mirror of
  // the effect-only bezel grid below — the same-source resolveRawCode
  // migration of this string is the recorded follow-up -------------
  const close = '</' + 'script>';

  const terminalCardTypesDemo = `<script lang="ts">
  import TerminalCard from '@ui/terminal-card.svelte';
${close}

<div class="flex flex-wrap items-start gap-6">
  <div class="flex min-w-64 flex-1 flex-col gap-3 border border-border p-4">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">theme dark (default)</span>
    <TerminalCard
      barTitle="quick-start — zsh"
      command="npx jixoai-ui add terminal-card"
      outputs={['terminal-card.svelte → src/lib/ui/']}
    />
    <span class="text-muted-foreground text-[12.5px]">the dark-locked bezel</span>
  </div>
  <div class="flex min-w-64 flex-1 flex-col gap-3 border border-border p-4">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">theme light</span>
    <TerminalCard
      theme="light"
      barTitle="quick-start — zsh"
      command="npx jixoai-ui add terminal-card"
      outputs={['light CRT shell — scoped token class']}
    />
    <span class="text-muted-foreground text-[12.5px]">'light' | 'system' opts into the light shell</span>
  </div>
</div>`;

  const terminalCardTypesFiles: TreeFile[] = [
    { name: 'terminal-card-types-demo.svelte', content: terminalCardTypesDemo, kind: 'usage' },
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
  // ---- the universal props demo (explicit-props W3-C) --------------------
  const universalUsage = `<TerminalCard barTitle="jixoai/ui — zsh" command="deploy" outputs={[...]} size={14} />`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/terminal-card-universal.svelte', content: universalUsage },
  ];

</script>

<svelte:head>
  <title>Terminal card · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai terminal-card component: the Broadside hero terminal — traffic-light title bar, one large typed command, outputs surfacing line by line, 6px hard offset shadow. One-shot typing entrance, static block cursor, reduced motion renders instantly."
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
      eyebrow="registry:ui · Shell"
      title="terminal-card — the typing terminal"
      summary="The Broadside hero terminal, composed after the openspecui reference: a traffic-light title bar, one large typed command, outputs that surface line by line, and the 6px hard offset shadow. The entrance is one-shot — it types once and settles, never looping; the cursor is a static block per the motion law. Prerendered and no-JS loads show the settled terminal; reduced motion skips straight to it."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">one-shot typing</span>
        <span class="pill">static block cursor</span>
        <span class="pill">6px hard offset shadow</span>
        <span class="pill">speed prop pacing</span>
      </div>
    </SectionCard>
  </div>

  <div id="terminal-card-workbench" data-region="terminal-card-workbench" data-reveal="">
    <ComponentCanvas
      title="terminal-card"
      description="The typing demo: the command types character by character with jittered cadence, then the outputs surface one line at a time. Replay re-mounts the card and restarts the story from the first character."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/terminal-card.svelte"
      {files}
      stage="center"
      onreset={resetCanvas}
      output={[{ label: 'speed', value: `${speed}×` }]}
    >
      <div class={cx(rt.termcStage)}>
        {#key replay}
          <TerminalCard
            barTitle="quick-start — zsh"
            command="npx jixoai-ui add terminal-card"
            outputs={[
              'terminal-card.svelte → src/lib/ui/',
              'one-shot typing · static cursor · no blink',
              'speed prop paces the entrance',
            ]}
            {speed}
          />
        {/key}
        <PressButton onclick={() => (replay += 1)}>Replay ↻</PressButton>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="speed">
            <!-- change bubbles out of the wrapped range: release → replay
                 (pacing is read on mount, so a live change re-mounts) -->
            <div onchange={() => (replay += 1)}>
              <PlayRange bind:value={speed} min={0.25} max={3} step={0.25} />
            </div>
          </PlayRow>
          <PlayHelp>
            release the slider and the card replays at the new pace — pacing is read on mount, so a
            live change re-mounts through <code>{'{#key}'}</code>.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="terminal-card-law" data-reveal="">
    <SectionCard
      family="terminal-card-law"
      headerRegion="terminal-card-law"
      eyebrow="law"
      title="One entrance, then stillness"
      summary="The typing story exists to prove the component is alive, not to entertain forever. Every timing derives from one rhythm: the per-character delay is 42ms plus a 0–40ms jitter, outputs follow at 110ms, and the whole chain divides by the speed multiplier — nothing loops, nothing blinks."
    >
      <ul class={cx(rt.col8, rt.body13)}>
        <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
          <span>prerender emits the settled terminal (<code class={cx(rt.inkAccent)}>typed = command</code>
            in markup); hydration restarts the entrance</span></li>
        <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
          <span>reduced motion (<code class={cx(rt.inkAccent)}>prefers-reduced-motion</code>) returns
            before the first timer — the card renders fully settled</span></li>
        <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
          <span>the cursor is a static block; the reference's blink predates the motion law and was
            dropped deliberately</span></li>
        <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
          <span>bezel law: dark-locked by default; <code class={cx(rt.inkAccent)}>theme="light" | "system"</code>
            opts into the light CRT shell through the scoped token class</span></li>
        <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
          <span><code class={cx(rt.inkAccent)}>speed</code> (default 1, clamped ≥ 0.25) divides every
            delay — a live control applies it by re-mounting, which is exactly what the playground
            slider does</span></li>
      </ul>
    </SectionCard>
  </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="Two bezel shells: the dark lock by default, the light CRT shell by opt-in.">
    <ComponentCanvas title="terminal-card · bezels" stage="fill" files={terminalCardTypesFiles}>
      <div class={cx(rt.wrapStart24)}>
        <div class={cx(rt.termcPanel)}><span class={cx(rt.eyebrowPrimary)}>theme dark (default)</span><TerminalCard barTitle="quick-start — zsh" command="npx jixoai-ui add terminal-card" outputs={['terminal-card.svelte → src/lib/ui/']} /><span class={cx(rt.noteSmall)}>the dark-locked bezel</span></div>
        <div class={cx(rt.termcPanel)}><span class={cx(rt.eyebrowPrimary)}>theme light</span><TerminalCard theme="light" barTitle="quick-start — zsh" command="npx jixoai-ui add terminal-card" outputs={['light CRT shell — scoped token class']} /><span class={cx(rt.noteSmall)}>'light' | 'system' opts into the light shell</span></div>
      </div>
    </ComponentCanvas>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="command as a plain string; outputs surface line by line after the typing completes — replay by re-mounting."><CodeBlock code={usage} lang="svelte" meta="TerminalCard usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The settled terminal is real text in the markup; the entrance is decoration hidden from readers."><A11yTable keys={[]} aria={[{ name: 'aria-hidden', value: 'true', description: 'On the traffic-light dots and the static block cursor — pure scenery' }, { name: 'prerendered output', value: 'settled', description: 'typed = command in markup: the full command + outputs are real text before any JS' }, { name: 'prefers-reduced-motion', value: 'instant', description: 'Returns before the first timer — the card renders fully settled' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="No density footprint: the bezel is fixed chrome. The scoped token class swaps dark for the light CRT shell; one rhythm divides by speed."><div class={cx(rt.col24)}><DensityDemo><TerminalCard barTitle="quick-start — zsh" command="npx jixoai-ui add terminal-card" outputs={['one-shot typing · static cursor']} /></DensityDemo><TokenTable tokens={[{ name: 'jx-light', default: 'scoped token class', source: 'component', description: 'theme="light" swaps the dark lock for the light CRT shell' }, { name: 'type rhythm', default: '42ms + 0-40ms jitter / 110ms outputs', source: 'component', description: 'Every delay divides by the speed multiplier (default 1, clamped ≥ 0.25)' }, { name: 'shadow', default: '6px hard offset', source: 'component' }]} /></div></SectionCard></div>
  
  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive/container-conditional values. The bezel carries SEVEN lanes: its `theme` prop is the SHELL lock (own-before-ambient, dark-locked regardless of the tree) — NOT the theme axis' ambient-first law; §13 rules no rename, so the theme axis forwards ambient, unadopted (the ghostty-term precedent). Elevation carries NO own — the bezel's 6px hard offset shadow is its own documented law; an explicit lane steps the §7 table over it."
    >
      <ComponentCanvas title="TerminalCard · universal props" stage="fill" files={universalFiles}>
<div class={cx(rt.panel)}><TerminalCard barTitle="universal · zsh" command="jixoai deploy --axes" outputs={['eight axes · resolved in one record', 'theme axis forwarded ambient (the shell lock owns the name)']} /></div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the TerminalCard Props interface — title, command, outputs, theme, pace."><PropsTable universal props={[{ name: 'barTitle', type: 'string', default: '—', description: 'Title-bar text (e.g. "quick-start — zsh").', required: true }, { name: 'command', type: 'string', default: '—', description: 'The one large typed command.', required: true }, { name: 'outputs', type: 'readonly string[]', default: '—', description: 'Lines surfacing one by one after the typing completes.', required: true }, { name: 'theme', type: "'dark' | 'light' | 'system'", default: "'dark'", description: 'Bezel shell; dark-locked by default, light/system opt into the CRT shell.' }, { name: 'speed', type: 'number', default: '1', description: 'Divides every delay; clamped ≥ 0.25 — read on mount, re-mount to apply.' }]} /></SectionCard></div>
</div>

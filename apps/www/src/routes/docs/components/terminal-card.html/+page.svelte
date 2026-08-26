<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
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
</script>

<svelte:head>
  <title>Terminal card · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai terminal-card component: the Broadside hero terminal — traffic-light title bar, one large typed command, outputs surfacing line by line, 6px hard offset shadow. One-shot typing entrance, static block cursor, reduced motion renders instantly."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Shell"
      title="terminal-card — the typing terminal"
      summary="The Broadside hero terminal, composed after the openspecui reference: a traffic-light title bar, one large typed command, outputs that surface line by line, and the 6px hard offset shadow. The entrance is one-shot — it types once and settles, never looping; the cursor is a static block per the motion law. Prerendered and no-JS loads show the settled terminal; reduced motion skips straight to it."
    >
      <div class="flex flex-wrap gap-3">
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
      <div class="flex w-full max-w-[38rem] flex-col items-center gap-5">
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
      <ul class="flex flex-col gap-2 text-[13px] leading-6">
        <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
          <span>prerender emits the settled terminal (<code class="text-accent">typed = command</code>
            in markup); hydration restarts the entrance</span></li>
        <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
          <span>reduced motion (<code class="text-accent">prefers-reduced-motion</code>) returns
            before the first timer — the card renders fully settled</span></li>
        <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
          <span>the cursor is a static block; the reference's blink predates the motion law and was
            dropped deliberately</span></li>
        <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
          <span>bezel law: dark-locked by default; <code class="text-accent">theme="light" | "system"</code>
            opts into the light CRT shell through the scoped token class</span></li>
        <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
          <span><code class="text-accent">speed</code> (default 1, clamped ≥ 0.25) divides every
            delay — a live control applies it by re-mounting, which is exactly what the playground
            slider does</span></li>
      </ul>
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="Two bezel shells: the dark lock by default, the light CRT shell by opt-in.">
    <div class="flex flex-wrap items-start gap-6">
      <div class="flex min-w-64 flex-1 flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">theme dark (default)</span><TerminalCard barTitle="quick-start — zsh" command="npx jixoai-ui add terminal-card" outputs={['terminal-card.svelte → src/lib/ui/']} /><span class="text-muted-foreground text-[12.5px]">the dark-locked bezel</span></div>
      <div class="flex min-w-64 flex-1 flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">theme light</span><TerminalCard theme="light" barTitle="quick-start — zsh" command="npx jixoai-ui add terminal-card" outputs={['light CRT shell — scoped token class']} /><span class="text-muted-foreground text-[12.5px]">'light' | 'system' opts into the light shell</span></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="command as a plain string; outputs surface line by line after the typing completes — replay by re-mounting."><CodeBlock code={usage} lang="svelte" meta="TerminalCard usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The settled terminal is real text in the markup; the entrance is decoration hidden from readers."><A11yTable keys={[]} aria={[{ name: 'aria-hidden', value: 'true', description: 'On the traffic-light dots and the static block cursor — pure scenery' }, { name: 'prerendered output', value: 'settled', description: 'typed = command in markup: the full command + outputs are real text before any JS' }, { name: 'prefers-reduced-motion', value: 'instant', description: 'Returns before the first timer — the card renders fully settled' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="No density footprint: the bezel is fixed chrome. The scoped token class swaps dark for the light CRT shell; one rhythm divides by speed."><div class="flex flex-col gap-6"><DensityDemo><TerminalCard barTitle="quick-start — zsh" command="npx jixoai-ui add terminal-card" outputs={['one-shot typing · static cursor']} /></DensityDemo><TokenTable tokens={[{ name: 'jx-light', default: 'scoped token class', source: 'component', description: 'theme="light" swaps the dark lock for the light CRT shell' }, { name: 'type rhythm', default: '42ms + 0-40ms jitter / 110ms outputs', source: 'component', description: 'Every delay divides by the speed multiplier (default 1, clamped ≥ 0.25)' }, { name: 'shadow', default: '6px hard offset', source: 'component' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the TerminalCard Props interface — title, command, outputs, theme, pace."><PropsTable props={[{ name: 'barTitle', type: 'string', default: '—', description: 'Title-bar text (e.g. "quick-start — zsh").', required: true }, { name: 'command', type: 'string', default: '—', description: 'The one large typed command.', required: true }, { name: 'outputs', type: 'readonly string[]', default: '—', description: 'Lines surfacing one by one after the typing completes.', required: true }, { name: 'theme', type: "'dark' | 'light' | 'system'", default: "'dark'", description: 'Bezel shell; dark-locked by default, light/system opt into the CRT shell.' }, { name: 'speed', type: 'number', default: '1', description: 'Divides every delay; clamped ≥ 0.25 — read on mount, re-mount to apply.' }]} /></SectionCard></div>
</div>

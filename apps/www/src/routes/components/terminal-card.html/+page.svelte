<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Input from '$lib/ui/input.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import TerminalCard from '$lib/ui/terminal-card.svelte';
  import terminalCardSource from '$lib/ui/terminal-card.svelte?raw';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';

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
      onreset={resetCanvas}
      echo={[{ label: 'speed', value: `${speed}×` }]}
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
        <Input
          type="range"
          label="speed"
          min="0.25"
          max="3"
          step="0.25"
          value={speed}
          oninput={(event) => {
            speed = Number(event.currentTarget.value);
          }}
          onchange={() => (replay += 1)}
        />
        <p class="text-muted-foreground text-pretty text-[12.5px] leading-5">
          release the slider and the card replays at the new pace — pacing is read on mount, so a
          live change re-mounts through <code class="text-accent">{'{#key}'}</code>.
        </p>
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

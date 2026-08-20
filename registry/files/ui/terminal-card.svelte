<!--
  jixoai terminal card (registry/files/ui/terminal-card.svelte).
  The terminal typing window: commands type in character by character
  (one-time entrance — never a looping animation), outputs appear after
  their command completes, and the cursor is a STATIC block (no blink;
  the jixoai motion law). Reduced motion renders the full transcript
  instantly.

  Props:
    title    window/tab label (e.g. "quick-start")
    script   steps: { cmd: string; out?: string[] } — typed sequentially
    prompt   prompt glyph before commands (default "$")
    speed    ms per character (default 28)
-->
<script lang="ts">
  import { onMount } from 'svelte';

  export interface TerminalStep {
    cmd: string;
    out?: string[];
  }

  interface Props {
    title: string;
    script: TerminalStep[];
    prompt?: string;
    speed?: number;
  }

  let { title, script, prompt = '$', speed = 28 }: Props = $props();

  // rendered state: for each step — the typed command so far, done?, and
  // whether its output has appeared
  let steps = $state(
    script.map((step) => ({ cmd: '', full: step.cmd, out: step.out ?? [], done: false, shown: false })),
  );
  let cursorStep = $state(-1);

  onMount(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      steps = script.map((step) => ({ cmd: step.cmd, full: step.cmd, out: step.out ?? [], done: true, shown: true }));
      cursorStep = steps.length - 1;
      return;
    }

    let step = 0;
    let char = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (step >= script.length) {
        cursorStep = steps.length - 1;
        return;
      }
      char += 1;
      steps[step]!.cmd = script[step]!.cmd.slice(0, char);
      if (char >= script[step]!.cmd.length) {
        steps[step]!.done = true;
        steps[step]!.shown = true;
        step += 1;
        char = 0;
        timer = setTimeout(tick, 420);
      } else {
        timer = setTimeout(tick, speed);
      }
    };
    cursorStep = 0;
    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  });
</script>

<div class="border border-terminal-foreground/25 bg-terminal text-terminal-foreground">
  <div class="flex items-center justify-between border-b border-terminal-foreground/15 px-4 py-2">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">{title}</span>
    <span class="font-nav text-terminal-foreground/40 text-[11px]" aria-hidden="true">─ ─ ✕</span>
  </div>
  <div class="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-6">
    {#each steps as step, i (i)}
      <p class="whitespace-pre">
        <span class="text-terminal-foreground/60">{prompt} </span><span class="text-terminal-foreground">{step.cmd}</span>{#if cursorStep === i && (!step.done || i === steps.length - 1)}<span class="jx-cursor" aria-hidden="true"></span>{/if}
      </p>
      {#if step.shown}
        {#each step.out as line (line)}
          <p class="whitespace-pre text-terminal-foreground/75">{line}</p>
        {/each}
      {/if}
    {/each}
  </div>
</div>

<style>
  .jx-cursor {
    display: inline-block;
    width: 0.55em;
    height: 1.05em;
    margin-left: 2px;
    vertical-align: text-bottom;
    background: var(--primary);
  }
</style>

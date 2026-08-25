<!--
  PlaySegmented — the standard small-enum control: a terminal button
  row with one pressed state. Replaces the four divergent enum forms
  (NativeSelect / Input / hand-rolled buttons / page-local fieldsets).
-->
<script lang="ts" generics="T extends string">
  import { getContext } from 'svelte';

  let {
    value = $bindable(),
    options,
  }: {
    value?: T;
    options: readonly { value: T; label: string }[];
  } = $props();

  const row = getContext<{ rowId: string }>('jx-play-row');

  // roving keyboard nav (r3, Codex P2-3): arrows/Home/End move focus
  // within the segmented group — the standard segmented-control contract
  let groupEl = $state<HTMLDivElement | null>(null);
  const focusAt = (index: number): void => {
    const buttons = groupEl?.querySelectorAll<HTMLButtonElement>('button');
    if (!buttons || buttons.length === 0) return;
    buttons[Math.max(0, Math.min(buttons.length - 1, index))].focus();
  };
  const onKeydown = (event: KeyboardEvent): void => {
    const buttons = groupEl ? [...groupEl.querySelectorAll<HTMLButtonElement>('button')] : [];
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (current < 0) return;
    const move = (delta: number | 'home' | 'end'): void => {
      event.preventDefault();
      if (delta === 'home') focusAt(0);
      else if (delta === 'end') focusAt(buttons.length - 1);
      else focusAt(current + delta);
    };
    if (event.key === 'ArrowRight') move(1);
    else if (event.key === 'ArrowLeft') move(-1);
    else if (event.key === 'Home') move('home');
    else if (event.key === 'End') move('end');
  };
</script>

<div class="jx-play-seg" role="group" aria-labelledby={row?.rowId} bind:this={groupEl} onkeydown={onKeydown}>
  {#each options as opt (opt.value)}
    <button
      type="button"
      aria-pressed={value === opt.value}
      onclick={() => (value = opt.value)}
    >
      {opt.label}
    </button>
  {/each}
</div>

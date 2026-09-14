<script lang="ts">
  // popover.svelte — the floating-surface kernel family, StyleX
  // re-authoring. NativeHTML base kept: popover="auto" + popovertarget
  // (light dismiss, Escape, top-layer — the platform's). Anchored
  // placement stays through the CSS Anchor Positioning API (inline
  // style carries anchor-name/position-area — same mechanism as the
  // source; the fallback/geometry residue rides popover.css).
  //
  // OUT OF CORPUS SCOPE: the WAAPI motion kernel + the surface-motion
  // direction tracking (the panel rests at the open pose; reduced-
  // motion parity is trivially true); tryFallbacks' @position-try
  // custom candidates (the default flip series rides the css residue).
  import * as stylex from '@stylexjs/stylex';

  // class-string composition: 0.19.0 exposes no callable type on the
  // namespace (runtime-only call signature); attrs().class is the typed form
  const sx = (...args: Parameters<typeof stylex.attrs>) => stylex.attrs(...args).class;
  import { popoverStyles as s } from './popover.stylex';
  import Icon from '../icon/icon.svelte';
  import './popover.css';

  interface Props {
    id: string;
    triggerLabel?: string;
    placement?:
      | 'bottom'
      | 'bottom-end'
      | 'bottom-start'
      | 'top'
      | 'top-end'
      | 'top-start'
      | 'left'
      | 'right'
      | 'center';
    variant?: 'solid' | 'acrylic' | 'auto';
    children: import('svelte').Snippet;
  }

  let { id, triggerLabel = '', placement = 'bottom-end', variant = 'auto', children }: Props =
    $props();

  const anchorName = `--jx-pop-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const area = $derived.by(() => {
    switch (placement) {
      case 'bottom': return 'bottom';
      case 'bottom-end': return 'bottom span-right';
      case 'bottom-start': return 'bottom span-left';
      case 'top': return 'top';
      case 'top-end': return 'top span-right';
      case 'left': return 'left';
      case 'right': return 'right';
      case 'center': return 'center';
      default: return 'top span-left';
    }
  });

  let panel = $state<HTMLElement | null>(null);
  let open = $state(false);

  // the toggle seam: one native event; state read LIVE from
  // :popover-open at fire time
  function onPanelToggle(): void {
    open = panel?.matches(':popover-open') ?? false;
  }
</script>

<span class={sx(s.anchor) + ' jx-pop-anchor'} style="anchor-name: {anchorName}">
  <button
    type="button"
    data-jx-pop-trigger=""
    class={sx(s.trigger)}
    popovertarget={id}
    aria-expanded={open}
  >
    {triggerLabel}
    <span class={sx(s.caret) + ' jx-pop-caret'} data-jx-pop-caret="">
      <Icon name="chevronDown" size={13} strokeWidth={2.5} />
    </span>
  </button>
</span>

<div
  {id}
  popover="auto"
  class="jx-pop"
  bind:this={panel}
  style="position-anchor: {anchorName}; inset-area: {area}; position-area: {area};"
  data-variant={variant}
  data-jx-popover-open={open ? 'true' : 'false'}
  ontoggle={onPanelToggle}
>
  <div class={sx(s.shadow)} aria-hidden="true" data-jx-pop-shadow=""></div>
  <div class={sx(s.body, variant !== 'solid' && s.bodyAcrylic)} data-jx-pop-body="">
    <div class={sx(s.scroll)} data-jx-pop-scroll="">
      {@render children()}
    </div>
  </div>
</div>

<script lang="ts">
  // code-card.svelte — StyleX re-authoring. The progressive-enhancement
  // floor (plain escaped sample) is kept; the pluggable highlight
  // backend machinery (shiki/prism/microlighter + detection rings) is
  // OUT OF CORPUS SCOPE — recorded: runtime engines, not styling
  // surface. The scroll affordance (veils gated on live scroll state)
  // and the copy control (with its copied transient) are kept.
  import * as stylex from '@stylexjs/stylex';

  // class-string composition: 0.19.0 exposes no callable type on the
  // namespace (runtime-only call signature); attrs().class is the typed form
  const sx = (...args: Parameters<typeof stylex.attrs>) => stylex.attrs(...args).class;
  import { codeCardStyles as s } from './code-card.stylex';
  import PressButton from '../press-button/press-button.svelte';
  import Icon from '../icon/icon.svelte';
  import './code-card.css';

  interface Props {
    code: string;
    lang?: string;
    filename?: string;
    copyable?: boolean;
    maxHeight?: string;
    minHeight?: string;
    fill?: boolean;
  }

  let {
    code,
    lang = 'ts',
    filename = '',
    copyable = true,
    maxHeight = '',
    fill = false,
    minHeight = '',
  }: Props = $props();

  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;
  const copyCode = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* preview contexts without a clipboard grant — demo no-op */
    }
    copied = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = false), 1600);
  };

  // ── the horizontal scroll affordance: veils appear only while that
  // direction can still scroll (scroll events + ResizeObserver) ──
  let preEl = $state<HTMLElement>();
  let hScrollStart = $state(false);
  let hScrollEnd = $state(false);

  function readScrollState(): void {
    const pre = preEl;
    if (!pre) return;
    hScrollStart = pre.scrollLeft > 1;
    hScrollEnd = pre.scrollLeft + pre.clientWidth < pre.scrollWidth - 1;
  }

  $effect(() => {
    const pre = preEl;
    if (!pre) return;
    readScrollState();
    pre.addEventListener('scroll', readScrollState, { passive: true });
    const ro = new ResizeObserver(readScrollState);
    ro.observe(pre);
    const codeBox = pre.querySelector('code');
    if (codeBox) ro.observe(codeBox);
    return () => {
      pre.removeEventListener('scroll', readScrollState);
      ro.disconnect();
    };
  });

  // FACTORY CALLS SIT IN THE MARKUP (the documented spike idiom):
  // the babel plugin transforms markup-level stylex.attrs(...) with
  // factory args into class + inline custom properties; a call built
  // inside a $derived closure is left to the runtime, which does NOT
  // process factory results (verified empirically — the class and the
  // custom property both vanish). The literal 'jx-code-card' hook
  // class cannot merge with a spread class in Svelte (§5.6 trap), so
  // the css palette re-anchors on data-kind="code" instead.
</script>

<figure
  {...stylex.attrs(s.card, fill && s.cardFill)}
  style={minHeight !== '' ? `min-height:${minHeight}` : undefined}
  data-kind="code"
>
  {#if filename}
    <figcaption class={sx(s.head)} data-jx-code-card-head="">
      <span class={sx(s.file)} data-jx-code-card-file="">{filename}</span>
      <span class={sx(s.side)} data-jx-code-card-side="">
        <span class={sx(s.lang)} data-jx-code-card-lang="">{lang}</span>
      </span>
    </figcaption>
  {/if}

  <div
    class={sx(s.scrollWrap, fill && s.scrollWrapFill, s.veilStart, s.veilEnd, s.veilReducedMotion, hScrollStart && s.veilStartOn, hScrollEnd && s.veilEndOn)}
    data-jx-code-card-scroll=""
    data-hscroll-start={hScrollStart || undefined}
    data-hscroll-end={hScrollEnd || undefined}
  >
    <!-- svelte-ignore a11y_no_noninteractive_tabindex --><!-- the
         scrollport is keyboard-reachable (arrow scrolling) — the same
         contract Shiki's own <pre tabindex="0"> ships (source note) -->
    <pre
      bind:this={preEl}
      {...stylex.attrs(s.pre, maxHeight !== '' && s.vscroll, fill && s.preFill)}
      style={maxHeight !== '' ? `max-height:${maxHeight}` : undefined}
      data-jx-code-card-pre=""
      tabindex="0"
      aria-label={filename ? `${filename} code sample` : `${lang} code sample`}
      ><code data-jx-code-card-code="">{code}</code></pre
    >
  </div>

  {#if copyable}
    <div class={sx(s.foot)} data-jx-code-card-foot="">
      <span class={sx(s.footSide)}></span>
      <PressButton
        variant="ghost"
        raised={false}
        hue={copied ? 'success' : undefined}
        onclick={copyCode}
        ariaLabel={copied ? 'copied' : `copy ${filename || lang} sample`}
      >
        <span style="display:inline-flex" data-jx-code-card-icon="">
          <Icon name={copied ? 'check' : 'copy'} size={12} strokeWidth={copied ? 2.5 : 2} />
        </span>
        <span>{copied ? 'copied' : 'copy'}</span>
      </PressButton>
    </div>
  {/if}
</figure>

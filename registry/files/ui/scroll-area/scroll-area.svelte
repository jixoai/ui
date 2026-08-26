<!--
  jixoai scroll-area (registry/files/ui/scroll-area/scroll-area.svelte).

  2026-08-22 · Scroll-area family, request 1 (Owner): 参考 shadcnui 封装专
  门的可滚动区域组件，但立场是 W3C-first nativeHTML —— 组件 IS 一个原生滚
  动容器（div + overflow），平台的滚动行为（滚轮、触摸惯性、键盘、
  PageUp/Home、scroll-snap、overscroll 链）原样保留，JS 只做两件事：overlay
  变体读几何画拇指，和读位置喂 ToC。

  Variants (scrollbar prop):
    native   默认。主题滚动条法则的组件化封装：全局 thin/currentColor/hover
             链直接继承；垂直向滚动口声明 scrollbar-gutter: stable
             both-edges，环内边距通过 --jx-scroll-pad 走补偿配方（pad prop
             是唯一的旋钮）。水平向-only 的滚动口按法则保持 auto gutter。
    overlay  虚拟滚动条：隐藏原生条，自绘方形拇指浮在内容上（经典滚动条系
             统也能获得 overlay 效果，内容占满全宽、无 gutter 预留）。仅
             (pointer: fine) 生效 —— 触屏设备自动退回纯原生（系统惯性滚动
             本来就会画原生 overlay 条，触屏自绘拇指是反模式）。拇指配色吃
             主题 token（--scrollbar-thumb/-hover/-active），拖拽用
             setPointerCapture 写 scrollTop（carousel 鼠标平移的既有法则），
             自动隐藏（空闲 ~700ms 淡出；prefers-reduced-motion 时常显）。

  ToC 联动（request 3）：getViewport() 导出滚动口元素 —— Toc 的 scrollRoot、
  toc-outline 的 root、toc-engine 的 extents 全部从这里接线；页面即
  「ScrollArea + Toc(outline)」零样板组合。

  API contract（克制原则）: orientation / scrollbar / label / pad / class +
  restProps 透传到滚动口 + children。实例导出（bind:this）:
  getViewport() / scrollTo()。仅此而已。

  tw4 (2026-08-24): the container, the scrollport's orientation overflow
  laws and the overlay thumb's static paint/geometry ride token
  utilities in the markup (orientation is a deterministic prop branch);
  scroll-area.css keeps the D1-exempt residue — the native scrollbar
  gutter compensation recipe, the overlay native-bar hiding (webkit
  pseudos), the thumb liveness state machine, hover/active repaints,
  focus-visible and the reduced-motion kill.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import './scroll-area.css';

  export type ScrollOrientation = 'vertical' | 'horizontal' | 'both';
  export type ScrollbarVariant = 'native' | 'overlay';
  export type ViewportScrollEvent = HTMLElementEventMap['scroll'] & {
    currentTarget: EventTarget & HTMLDivElement;
  };

  interface Props {
    /** which axes scroll: overflow-y/x mapping (default vertical) */
    orientation?: ScrollOrientation;
    /** scrollbar presentation (default native — the theme scrollbar law) */
    scrollbar?: ScrollbarVariant;
    /** a11y name for the scrollable region */
    label?: string;
    /** ring padding (CSS length) around the content, inline-axis — feeds
     *  the scrollbar law's gutter compensation recipe. Default 0. */
    pad?: string;
    class?: string;
    style?: string;
    onscroll?: (event: ViewportScrollEvent) => void;
    children: Snippet;
  }

  let {
    orientation = 'vertical',
    scrollbar = 'native',
    label = 'scrollable content',
    pad,
    class: className = '',
    style,
    onscroll,
    children,
    ...restProps
  }: Props = $props();

  let viewportEl = $state<HTMLDivElement | null>(null);
  let contentEl = $state<HTMLDivElement | null>(null);
  let thumbYEl = $state<HTMLDivElement | null>(null);
  let thumbXEl = $state<HTMLDivElement | null>(null);

  /** overlay thumbs are live: fine pointers only (mobile keeps native) */
  let overlayOn = $state(false);
  /** thumbs visible: scrolling / hover / drag / reduced-motion keeps them */
  let thumbLive = $state(false);

  export function getViewport(): HTMLDivElement | null {
    return viewportEl;
  }

  /** thin passthrough to the native scrollport */
  export function scrollTo(options?: ScrollToOptions): void {
    viewportEl?.scrollTo(options);
  }

  // ---- overlay geometry + interaction --------------------------------
  // read-only stance (the toc-engine / carousel law): scroll + ResizeObserver
  // feed one rAF-throttled sync that writes thumb styles; drag writes
  // scrollTop/scrollLeft back through pointer capture.
  let raf = 0;
  let hideTimer = 0;
  let dragging = false;
  let hovering = false;
  const FINE = '(pointer: fine)';
  const REDUCED = '(prefers-reduced-motion: reduce)';

  const showThumbs = (): void => {
    thumbLive = true;
    if (hideTimer) clearTimeout(hideTimer);
    // auto-hide after idle — never while hovered, dragged, or under
    // reduced motion (static visibility there)
    if (!hovering && !dragging && !matchMedia(REDUCED).matches) {
      hideTimer = window.setTimeout(() => {
        if (!hovering && !dragging) thumbLive = false;
      }, 700);
    }
  };

  const syncThumbs = (): void => {
    raf = 0;
    const vp = viewportEl;
    if (!vp) return;
    if (thumbYEl) {
      const scrollable = vp.scrollHeight > vp.clientHeight + 1;
      thumbYEl.style.visibility = scrollable ? 'visible' : 'hidden';
      if (scrollable) {
        thumbYEl.style.height = `${(vp.clientHeight / vp.scrollHeight) * 100}%`;
        thumbYEl.style.top = `${(vp.scrollTop / vp.scrollHeight) * 100}%`;
      }
    }
    if (thumbXEl) {
      const scrollable = vp.scrollWidth > vp.clientWidth + 1;
      thumbXEl.style.visibility = scrollable ? 'visible' : 'hidden';
      if (scrollable) {
        thumbXEl.style.width = `${(vp.clientWidth / vp.scrollWidth) * 100}%`;
        thumbXEl.style.left = `${(vp.scrollLeft / vp.scrollWidth) * 100}%`;
      }
    }
  };

  const scheduleSync = (): void => {
    if (!raf) raf = requestAnimationFrame(syncThumbs);
  };

  const handleScroll = (event: ViewportScrollEvent): void => {
    if (overlayOn) showThumbs();
    scheduleSync();
    onscroll?.(event);
  };

  /** pointer drag: thumb pixels → scroll units (the reciprocal of the
   *  geometry sync; carousel's pointer-capture law) */
  const thumbDrag = (axis: 'y' | 'x') => (event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }) => {
    if (event.button !== 0 || !viewportEl) return;
    const vp = viewportEl;
    const vertical = axis === 'y';
    const trackSize = vertical ? vp.clientHeight : vp.clientWidth;
    const scrollSize = vertical ? vp.scrollHeight : vp.scrollWidth;
    const scrollRange = scrollSize - trackSize;
    if (scrollRange <= 0) return;

    event.preventDefault();
    const thumb = event.currentTarget;
    thumb.setPointerCapture(event.pointerId);
    dragging = true;
    showThumbs();

    const startPointer = vertical ? event.clientY : event.clientX;
    const startScroll = vertical ? vp.scrollTop : vp.scrollLeft;
    // thumb px on the track: track * (viewport/scroll) — the same ratio the
    // geometry sync paints; drag factor = scrollRange / (track - thumb)
    const thumbPx = (trackSize * trackSize) / scrollSize;
    const factor = scrollRange / Math.max(1, trackSize - thumbPx);

    const onMove = (ev: PointerEvent): void => {
      const pointer = vertical ? ev.clientY : ev.clientX;
      const next = startScroll + (pointer - startPointer) * factor;
      if (vertical) vp.scrollTop = next;
      else vp.scrollLeft = next;
    };
    const onUp = (ev: PointerEvent): void => {
      dragging = false;
      thumb.releasePointerCapture(ev.pointerId);
      thumb.removeEventListener('pointermove', onMove);
      thumb.removeEventListener('pointerup', onUp);
      thumb.removeEventListener('pointercancel', onUp);
      // keep visible through the hide grace, then fade
      showThumbs();
    };
    thumb.addEventListener('pointermove', onMove);
    thumb.addEventListener('pointerup', onUp);
    thumb.addEventListener('pointercancel', onUp);
  };

  $effect(() => {
    if (scrollbar !== 'overlay') {
      overlayOn = false;
      return;
    }
    const fine = matchMedia(FINE);
    const apply = () => {
      overlayOn = fine.matches;
      scheduleSync();
      if (fine.matches) showThumbs();
    };
    apply();
    fine.addEventListener('change', apply);
    return () => {
      fine.removeEventListener('change', apply);
      if (hideTimer) clearTimeout(hideTimer);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
  });

  // geometry re-sync: viewport + content resize (fonts, images, rows)
  $effect(() => {
    if (!overlayOn || !viewportEl || !contentEl) return;
    const ro = new ResizeObserver(scheduleSync);
    ro.observe(viewportEl);
    ro.observe(contentEl);
    scheduleSync();
    return () => ro.disconnect();
  });

  // orientation → the scrollport's overflow law (deterministic branch)
  const orientationUtilities = {
    vertical: 'overflow-x-hidden overflow-y-auto',
    horizontal: 'overflow-x-auto overflow-y-hidden',
    both: 'overflow-x-auto overflow-y-auto',
  } as const;

  // the virtual thumb: square (radius 0 law), logical-geometry per axis
  const thumbPaint =
    'absolute z-[1] invisible opacity-0 pointer-events-none bg-[color:var(--scrollbar-thumb)] transition-opacity duration-[180ms] ease-out';
  const thumbGeometry = {
    y: 'y [inline-size:var(--jx-scroll-thumb-w,8px)] [inset-block:2px] [inset-inline-end:2px] [min-block-size:24px]',
    x: 'x [block-size:var(--jx-scroll-thumb-w,8px)] [inset-block-end:2px] [inset-inline:2px] [min-inline-size:24px]',
  } as const;
</script>

<!-- svelte-ignore a11y_no_static_element_interactions (hover liveness only —
     the interactive surface is the focusable viewport below) -->
<div
  class="jx-scroll-area relative"
  data-orientation={orientation}
  data-scrollbar={scrollbar}
  data-overlay={overlayOn ? 'on' : undefined}
  data-thumb-live={thumbLive ? 'on' : undefined}
  onpointerenter={() => {
    hovering = true;
    if (overlayOn) showThumbs();
  }}
  onpointerleave={() => {
    hovering = false;
    if (overlayOn) showThumbs();
  }}
>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (the WAI scrollable-
       region pattern: role=region + name + tabindex makes it a keyboard
       scroll surface — the platform's own arrows/PageUp/Home drive it) -->
  <div
    class={cn('jx-scroll-viewport overscroll-contain', orientationUtilities[orientation], className)}
    role="region"
    aria-label={label}
    tabindex="0"
    bind:this={viewportEl}
    onscroll={handleScroll}
    style={[pad ? `--jx-scroll-pad: ${pad}` : null, style].filter(Boolean).join('; ') || undefined}
    {...restProps}
  >
    <div data-jx-scroll-content class="h-full" bind:this={contentEl}>
      {@render children()}
    </div>
  </div>

  {#if overlayOn}
    {#if orientation !== 'horizontal'}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class={cn('jx-scroll-thumb', thumbPaint, thumbGeometry.y)} bind:this={thumbYEl} aria-hidden="true" onpointerdown={thumbDrag('y')}></div>
    {/if}
    {#if orientation !== 'vertical'}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class={cn('jx-scroll-thumb', thumbPaint, thumbGeometry.x)} bind:this={thumbXEl} aria-hidden="true" onpointerdown={thumbDrag('x')}></div>
    {/if}
  {/if}
</div>

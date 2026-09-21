<!--
  jixoai scroll-virtual (registry/files/ui/scroll-virtual/scroll-virtual.svelte).

  2026-08-22 · Scroll-area family, request 2 (Owner): 原生支持虚拟滚动，
  使用 tanstack 那套封装。STRONG association, THIN coupling —— 本组件只是
  @tanstack/svelte-virtual（官方 Svelte 5 适配器，底层 @tanstack/
  virtual-core）的 DOM 接线层：窗口化语义、动态测量、scrollToIndex/Offset、
  lanes、getItemKey…… 全部是 TanStack 的，直接读 TanStack Virtual 文档
  (https://tanstack.com/virtual)。本组件 adds only:
    1. ScrollArea 组合（label / class 透传；scrollbar 变体随 2026-09-15
       家族重构退役 —— 组合方永远手绘，平台路径是 native-scroll-area）；
    2. 定位层代劳 —— spacer(totalSize) + 绝对定位行 + 行上自动
       item.measureElement（动态高度开箱即用，比裸 TanStack 少一步）；
    3. 逃生舱 —— getVirtualizer() 拿原始实例做任何 TanStack 文档里的事，
       或者干脆直接用 @tanstack/svelte-virtual 不经过本组件。

  按需启用：scroll-area 零 TanStack 依赖；只有 add 本组件才安装它。
  虚拟化沿单轴（horizontal ? x : y）；行间距用行内 margin 表达（TanStack
  无 gap 概念）。ring padding（ScrollArea 的 pad）不要与水平虚拟列表同用
  —— inline 起点会偏移 scrollMargin。

  tw4 (2026-08-24): utility-authored — the spacer's positioning law is
  one utility in the markup; zero css residue (the positioning styles
  of rows/spacer are TanStack-driven inline styles by design).
-->
<script lang="ts" generics="T = unknown">
  import { createVirtualizer } from '@tanstack/svelte-virtual';
  import type {
    SvelteVirtualizer,
    VirtualItem,
    VirtualizerOptions,
  } from '@tanstack/svelte-virtual';
  import type { Snippet } from 'svelte';
  import {
    type ColorLane,
    type DensityLane,
    type ElevationLane,
    type MotionLane,
    type QueryResult,
    type RadiusLane,
    type ShapeLane,
    type SizeLane,
    type ThemeLane,
  } from '$lib/defaults.svelte';
  import ScrollArea, { type ViewportScrollEvent } from '$lib/ui/scroll-area/scroll-area.svelte';
  import { ScrollVirtualDefaults } from './scroll-virtual-defaults.svelte';
  import { scrollVirtualStyles } from './scroll-virtual.stylex';

  // the payload's own join (separator's serialize law): atoms are
  // objects in dev — composition goes through THIS joiner (all string
  // values except $$css, space-joined; plain strings pass through)
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

  type ScrollElement = HTMLDivElement;
  type ItemElement = HTMLDivElement;
  type Sv = SvelteVirtualizer<ScrollElement, ItemElement>;
  /** the composed ScrollArea's instance surface (bind:this contract) */
  type ScrollAreaInstance = {
    getViewport(): HTMLDivElement | null;
    scrollTo(options?: ScrollToOptions): void;
  };

  interface Props {
    /** total item count (TanStack `count`) */
    count: number;
    /** estimated row size in px — number or per-index fn (TanStack
     *  `estimateSize`); dynamic measurement corrects it per row */
    estimateSize?: number | ((index: number) => number);
    /** items rendered beyond the visible window (TanStack `overscan`) */
    overscan?: number;
    /** virtualize along x instead of y */
    horizontal?: boolean;
    /** TanStack VirtualizerOptions passthrough — scrollMargin / lanes /
     *  getItemKey / initialOffset / onChange / rangeExtractor … speak
     *  TanStack verbatim (reserved keys count/estimateSize/overscan/
     *  horizontal/getScrollElement are overridden by this component) */
    virtualOptions?: Partial<VirtualizerOptions<ScrollElement, ItemElement>>;
    /** a11y name for the scrollable region */
    label?: string;
    class?: string;
    /** passthrough — the composed ScrollArea's viewport scroll event */
    onscroll?: (event: ViewportScrollEvent) => void;
    /** the EIGHT universal axes (§0/§11, W3-D3): the ENGINE-WRAPPER
     *  dialect — scroll-virtual owns no DOM root of its own (the
     *  composed ScrollArea renders the region), so the resolved lanes
     *  FORWARD to the composed root, which stamps the carriers,
     *  supplies downward and anchors query() at ITS root. The
     *  wrapper's contract (scroll-virtual-defaults.svelte.ts, all
     *  no-own) is the family's read point (the A3 law) and unwraps
     *  query() media lanes at the boundary; the spacer and the
     *  absolutely-positioned rows are TanStack engine internals,
     *  documented outside the supply set */
    density?: DensityLane | QueryResult<DensityLane>;
    size?: SizeLane | QueryResult<SizeLane>;
    shape?: ShapeLane | QueryResult<ShapeLane>;
    radius?: RadiusLane | QueryResult<RadiusLane>;
    color?: ColorLane | QueryResult<ColorLane>;
    theme?: ThemeLane | QueryResult<ThemeLane>;
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    motion?: MotionLane | QueryResult<MotionLane>;
    /** rendered per virtual item — receives TanStack's VirtualItem
     *  (index / start / size / key / lane); style your row freely, sizing
     *  is measured automatically */
    children: Snippet<[VirtualItem<ItemElement>]>;
  }

  let {
    count,
    estimateSize = 48,
    overscan,
    horizontal = false,
    virtualOptions = {},
    label = 'virtual list',
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
    onscroll,
    children,
  }: Props = $props();

  // the family Defaults is the single read point (the A3 law): one
  // record unwrapping the query() lanes at the boundary; the resolved
  // lanes forward to the composed ScrollArea below (the composition
  // law — the region owns carriers/anchor/supply)
  const d = $derived(
    ScrollVirtualDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );

  let scrollAreaEl = $state<ScrollAreaInstance | null>(null);

  const toEstimate = (size: Props['estimateSize']): ((index: number) => number) =>
    typeof size === 'function' ? size : () => size;

  // reserved keys land LAST — the component's own wiring always wins over
  // the passthrough object
  const mergedOptions = (): VirtualizerOptions<ScrollElement, ItemElement> => ({
    ...virtualOptions,
    count,
    estimateSize: toEstimate(estimateSize),
    overscan,
    horizontal,
    getScrollElement: () => scrollAreaEl?.getViewport() ?? null,
  });

  const virtualizer = createVirtualizer(mergedOptions());

  // manual subscription keeps the LIVE instance for imperative exports and
  // option pushes (the $-auto subscription below is template-only)
  let live: Sv | undefined;
  const unsubscribe = virtualizer.subscribe((instance) => {
    live = instance;
  });
  $effect(() => () => unsubscribe());

  // push prop changes onto the live instance (TanStack setOptions —
  // count growth etc. without recreating the virtualizer)
  $effect(() => {
    const options = mergedOptions();
    live?.setOptions(options);
  });

  // ---- imperative surface (bind:this) — thin TanStack passthroughs ----
  export function scrollToIndex(index: number, options?: Parameters<Sv['scrollToIndex']>[1]): void {
    live?.scrollToIndex(index, options);
  }
  export function scrollToOffset(offset: number, options?: Parameters<Sv['scrollToOffset']>[1]): void {
    live?.scrollToOffset(offset, options);
  }
  /** re-measure mounted rows (TanStack `measure`) */
  export function measure(): void {
    live?.measure();
  }
  /** escape hatch — the raw TanStack virtualizer instance */
  export function getVirtualizer(): Sv | undefined {
    return live;
  }

  // dynamic measurement: TanStack needs data-index + measureElement(node)
  // per row — the row wrapper is ours, so the consumer never writes this.
  // An attachment FACTORY by shape (item in, attachment out) — and the
  // {@attach measureItem(item)} form (effect-attachments) is the only
  // mount that ever RAN it: the retired use:measureItem={item} call
  // bound (node, item) into the curried outer slot, so the inner
  // measure closure never executed (measured dead in the lane-B spike)
  const measureItem =
    (item: VirtualItem<ItemElement>) =>
    (node: ItemElement): void => {
      item.measureElement(node);
    };
</script>

<ScrollArea
  bind:this={scrollAreaEl}
  {label}
  {onscroll}
  orientation={horizontal ? 'horizontal' : 'vertical'}
  class={className}
  density={d.density}
  size={d.size}
  shape={d.shape}
  radius={typeof d.radius === 'number' ? d.radius : undefined}
  color={d.color}
  theme={d.theme}
  elevation={d.elevation}
  motion={d.motion}
>
  <div
    data-jx-sv-spacer
    class={cx(scrollVirtualStyles.spacer)}
    style={horizontal
      ? `inline-size: ${$virtualizer.getTotalSize()}px; block-size: 100%`
      : `block-size: ${$virtualizer.getTotalSize()}px; inline-size: 100%`}
  >
    {#each $virtualizer.getVirtualItems() as item (item.key)}
      <div
        data-jx-sv-row
        data-index={item.index}
        style={horizontal
          ? `position: absolute; inset-block-start: 0; inset-inline-start: ${item.start}px; block-size: 100%`
          : `position: absolute; inset-inline-start: 0; inset-block-start: ${item.start}px; inline-size: 100%`}
        {@attach measureItem(item)}
      >
        {@render children(item)}
      </div>
    {/each}
  </div>
</ScrollArea>

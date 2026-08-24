<!--
  jixoai scroll-virtual (registry/files/ui/scroll-virtual.svelte).

  2026-08-22 · Scroll-area family, request 2 (Owner): 原生支持虚拟滚动，
  使用 tanstack 那套封装。STRONG association, THIN coupling —— 本组件只是
  @tanstack/svelte-virtual（官方 Svelte 5 适配器，底层 @tanstack/
  virtual-core）的 DOM 接线层：窗口化语义、动态测量、scrollToIndex/Offset、
  lanes、getItemKey…… 全部是 TanStack 的，直接读 TanStack Virtual 文档
  (https://tanstack.com/virtual)。本组件 adds only:
    1. ScrollArea 组合（scrollbar 变体 / label / class 透传）；
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
  import ScrollArea, { type ScrollbarVariant, type ViewportScrollEvent } from '$lib/ui/scroll-area/scroll-area.svelte';

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
    /** scrollbar presentation of the composed ScrollArea (default native) */
    scrollbar?: ScrollbarVariant;
    /** a11y name for the scrollable region */
    label?: string;
    class?: string;
    /** passthrough — the composed ScrollArea's viewport scroll event */
    onscroll?: (event: ViewportScrollEvent) => void;
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
    scrollbar = 'native',
    label = 'virtual list',
    class: className = '',
    onscroll,
    children,
  }: Props = $props();

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
  // per row — the row wrapper is ours, so the consumer never writes this
  const measureItem =
    (item: VirtualItem<ItemElement>) =>
    (node: ItemElement): void => {
      item.measureElement(node);
    };
</script>

<ScrollArea bind:this={scrollAreaEl} {scrollbar} {label} {onscroll} orientation={horizontal ? 'horizontal' : 'vertical'} class={className}>
  <div
    class="jx-sv-spacer relative"
    style={horizontal
      ? `inline-size: ${$virtualizer.getTotalSize()}px; block-size: 100%`
      : `block-size: ${$virtualizer.getTotalSize()}px; inline-size: 100%`}
  >
    {#each $virtualizer.getVirtualItems() as item (item.key)}
      <div
        class="jx-sv-row"
        data-index={item.index}
        style={horizontal
          ? `position: absolute; inset-block-start: 0; inset-inline-start: ${item.start}px; block-size: 100%`
          : `position: absolute; inset-inline-start: 0; inset-block-start: ${item.start}px; inline-size: 100%`}
        use:measureItem={item}
      >
        {@render children(item)}
      </div>
    {/each}
  </div>
</ScrollArea>

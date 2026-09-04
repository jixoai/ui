// scroll-run — the ONE scrollable-region contract (Owner 2026-09-04,
// the unification): the stamp machine + RTL engine + nudge + effect
// builders (scroll-run.svelte.ts), the law sheet (scroll-run.css) and
// the overlay half (scroll-chrome.svelte). Pure barrel: no logic here.
export {
  blur,
  blurSlide,
  createScrollStamp,
  detectRtlScrollModel,
  isRtlDirection,
  isRtlElement,
  nudgeRun,
  progressBlur,
  rtlScrollFromCanonical,
  rtlScrollToCanonical,
  shadow,
  slide,
  type BlurEffect,
  type BlurOptions,
  type BlurSlideEffect,
  type BlurSlideOptions,
  type ProgressBlurEffect,
  type ProgressBlurOptions,
  type RtlScrollModel,
  type ScrollEffect,
  type ScrollStamp,
  type ScrollStampOptions,
  type ShadowEffect,
  type ShadowOptions,
  type SlideEffect,
  type SlideOptions,
} from './scroll-run.svelte';
export { default as ScrollChrome } from './scroll-chrome.svelte';

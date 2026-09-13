// prototype-kit — pure barrel (the component-canvas precedent): the
// canonical main is the canvas; the two frame kinds ship as named
// defaults; the URL contract and context seam re-export for tests and
// the design server (which mirrors the URL builder server-side).
// No logic lives here.
//
// The public surface (design-studio change, 2026-09-11):
// - PrototypeCanvas — grid container, provides the prototype-folder
//   context (nestable, inherit-then-override)
// - PrototypePage — declarative viewport iframe
//   (/__design__/frame?p=&f=&theme=&w=&h=)
// - PrototypeComponent — adaptive component frame (fill locks height;
//   URL carries &fill=0|1)
// - installOverlayScrollbar — the #22 law for documents the kit
//   surfaces scroll (frame docs, the /prototypes/ canvas page)
export { default, default as PrototypeCanvas } from './prototype-canvas.svelte';
export { default as PrototypePage } from './prototype-page.svelte';
export { default as PrototypeComponent } from './prototype-component.svelte';
export { buildFrameUrl, normalizeRef, type FrameUrlInput } from './frame-url';
export { installOverlayScrollbar } from './overlay-scrollbar';
export {
  PROTOTYPE_KIT_KEY,
  derivePrototypeFromLocation,
  getPrototypeContext,
  hasDesignHost,
  isDevMode,
  type PrototypeKitContext,
  type PrototypeTheme,
} from './context';

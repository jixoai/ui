/*
  jixoai press-effect runtime (registry/files/ui/press-button/press-effect-runtime.ts).
  The attachment face of the effect family (effect-attachments,
  2026-09-09): the kernels stamp their layers/vars/classes imperatively
  so a plain element carries the same loop:

    {@attach pressEffect(shimmer({ speed: 4000 }))}

  THE CONTRACT (Svelte attachments, source+E2E proven on the resolved
  5.5x line): {@attach} invokes the expression's VALUE with (element)
  and honors a FUNCTION return as the teardown — there is no update /
  destroy-object channel. A REPLACED fx (the $derived path the docs
  teach) yields a fresh closure = identity remount, old teardown first;
  the deep-mutation boundary is two-sided and measured: no channel
  deep-reads the param (unlike use:), but the kernels' OWN property
  reads on a $state-held fx register fine-grained deps, so mutation
  re-runs the attachment — params flow, never mutate.

  SELF-LISTENING (Owner ruling): the factory owns its gesture surface —
  pointerdown/pointerup + keydown Enter/Space, zero coupling to the
  host's state machine. The documented price: the ripple ink fires on
  POINTERDOWN (the component's seam was click, where the loading lock
  suppressed it — a self-listening attachment cannot see the host's
  loading state; hosts that need that lock forward through their own
  record wrapper instead). No-op while the element matches
  :disabled / [aria-disabled="true"], re-checked PER EVENT (the
  loading pose flips aria-disabled live). Reduced motion rides the
  runtimes' own gates (ripple.svelte.ts's matchMedia check; the css
  law sheet freezes the other loops).

  THE r4→r5 RECIPE LAWS (Owner reviews 2026-09-10, design §12): pulse
  fades AS it expands (opacity and spread at matched percentages in
  ONE animation — r4, standing). The three r5 re-ruled recipes:
  shimmer and rainbow paint through ONE ring-masked span each — the
  RING-MASK law (press-button.css's law block): paint exists ONLY in
  the rim band, so a transparent host shows the effect and nothing
  else; the r4 backdrop-cut sniffing and rainbow host-face layering
  RESOLVED and painted the host's own background — the pollution
  class the Owner caught on the invite/subscribe demos, deleted with
  its resolution code. Shimmer's conic arc dwells around the ring on
  the sheet's registered --jx-shimmer-angle keyframes (no slide left
  to jam at the corners; the carrier law — measured through the mask —
  runs the keyframes on the masked span and consumes the inherited
  angle via rotate, the only path that repaints); rainbow's registered
  --jx-rainbow-shift pans a 200%-period stop train around the FULL
  ring. ripple keeps its viewBox-free svg seat (user units
  carries the host's inherited silhouette) and the ink runs on CSS
  keyframes (settle = animationend, the WAAPI call is gone), clipped
  to the host's silhouette by a per-layer clipPath and softened by an
  svg feGaussianBlur — the ink can never escape the button whatever
  the host's positioning. The kernels stay exported for direct use
  (the attachLiquidGlass precedent); the builders keep living in
  press-button.svelte's module script, unchanged.
*/
import type { Attachment } from 'svelte/attachments';
import type {
  PressEffect,
  PulseEffect,
  RainbowEffect,
  RippleEffect,
  ShimmerEffect,
} from './press-button.svelte';
import { createRipple } from './ripple.svelte';

/** corner-shape gates the bevel ink's support marker; where it's missing
 *  the flat fallback stamps the node — the path draws the same diamond
 *  either way (the component's own module-scope probe, mirrored) */
const bevelInk =
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('corner-shape', 'bevel');

/** the stacking pose the effect hosts carry as utilities (relative z-0
 *  keeps the negative-z layers under the in-flow label); the runtime
 *  stamps the same classes itself */
const HOST_CLASSES = ['relative', 'z-0'];

/** each kernel's own custom properties — the stamp/strip pairs that
 *  keep the runtime coexisting with consumer styles (the liquid-glass
 *  stampVars precedent: rewrite ONLY what you own) */
const VAR_SHIMMER = /--shimmer-[a-z]+:\s*[^;]*;?/g;
const VAR_PULSE = /--pulse-[a-z]+:\s*[^;]*;?/g;

/** rainbow owns ONLY the pace + the color stops inline — the paint
 *  itself rides the ring/glow spans' own law-sheet rule, and the
 *  host's background/border channels are never touched (r5) */
const VAR_RAINBOW = /--rainbow-speed:\s*[^;]*;?|--c\d+:\s*[^;]*;?/g;

function stampVars(element: HTMLElement, vars: string, own: RegExp): void {
  const style = element.getAttribute('style') ?? '';
  const kept = style.replace(own, '').trim().replace(/;$/, '');
  element.setAttribute('style', kept ? `${kept}; ${vars}` : vars);
}
function stripVars(element: HTMLElement, own: RegExp): void {
  const style = element.getAttribute('style') ?? '';
  const kept = style.replace(own, '').trim().replace(/;$/, '');
  if (kept) element.setAttribute('style', kept);
  else element.removeAttribute('style');
}

/** add classes the element does not carry yet; return exactly the ones
 *  added — the cleanup must never strip a consumer's own utilities */
function addClasses(element: HTMLElement, classes: readonly string[]): string[] {
  const added: string[] = [];
  for (const cls of classes) {
    if (!element.classList.contains(cls)) {
      element.classList.add(cls);
      added.push(cls);
    }
  }
  return added;
}

/** the static layer spans the kernels render — aria-hidden scenery */
function span(cls: string): HTMLSpanElement {
  const node = document.createElement('span');
  node.className = cls;
  node.setAttribute('aria-hidden', 'true');
  return node;
}

/** svg ink nodes (the r4 ripple engine; r5 adds the defs pair — the
 *  silhouette clip + the soft-edge filter — and the group that carries
 *  their references) */
const SVG_NS = 'http://www.w3.org/2000/svg';
function svgNode(tag: 'svg'): SVGSVGElement;
function svgNode(
  tag:
    | 'circle'
    | 'path'
    | 'g'
    | 'defs'
    | 'clipPath'
    | 'filter'
    | 'feGaussianBlur'
    | 'rect'
): SVGElement;
function svgNode(tag: string): SVGElement {
  return document.createElementNS(SVG_NS, tag) as SVGElement;
}

/** shimmer — the ring port (r5): ONE mask-banded span IS the ring; the
 *  sheet paints the conic arc on its ::before and dwells it around the
 *  rim with `rotate` keyframes — the spark WALKS with holds, there is
 *  no slide left to jam at the corners, and there is no backdrop
 *  sniffing: the host's face is never read, resolved, or painted (a
 *  transparent host stays transparent — the r5 pollution law).
 *  --shimmer-cut feeds the mask as the ring band thickness. One span,
 *  teardown removes it */
export function applyShimmer(element: HTMLElement, fx: ShimmerEffect): () => void {
  element.setAttribute('data-jx-shimmer-host', '');
  const added = addClasses(element, HOST_CLASSES);
  stampVars(
    element,
    `--shimmer-color: ${fx.color}; --shimmer-spread: ${fx.spread}; --shimmer-cut: ${fx.cut}; --shimmer-speed: ${fx.speed}ms`,
    VAR_SHIMMER
  );
  // r8: ONE mask-banded ring — the spark walks the host's own rim; the
  // face/radius/text are the host's business, never the effect's
  const ring = span('jx-shimmer-ring');
  element.prepend(ring);
  return () => {
    ring.remove();
    element.removeAttribute('data-jx-shimmer-host');
    for (const cls of added) element.classList.remove(cls);
    stripVars(element, VAR_SHIMMER);
  };
}

/** pulse — sonar rings from a silhouette copy of the body. The DOM is
 *  the pre-r4 shape (one layer span, the variant rides its own class);
 *  the r4 ruling lives in the sheet: opacity fades DURING the spread —
 *  both channels at matched percentages in ONE keyframe set, no
 *  sequential fade phase */
export function applyPulse(element: HTMLElement, fx: PulseEffect): () => void {
  element.setAttribute('data-jx-pulse-host', '');
  const added = addClasses(element, HOST_CLASSES);
  stampVars(
    element,
    `--pulse-color: ${fx.color}; --pulse-duration: ${fx.duration}ms; --pulse-distance: ${fx.distance}`,
    VAR_PULSE
  );
  const layer = span(`jx-pulse-layer jx-pulse-${fx.variant}`);
  element.prepend(layer);
  return () => {
    layer.remove();
    element.removeAttribute('data-jx-pulse-host');
    for (const cls of added) element.classList.remove(cls);
    stripVars(element, VAR_PULSE);
  };
}

/** rainbow — the ring port (r5): the r4 host-background layering is
 *  DELETED — the host's background/border channels are never touched
 *  (inline or otherwise; the ownership-restore contract dies with the
 *  channels it guarded). ONE mask-banded ring span + the under-glow
 *  run the sheet's 200%-period stop train (the registered
 *  --jx-rainbow-shift pans it); the kernel's stamp is vars ONLY, so a
 *  transparent host shows the flowing rim and nothing else, and the
 *  FULL ring flows — top, bottom, both sides */
export function applyRainbow(element: HTMLElement, fx: RainbowEffect): () => void {
  const added = addClasses(element, HOST_CLASSES);
  const vars = `--rainbow-speed: ${fx.speed}ms; ${fx.colors
    .map((c, i2) => `--c${i2 + 1}: ${c}`)
    .join('; ')}`;
  stampVars(element, vars, VAR_RAINBOW);
  // r8: the ring + the under-glow carry the whole paint; the host keeps
  // its own face, radius, and text
  const ring = span('jx-rainbow-ring');
  const glow = span('jx-rainbow-glow');
  element.prepend(ring, glow);
  return () => {
    ring.remove();
    glow.remove();
    for (const cls of added) element.classList.remove(cls);
    stripVars(element, VAR_RAINBOW);
  };
}

/** per-layer id suffix (the glass filter's stamp-suffix precedent):
 *  the clipPath/filter ids must be unique per MOUNTED layer — two
 *  ripple hosts on one page would otherwise cross-reference each
 *  other's defs */
let rippleLayerSeq = 0;


/** ripple — the SVG ink engine (r4 ruling 6; r5: css-timeline ink +
 *  the silhouette clip + the soft edge): the layer is ONE viewBox-
 *  free <svg> seat filling the host (inset-0 = the padding box), so
 *  user units are CSS px in the seat's own rect frame (clientX/Y minus
 *  frame — spawn never touches per-dot top/left math again (the
 *  border-box-vs-padding-box misalignment class is dead by
 *  construction). Size reads clientWidth/clientHeight (the padding
 *  box, what the svg fills) — never getBoundingClientRect. ONE defs
 *  pair per layer: the clipPath rect (the host's padding box + its
 *  computed corner radius — the ink can never escape the rounded
 *  silhouette whatever the host's positioning, the Owner's overflow
 *  finding) and the feGaussianBlur soft edge; the ink <g>roup carries
 *  both references. The ink node animates via the sheet's
 *  jx-ripple-ink keyframes (--ripple-duration on the layer) and the
 *  settle engine removes it on animationend — no WAAPI anywhere */
function rippleRuntime(element: HTMLElement, fx: RippleEffect): {
  spawn(clientX: number, clientY: number, fromPointer: boolean): void;
  destroy(): void;
} {
  const runtime = createRipple();
  // the host stamp the template branch carried (data-jx-ripple-host) —
  // DOM/classname equivalence with the retired declarative path
  element.setAttribute('data-jx-ripple-host', '');
  // THE ANCHOR LAW: the svg seat is position:absolute — without a
  // positioned host it anchors to the nearest transform/filter ancestor
  // and the ink rides a foreign box (the IAB catch, 2026-09-10: the
  // showcase's plain hosts are static, the page wrapper carries a
  // transform — every other kernel stamps this pose; ripple had lost it)
  const pose = addClasses(element, HOST_CLASSES);
  const layer = svgNode('svg');
  layer.setAttribute('class', 'jx-ripple-layer');
  layer.setAttribute('aria-hidden', 'true');
  layer.setAttribute(
    'style',
    `--ripple-color: ${fx.color}; --ripple-duration: ${fx.duration}ms`
  );
  // The clipping is GEOMETRY-FREE by ruling (Owner 2026-09-10): the
  // sheet rides the host's own silhouette — `.jx-ripple-layer` carries
  // `border-radius: inherit; overflow: hidden` — the corners track the
  // host for free (a clipPath's rx/ry never matched inherited radii as
  // cleanly and fought the resize). The ONE def this layer may carry is
  // the soft-edge filter, and ONLY when soft > 0 (the default 0 keeps
  // the ink crisp — soft is a choice, never a default)
  const id = `jx-ripple-${(rippleLayerSeq += 1)}`;
  const inkGroup = svgNode('g');
  if (fx.soft > 0) {
    const blur = svgNode('feGaussianBlur');
    blur.setAttribute('stdDeviation', String(fx.soft));
    const filter = svgNode('filter');
    filter.setAttribute('id', `${id}-soft`);
    filter.append(blur);
    const defs = svgNode('defs');
    defs.append(filter);
    layer.append(defs);
    inkGroup.setAttribute('filter', `url(#${id}-soft)`);
  }
  layer.append(inkGroup);
  element.prepend(layer);
  const inks: { destroy(): void }[] = [];
  let seq = 0;
  // THE TARGET LAW (Owner 2026-09-10, the ⌘-glyph catch): the pointer
  // may land on ANY descendant — event.offsetX/Y would be relative to
  // THAT node's box. The only honest frame is the seat's own: client
  // coordinates minus the layer's rect (the padding box, borders
  // included in the arithmetic for free), read at event time so a
  // resize or scroll can never desync it.
  const seatPoint = (clientX: number, clientY: number): { x: number; y: number } => {
    const seat = layer.getBoundingClientRect();
    return { x: clientX - seat.left, y: clientY - seat.top };
  };
  const spawn = (clientX: number, clientY: number, fromPointer: boolean): void => {
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    const width = element.clientWidth;
    const height = element.clientHeight;
    const size = Math.max(width, height);
    const point = fromPointer ? seatPoint(clientX, clientY) : { x: width / 2, y: height / 2 };
    const cx = point.x;
    const cy = point.y;
    const ink = svgNode(fx.shape === 'bevel' ? 'path' : 'circle');
    ink.setAttribute('class', `jx-ripple-ink${fx.shape === 'bevel' && !bevelInk ? ' jx-ripple-flat' : ''}`);
    ink.setAttribute('data-shape', fx.shape);
    if (fx.shape === 'bevel') {
      // the shape law's 50% corner cut: a square of side=size with the
      // corners chamfered to the midpoints — the diamond both DOM
      // branches of the retired engine drew (bevel cut / 45° square)
      const half = size / 2;
      ink.setAttribute(
        'd',
        `M ${cx - half} ${cy} L ${cx} ${cy - half} L ${cx + half} ${cy} L ${cx} ${cy + half} Z`
      );
    } else {
      ink.setAttribute('cx', String(cx));
      ink.setAttribute('cy', String(cy));
      ink.setAttribute('r', String(size / 2));
    }
    inkGroup.append(ink);
    // the node's DOM removal rides the SAME settle the template path
    // got from its reactive each-loop (onSettled hands the imperative
    // layer the animationend/cancel hook)
    inks.push(
      runtime.ink(ink, {
        key: ++seq,
        onSettled: () => ink.remove(),
      })
    );
  };
  return {
    spawn,
    destroy() {
      for (const ink of inks.splice(0)) ink.destroy(); // unlisten + remove the ink nodes
      layer.remove(); // the defs go with the svg — no id leaks
      element.removeAttribute('data-jx-ripple-host');
      for (const cls of pose) element.classList.remove(cls); // the anchor pose was ours
    },
  };
}

/**
 * The attachment FACTORY — `pressEffect(fx)` is the whole {@attach}
 * expression; param in, attachment out (the liquidGlass shape).
 * Mounts the fx's kernel, owns the gesture surface, and returns the
 * teardown: listeners off, ink settle unlistened + nodes removed,
 * stamped layers/vars/classes gone. `fx` is captured — a replaced fx
 * re-runs the FACTORY (identity remount), never this closure (params
 * flow).
 */
export function pressEffect(fx: PressEffect): Attachment<HTMLElement> {
  return (element) => {
    let cleanup: (() => void) | undefined;
    let spawn: ((clientX: number, clientY: number, fromPointer: boolean) => void) | undefined;
    switch (fx.type) {
      case 'shimmer':
        cleanup = applyShimmer(element, fx);
        break;
      case 'pulse':
        cleanup = applyPulse(element, fx);
        break;
      case 'rainbow':
        cleanup = applyRainbow(element, fx);
        break;
      case 'ripple': {
        const ripple = rippleRuntime(element, fx);
        spawn = ripple.spawn;
        cleanup = ripple.destroy;
        break;
      }
    }

    // the loading/disabled poses flip live — the gate reads PER EVENT,
    // never once at mount
    const inactive = (): boolean => element.matches(':disabled, [aria-disabled="true"]');

    const onPointerDown = (event: PointerEvent): void => {
      if (inactive()) return;
      // client coords ONLY — offsetX/Y is relative to whichever CHILD
      // caught the pointer (the ⌘-glyph catch); the seat's rect does the
      // frame math inside spawn
      spawn?.(event.clientX, event.clientY, true);
    };
    // pointerup completes the gesture surface (the Owner ruling names
    // the whole pointer pair); no kernel answers it today — the ink
    // fires at pointerdown by design — the seam stays armed so the
    // gesture contract is one surface, not a per-kernel rebuild
    const onPointerUp = (): void => {
      if (inactive()) return;
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      if (inactive()) return;
      spawn?.(0, 0, false); // keyboard: centered on the padding box
    };

    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointerup', onPointerUp);
    element.addEventListener('keydown', onKeyDown);

    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('keydown', onKeyDown);
      cleanup?.();
    };
  };
}

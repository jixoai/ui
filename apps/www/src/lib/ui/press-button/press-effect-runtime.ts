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
// the scope token's parser (timeline-reui W1, Owner r2): this site's
// --background tokens are oklch strings and the local canvas-fillStyle
// normalization does NOT convert them (Chrome returns oklch verbatim,
// lab-verified 2026-09-15), so the fill basis crosses color-utils'
// OKLCH→sRGB bridge — the established channel (the item declares
// @jixoai/color-utils)
import { oklchToRgb, parseColor as parseTokenColor } from '$lib/color-utils';
import { createRipple } from './ripple.svelte';

/** corner-shape gates the bevel ink's support marker; where it's missing
 *  the flat fallback stamps the node — the path draws the same diamond
 *  either way (the component's own module-scope probe, mirrored) */
const bevelInk =
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('corner-shape', 'bevel');

/** THE BORDER-AREA GATE (Owner r11): Chrome 139+ can clip a background
 *  to the border band itself — the true cutout, no fill layer needed
 *  for a transparent face. Read PER MOUNT (a function, not a frozen
 *  const) so tests can stub CSS.supports and pin both branches */
function borderAreaSupported(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('background-clip', 'border-area')
  );
}

/* ── the fill channel (Owner r11): number = opaque, null = transparent ── */

/** parse a CSS color to [r, g, b, a] — hex and rgb()/rgba() by regex
 *  (jsdom-safe), anything exotic through the canvas normalizer */
function parseColor(color: string): [number, number, number, number] | null {
  const s = color.trim();
  let m = /^#([0-9a-f]{3,8})$/i.exec(s);
  if (m) {
    const h = m[1];
    if (h.length === 3 || h.length === 4) {
      const [r, g, b, a = 'f'] = h.split('');
      return [parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16), parseInt(a + a, 16) / 255];
    }
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
      h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    ];
  }
  m = /^rgba?\(([^)]+)\)$/i.exec(s);
  if (m) {
    const parts = m[1].replace(/\//g, ' ').replace(/,/g, ' ').trim().split(/\s+/);
    if (parts.length >= 3) {
      const n = (v: string): number => parseFloat(v);
      return [
        Math.round(n(parts[0])),
        Math.round(n(parts[1])),
        Math.round(n(parts[2])),
        parts[3] === undefined ? 1 : n(parts[3]),
      ];
    }
  }
  if (typeof document === 'undefined') return null;
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#000';
  ctx.fillStyle = s;
  const norm = String(ctx.fillStyle);
  if (norm.startsWith('#') || norm.startsWith('rgba')) return parseColor(norm);
  return null;
}

/* ── the theme-scope ladder (visual-quality-iteration W1, Owner
 *  2026-09-15): the Context resolves FROM THE HOST ELEMENT, never
 *  from the document alone. The standing r12 ladder read html.dark
 *  (never set by this site's themed stages, which toggle
 *  [data-theme]/.jx-light/.dark on a stage ANCESTOR) and then fell to
 *  the OS scheme — so a light stage on an OS-dark machine painted a
 *  dark sweep: the Owner's reported symptom. The law (change design
 *  §W1): walk the host's ancestor chain (self included) for the
 *  NEAREST theme scope — [data-theme="light"|"dark"], .dark,
 *  .jx-light — first hit wins; the OS scheme answers ONLY when the
 *  whole chain carries no scope (an unthemed page follows the user,
 *  honest fallback). html.dark is merely the root-most scope of the
 *  same walk. */
/** one element's scope marker — data-theme outranks the classes on
 *  the same element (an explicit attribute beats a utility class);
 *  non-light/dark data-theme values are no scope at all */
function scopeIsDark(el: Element): boolean | null {
  const theme = el.getAttribute('data-theme');
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  if (el.classList.contains('dark')) return true;
  if (el.classList.contains('jx-light')) return false;
  return null;
}

/** the RAW token's slash-alpha, read BEFORE any parser touches the
 *  string (the Owner r2 ladder): color-utils' parseColor DISCARDS oklch
 *  alpha (its model is opaque — registry/files/lib/color-utils.ts:203),
 *  so opacity is judged on the raw token alone — alpha absent, `/ 1`,
 *  or `/ 100%` proceeds; `/ none` (a css MISSING component), any alpha
 *  < 1, or an unparsable alpha tail takes the fallback ladder
 *  (conservative: a semi-transparent scope token is not a canvas) */
function tokenAlphaIsOpaque(raw: string): boolean {
  const slash = raw.lastIndexOf('/');
  if (slash === -1) return true;
  // function colors keep their closing paren on the computed token
  // (`oklch(0 0 0 / 100%)`) — strip it before judging the alpha tail
  const tail = raw.slice(slash + 1).replace(/\)\s*$/, '').trim();
  if (tail === '' || tail === 'none') return false;
  const pct = tail.endsWith('%');
  const n = parseFloat(pct ? tail.slice(0, -1) : tail);
  if (!Number.isFinite(n)) return false;
  return (pct ? n / 100 : n) === 1;
}

/** the Context's theme state (the Owner's r12 ruling, W1-scoped): the
 *  NEAREST ancestor theme scope of the HOST (self included) first —
 *  a dark stage on a light site is dark — and only an entirely
 *  unscoped chain falls to the OS scheme */
export function contextIsDark(host?: Element): boolean {
  for (
    let el: Element | null = host ?? (typeof document !== 'undefined' ? document.documentElement : null);
    el;
    el = el.parentElement
  ) {
    const scoped = scopeIsDark(el);
    if (scoped !== null) return scoped;
  }
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
}

/** the Context's CANVAS (Owner r2, timeline-reui W1): the auto fill
 *  rides the SAME basis as text/border — the theme scope's
 *  --background TOKEN, never a measured ancestor. A decorative opaque
 *  band (the effects gallery's dark glass-band) is not the fill's
 *  context: the fill sitting next to the scope's own text/border ink
 *  steps with the THEME. Walk the host's ancestor chain (self
 *  included; hostless starts at the document root) for the NEAREST
 *  theme scope — the same predicate contextIsDark uses — and read
 *  that scope element's computed --background; an entirely unscoped
 *  chain reads the ROOT element's token first (on jixoai pages :root
 *  always carries --background — the root token IS the text/border
 *  basis, so it is the fill's basis too; the OS scheme does NOT enter
 *  the color path). The token parses OPAQUE through
 *  @jixoai/color-utils' oklch bridge (this site's tokens are oklch
 *  strings; the canvas-fillStyle normalizer does not convert them)
 *  after the raw-string alpha pre-pass; unparsable or non-opaque
 *  tokens — and a world with no document at all — take the TERMINAL
 *  white/black ladder by contextIsDark (it fires only on non-token
 *  pages, where contextIsDark itself has fallen to the OS scheme) */
export function contextCanvasCss(host?: Element): string {
  if (typeof document !== 'undefined') {
    let scope: Element | undefined;
    for (
      let el: Element | null = host ?? document.documentElement;
      el;
      el = el.parentElement
    ) {
      if (scopeIsDark(el) !== null || el === document.documentElement) {
        scope = el; // the nearest scope — else the root element, the unscoped terminal
        break;
      }
    }
    if (scope) {
      const raw = getComputedStyle(scope).getPropertyValue('--background').trim();
      if (raw !== '' && tokenAlphaIsOpaque(raw)) {
        const parsed = parseTokenColor(raw);
        if (parsed) {
          const { r, g, b } = oklchToRgb(parsed);
          return `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;
        }
      }
    }
  }
  return contextIsDark(host) ? '#000000' : '#ffffff';
}

/**
 * solidFill — the fill channel's minter (Owner r11): take ANY CSS
 * color, composite it over the context's base — the theme scope's
 * --background token, the SAME basis the auto fill rides (Owner r2,
 * W1) — and return the guaranteed-OPAQUE 0xRRGGBB number shimmer's
 * `fill` accepts. The base is minted HOSTLESS (call-time, often
 * pre-mount — no host param, the document root's token through the
 * same ladder). An explicit base overrides the context's
 * (deterministic minting for tests and design tokens):
 *
 *   shimmer({ fill: solidFill('rgba(255, 255, 255, 0.35)') })
 */
export function solidFill(color: string, base?: string): number {
  const src = parseColor(color) ?? [255, 255, 255, 1];
  const dst = parseColor(base ?? contextCanvasCss()) ?? [255, 255, 255, 1];
  const a = Math.min(Math.max(src[3], 0), 1);
  const over = (s: number, d: number): number => Math.round(s * a + d * (1 - a));
  return (over(src[0], dst[0]) << 16) | (over(src[1], dst[1]) << 8) | over(src[2], dst[2]);
}

/** number → the rgb() the sheet paints */
function fillToCss(fill: number): string {
  return `rgb(${(fill >> 16) & 255} ${(fill >> 8) & 255} ${fill & 255})`;
}

/** the fill channel's resolution, shared by the rim kernels (r11/r13,
 *  W1-scoped 2026-09-15): number → opaque rgb(); null → the TRUE
 *  cutout where the engine clips border-area, else the blend
 *  emulation (white + darken in light contexts, black + lighten in
 *  dark — read from the HOST's scope); undefined → the theme scope's
 *  --background TOKEN (Owner r2: the SAME basis as text/border —
 *  never a measured ancestor; the CSS Canvas keyword AND the measured
 *  opaque-ancestor walk are both retired from the auto path) */
function resolveFill(fill: number | null | undefined, host?: Element): { fillCss: string; blend: 'darken' | 'lighten' | null } {
  if (fill === null && !borderAreaSupported()) {
    const dark = contextIsDark(host);
    return { fillCss: fillToCss(dark ? 0x000000 : 0xffffff), blend: dark ? 'lighten' : 'darken' };
  }
  if (fill === null) return { fillCss: 'transparent', blend: null };
  if (fill === undefined) return { fillCss: contextCanvasCss(host), blend: null };
  return { fillCss: fillToCss(fill), blend: null };
}

/** the host's ancestor chain as a list — self through root (the
 *  design's own words for the observer's reach) */
function scopeChain(element: Element): Element[] {
  const chain: Element[] = [];
  for (let el: Element | null = element; el; el = el.parentElement) chain.push(el);
  return chain;
}

/** ONE MutationObserver per mounted context-resolved effect (W1):
 *  attributeFilter ['class', 'data-theme'] on every element of the
 *  host's CURRENT ancestor chain (self through root) — a class flip
 *  (jx-light → dark) AND an attribute flip (data-theme="light" →
 *  "dark") both re-resolve — plus ONE childList/subtree registration
 *  on the document root as the REPARENT channel (the Gate-1 r5
 *  residual made explicit: attribute observation cannot see a host
 *  changing parents, and the old chain's registrations go stale the
 *  moment the host moves). Structural mutations only ever wake a
 *  CHAIN COMPARE — a pure parentNode identity walk, no style reads —
 *  so unrelated DOM churn never pays for a re-resolution; only a
 *  genuinely moved host re-resolves AND rebinds to its new chain.
 *  An unrelated element's class change triggers nothing (the chain
 *  registrations are per-element, never subtree). Disconnected on
 *  effect cleanup. */
function watchScope(element: HTMLElement, reresolve: () => void): () => void {
  if (typeof MutationObserver === 'undefined') return () => {};
  let chain = scopeChain(element);
  const root = element.ownerDocument?.documentElement ?? null;
  const observer = new MutationObserver((records) => {
    const attributeFlip = records.some((record) => record.type === 'attributes');
    const live = scopeChain(element);
    const moved = live.length !== chain.length || live.some((el, i) => el !== chain[i]);
    if (!attributeFlip && !moved) return; // structural churn elsewhere — nothing of ours changed
    reresolve();
    if (moved) {
      observer.disconnect();
      chain = live;
      bind();
    }
  });
  const bind = (): void => {
    for (const el of chain) observer.observe(el, { attributeFilter: ['class', 'data-theme'] });
    if (root) observer.observe(root, { childList: true, subtree: true });
  };
  bind();
  return () => observer.disconnect();
}

/** the rim kernels' clip pair — border-area where the engine answers,
 *  the Afif border-box pair elsewhere */
function rimClipCss(): string {
  return borderAreaSupported() ? 'padding-box, border-area' : 'padding-box, border-box';
}

/** the stacking pose the effect hosts carry (relative z-0 keeps the
 *  negative-z layers under the in-flow label). THE TAILWINDLESS
 *  LESSON (the overflow round, 2026-09-20): this list once read
 *  ['relative', 'z-0'] — UTILITY class names whose rules the
 *  tailwindless migration deleted from production css, so the stamps
 *  went mute (computed position: static), every absolute effect
 *  layer resolved against a foreign containing block, and the
 *  pulse/glow geometry spilled far outside its host. Dynamic class
 *  stamps must reference rules the FAMILY owns — the semantic
 *  jx-fx-host class below, lawed in press-button.css behind :where()
 *  (zero specificity: consumer utilities keep winning) */
const HOST_CLASSES = ['jx-fx-host'];

/** each kernel's own custom properties — the stamp/strip pairs that
 *  keep the runtime coexisting with consumer styles (the liquid-glass
 *  stampVars precedent: rewrite ONLY what you own) */
const VAR_SHIMMER = /--shimmer-[a-z-]+:\s*[^;]*;?/g;
const VAR_PULSE = /--pulse-[a-z]+:\s*[^;]*;?/g;

/** rainbow owns the pace + the ring/fill/clip channels + the color
 *  stops inline — the paint itself rides the host-channel rule + the
 *  glow span's own law-sheet rule */
const VAR_RAINBOW = /--rainbow-[a-z-]+:\s*[^;]*;?|--c\d+:\s*[^;]*;?/g;

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

/** shimmer — THE HOST CHANNEL, r11 final (the Owner's core ruling
 *  2026-09-11: 「你目前是通过在宿主元素里面加元素来实现这个效果，
 *  还要加 inset，现在不要了。直接改成在宿主元素上去做」): NO child
 *  layer, NO inset — the HOST itself carries the ring, exactly like
 *  the Owner's reference css (border + the double background + the
 *  spin, all one element). The runtime stamps the class + vars and
 *  resolves the FACE per the fill channel:
 *    • fill = number  → the opaque rgb() rides --shimmer-fill; the
 *      sheet's fill layer provides the background (the extra layer
 *      the border-area mode requires for a solid face)
 *    • fill = null    → TRANSPARENT. Where Chrome 139+ answers, the
 *      conic clips to border-area and the face is the host's own —
 *      the TRUE cutout at last. Where it does not, the blend
 *      emulation (the Owner's ruling): light context → white fill +
 *      mix-blend-mode: darken on the host; dark context → black
 *      fill + lighten — the face reads as glass over whatever sits
 *      behind, which is why the demo band exists
 *    • fill undefined → the theme scope's --background TOKEN (W1-r2,
 *      Owner ruling: auto rides the SAME basis as text/border — never
 *      a measured ancestor; the gallery's dark glass-band is scenery,
 *      not context) — the sweep follows the scope, live (a scope
 *      observer re-resolves class/data-theme flips and reparents
 *      without a remount; the CSS Canvas keyword is retired)
 *  Teardown strips the class, the vars, and restores the host's
 *  prior mix-blend-mode untouched */
export function applyShimmer(element: HTMLElement, fx: ShimmerEffect): () => void {
  element.setAttribute('data-jx-shimmer-host', '');
  const added = addClasses(element, ['jx-shimmer-host']);
  const priorBlend = element.style.mixBlendMode;
  const apply = (): void => {
    const { fillCss, blend } = resolveFill(fx.fill, element);
    stampVars(
      element,
      `--shimmer-shine: ${fx.shine}; --shimmer-base: ${fx.ringColor}; --shimmer-shine-width: ${fx.shineWidth}; --shimmer-speed: ${fx.speed}ms; --shimmer-ring-w: ${fx.ringW}; --shimmer-fill: ${fillCss}; --shimmer-clip: ${rimClipCss()}`,
      VAR_SHIMMER
    );
    // the blend stamp is ours while mounted: set it when the channel
    // asks, restore the consumer's prior when it does not (idempotent
    // under re-resolution — the undefined arm never blends)
    if (blend) element.style.mixBlendMode = blend;
    else if (element.style.mixBlendMode !== priorBlend) element.style.mixBlendMode = priorBlend;
  };
  apply();
  // numeric fills are explicit and context-free — no observer at all;
  // the context-resolved arms (undefined canvas, null blend direction)
  // re-resolve live through ONE observer on the ancestor chain
  const unwatch = typeof fx.fill === 'number' ? undefined : watchScope(element, apply);
  return () => {
    unwatch?.();
    element.style.mixBlendMode = priorBlend;
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

/** rainbow — THE HOST CHANNEL, r13 (the Owner's ruling: rainbow is
 *  shimmer's sibling — same technique, same params): the host's own
 *  border IS the flowing ring (width = ringW, forced transparent +
 *  image hidden; the wrap-stop train rides background layer 2 through
 *  the SAME border-area gate and fill channel as shimmer — number =
 *  opaque face, null = the true cutout / blend emulation, undefined =
 *  the theme scope's --background TOKEN (the text/border basis),
 *  theme-live through the same W1 scope observer). The ONE span that remains is the under-glow
 *  bar (the Owner's ruling: 「blur 的彩虹光影不用改」) — it keeps its
 *  own paint and now INHERITS the registered shift from the animating
 *  host (one animation drives both carriers) */
export function applyRainbow(element: HTMLElement, fx: RainbowEffect): () => void {
  element.setAttribute('data-jx-rainbow-host', '');
  const added = addClasses(element, ['jx-rainbow-host', ...HOST_CLASSES]); // the glow span still needs the stacking pose
  const priorBlend = element.style.mixBlendMode;
  const apply = (): void => {
    const { fillCss, blend } = resolveFill(fx.fill, element);
    stampVars(
      element,
      `--rainbow-speed: ${fx.speed}ms; --rainbow-ring-w: ${fx.ringW}; --rainbow-fill: ${fillCss}; --rainbow-clip: ${rimClipCss()}; ${fx.colors
        .map((c, i2) => `--c${i2 + 1}: ${c}`)
        .join('; ')}`,
      VAR_RAINBOW
    );
    if (blend) element.style.mixBlendMode = blend;
    else if (element.style.mixBlendMode !== priorBlend) element.style.mixBlendMode = priorBlend;
  };
  apply();
  const unwatch = typeof fx.fill === 'number' ? undefined : watchScope(element, apply);
  const glow = span('jx-rainbow-glow');
  element.prepend(glow);
  return () => {
    unwatch?.();
    element.style.mixBlendMode = priorBlend;
    glow.remove();
    element.removeAttribute('data-jx-rainbow-host');
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

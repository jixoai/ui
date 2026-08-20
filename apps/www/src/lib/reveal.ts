/**
 * jixoai scroll-reveal action (registry/files/lib/reveal.ts).
 *
 * Initial-state law: the hidden state is a STATIC `data-reveal=""` (or
 * `data-reveal="rule"`) attribute in the template markup — never something
 * a mount-time action adds. On flat-file page loads a mount-time attribute
 * flashes the content before the animation runs. The action's ONLY jobs:
 * set --reveal-delay/--reveal-rise, observe, and add .is-revealed on first
 * intersection (threshold 0 — first-pixel entry; ratios couple reveal
 * timing to element height). No `rule` option: the variant lives in the
 * static attribute value.
 */

export interface RevealOptions {
  /** Transition delay in ms; stagger siblings ~60–90ms apart. */
  delay?: number;
  /** Rise distance in px for the default variant. */
  rise?: number;
}

export function reveal(
  node: HTMLElement,
  options: RevealOptions = {},
): { destroy: () => void } {
  if (options.delay !== undefined) {
    node.style.setProperty('--reveal-delay', `${options.delay}ms`);
  }
  if (options.rise !== undefined) {
    node.style.setProperty('--reveal-rise', `${options.rise}px`);
  }

  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
    node.classList.add('is-revealed');
    return { destroy: () => undefined };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          node.classList.add('is-revealed');
          observer.unobserve(node);
        }
      }
    },
    { threshold: 0 },
  );
  observer.observe(node);
  return { destroy: () => observer.disconnect() };
}

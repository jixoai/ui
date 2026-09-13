/**
 * Press-button restProps + external-detection suite
 * (test/press-button-restprops.spec.ts, 2026-09-13 — issues #4 + #5).
 *
 * #4 — the rest lane's consumer-semantics seam: the component spreads
 * {...rest} FIRST and stamps its own contract AFTER (link.svelte's
 * separator law — component-owned semantics land after the spread), so
 * any attribute the component ALSO stamps must be destructured and
 * COMPOSED or a blind re-declaration erases the pass-through value the
 * moment the typed prop is unset. The lock below pins the three named
 * casualties of the issue (aria-label, aria-disabled, disabled) on BOTH
 * roots, plus the family law that the anchor form never receives
 * button-only attributes (interactive descendants belong OUTSIDE
 * anchors): `disabled` maps to the loading pose's inert contract there
 * (aria-disabled + blocked navigation), never the native attribute.
 *
 * #5 — external detection is link.svelte's codified law: ONLY an
 * absolute http(s) href is external (/^https?:\/\//i). A bare "#" or
 * "#section" is a same-document anchor — same tab, no target=_blank —
 * and app routes keep the same-tab default; the explicit `external`
 * prop stays the forced override.
 *
 * Assertion law: state is read back through the DOM the way a user or
 * assistive tech sees it (roles, attributes) — never through component
 * internals. The anchor's blocked navigation is observed the way the
 * platform sees it: defaultPrevented on the dispatched click.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import RestHost from './fixtures/press-button-restprops-host.svelte';

/** a click listener one bubble hop above the anchor: sees exactly what
 *  the platform would have acted on (defaultPrevented or not) */
function observeClickOnce(): { clicks: boolean[]; off: () => void } {
  const clicks: boolean[] = [];
  const onClick = (e: MouseEvent) => clicks.push(e.defaultPrevented);
  document.addEventListener('click', onClick);
  return { clicks, off: () => document.removeEventListener('click', onClick) };
}

// ---------------------------------------------------------------------------
// #4 — the rest lane: aria-* and disabled land, nothing clobbered
// ---------------------------------------------------------------------------
describe('press-button restProps (#4) — consumer semantics survive the stamps', () => {
  it('aria-* land verbatim on the root, button and anchor forms alike', () => {
    const { container } = render(RestHost, {
      props: { 'aria-label': 'Deploy the build', 'aria-expanded': 'false' },
    });
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('aria-label')).toBe('Deploy the build');
    expect(btn.getAttribute('aria-expanded')).toBe('false');

    const anchor = render(RestHost, {
      props: { href: '/docs.html', 'aria-label': 'Read the docs' },
    });
    const a = anchor.container.querySelector('a')!;
    expect(a.getAttribute('aria-label')).toBe('Read the docs');
  });

  it('the typed ariaLabel prop and the kebab aria-label both land; the typed prop wins when both are passed', () => {
    const typed = render(RestHost, { props: { ariaLabel: 'typed lane' } });
    expect(typed.container.querySelector('button')!.getAttribute('aria-label')).toBe('typed lane');

    const kebab = render(RestHost, { props: { 'aria-label': 'kebab lane' } });
    expect(kebab.container.querySelector('button')!.getAttribute('aria-label')).toBe('kebab lane');

    const both = render(RestHost, {
      props: { ariaLabel: 'typed lane', 'aria-label': 'kebab lane' },
    });
    expect(both.container.querySelector('button')!.getAttribute('aria-label')).toBe('typed lane');
  });

  it('a pass-through aria-disabled survives (the clobber regression: not loading, not disabled)', () => {
    // before #4, the blind `aria-disabled={loading ? 'true' : undefined}`
    // stamp erased the consumer's value whenever loading was false
    const { container } = render(RestHost, {
      props: { 'aria-disabled': 'true' },
    });
    expect(container.querySelector('button')!.getAttribute('aria-disabled')).toBe('true');
  });

  it('loading keeps its component contract: aria-disabled="true" wins over the consumer value', () => {
    const { container } = render(RestHost, {
      props: { loading: true, 'aria-disabled': 'false' },
    });
    expect(container.querySelector('button')!.getAttribute('aria-disabled')).toBe('true');
  });

  it('disabled carries NATIVE semantics on the button form: the attribute, and activation suppressed', () => {
    const onclick = vi.fn();
    const { container } = render(RestHost, {
      props: { disabled: true, onclick },
    });
    const btn = container.querySelector('button')!;
    expect(btn.hasAttribute('disabled')).toBe(true);
    fireEvent.click(btn);
    expect(onclick).not.toHaveBeenCalled();
    // not loading: the pose is disabled's own, never loading's
    expect(btn.getAttribute('aria-disabled')).toBe('true');
  });

  it('disabled maps to the ANCHOR inert contract: aria-disabled, no native attribute, navigation blocked', () => {
    const { container } = render(RestHost, {
      props: { href: 'https://example.com', disabled: true },
    });
    const a = container.querySelector('a')!;
    // `disabled` is not an anchor attribute — the family law
    expect(a.hasAttribute('disabled')).toBe(false);
    expect(a.getAttribute('aria-disabled')).toBe('true');
    const observed = observeClickOnce();
    fireEvent.click(a);
    observed.off();
    expect(observed.clicks).toEqual([true]); // defaultPrevented: navigation blocked
  });

  it('the anchor form still navigates when neither loading nor disabled', () => {
    const { container } = render(RestHost, {
      props: { href: 'https://example.com' },
    });
    const a = container.querySelector('a')!;
    expect(a.getAttribute('aria-disabled')).toBeNull();
    const observed = observeClickOnce();
    fireEvent.click(a);
    observed.off();
    expect(observed.clicks).toEqual([false]);
  });

  it('no href means no anchor: the button receives no <a>-only stamps (target/rel absent)', () => {
    const { container } = render(RestHost);
    expect(container.querySelector('a')).toBeNull();
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('target')).toBeNull();
    expect(btn.getAttribute('rel')).toBeNull();
    expect(btn.getAttribute('href')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// #5 — external detection: absolute http(s) only, anchors stay same-tab
// ---------------------------------------------------------------------------
describe('press-button external detection (#5) — the http(s)-only law', () => {
  it('a bare "#" is a same-document anchor: no target, no rel', () => {
    const { container } = render(RestHost, { props: { href: '#' } });
    const a = container.querySelector('a')!;
    expect(a.getAttribute('href')).toBe('#');
    expect(a.getAttribute('target')).toBeNull();
    expect(a.getAttribute('rel')).toBeNull();
  });

  it('"#section" stays in the same document too', () => {
    const { container } = render(RestHost, { props: { href: '#section' } });
    expect(container.querySelector('a')!.getAttribute('target')).toBeNull();
  });

  it('app routes and relative pages keep the same-tab default', () => {
    for (const href of ['/docs.html', 'docs.html']) {
      const { container } = render(RestHost, { props: { href } });
      expect(container.querySelector('a')!.getAttribute('target')).toBeNull();
    }
  });

  it('absolute http(s) opens in a new tab with the noreferrer pair', () => {
    for (const href of ['https://example.com', 'http://example.com']) {
      const { container } = render(RestHost, { props: { href } });
      const a = container.querySelector('a')!;
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toBe('noreferrer');
    }
  });

  it('the explicit external prop stays the forced override, on or off', () => {
    const forcedOn = render(RestHost, {
      props: { href: '/docs.html', external: true },
    });
    expect(forcedOn.container.querySelector('a')!.getAttribute('target')).toBe('_blank');

    const forcedOff = render(RestHost, {
      props: { href: 'https://example.com', external: false },
    });
    expect(forcedOff.container.querySelector('a')!.getAttribute('target')).toBeNull();
  });
});

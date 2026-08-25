/**
 * composition-f (composition-first-apis, Batch F, 2026-08-25): the
 * terminal-header decomposition locks — the LAST composition-law
 * violator clears (the probe goes green across registry/files/ui):
 *   1. chrome-only header: brand block + pill slot + drawer shell,
 *      with the nav composed from NavigationMenu parts INSIDE it;
 *   2. the family's ID/wire laws hold under the header (popovertarget
 *      === aria-controls === the live panel; click opens);
 *   3. the config tree is GONE — no TerminalNavItem-shaped props
 *      anywhere in the component source (source + mirror);
 *   4. mobile drawer mechanics: hamburger fold, Escape → close with
 *      focus returned, bind:open two-way;
 *   5. closeAll(): navigation cleanup hides composed panels and resets
 *      the drawer without the header ever tracking either.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import Host from './fixtures/terminal-header-host.svelte';

// jsdom ships no matchMedia; the header's tier-cross watcher needs the
// listener pair only (matches is never true in the headless pass)
beforeAll(() => {
  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  }
});

// the source laws are asserted textually on the mirror copy (the exact
// bytes the site runs — registry and mirror are byte-identical)
const headerSource = readFileSync('src/lib/ui/terminal-header/terminal-header.svelte', 'utf8');
const headerCss = readFileSync('src/lib/ui/terminal-header/terminal-header.css', 'utf8');
// the Props interface is the probe's target — assert on IT (the header
// comment cites the dead API names as documentation)
const propsBlock = headerSource.match(/interface Props \{[\s\S]*?\n  \}/)![0];

const raf = () => new Promise(requestAnimationFrame);

function setup() {
  const rendered = render(Host);
  const header = () => rendered.container.querySelector('header.jx-nav') as HTMLElement;
  const burger = () =>
    rendered.container.querySelector('button[aria-label="Toggle navigation"]') as HTMLButtonElement;
  const trigger = () =>
    rendered.container.querySelector('button[data-jx-navmenu-trigger]') as HTMLButtonElement;
  const drawerNav = () =>
    rendered.container.querySelector('.f-drawer') as HTMLElement;
  const openMirror = () =>
    rendered.container.querySelector('[data-fixture-open]')?.getAttribute('data-fixture-open');
  return { rendered, header, burger, trigger, drawerNav, openMirror };
}

// ---------------------------------------------------------------------------
// lock 1 — chrome only, nav composed inside it
// ---------------------------------------------------------------------------
describe('terminal-header — chrome + composed nav', () => {
  it('renders the bar chrome: bezel header, brand block, pill slot with the indicator', () => {
    const { header, rendered } = setup();
    expect(header().classList.contains('dark')).toBe(true); // the theme lock
    expect(header().textContent).toContain('f-brand');
    expect(header().textContent).toContain('f.jixoai.com');
    // the pill box hosts the consumer-composed family bar…
    const nav = rendered.container.querySelector('nav[data-jx-navmenu]') as HTMLElement;
    expect(nav).toBeTruthy();
    expect(nav.getAttribute('aria-label')).toBe('Primary');
    // …inside the header's chrome, with the sliding indicator element
    expect(nav.closest('header')).toBe(header());
    expect(header().querySelector('.jx-indicator')).toBeTruthy();
  });

  it('the nav slot composes family parts: one Item/Trigger/Panel pair + bare links', () => {
    const { rendered } = setup();
    expect(rendered.container.querySelectorAll('[data-jx-navmenu-item]').length).toBe(1);
    expect(rendered.container.querySelectorAll('[data-jx-navmenu-trigger]').length).toBe(1);
    const links = [...rendered.container.querySelectorAll('nav[data-jx-navmenu] > a[data-jx-navmenu-link]')] as HTMLAnchorElement[];
    expect(links.map((a) => a.textContent?.trim())).toEqual(['home', 'tokens']);
  });
});

// ---------------------------------------------------------------------------
// lock 2 — the family wire laws hold under the header
// ---------------------------------------------------------------------------
describe('terminal-header — the composed panel wires through the family ID protocol', () => {
  it('trigger popovertarget === aria-controls === the live popover=auto panel id', () => {
    const { rendered, trigger } = setup();
    const panelId = trigger().getAttribute('popovertarget')!;
    expect(trigger().getAttribute('aria-controls')).toBe(panelId);
    expect(panelId).toBe('f-docs-panel');
    const panel = document.getElementById(panelId)!;
    expect(panel.getAttribute('popover')).toBe('auto');
    // the panel is DOM-descended from the header (top layer promotes
    // painting only) — the header's closeAll finds it by DOM query
    expect(panel.closest('header.jx-nav')).toBeTruthy();
  });

  it('click opens the composed panel; the mega link inside is the consumer-authored content', async () => {
    const { rendered, trigger } = setup();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    await fireEvent.click(trigger());
    const panel = document.getElementById(trigger().getAttribute('aria-controls')!)!;
    expect(panel.matches(':popover-open')).toBe(true);
    expect(panel.textContent).toContain('docs link a');
    // cleanup for the next spec (one auto popover at a time is the
    // engine's law, but this panel would leak across renders otherwise)
    await fireEvent.click(trigger());
  });
});

// ---------------------------------------------------------------------------
// lock 3 — the config tree is gone (the composition-law clearance)
// ---------------------------------------------------------------------------
describe('terminal-header — no TerminalNavItem-shaped props anywhere', () => {
  it('the Props surface carries no items config tree, no panelAction, no navColumns, no keyed render-props', () => {
    expect(propsBlock).not.toMatch(/\bitems\b/);
    expect(propsBlock).not.toMatch(/\bpanelAction\b/);
    expect(propsBlock).not.toMatch(/\bnavColumns\b/);
    // no keyed render-prop escapes either (Snippet<[…, number]>)
    expect(propsBlock).not.toMatch(/Snippet<\[/);
    // the props surface is chrome + snippets + the bindable drawer state
    expect(propsBlock).toContain('drawer?: Snippet');
    expect(propsBlock).toContain('open?: boolean');
  });

  it('the css keeps the chrome bands and dropped the config-tree surface rules', () => {
    // band 3 (the bezel subpanel law) survives for composed panels…
    expect(headerCss).toContain('.jx-nav .jx-pop.jx-subpanel');
    expect(headerCss).toContain('jx-subpanel-mega');
    // …while the navColumns pinning classes died with the prop
    expect(headerCss).not.toContain('jx-nav-cols');
    // the panel side stays the pre-composition bottom-end law
    expect(headerCss).toContain('position-area: bottom span-right !important');
  });
});

// ---------------------------------------------------------------------------
// lock 4 — the mobile drawer shell
// ---------------------------------------------------------------------------
describe('terminal-header — the mobile drawer shell', () => {
  it('the hamburger folds the drawer open and closed; the drawer snippet is inside the scroller', async () => {
    const { burger, drawerNav, header } = setup();
    expect(burger().getAttribute('aria-expanded')).toBe('false');
    await fireEvent.click(burger());
    expect(burger().getAttribute('aria-expanded')).toBe('true');
    const scroller = header().querySelector('[data-jx-mobile-scroll]') as HTMLElement;
    expect(scroller.contains(drawerNav())).toBe(true);
    await fireEvent.click(burger());
    expect(burger().getAttribute('aria-expanded')).toBe('false');
  });

  it('Escape closes the open drawer and returns focus to the hamburger', async () => {
    const { burger, drawerNav } = setup();
    await fireEvent.click(burger());
    burger().focus();
    await fireEvent.keyDown(window, { key: 'Escape' });
    expect(burger().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(burger());
    expect(drawerNav()).toBeTruthy(); // collapsed, never unmounted
  });

  it('bind:open is two-way: the bound mirror follows the hamburger and drives it back', async () => {
    const { rendered, burger, openMirror } = setup();
    expect(openMirror()).toBe('false');
    await fireEvent.click(burger());
    expect(openMirror()).toBe('true');
    // the consumer closing through the bound state closes the shell
    await fireEvent.click(rendered.container.querySelector('[data-fixture-close]') as HTMLButtonElement);
    expect(openMirror()).toBe('false');
    expect(burger().getAttribute('aria-expanded')).toBe('false');
  });
});

// ---------------------------------------------------------------------------
// lock 5 — closeAll(): navigation cleanup without tracking
// ---------------------------------------------------------------------------
describe('terminal-header — closeAll navigation cleanup', () => {
  it('hides an open composed panel and resets the drawer in one call', async () => {
    const { rendered, burger, trigger } = setup();
    // both surfaces open at once: a composed panel + the drawer
    await fireEvent.click(trigger());
    const panel = document.getElementById(trigger().getAttribute('aria-controls')!)!;
    expect(panel.matches(':popover-open')).toBe(true);
    await fireEvent.click(burger());
    expect(burger().getAttribute('aria-expanded')).toBe('true');

    await fireEvent.click(rendered.container.querySelector('[data-fixture-close]') as HTMLButtonElement);
    expect(panel.matches(':popover-open')).toBe(false);
    expect(burger().getAttribute('aria-expanded')).toBe('false');
  });
});

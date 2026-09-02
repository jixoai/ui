/**
 * language-switcher.spec.ts — the SSG anchor law + honest link
 * semantics (2026-09-02 fix wave).
 *
 * Contracts under test:
 *  - the popover anchor is DERIVED, never random: the trigger's
 *    anchor-name and the panel's position-anchor are the same
 *    `--jx-lang-*` string, computed once per instance (stable across
 *    popover churn) and distinct per co-mounted instance — two
 *    switchers must never share one anchor (CSS anchor names
 *    namespace by document). The SSR/hydration seam itself is pinned
 *    at SOURCE (the separator.spec precedent — this harness compiles
 *    components for the client only, so svelte/server render is not
 *    reachable): the derivation must ride $props.id(), whose id
 *    travels through a hydration marker so SSR html and the hydrated
 *    client agree; a Math.random name diverges across the seam and
 *    briefly orphans the popover;
 *  - honest menu semantics (2026-09-02): the panel is a nav landmark
 *    of plain anchors — no listbox/option composite roles, no
 *    aria-haspopup on the trigger (nothing here implements roving
 *    arrows or aria-activedescendant, so those roles would lie); the
 *    keyboard contract is the anchors' native focusability, the
 *    current locale carries aria-current="page", every link its own
 *    href + hreflang;
 *  - the popover truth: the trigger's aria-expanded tracks the
 *    toggle event — flips on click, returns on link select and on
 *    Escape (light dismiss is the platform's, wired by setup.ts).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';

import LanguageSwitcher from '../src/lib/ui/language-switcher/language-switcher.svelte';

const menuLocales = [
  { code: 'en', label: 'English', href: '/en/docs' },
  { code: 'zh', label: '简体中文', href: '/zh/docs' },
  { code: 'ja', label: '日本語', href: '/ja/docs' },
];
const pairLocales = menuLocales.slice(0, 2).map(({ code, label, href }) => ({
  code,
  label: code === 'en' ? 'EN' : '中文',
  href,
}));

/** `--jx-lang-<ident>` out of a style attribute (null when absent) */
const anchorFrom = (style: string | null, prop: 'anchor-name' | 'position-anchor'): string | null => {
  const m = style?.match(new RegExp(`${prop}:\\s*(--jx-lang-[\\w-]+)`));
  return m ? m[1] : null;
};

function mountMenu(current = 'en') {
  const { container } = render(LanguageSwitcher, {
    props: { variant: 'menu', locales: menuLocales, current, ariaLabel: 'Language' },
  });
  const btn = container.querySelector<HTMLButtonElement>('[data-jx-lang-btn]')!;
  const nav = container.querySelector<HTMLElement>('[data-jx-lang-menu]')!;
  return { btn, nav, links: [...nav.querySelectorAll('a')] };
}

describe('language-switcher anchor law (SSG-safe)', () => {
  it('trigger and panel agree on one non-empty --jx-lang-* anchor', () => {
    const { btn, nav } = mountMenu();
    const triggerAnchor = anchorFrom(btn.getAttribute('style'), 'anchor-name');
    const panelAnchor = anchorFrom(nav.getAttribute('style'), 'position-anchor');
    expect(triggerAnchor).toBeTruthy();
    expect(panelAnchor).toBeTruthy();
    expect(triggerAnchor).toBe(panelAnchor);
  });

  it('the anchor is computed once per instance — popover churn never re-rolls it', async () => {
    const { btn } = mountMenu();
    const before = anchorFrom(btn.getAttribute('style'), 'anchor-name');
    fireEvent.click(btn);
    await tick();
    fireEvent.keyDown(document, { key: 'Escape' });
    await tick();
    expect(anchorFrom(btn.getAttribute('style'), 'anchor-name')).toBe(before);
  });

  it('two switchers on one page never share an anchor', () => {
    const a = mountMenu();
    const b = mountMenu();
    const anchorA = anchorFrom(a.btn.getAttribute('style'), 'anchor-name');
    const anchorB = anchorFrom(b.btn.getAttribute('style'), 'anchor-name');
    expect(anchorA).toBeTruthy();
    expect(anchorB).toBeTruthy();
    expect(anchorA).not.toBe(anchorB);
    // each pair stays internally consistent
    expect(anchorFrom(a.nav.getAttribute('style'), 'position-anchor')).toBe(anchorA);
    expect(anchorFrom(b.nav.getAttribute('style'), 'position-anchor')).toBe(anchorB);
  });

  it('source law: the anchor derives from $props.id() — never Math.random', () => {
    // jsdom compiles client-only, so the SSR/hydration seam is proven
    // the input-group/separator way: the law is pinned at source
    const src = readFileSync(
      resolve(process.cwd(), 'src/lib/ui/language-switcher/language-switcher.svelte'),
      'utf8',
    );
    // the executable law only — the header comment names Math.random
    // in its WHY prose (the banned thing is the derivation using it)
    const script = src.match(/<script[\s\S]*?<\/script>/)![0];
    expect(script).toContain('$props.id()');
    expect(script).toMatch(/const anchor = `--jx-lang-\$\{autoId\}`/);
    expect(script).not.toContain('Math.random');
  });
});

describe('language-switcher honest link semantics', () => {
  it('the menu panel is a nav landmark — no listbox/option composite roles', () => {
    const { nav, btn } = mountMenu();
    expect(nav.tagName).toBe('NAV');
    expect(nav.getAttribute('popover')).toBe('auto');
    expect(nav.getAttribute('aria-label')).toBe('Language');
    // the retired lie: composite roles with no roving/activedescendant engine
    expect(nav.querySelector('[role="listbox"], [role="option"]')).toBeNull();
    expect(nav.getAttribute('role')).toBeNull();
    expect(btn.getAttribute('aria-haspopup')).toBeNull();
    // bare disclosure: the expansion truth stays
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('entries are native anchors: focusable links with href + hreflang', () => {
    const { links } = mountMenu('zh');
    expect(links).toHaveLength(3);
    for (const [i, code] of ['en', 'zh', 'ja'].entries()) {
      const a = links[i] as HTMLAnchorElement;
      expect(a.tagName).toBe('A');
      expect(a.getAttribute('href')).toBe(`/${code}/docs`);
      expect(a.getAttribute('hreflang')).toBe(code);
      // native focusability is the keyboard contract (Tab/Enter)
      a.focus();
      expect(a.ownerDocument.activeElement).toBe(a);
    }
  });

  it('the current locale link alone carries aria-current="page"', () => {
    const { links } = mountMenu('zh');
    const current = links.filter((a) => a.getAttribute('aria-current') === 'page');
    expect(current).toHaveLength(1);
    expect(current[0]!.getAttribute('hreflang')).toBe('zh');
  });

  it('pair variant: labeled group of two links, active side aria-current="page"', () => {
    const { container } = render(LanguageSwitcher, {
      props: { variant: 'pair', locales: pairLocales, current: 'zh' },
    });
    const group = container.querySelector('[role="group"]')!;
    expect(group.getAttribute('aria-label')).toBe('Language');
    const links = [...group.querySelectorAll('a')] as HTMLAnchorElement[];
    expect(links).toHaveLength(2);
    expect(links[0]!.getAttribute('aria-current')).toBeNull();
    expect(links[1]!.getAttribute('aria-current')).toBe('page');
  });
});

describe('language-switcher popover truth', () => {
  it('aria-expanded flips on toggle and returns on link select', async () => {
    const { btn, links } = mountMenu();
    fireEvent.click(btn);
    await tick();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(links[2]!);
    await tick();
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('Escape closes the open popover (the platform close request)', async () => {
    const { btn } = mountMenu();
    fireEvent.click(btn);
    await tick();
    fireEvent.keyDown(document, { key: 'Escape' });
    await tick();
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });
});

/**
 * @jixoai/ui-design (studio) — the studio theme (walkthrough r6,
 * 2026-09-21: "general 这里至少可以提供 theme 的切换").
 *
 * The theme system is the theme sheet's own scope pair — :root paints
 * the light token set, `.dark` the dark one (registry/files/theme/
 * jx-pure.css) — so a theme IS the presence of the `dark` class on
 * documentElement, nothing more. This module owns the three-part
 * posture every theme picker needs:
 *
 * 1. BOOTSTRAP (both entries, BEFORE mount — the #23 dark token
 *    scope: family components must paint the resolved set on their
 *    first frame, no flash): read the persisted preference, apply it.
 *    The historical default stays 'dark' (the studio shipped dark).
 * 2. APPLY: dark → class on, light → class off, system → follow
 *    prefers-color-scheme (a live listener keeps a 'system' studio
 *    riding OS flips).
 * 3. PERSIST: localStorage, studio-scoped key — the server home's
 *    settings files are AGENT state; the chrome preference is a
 *    browser concern and never crosses that line.
 *
 * Browser-only by construction (both consumers are vite-compiled
 * entries/panel code); node tests never import it.
 */

export type StudioTheme = 'dark' | 'light' | 'system';

const STORAGE_KEY = 'jixoai-design-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function systemPrefersDark(): boolean {
  return typeof matchMedia === 'function' && matchMedia(DARK_QUERY).matches;
}

/** resolve a posture to the concrete scope: is `.dark` on? */
export function themeWantsDark(theme: StudioTheme): boolean {
  if (theme === 'system') return systemPrefersDark();
  return theme === 'dark';
}

/** the persisted posture — 'dark' when nothing (or something stale)
 *  ever chose, matching the studio's pre-r6 hardcoded identity */
export function readStudioTheme(): StudioTheme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
  } catch {
    /* storage unavailable (privacy mode) — the default posture */
  }
  return 'dark';
}

/** put the scope on the document (idempotent; the entries call this
 *  pre-mount, the settings panel on every change) */
export function applyStudioTheme(theme: StudioTheme): void {
  document.documentElement.classList.toggle('dark', themeWantsDark(theme));
}

/** the panel's write path: state → scope + storage in one step */
export function persistStudioTheme(theme: StudioTheme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable — the session still switches live */
  }
  applyStudioTheme(theme);
}

/** keep a 'system' studio riding OS flips (both entries arm this after
 *  the bootstrap apply; the listener never needs teardown — the
 *  document outlives every panel) */
export function watchStudioSystemTheme(): void {
  if (typeof matchMedia !== 'function') return;
  matchMedia(DARK_QUERY).addEventListener('change', () => {
    if (readStudioTheme() === 'system') applyStudioTheme('system');
  });
}

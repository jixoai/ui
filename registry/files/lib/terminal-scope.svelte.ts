/**
 * terminal-scope (registry/files/lib/terminal-scope.svelte.ts,
 * context-defaults round 2, 2026-09-19).
 *
 * The terminal family's SHARED theme→scope resolution — the bezel law
 * (Owner, 2026-08-21): every terminal surface is dark-locked by
 * default; theme='light' opts into the light CRT shell, 'system'
 * follows the OS preference LIVE (the matchMedia watch). The header
 * and the card carried this as two byte-identical $effect blocks
 * (first written 2026-08-21, duplicated at the card's birth) — one
 * law, one implementation now (the goal's 重构合并 lane).
 *
 * Call INSIDE a component's script (the $state/$effect runes bind to
 * the initializing component): pass the theme as a GETTER so the
 * effect tracks the reactive source (a Defaults resolve window, a
 * plain prop — both re-run the watch on change).
 *
 * 惰性律-aligned: no context reads here — the theme arrives as a
 * value; the ambient seam lives in each family's Defaults
 * (TerminalHeaderDefaults / TerminalCardDefaults), which resolve
 * BEFORE this watch consumes the value.
 */

/** the bezel theme vocabulary: dark-locked default, light opt-in, live system */
export type TerminalTheme = 'dark' | 'light' | 'system';

/** the resolved paint scope — the only two shells the CRT law knows */
export type TerminalScope = 'dark' | 'light';

/**
 * Resolve + watch. The initial $state mirrors the pre-effect truth
 * (SSR and prerender see the settled scope for dark/light themes);
 * the effect then owns every transition, including the live
 * prefers-color-scheme stream for theme='system'.
 */
export function watchTerminalScope(theme: () => TerminalTheme): { readonly scope: TerminalScope } {
  let scope = $state<TerminalScope>(theme() === 'light' ? 'light' : 'dark');

  $effect(() => {
    const t = theme();
    if (t !== 'system') {
      scope = t === 'light' ? 'light' : 'dark';
      return;
    }
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => (scope = media.matches ? 'dark' : 'light');
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  });

  return { get scope() { return scope; } };
}

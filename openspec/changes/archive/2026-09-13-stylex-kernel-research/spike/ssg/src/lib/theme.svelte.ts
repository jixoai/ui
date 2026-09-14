  // theme.svelte.ts — client-side theme/density state (D1-10's root
  // toggles). Deliberately NOT search-param-driven: prerendered pages
  // cannot read url.searchParams (SvelteKit throws during prerender),
  // and the no-JS D1-07 section must ship the default theme statically.
  const initial = $state({ theme: 'light' as 'light' | 'dark', density: 'default' as 'default' | 'lg' });

  export function themeStore() {
    return {
      get theme() {
        return initial.theme;
      },
      get density() {
        return initial.density;
      },
      setTheme(t: 'light' | 'dark') {
        initial.theme = t;
      },
      setDensity(d: 'default' | 'lg') {
        initial.density = d;
      },
    };
}

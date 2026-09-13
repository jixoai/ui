// +page.ts — theme/density arrive as search params so the toggles
// drive the ROOT element's .dark + [data-density] through +layout's
// $effect. Prerender uses the defaults.
// NOTE: plain TS (no svelte script wrapper) — runes-mode page load.
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => ({
  theme: (url.searchParams.get('theme') as 'light' | 'dark' | null) ?? 'light',
  density: (url.searchParams.get('density') as 'default' | 'lg' | null) ?? 'default',
});

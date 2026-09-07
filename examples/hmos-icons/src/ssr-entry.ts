// the SSR build target: renders App to a string so the E2E gate can
// assert the FINAL server-rendered output (the inline-core chunk
// paints synchronously — zero flicker, no hydration wiring needed)
import { render } from 'svelte/server';
import App from './App.svelte';

export const html = render(App).body;

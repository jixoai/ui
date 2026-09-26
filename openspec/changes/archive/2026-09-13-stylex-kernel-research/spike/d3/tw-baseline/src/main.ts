import { mount } from 'svelte';
// the ONE css import of the TW wiring (payload css rides this chain too:
// src/app.css → @import 'tailwindcss' + the theme sheets)
import './app.css';
import App from './App.svelte';

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;

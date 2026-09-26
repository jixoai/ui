import { mount } from 'svelte';
import './theme.css';
// the ONE wiring line of architecture C: the kernel's precompiled sheet
import './kernel-precompiled/stylex.css';
import App from './App.svelte';

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;

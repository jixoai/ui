import { mount } from 'svelte';
import './app.css';
import ControlApp from './ControlApp.svelte';

const app = mount(ControlApp, { target: document.getElementById('app')! });

export default app;

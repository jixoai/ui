import { mount } from 'svelte';
import App from './App.svelte';

const target = document.querySelector('#app');
if (target === null) throw new Error('#app mount target missing');
export const app = mount(App, { target });

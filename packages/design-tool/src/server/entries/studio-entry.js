/**
 * @jixoai/ui-design (server entries) — the studio surface entry.
 *
 * Orthogonal intent (1): mount the HOST-OWNED design/studio.svelte
 * (the scaffolded mount page that wraps the package default shell —
 * the dogfood slot; design-studio design.md §6.4). The host file is
 * fixed-path by convention, so one shared entry serves every host.
 *
 * Document theme (#23, 2026-09-12): the studio chrome is dark, so the
 * document root carries the theme sheet's `.dark` token scope BEFORE
 * mount — every dogfooded family component (tree-view rows, Items,
 * badges, chips, fields) then paints the dark token set against the
 * dark chrome. The r2 studio ran :root LIGHT tokens under a dark
 * chrome: family selected rows washed out light-gray, muted tree text
 * ~2:1, pure-black borders invisible (the "配色异常" root cause).
 *
 * Original need: Owner 2026-09-11 (design-studio T3/T4); dark-scope
 * fix 2026-09-12 (r3 polish #23). Browser code — plain JS served
 * through the design server's vite pipeline.
 */

import { mount } from 'svelte';
import 'virtual:jixoai-design/css';
import 'virtual:jixoai-icons.css';

document.documentElement.classList.add('dark');

import Studio from '/design/studio.svelte';

mount(Studio, { target: document.getElementById('studio-root') });

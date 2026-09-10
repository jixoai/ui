/**
 * @jixoai/ui-design (server entries) — the studio surface entry.
 *
 * Orthogonal intent (1): mount the HOST-OWNED design/studio.svelte
 * (the scaffolded mount page that wraps the package default shell —
 * the dogfood slot; design-studio design.md §6.4). The host file is
 * fixed-path by convention, so one shared entry serves every host.
 *
 * Original need: Owner 2026-09-11 (design-studio T3/T4). Browser
 * code — plain JS served through the design server's vite pipeline.
 */

import { mount } from 'svelte';
import 'virtual:jixoai-design/css';
import 'virtual:jixoai-icons.css';

import Studio from '/design/studio.svelte';

mount(Studio, { target: document.getElementById('studio-root') });

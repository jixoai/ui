/**
 * @jixoai/ui-design (studio) — mountStudio, the imperative mount
 * protocol (T4).
 *
 * Orthogonal intent (1): mount the package default shell on an
 * element with explicit endpoint URLs — for hosts that embed the
 * studio without the scaffolded design/studio.svelte layer. The
 * scaffolded mount page is the declarative twin (it imports the shell
 * directly and passes the same props).
 *
 * Original need: Owner 2026-09-11 (design-studio T4). BROWSER module
 * (vite-pipeline code — imports svelte + the shell component; never
 * import it from node-side code).
 */

import { mount, unmount } from 'svelte';
import type { Component } from 'svelte';

import Shell from './shell.svelte';

export interface MountStudioOptions {
  readonly manifestUrl?: string;
  readonly chatUrl?: string;
  readonly agentInfoUrl?: string;
  readonly knowledgeUrl?: string;
}

export interface MountedStudio {
  readonly component: Component;
  readonly destroy: () => void;
}

/** mount the default studio shell onto `target` (see shell.svelte for the endpoint defaults) */
export function mountStudio(target: HTMLElement, options: MountStudioOptions = {}): MountedStudio {
  const component = mount(Shell, {
    target,
    props: {
      manifestUrl: options.manifestUrl ?? '/__design__/api/manifest.json',
      chatUrl: options.chatUrl ?? '/__design__/api/chat',
      agentInfoUrl: options.agentInfoUrl ?? '/__design__/api/agent.json',
      knowledgeUrl: options.knowledgeUrl ?? '/__design__/api/knowledge.json',
    },
  });
  return { component, destroy: () => unmount(component) };
}

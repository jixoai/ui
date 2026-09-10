/**
 * @jixoai/ui-design (agent) — EchoAgent (T5).
 *
 * Orthogonal intents (2):
 *   1. the recorded playbook: a "hero prototype" style instruction
 *      streams the full agent turn — text reasoning, a write-files
 *      tool boundary, real workspace files (design/prototypes/echo-demo:
 *      canvas + 2 pages + 1 component built on #jixoai/press-button and
 *      the prototype-kit), closing text, done. No model service — the
 *      experimental product circuit must close on Echo first
 *      (design-studio design.md §4).
 *   2. path confinement: every write lands inside <root>/design/
 *      (escape attempts throw a named error before any disk touch).
 *
 * Original need: Owner 2026-09-11 (`jixoai-ui design --agent echo`).
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';

import type { AgentEvent, DesignAgent } from './types.ts';

/** thrown before any disk touch when a playbook path escapes design/ */
export class DesignPathEscapeError extends Error {
  constructor(path: string) {
    super(`[design-echo] refusing to write outside design/: ${path}`);
    this.name = 'DesignPathEscapeError';
  }
}

/**
 * Resolve a host-relative POSIX path inside <root>/design/ or throw.
 * Symlink-safe form: the resolved target must remain under designDir.
 */
export function resolveDesignFile(root: string, relPath: string): string {
  const designDir = resolve(root, 'design');
  const target = resolve(designDir, relPath);
  if (target !== designDir && !target.startsWith(designDir + sep)) {
    throw new DesignPathEscapeError(relPath);
  }
  return target;
}

/* ── the echo-demo prototype payload (real component imports) ─────────── */

const ECHO_DEMO_FILES: Readonly<Record<string, string>> = {
  'prototypes/echo-demo/canvas.svelte': `<!--
  echo-demo canvas — written by the EchoAgent playbook (T5).
  Pure declaration: the kit's frames carry ref/size/theme, this file
  only lays out the matrix (design-studio design.md §2).
-->
<script lang="ts">
  import { PrototypeCanvas, PrototypePage, PrototypeComponent } from '#jixoai/prototype-kit';
</script>

<PrototypeCanvas gridCols={2} gridRows={2} gap={16}>
  <PrototypePage
    id="echo-hero-desktop-1280-dark"
    ref="./pages/hero.svelte"
    width={1280}
    height={800}
    theme="dark"
  />
  <PrototypePage
    id="echo-hero-mobile-390-light"
    ref="./pages/hero.svelte"
    width={390}
    height={844}
    theme="light"
  />
  <PrototypeComponent
    id="echo-press-states-light"
    ref="./components/press-states.svelte"
    width={360}
    height={240}
    theme="light"
  />
</PrototypeCanvas>
`,
  'prototypes/echo-demo/pages/hero.svelte': `<!-- echo-demo hero page — a real press-button on a real responsive layout -->
<script lang="ts">
  import PressButton from '#jixoai/press-button';
</script>

<main class="echo-hero">
  <p class="echo-kicker">echo-demo</p>
  <h1>A hero the agent wrote</h1>
  <p class="echo-lede">
    This page is real svelte on real jixoai-ui components — resize the
    frame and the layout answers.
  </p>
  <div class="echo-actions">
    <PressButton>Deploy prototype</PressButton>
    <PressButton>Discard</PressButton>
  </div>
</main>

<style>
  .echo-hero {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 1rem;
    padding: 4rem 2rem;
  }
  .echo-kicker {
    font-family: monospace;
    font-size: 0.75rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    opacity: 0.7;
  }
  .echo-hero h1 {
    font-size: clamp(1.75rem, 5vw, 3rem);
    line-height: 1.1;
    margin: 0;
  }
  .echo-lede {
    max-width: 34rem;
    opacity: 0.8;
    margin: 0;
  }
  .echo-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
  }
</style>
`,
  'prototypes/echo-demo/pages/settings.svelte': `<!-- echo-demo settings page — form lane demo for the second frame -->
<script lang="ts">
  import PressButton from '#jixoai/press-button';
</script>

<main class="echo-settings">
  <h1>Settings</h1>
  <p class="echo-lede">Second page of the echo-demo prototype.</p>
  <PressButton>Save changes</PressButton>
</main>

<style>
  .echo-settings {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
    gap: 0.75rem;
    padding: 4rem 2rem;
  }
  .echo-lede {
    opacity: 0.8;
    margin: 0;
  }
</style>
`,
  'prototypes/echo-demo/components/press-states.svelte': `<!-- echo-demo component frame — the press-button state ladder -->
<script lang="ts">
  import PressButton from '#jixoai/press-button';
</script>

<div class="echo-states">
  <PressButton>Idle</PressButton>
  <PressButton>Pressed often</PressButton>
  <PressButton>Disabled lane</PressButton>
</div>

<style>
  .echo-states {
    display: grid;
    gap: 0.75rem;
    padding: 1.5rem;
    place-items: start;
  }
</style>
`,
};

const TRIGGER = /hero|原型|prototype|demo|做|build|page|画布/i;

/* ── the agent ────────────────────────────────────────────────────────── */

export interface EchoAgentOptions {
  /** override the written payload (tests); keys are design/-relative POSIX paths */
  readonly files?: Readonly<Record<string, string>>;
}

export function createEchoAgent(root: string, options: EchoAgentOptions = {}): DesignAgent {
  const files = options.files ?? ECHO_DEMO_FILES;
  return {
    info: () => ({ kind: 'echo', model: 'playbook' }),
    async *chat(sessionId: string, message: string): AsyncIterable<AgentEvent> {
      if (!TRIGGER.test(message)) {
        yield { type: 'text', text: `echo: I only know the demo playbook. Try something like "做一个 hero 原型" / "build a hero prototype". (session ${sessionId})` };
        yield { type: 'done' };
        return;
      }
      yield { type: 'text', text: 'echo: building the echo-demo prototype — a hero page at two viewports plus the press-button state ladder, on real components.' };
      yield { type: 'text', text: 'echo: writing canvas.svelte (declarative matrix), pages/hero.svelte, pages/settings.svelte and components/press-states.svelte under design/prototypes/echo-demo/.' };
      yield { type: 'tool', name: 'write-files', state: 'start' };
      try {
        for (const [relPath, content] of Object.entries(files)) {
          const target = resolveDesignFile(root, relPath);
          mkdirSync(dirname(target), { recursive: true });
          writeFileSync(target, content);
          yield { type: 'file', path: `design/${relPath.split('\\').join('/')}` };
        }
      } catch (cause) {
        yield { type: 'tool', name: 'write-files', state: 'end' };
        yield {
          type: 'error',
          message: cause instanceof Error ? cause.message : String(cause),
        };
        return;
      }
      yield { type: 'tool', name: 'write-files', state: 'end' };
      yield { type: 'text', text: 'echo: done — the canvas list picks up echo-demo; open it in the preview grid (files land inside design/, nothing else is touched).' };
      yield { type: 'done' };
    },
  };
}

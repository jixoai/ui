/**
 * @jixoai/ui-design (agent) — the none agent (T5).
 *
 * Orthogonal intent (1): `--agent none` — chat is disabled; the turn
 * streams a single explanatory text event + done so the UI has
 * something honest to render instead of a dead panel.
 *
 * Original need: Owner 2026-09-11 (read-only studio for demos and
 * vision walkthroughs).
 */

import type { AgentEvent, DesignAgent } from './types.ts';

export function createNoneAgent(): DesignAgent {
  return {
    info: () => ({ kind: 'none' }),
    async *chat(_sessionId: string, _message: string): AsyncIterable<AgentEvent> {
      yield {
        type: 'text',
        text: 'chat is disabled (running with --agent none) — the studio is read-only. Restart with --agent echo or --agent dsh to talk to an agent.',
      };
      yield { type: 'done' };
    },
  };
}

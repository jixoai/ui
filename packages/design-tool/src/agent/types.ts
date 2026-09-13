/**
 * @jixoai/ui-design (agent) — the DesignAgent seam (T5).
 *
 * Orthogonal intent (1): the single chat contract between the studio
 * shell and any agent runtime. Transport is SSE at
 * POST /__design__/api/chat (body: { sessionId, message }; the POST
 * response itself streams the turn's AgentEvents as `data:` lines —
 * one protocol, no WebSocket twin; design-studio design.md §4).
 *
 * Original need: Owner 2026-09-11 (`jixoai-ui design`). Event shapes
 * are frozen here; implementations: echo.ts (recorded playbook),
 * none.ts (read-only studio), dsh adapter (T8, separate change
 * module — not this file's business).
 */

/** one streamed agent event; `error` closes a failed turn (T5 ruling) */
export type AgentEvent =
  | { readonly type: 'text'; readonly text: string }
  /** a workspace file the agent wrote (host-relative POSIX path) */
  | { readonly type: 'file'; readonly path: string }
  /** a tool invocation boundary (state: 'start' | 'end') */
  | { readonly type: 'tool'; readonly name: string; readonly state: 'start' | 'end' }
  /** closes the turn successfully */
  | { readonly type: 'done' }
  /** closes a failed turn; the studio renders it inline */
  | { readonly type: 'error'; readonly message: string };

export interface AgentInfo {
  readonly kind: 'dsh' | 'echo' | 'none';
  readonly model?: string;
}

export interface DesignAgent {
  info(): AgentInfo;
  /**
   * One chat turn. The iterable MUST terminate (done or error) — the
   * SSE endpoint closes the response when the iterator finishes.
   */
  chat(sessionId: string, message: string): AsyncIterable<AgentEvent>;
}

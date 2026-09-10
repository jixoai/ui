/**
 * @jixoai/ui-design (agent) — the SSE transport (T5).
 *
 * Orthogonal intents (2):
 *   1. POST /__design__/api/chat — { sessionId, message } JSON body →
 *      text/event-stream of AgentEvents (`data: <json>` per event,
 *      flushed per event, closed when the turn's iterator ends).
 *      Single protocol: no WebSocket twin, no GET replay channel
 *      (design.md §4 leaves the exact shape to T5 — this is that
 *      ruling; the studio consumes it with fetch + ReadableStream
 *      since EventSource cannot POST).
 *   2. GET /__design__/api/agent.json — the seam's info() so the chat
 *      panel can render its read-only state before the first send.
 *
 * Original need: Owner 2026-09-11 (design-studio T5).
 */

import type { IncomingMessage, ServerResponse } from 'node:http';

import type { AgentEvent, DesignAgent } from './types.ts';

export const CHAT_PATH = '/__design__/api/chat';
export const AGENT_INFO_PATH = '/__design__/api/agent.json';

const MAX_BODY_BYTES = 64 * 1024;

/** read + JSON-parse a request body with a hard size ceiling */
function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolvePromise, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolvePromise(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (cause) {
        reject(cause instanceof Error ? cause : new Error(String(cause)));
      }
    });
    req.on('error', reject);
  });
}

function writeSseEvent(res: ServerResponse, event: AgentEvent): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

/**
 * The connect middleware wiring an agent into the design server.
 * Misses (wrong method/path, bad body) pass through or answer as
 * plain HTTP errors — never as SSE.
 */
export function agentMiddleware(agent: DesignAgent): (req: IncomingMessage, res: ServerResponse, next: () => void) => void {
  return (req, res, next) => {
    const pathname = (req.url ?? '').split('?')[0]!;

    if (pathname === AGENT_INFO_PATH && req.method === 'GET') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(agent.info()));
      return;
    }

    if (pathname !== CHAT_PATH || req.method !== 'POST') {
      next();
      return;
    }

    void (async () => {
      let body: { sessionId?: unknown; message?: unknown };
      try {
        body = (await readJsonBody(req)) as { sessionId?: unknown; message?: unknown };
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'invalid JSON body' }));
        return;
      }
      if (typeof body.sessionId !== 'string' || typeof body.message !== 'string' || body.message.length === 0) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'body must be { sessionId: string, message: string }' }));
        return;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      try {
        for await (const event of agent.chat(body.sessionId, body.message)) {
          writeSseEvent(res, event);
        }
      } catch (cause) {
        writeSseEvent(res, {
          type: 'error',
          message: cause instanceof Error ? cause.message : String(cause),
        });
      }
      res.end();
    })().catch(next);
  };
}

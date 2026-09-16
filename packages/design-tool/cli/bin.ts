/**
 * @jixoai/ui-design (collab CLI bin) — the THIN argv face over the four
 * programmatic commands (collab-protocol M6; protocol-spec §10). All
 * semantics live in `../src/server/collab/cli.ts`; this file only
 * parses argv, opens the workspace (`.jx-collab/` at the design root —
 * the frozen resolution) and prints one JSON envelope per invocation.
 *
 * Usage (node cli/bin.ts …):
 *
 *   update     <designDir> <componentId> <buffer> <patch> [--actor <a>]
 *   update-js  <designDir> <scriptFile>   [--actor <a>]
 *   sync       <designDir> [--component <id>] [--frontier <json>]
 *   log        <designDir> <componentId>  [--limit <n>]
 *
 * `patch` is the raw line-by-line protocol (one token per line, see
 * protocol-spec §10); `--frontier` is a JSON `[[peer, counter], …]`
 * encoded into a frontier-tagged sync cursor. Binary payloads (Loro
 * updates, cursor bytes) print as base64. Exit code: 0 on 200, 1 on
 * 422/409, 2 on usage errors.
 *
 * Original need: collab-protocol M6 (2026-09-15).
 */

import { readFileSync } from 'node:fs';

import { cliLog, cliSync, cliUpdate, cliUpdateJs, openWorkspaceCollab } from '../src/server/collab/cli.ts';
import type { Frontier } from '../src/server/collab/types.ts';

function usage(message?: string): never {
  if (message !== undefined) process.stderr.write(`error: ${message}\n`);
  process.stderr.write(
    'usage:\n' +
      '  node cli/bin.ts update <designDir> <componentId> <buffer> <patch> [--actor <a>]\n' +
      '  node cli/bin.ts update-js <designDir> <scriptFile> [--actor <a>]\n' +
      '  node cli/bin.ts sync <designDir> [--component <id>] [--frontier <json>]\n' +
      '  node cli/bin.ts log <designDir> <componentId> [--limit <n>]\n',
  );
  process.exit(2);
}

function flag(argv: string[], name: string): string | undefined {
  const at = argv.indexOf(`--${name}`);
  return at !== -1 && at + 1 < argv.length ? argv[at + 1] : undefined;
}

/** `[[peer, counter], …]` JSON → a frontier array */
function parseFrontierJson(json: string): Frontier {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch (error) {
    usage(`--frontier is not JSON: ${String(error)}`);
  }
  if (!Array.isArray(raw)) usage('--frontier must be a JSON array of [peer, counter] pairs');
  return raw.map((point) => {
    if (!Array.isArray(point) || point.length !== 2 || typeof point[0] !== 'string' || typeof point[1] !== 'number') {
      usage('--frontier entries must be [peerString, counterNumber] pairs');
    }
    return { peer: point[0] as string, counter: point[1] as number };
  });
}

const [command, ...rest] = process.argv.slice(2);
if (command === undefined) usage('missing command');

try {
  if (command === 'update') {
    const [designDir, componentId, buffer, patch] = rest;
    if (designDir === undefined || componentId === undefined || buffer === undefined || patch === undefined) usage('update needs <designDir> <componentId> <buffer> <patch>');
    const actor = flag(rest, 'actor') ?? 'agent:cli';
    const { gate } = openWorkspaceCollab(designDir);
    const result = await cliUpdate(gate, { actor, componentId, buffer, patch });
    process.stdout.write(`${JSON.stringify(result)}\n`);
    process.exit(result.status === 200 ? 0 : 1);
  }
  if (command === 'update-js') {
    const [designDir, scriptFile] = rest;
    if (designDir === undefined || scriptFile === undefined) usage('update-js needs <designDir> <scriptFile>');
    const actor = flag(rest, 'actor') ?? 'agent:cli';
    const { gate } = openWorkspaceCollab(designDir);
    const script = readFileSync(scriptFile, 'utf8');
    const result = await cliUpdateJs(gate, script, { actor });
    // the Loro increment is binary — print it as base64, keep the byte count
    process.stdout.write(
      `${JSON.stringify({ ...result, update: undefined, updateB64: result.update !== undefined ? Buffer.from(result.update).toString('base64') : undefined })}\n`,
    );
    process.exit(result.status === 200 ? 0 : 1);
  }
  if (command === 'sync') {
    const [designDir] = rest;
    if (designDir === undefined) usage('sync needs <designDir>');
    const component = flag(rest, 'component');
    const frontierJson = flag(rest, 'frontier');
    const { gate } = openWorkspaceCollab(designDir);
    const result = cliSync(gate, {
      ...(component !== undefined ? { componentId: component } : {}),
      ...(frontierJson !== undefined ? { syncCursor: { kind: 'frontier', value: parseFrontierJson(frontierJson) } } : {}),
    });
    process.stdout.write(
      `${JSON.stringify({ ...result, update: Buffer.from(result.update).toString('base64'), updateBytes: result.update.byteLength })}\n`,
    );
    process.exit(result.status === 200 ? 0 : 1);
  }
  if (command === 'log') {
    const [designDir, componentId] = rest;
    if (designDir === undefined || componentId === undefined) usage('log needs <designDir> <componentId>');
    const limitFlag = flag(rest, 'limit');
    const { gate } = openWorkspaceCollab(designDir);
    const result = cliLog(gate, componentId, ...(limitFlag !== undefined ? [{ limit: Number(limitFlag) }] : []));
    process.stdout.write(`${JSON.stringify(result)}\n`);
    process.exit(0);
  }
  usage(`unknown command ${JSON.stringify(command)}`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exit(2);
}

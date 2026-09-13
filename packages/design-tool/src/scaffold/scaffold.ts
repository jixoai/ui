/**
 * @jixoai/ui-design (scaffold) — the design workspace scaffold (T3/T4).
 *
 * Orthogonal intents (2):
 *   1. idempotently drop the HOST-OWNED studio mount page
 *      (design/studio.svelte — imports the package default shell,
 *      host may freely edit; scaffold never overwrites).
 *   2. copy any prototype templates from src/scaffold/templates/
 *      (subagent A's welcome/** demo lands there; this module treats
 *      the directory as data — unknown contents copied verbatim).
 *
 * Original need: Owner 2026-09-11 (design-studio T3, design.md §6.1).
 * LAW: only MISSING files are created — byte content of existing
 * files is never touched (V1 scaffold idempotence).
 */

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGE_SRC = dirname(dirname(fileURLToPath(import.meta.url))); // …/design-tool/src
const TEMPLATES_DIR = join(PACKAGE_SRC, 'scaffold/templates');

/**
 * The host-owned studio mount page. Rendered by the design server's
 * studio surface; the stable alias `#jixoai-design/shell` points at
 * the package default shell, so this file stays forkable without
 * knowing where the package lives on disk.
 */
const STUDIO_TEMPLATE = `<!--
  design/studio.svelte — the studio mount page (scaffolded 2026-09-11,
  design-studio T4). HOST-OWNED: edit freely, the scaffold never
  overwrites an existing file. Replace the default shell or wrap it
  with your own chrome to dogfood your components into the studio.
-->
<script lang="ts">
  import DefaultShell from '#jixoai-design/shell';

  // fill these to rewire the studio at the host level
  const endpoints = {
    manifestUrl: '/__design__/api/manifest.json',
    chatUrl: '/__design__/api/chat',
    agentInfoUrl: '/__design__/api/agent.json',
    knowledgeUrl: '/__design__/api/knowledge.json',
  };
</script>

<DefaultShell {...endpoints} />
`;

export interface ScaffoldResult {
  /** design/-relative POSIX paths created this run */
  readonly created: readonly string[];
  /** design/-relative POSIX paths that already existed (left byte-identical) */
  readonly kept: readonly string[];
}

/** collect the relative file list of a directory tree (POSIX paths) */
function walkFiles(root: string, prefix = ''): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const rel = prefix === '' ? entry.name : `${prefix}/${entry.name}`;
    if (entry.isDirectory()) out.push(...walkFiles(join(root, entry.name), rel));
    else if (entry.isFile()) out.push(rel);
  }
  return out;
}

/**
 * Scaffold the design workspace under <root>/design. Idempotent:
 * every target is written ONLY when absent; existing files (host
 * edits) are never touched. Templates with no matching design/
 * counterpart are copied recursively.
 */
export function scaffoldWorkspace(root: string): ScaffoldResult {
  const designDir = join(root, 'design');
  mkdirSync(designDir, { recursive: true });

  const created: string[] = [];
  const kept: string[] = [];

  // 1. the host-owned studio mount page
  const studioPath = join(designDir, 'studio.svelte');
  if (existsSync(studioPath)) {
    kept.push('studio.svelte');
  } else {
    writeFileSync(studioPath, STUDIO_TEMPLATE, 'utf8');
    created.push('studio.svelte');
  }

  // 2. prototype templates — the tree MIRRORS the design/ root
  // (subagent A delivers templates/design/prototypes/welcome/**; the
  // leading design/ segment is stripped — the copy target IS design/).
  // The top-level README documents provenance and never scaffolds.
  if (existsSync(TEMPLATES_DIR) && statSync(TEMPLATES_DIR).isDirectory()) {
    for (const rel of walkFiles(TEMPLATES_DIR)) {
      if (rel === 'README.md' && dirname(join(TEMPLATES_DIR, rel)) === TEMPLATES_DIR) continue;
      const designRel = rel.startsWith('design/') ? rel.slice('design/'.length) : rel;
      const target = join(designDir, designRel);
      if (existsSync(target)) {
        kept.push(relative(designDir, target).split('\\').join('/'));
        continue;
      }
      mkdirSync(dirname(target), { recursive: true });
      cpSync(join(TEMPLATES_DIR, rel), target);
      created.push(relative(designDir, target).split('\\').join('/'));
    }
  }

  return { created, kept };
}

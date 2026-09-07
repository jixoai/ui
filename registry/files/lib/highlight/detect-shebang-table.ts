/**
 * DLD layer 2 — the shebang / modeline layer
 * (lib/highlight/detect-shebang-table.ts, highlight-lang-detector,
 * 2026-09-07).
 *
 * The interpreter map DERIVES from lang-canonical.ts's interp view
 * (derive-then-diff law); the emacs first-line modeline rules are the
 * deliberately small hardcoded set design D3.1 sanctions. Boundary
 * semantics frozen there:
 *
 *   - a UTF-8 BOM is stripped before the first line is read;
 *   - `#!/usr/bin/env X` takes the first word after env — `env -S X -u`
 *     yields the first non-flag word AFTER -S (flags in general are
 *     skipped: env's own options are never the interpreter);
 *   - `#!X` takes the interpreter's basename directly
 *     (`#!/usr/bin/python3` → python3);
 *   - arguments after the interpreter are ignored (`python3 -O` →
 *     python3);
 *   - the modeline is the `# -*- mode: X -*-` FIRST-LINE form only —
 *     the `#` comment shape (a `//`-form line never matches).
 *
 * A miss is null; the waterfall continues to L3.
 */

import { getInterpMap } from './lang-canonical';

/**
 * emacs model names → canonical ids (design D3.1's small hardcoded set —
 * the mode vocabulary is emacs's, not linguist's, so it does not derive
 * from the canonical table).
 */
const MODELINE_TABLE: Readonly<Record<string, string>> = {
  python: 'python',
  javascript: 'javascript',
  js: 'javascript',
  js2: 'javascript',
  js3: 'javascript',
  typescript: 'typescript',
  'typescript-ts': 'typescript',
  ts: 'typescript',
  sh: 'bash',
  shell: 'bash',
  'shell-script': 'bash',
  bash: 'bash',
  zsh: 'bash',
  c: 'c',
  'c++': 'cpp',
  cpp: 'cpp',
  java: 'java',
  ruby: 'ruby',
  go: 'go',
  rust: 'rust',
  yaml: 'yaml',
  toml: 'toml',
  json: 'json',
  xml: 'xml',
  html: 'html',
  css: 'css',
  scss: 'scss',
  markdown: 'markdown',
  md: 'markdown',
  ini: 'ini',
  conf: 'ini',
  sql: 'sql',
  lua: 'lua',
  php: 'php',
  perl: 'perl',
  elixir: 'elixir',
  dart: 'dart',
  kotlin: 'kotlin',
  swift: 'swift',
  powershell: 'powershell',
  dockerfile: 'dockerfile',
};

/** the word's basename — `#!/usr/bin/python3` and `python3` agree */
function basename(word: string): string {
  const cut = Math.max(word.lastIndexOf('/'), word.lastIndexOf('\\'));
  return cut === -1 ? word : word.slice(cut + 1);
}

/**
 * Layer 2 — answer from the first line (BOM-stripped), or null. Both
 * the `#!` shebang forms and the `# -*- mode: X -*-` modeline live here;
 * a first line that is neither is no opinion.
 */
export function detectByShebang(code: string): string | null {
  // strip the BOM, take the first line, drop its CR tail
  const firstLine = (code.charCodeAt(0) === 0xfeff ? code.slice(1) : code)
    .split('\n', 1)[0]
    .replace(/\r$/, '');
  if (firstLine === '') return null;

  // the modeline: `#` comment form only (a // form is not a comment
  // line in the languages that use -*- markers this way)
  const modeline = /^#.*?-\*-\s*mode:\s*([A-Za-z0-9+#_-]+)/.exec(firstLine);
  if (modeline !== null) {
    const canonical = MODELINE_TABLE[modeline[1]];
    return canonical ?? null;
  }

  if (!firstLine.startsWith('#!')) return null;
  const words = firstLine.slice(2).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  let interpreter: string;
  if (basename(words[0]) === 'env' && words.length > 1) {
    // `#!/usr/bin/env X` — env's own flags (-S, -u, …) are never the
    // interpreter; the first non-flag word after them is
    const argument = words.slice(1).find((word) => !word.startsWith('-'));
    if (argument === undefined) return null;
    interpreter = basename(argument);
  } else {
    // `#!X` — the command's basename; trailing arguments were already
    // left in `words` and are ignored
    interpreter = basename(words[0]);
  }

  const canonical = getInterpMap().get(interpreter);
  return canonical ?? null;
}

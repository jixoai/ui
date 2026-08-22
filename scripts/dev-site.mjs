#!/usr/bin/env node
// Start the www site dev server from the repo root.
//
// Why this exists: the ROOT `npm run dev` is the REGISTRY watch build
// (shadcn build --watch) — it does not serve the site. The site lives
// in apps/www; this script gives that dev server a root-level entry so
// nobody has to know the layout.
//
// Usage:
//   npm run site                  # http://localhost:5199
//   npm run site -- --port 3000   # custom port
//   node scripts/dev-site.mjs --port 3000
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const portFlag = args.findIndex((a) => a === '--port');
const port = portFlag >= 0 ? args[portFlag + 1] : '5199';

const child = spawn('npm', ['run', 'dev', '--', '--port', port], {
  cwd: join(root, 'apps/www'),
  stdio: 'inherit',
});
child.on('exit', (code) => process.exit(code ?? 0));

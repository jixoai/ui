#!/usr/bin/env node
// measure-bytes.mjs — D3 bytes vector (F5 protocol): per configuration,
// 3 DEDICATED install runs (rm -rf node_modules between), bytes =
// MEDIAN `du -sk node_modules` over the 3 runs; lockfile bytes + sha256
// and the npm-install --dry-run added-total recorded alongside. All
// runs SERIAL. Raw output → logs/bytes.log (append-only receipt).
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const HERE = import.meta.dirname;
const LOG = path.join(HERE, 'logs', 'bytes.log');
fs.mkdirSync(path.dirname(LOG), { recursive: true });
fs.writeFileSync(LOG, `# D3 bytes vector — ${new Date().toISOString()}\n`);

const CONFIGS = ['tw-baseline', 'arch-a', 'arch-b', 'arch-c'];

function log(s) {
  fs.appendFileSync(LOG, s + '\n');
  process.stdout.write(s + '\n');
}

for (const cfg of CONFIGS) {
  const dir = path.join(HERE, cfg);
  const lock = path.join(dir, 'package-lock.json');
  const lockBytes = fs.statSync(lock).size;
  const lockSha = crypto.createHash('sha256').update(fs.readFileSync(lock)).digest('hex');
  log(`\n=== ${cfg} ===`);
  log(`lockfile: ${lockBytes} bytes, sha256 ${lockSha}`);

  // dry-run from an EMPTY state (total it would add)
  execSync('rm -rf node_modules', { cwd: dir });
  const dry = execSync('npm install --dry-run --no-audit --no-fund', {
    cwd: dir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const m = dry.match(/added (\d+) packages?/);
  log(`npm install --dry-run: ${m ? 'added ' + m[1] + ' packages' : 'UNPARSED'} (npm 11.19.0 exposes no tarball byte totals in dry-run — recorded as limitation; du median below is the byte measurement per F5)`);

  const dus = [];
  for (let i = 1; i <= 3; i++) {
    execSync('rm -rf node_modules', { cwd: dir });
    const t0 = Date.now();
    execSync('npm ci --no-audit --no-fund', { cwd: dir, stdio: 'pipe' });
    const ciSecs = ((Date.now() - t0) / 1000).toFixed(1);
    const du = execSync('du -sk node_modules', { cwd: dir, encoding: 'utf8' });
    const kbytes = parseInt(du.trim().split('\t')[0], 10);
    dus.push(kbytes);
    log(`install run ${i}: npm ci ${ciSecs}s; du -sk node_modules = ${kbytes} KB`);
  }
  const sorted = [...dus].sort((a, b) => a - b);
  log(`du runs: [${dus.join(', ')}] sorted [${sorted.join(', ')}] -> MEDIAN = ${sorted[1]} KB`);
}
log(`\nDONE ${new Date().toISOString()}`);

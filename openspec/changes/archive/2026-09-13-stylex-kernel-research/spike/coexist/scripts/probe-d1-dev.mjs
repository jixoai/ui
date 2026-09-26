#!/usr/bin/env node
// probe-d1-dev.mjs — D1-10 (dev side): same-frame .dark + density flip
// on the coexist DEV server (STYLEX_LAYER=after). Prod side runs in
// probe-d2.mjs. Owns the dev-server lifecycle + recycle evidence.
import { spawn } from 'node:child_process';
import { launchEngine } from './browser.mjs';

const PORT = Number(process.env.PORT || 5294);
const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
  cwd: new URL('..', import.meta.url).pathname,
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: true,
  env: { ...process.env, STYLEX_LAYER: 'after' },
});
let log = '';
server.stdout.on('data', (d) => (log += d));
server.stderr.on('data', (d) => (log += d));
const pid = server.pid;

const browser = await launchEngine(process.env.ENGINE || 'chromium');
let verdict = 'FAIL';
let detail = '';
try {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline && !log.includes(`localhost:${PORT}`)) await new Promise((r) => setTimeout(r, 250));
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
  await page.waitForSelector('[data-d2="d2-10"]', { timeout: 20_000 });
  await page.waitForFunction(
    () => getComputedStyle(document.querySelector('[data-d2="d2-10"]')).backgroundColor.includes('oklch'),
    { timeout: 20_000 },
  );
  const flip = await page.evaluate(async () => {
    const darkWrap = document.querySelector('.dark');
    const lgWrap = document.querySelector('[data-density="lg"]');
    const k = document.querySelector('[data-d2="d2-10"]');
    const read = () => ({
      color: getComputedStyle(k).backgroundColor,
      pad: `${getComputedStyle(k).paddingTop} ${getComputedStyle(k).paddingLeft}`,
    });
    const before = read();
    darkWrap.classList.remove('dark');
    lgWrap.removeAttribute('data-density');
    const afterRaf = await new Promise((resolve) => requestAnimationFrame(() => resolve(read())));
    darkWrap.classList.add('dark');
    lgWrap.setAttribute('data-density', 'lg');
    const restored = await new Promise((resolve) => requestAnimationFrame(() => resolve(read())));
    return { before, afterRaf, restored };
  });
  const changed = flip.before.color !== flip.afterRaf.color && flip.before.pad !== flip.afterRaf.pad;
  const restores = flip.before.color === flip.restored.color && flip.before.pad === flip.restored.pad;
  verdict = changed && restores ? 'PASS' : 'FAIL';
  detail = `same-frame batch: color ${flip.before.color}→${flip.afterRaf.color}, padding ${flip.before.pad}→${flip.afterRaf.pad} (changed=${changed}); restore-equal=${restores}`;
  await page.close();
} catch (err) {
  detail = `fatal: ${err}`;
} finally {
  await browser.close().catch(() => {});
  try { process.kill(-pid, 'SIGTERM'); } catch { try { server.kill('SIGTERM'); } catch {} }
  await new Promise((r) => setTimeout(r, 800));
  let alive = false, groupAlive = false;
  try { process.kill(pid, 0); alive = true; } catch {}
  try { process.kill(-pid, 0); groupAlive = true; } catch {}
  if (alive || groupAlive) { try { process.kill(-pid, 'SIGKILL'); } catch {} try { server.kill('SIGKILL'); } catch {} }
  console.log(` D1-10(dev)  ${verdict} — ${detail}`);
  console.log(`[probe-d1-dev] dev server pid=${pid} recycled (alive after SIGTERM: ${alive}, group: ${groupAlive}${alive || groupAlive ? ' → SIGKILL sent' : ''})`);
}
process.exit(verdict === 'PASS' ? 0 : 1);

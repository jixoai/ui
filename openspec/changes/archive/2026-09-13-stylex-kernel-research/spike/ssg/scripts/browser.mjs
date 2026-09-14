// scripts/browser.mjs — engine discovery for the spike probes.
// Mirrors the repo's verify-km pattern: CHROME_PATH override →
// playwright cache → system installs. WebKit/Firefox use the
// playwright-core registry (executablePath resolved by the library
// itself); failures surface verbatim for LIMITATION rows.
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const caches = [
    join(homedir(), 'Library/Caches/ms-playwright'),
    process.env.XDG_CACHE_HOME
      ? join(process.env.XDG_CACHE_HOME, 'ms-playwright')
      : join(homedir(), '.cache/ms-playwright'),
  ];
  for (const cache of caches) {
    if (!existsSync(cache)) continue;
    const versions = readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().reverse();
    for (const v of versions) {
      for (const name of [
        'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
        'chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium',
        'chrome-linux64/chrome',
        'chrome-linux/chrome',
      ]) {
        const p = join(cache, v, name);
        if (existsSync(p)) return p;
      }
    }
  }
  const system = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];
  for (const p of system) if (existsSync(p)) return p;
  throw new Error('No Chromium found (CHROME_PATH, playwright cache, or system installs)');
}

/** launch an engine by name; webkit/firefox resolve through
 *  playwright-core's own registry so a missing build throws the
 *  library's verbatim error (recorded as LIMITATION upstream). */
export async function launchEngine(name) {
  const pw = await import('playwright-core');
  if (name === 'chromium') {
    return pw.chromium.launch({ executablePath: findChrome() });
  }
  if (name === 'webkit') {
    return pw.webkit.launch();
  }
  if (name === 'firefox') {
    return pw.firefox.launch();
  }
  throw new Error(`unknown engine ${name}`);
}

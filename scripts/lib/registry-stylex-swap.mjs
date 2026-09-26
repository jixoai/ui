#!/usr/bin/env node
/**
 * registry-stylex-swap — the phase-1 consumer-contract flip (the
 * tailwindless one-shot W4, spec delta registry/spec.md: "a consumer
 * installing a COMPILED KERNEL PAYLOAD ITEM … SHALL owe NO
 * styling-engine tooling").
 *
 * WHAT: after `shadcn build` emits public/r/*.json (raw sources) and
 * gen-stylex-payload publishes the compiled artifacts, this step
 * rewrites every payload's file list so consumers receive the
 * COMPILED form:
 *
 *   each "…/x.stylex.ts" files[] entry ──▶ an "…/x.stylex.js" entry
 *         (the item's compiled classModule — plain-string class
 *         constants; the extensionless `./x.stylex` import specifiers
 *         the delivered .svelte files already use resolve to it
 *         unchanged) plus, for the item's OWN module, a leading
 *         relative css import
 *   + a new …/x.stylex.css entry (the item's compiled css — the F9
 *         canonical statement at byte zero, self-contained: the token
 *         :root block rides every item's css)
 *
 * The compiled module embeds every table the item delivers (deps'
 * tables — e.g. tokens — were inlined by the same transform pass, the
 * same-build law), so multi-module items (family + tokens dep) each
 * resolve their imports against the same classModule bytes; only the
 * carrier (the module whose stem matches the item key) wires the css.
 *
 * WHY A SEPARATE STEP: shadcn's CLI owns the r/ tree's composition;
 * the swap runs immediately after both producers, in build-site AND
 * verify:shadcn-add, through THIS one implementation so the two can
 * never disagree about the consumer contract.
 *
 * Idempotent: a payload without .stylex.ts entries passes untouched;
 * re-running over a swapped tree is a no-op.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const STYLEX_TS = /\.stylex\.ts$/;

/**
 * Swap every payload carrying .stylex.ts sources to its compiled form.
 * @param {string} root repo root
 * @param {string} [rDir] the built registry tree (default public/r)
 * @returns {{swapped: string[], untouched: number}} receipts for the caller's log line
 */
export function swapRegistryPayloads(root, rDir = join(root, 'public', 'r')) {
  const manifestPath = join(root, 'registry/payload/stylex/payload-manifest.json');
  if (!existsSync(manifestPath)) {
    throw new Error('registry-stylex-swap: registry/payload/stylex/payload-manifest.json missing — run gen-stylex-payload first (same-build law: the swap consumes the SAME derivation)');
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const artifacts = new Map(); // key → { classModule, css } (bytes from the payload tree — the single derivation point)
  for (const [key, entry] of Object.entries(manifest.items)) {
    const read = (art) => readFileSync(join(root, art.path), 'utf8');
    artifacts.set(key, { classModule: read(entry.classModule), css: read(entry.css) });
  }

  const swapped = [];
  let untouched = 0;

  /** mutate one payload object's files/dependencies in place; returns true when a swap happened */
  const swapItem = (item) => {
    const files = item.files;
    if (!Array.isArray(files) || !files.some((f) => f?.path?.match(STYLEX_TS))) return false;
    const key = item.name;
    // DATA MODULES (tailwindless W4-r6): a `.stylex.ts` making no
    // stylex.* calls and importing nothing engine-side is a plain
    // token MAP — it delivers as SOURCE (like every other .ts in the
    // payloads): a PURE-data item passes through untouched; inside a
    // compiled item the data entry also stays source (the compiled
    // module imports it at runtime). (The lane's first customer WAS
    // tokens.stylex.ts as a bare map; since the scope-stamp round the
    // tokens module carries real defineVars/createTheme calls and
    // rides the COMPILED lane — this stays as the guard for future
    // pure-map modules, line-anchored so prose never trips it.)
    const stylexSources = files.filter((f) => f?.path?.match(STYLEX_TS));
    const readSrc = (f) => (existsSync(join(root, f.path)) ? readFileSync(join(root, f.path), 'utf8') : '');
    const isData = (f) => {
      const code = readSrc(f);
      // LINE-ANCHORED (prose-proof): a real module has an import line or
      // a call site; doc comments mentioning the engine never count
      const hasImport = /^\s*import\b[^\n]*@stylexjs\/stylex/m.test(code);
      const hasCall = /stylex\.(create|defineVars|vars|include|createTheme)\s*\(/.test(code);
      return !hasImport && !hasCall;
    };
    const art = artifacts.get(key);
    if (!art) {
      if (stylexSources.length > 0 && stylexSources.every(isData)) return false; // pure data item — source delivery
      throw new Error(`registry-stylex-swap: payload item '${key}' carries .stylex.ts sources but the compiled payload has no '${key}' entry — regenerate the payload (gen-stylex-payload) before the swap`);
    }
    const stem = key.split('/').at(-1);
    // compiled entries only — data deps ride as source
    const stylexEntries = stylexSources.filter((f) => !isData(f));
    if (stylexEntries.length === 0) return false; // shouldn't happen (manifest said compiled), but stay honest
    // the css carrier: the item's OWN module — resolution ladder
    // (measured against the live registry): 1) the stem-named entry,
    // 2) an entry under the item's own directory, 3) the item's SINGLE
    // stylex entry (e.g. tokens → registry/files/lib/tokens.stylex.ts).
    // NO SILENT AMBIGUITY (the Codex r1 finding): multiple foreign
    // entries without an owner = fail loud — wiring the css onto a
    // dep's module would deliver the item css only while that dep
    // rides along.
    const ownDir = stylexEntries.filter((f) => f.path.startsWith(`registry/files/ui/${key}/`) || f.path.startsWith(`registry/files/${key}/`));
    const carrier =
      stylexEntries.find((f) => f.path.split('/').at(-1) === `${stem}.stylex.ts`) ??
      ownDir[0] ??
      (stylexEntries.length === 1 ? stylexEntries[0] : undefined);
    if (!carrier) {
      throw new Error(`registry-stylex-swap: item '${key}' has no resolvable owner carrier [${stylexEntries.map((f) => f.path).join(', ')}] — the css wiring must land on the item's OWN module (stem-named, own-dir, or single-entry)`);
    }
    const carrierDir = carrier.path.split('/').slice(0, -1).join('/');
    const carrierStem = carrier.path.split('/').at(-1).replace(STYLEX_TS, '');
    const cssPath = `${carrierDir}/${carrierStem}.stylex.css`;
    const carrierModule = `import './${carrierStem}.stylex.css';\n${art.classModule}`;

    const swappedFiles = [];
    for (const f of files) {
      if (!f?.path?.match(STYLEX_TS)) {
        swappedFiles.push(f);
        continue;
      }
      if (isData(f)) {
        swappedFiles.push(f); // the data dep rides as source (the compiled module imports it)
        continue;
      }
      const isCarrier = f === carrier;
      swappedFiles.push({
        ...f,
        path: f.path.replace(STYLEX_TS, '.stylex.js'),
        target: typeof f.target === 'string' && f.target ? f.target.replace(STYLEX_TS, '.stylex.js') : f.target,
        content: isCarrier ? carrierModule : art.classModule,
      });
    }
    swappedFiles.push({ path: cssPath, target: f_target(carrier.target, '.stylex.css'), type: 'registry:file', content: art.css });
    item.files = swappedFiles;

    // dependencies may be an array (names or name@spec) or an object map — strip every @stylexjs/*
    if (Array.isArray(item.dependencies)) {
      item.dependencies = item.dependencies.filter((d) => !d.startsWith('@stylexjs/'));
    } else if (item.dependencies && typeof item.dependencies === 'object') {
      for (const k of Object.keys(item.dependencies)) {
        if (k.startsWith('@stylexjs/')) delete item.dependencies[k];
      }
    }
    return true;
  };

  /** keep the CLI's target convention when deriving the css entry's target */
  function f_target(target, suffix) {
    if (typeof target !== 'string' || !target) return undefined;
    return target.replace(STYLEX_TS, suffix);
  }

  for (const name of readdirSync(rDir)) {
    if (!name.endsWith('.json')) continue;
    const file = join(rDir, name);
    const payload = JSON.parse(readFileSync(file, 'utf8'));
    let changed = false;
    if (Array.isArray(payload?.items)) {
      // the registry INDEX: swap each item in place
      for (const item of payload.items) changed = swapItem(item) || changed;
    } else {
      changed = swapItem(payload);
    }
    if (changed) {
      writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`);
      swapped.push(name);
    } else {
      untouched += 1;
    }
  }
  return { swapped, untouched };
}

// CLI form (build-site and verify import the function; the bin form is
// for manual re-swaps over an already-built tree)
if (process.argv[1] && process.argv[1].endsWith('registry-stylex-swap.mjs')) {
  const { fileURLToPath } = await import('node:url');
  const root = fileURLToPath(new URL('../..', import.meta.url));
  const { swapped, untouched } = swapRegistryPayloads(root);
  console.log(`[registry-stylex-swap] ${swapped.length} payload(s) swapped to compiled form, ${untouched} untouched`);
}

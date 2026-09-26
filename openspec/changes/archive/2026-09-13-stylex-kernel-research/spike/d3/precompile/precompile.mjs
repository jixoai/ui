#!/usr/bin/env node
// precompile.mjs — architecture C's KERNEL-BUILD-SIDE step (NOT in any
// consumer closure; this tool's deps price on OUR side, like the theme
// sheet generators today).
//
// What it does (the exact command lands in research/d3-consumer.md):
//   1. babel-transforms every .stylex.ts module of the corpus payload
//      (@babel/preset-typescript + @stylexjs/babel-plugin 0.19.0,
//      dev:false, minify:false — the SAME engine options the unplugin
//      path uses at consumer build time, spike-report §3) → emits the
//      compiled class-constant JS modules into arch-c/src (same
//      relative layout, .stylex.ts → .stylex.js);
//   2. collects every rule from the babel metadata and runs
//      @stylexjs/babel-plugin.processStylexRules — the SAME function
//      the unplugin's collectCss calls (unplugin lib/core.js
//      processCollectedRulesToCSS) — then lightningcss, mirroring the
//      unplugin pipeline → arch-c/src/kernel-precompiled/stylex.css.
//
// The consumer (arch-c) imports the css + the class-constant modules
// and runs the @stylexjs/stylex RUNTIME (styleq) for attrs()/dynamic
// merging — no babel, no unplugin, no transform at consumer build time.
import { transformFileSync } from '@babel/core';
import babelPlugin from '@stylexjs/babel-plugin';
import { transform as lightningTransform, browserslistToTargets } from 'lightningcss';
import browserslist from 'browserslist';
import fs from 'node:fs';
import path from 'node:path';

const HERE = import.meta.dirname;
const D3 = path.dirname(HERE);
const CORPUS_SRC = path.join(D3, '..', 'corpus', 'src'); // spike/corpus/src (the frozen payload)
const OUT_SRC = path.join(D3, 'arch-c', 'src');

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.stylex.ts')) files.push(p);
  }
})(CORPUS_SRC);
files.sort();

const allRules = [];
let emitted = 0;
for (const file of files) {
  const result = transformFileSync(file, {
    presets: [['@babel/preset-typescript', {}]],
    plugins: [
      [
        '@stylexjs/babel-plugin',
        {
          dev: false,
          minify: false,
          unstable_moduleResolution: { type: 'commonJS', rootDir: CORPUS_SRC },
        },
      ],
    ],
    filename: file,
    sourceMaps: false,
  });
  const rules = result.metadata?.stylex ?? [];
  allRules.push(...rules);
  const rel = path.relative(CORPUS_SRC, file); // e.g. families/separator/separator.stylex.ts
  const dest = path.join(OUT_SRC, rel.replace(/\.stylex\.ts$/, '.stylex.js'));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, result.code);
  emitted++;
  console.log(`compiled ${rel} (${rules.length} rules)`);
}

const collected = babelPlugin.processStylexRules(allRules, {
  useLayers: false,
});
const { code } = lightningTransform({
  targets: browserslistToTargets(browserslist()),
  filename: 'stylex.css',
  code: Buffer.from(collected),
});
const cssDest = path.join(OUT_SRC, 'kernel-precompiled');
fs.mkdirSync(cssDest, { recursive: true });
fs.writeFileSync(path.join(cssDest, 'stylex.css'), code.toString());
console.log(
  `DONE ${emitted} modules, ${allRules.length} rules -> ${path.relative(D3, cssDest)}/stylex.css (${code.length}B after lightningcss)`,
);

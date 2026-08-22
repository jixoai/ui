/**
 * Blueprint coverage lock (test/blueprints.spec.ts, 2026-08-22).
 *
 * The satori pipeline (scripts/build-blueprints.mjs) renders one gray
 * blueprint SVG per catalog entry from the scene components in
 * src/lib/blueprints/scenes/. The overview cards EMBED those SVGs as
 * their body — a missing asset means a hatch-fallback card shipped
 * silently. This suite locks both directions:
 *
 *   catalog entry ─ must have ─▶ scenes/<name>.svelte
 *   catalog entry ─ must have ─▶ static/blueprints/<name>.svg (committed)
 *
 * plus orphan cleanliness (no scene/svg without a catalog entry). If
 * this fails after adding a registry item: write the scene, run
 * `npm run build:blueprints` at the repo root, commit the SVG.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CATALOG } from '../src/lib/catalog';

const wwwRoot = resolve(fileURLToPath(import.meta.url), '../..');
const scenesDir = resolve(wwwRoot, 'src/lib/blueprints/scenes');
const svgsDir = resolve(wwwRoot, 'static/blueprints');

const sceneFiles = () =>
  new Set(
    readdirSync(scenesDir)
      .filter((f) => f.endsWith('.svelte') && !f.startsWith('_'))
      .map((f) => f.replace(/\.svelte$/, '')),
  );
const svgFiles = () =>
  new Set(
    readdirSync(svgsDir)
      .filter((f) => f.endsWith('.svg'))
      .map((f) => f.replace(/\.svg$/, '')),
  );

describe('blueprint pipeline coverage', () => {
  it('every catalog entry has a scene component (nothing unrenderable)', () => {
    const scenes = sceneFiles();
    const missing = CATALOG.map((e) => e.name).filter((name) => !scenes.has(name));
    expect(missing, 'catalog entries without scenes/<name>.svelte').toEqual([]);
  });

  it('every catalog entry has a committed blueprint SVG (run npm run build:blueprints)', () => {
    const svgs = svgFiles();
    const missing = CATALOG.map((e) => e.name).filter((name) => !svgs.has(name));
    expect(missing, 'catalog entries without static/blueprints/<name>.svg').toEqual([]);
  });

  it('scene files are not empty stubs', () => {
    for (const name of CATALOG.map((e) => e.name)) {
      const source = readFileSync(resolve(scenesDir, `${name}.svelte`), 'utf8');
      expect(source.length, `${name}.svelte looks empty`).toBeGreaterThan(40);
    }
  });

  it('no orphan scenes or SVGs (both directions locked)', () => {
    const names = new Set(CATALOG.map((e) => e.name));
    const orphanScenes = [...sceneFiles()].filter((n) => !names.has(n));
    const orphanSvgs = [...svgFiles()].filter((n) => !names.has(n));
    expect(orphanScenes, 'scene files without a catalog entry').toEqual([]);
    expect(orphanSvgs, 'blueprint SVGs without a catalog entry').toEqual([]);
  });

  it('generated SVGs are real vector scenes, not empty canvases', () => {
    // the empty-canvas failure mode (satori silently dropping subtrees)
    // produced ~250 byte files — a real scene carries glyph paths
    for (const name of CATALOG.map((e) => e.name)) {
      const svg = readFileSync(resolve(svgsDir, `${name}.svg`), 'utf8');
      expect(svg.length, `${name}.svg is suspiciously small — rerun build:blueprints`).toBeGreaterThan(600);
    }
  });

  it('the gallery route is registered in svelte.config entries', () => {
    const config = readFileSync(resolve(wwwRoot, 'svelte.config.js'), 'utf8');
    expect(config).toContain("'/blueprints.html'");
    expect(existsSync(resolve(wwwRoot, 'src/routes/blueprints.html/+page.svelte'))).toBe(true);
  });
});

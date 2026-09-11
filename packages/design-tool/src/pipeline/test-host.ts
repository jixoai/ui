/**
 * test-host.ts — the consumer-shaped host fixture for the pipeline
 * tests (r2 rev2): a tmp tree with components.json + a two-item ui
 * dir (an index-entry item and a bare .svelte item) + the checkout
 * prototype, all committed in a nested design repo with the r1
 * release tag. TEST SUPPORT ONLY — never imported by product code.
 *
 * Original need: design-studio r2 rev2 (2026-09-11) — promote/apply
 * tests need a probe-detectable host whose design/ carries a real
 * git history (save + release) without touching the repository.
 */

import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { initDesignRepo, releaseDesignTag, saveDesignCommit } from './design-repo.ts';
import type { ReleaseTag } from './design-repo.ts';

/** the prototype page source (imports both ui items through #jixoai/) */
export const HERO_SOURCE = `<script module lang="ts">
  import PressButton from '#jixoai/press-button';
  import Badge from '#jixoai/badge';
</script>

<main class="hero">
  <Badge variant="outline">checkout</Badge>
  <PressButton variant="fill">Deploy</PressButton>
</main>
`;

/** the prototype component source */
export const CTA_SOURCE = `<script module lang="ts">
  import PressButton from '#jixoai/press-button';
</script>

<div class="cta"><PressButton variant="tonal">Ship</PressButton></div>
`;

/** canvas source — never promoted (outside pages/ and components/) */
export const CANVAS_SOURCE = `<script module lang="ts">
  import { PrototypeCanvas } from '#jixoai/prototype-kit';
</script>
`;

export interface TestHost {
  /** the host root (probe-able: consumer kind) */
  readonly root: string;
  readonly protoDir: string;
  readonly heroPath: string;
  readonly ctaPath: string;
  readonly promotedHeroPath: string;
  readonly promotedCtaPath: string;
  readonly designDir: string;
  /** the r1 release tag the fixture was saved+released under */
  readonly r1: ReleaseTag;
}

/**
 * Build the seeded host: ui items + prototype + a design repo with
 * the r1 release. Caller disposes (rmSync).
 */
export function buildTestHost(proto = 'checkout'): TestHost {
  const root = mkdtempSync(join(tmpdir(), 'design-pipeline-'));
  // the consumer's ui tree (components.json aliases.ui → src/lib/ui)
  mkdirSync(join(root, 'src/lib/ui/press-button'), { recursive: true });
  mkdirSync(join(root, 'src/lib/ui/badge'), { recursive: true });
  writeFileSync(join(root, 'src/lib/ui/press-button/index.ts'), 'export default 1;\n', 'utf8');
  writeFileSync(join(root, 'src/lib/ui/badge/badge.svelte'), '<span>badge</span>\n', 'utf8');
  writeFileSync(
    join(root, 'components.json'),
    JSON.stringify({ aliases: { ui: 'src/lib/ui', lib: 'src/lib' } }, null, 2),
    'utf8',
  );
  // the prototype
  const protoDir = join(root, 'design/prototypes', proto);
  mkdirSync(join(protoDir, 'pages'), { recursive: true });
  mkdirSync(join(protoDir, 'components'), { recursive: true });
  writeFileSync(join(protoDir, 'canvas.svelte'), CANVAS_SOURCE, 'utf8');
  writeFileSync(join(protoDir, 'pages/hero.svelte'), HERO_SOURCE, 'utf8');
  writeFileSync(join(protoDir, 'components/cta.svelte'), CTA_SOURCE, 'utf8');
  // the design history: init → wip save → r1 release
  const { designDir } = initDesignRepo(root);
  saveDesignCommit(root, proto, 'seed');
  const { tag } = releaseDesignTag(root, 'r1', 'first release');
  return {
    root,
    protoDir,
    designDir,
    heroPath: join(protoDir, 'pages/hero.svelte'),
    ctaPath: join(protoDir, 'components/cta.svelte'),
    promotedHeroPath: join(root, 'src/lib/design', proto, 'pages/hero.svelte'),
    promotedCtaPath: join(root, 'src/lib/design', proto, 'components/cta.svelte'),
    r1: tag,
  };
}

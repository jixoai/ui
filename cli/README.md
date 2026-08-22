# jixoai-ui CLI

The official jixoai design-language CLI. It **shares shadcn's
`components.json`** and extends it with a non-conflicting `jixoai` block:

```jsonc
{
  // ...shadcn fields stay untouched (style, aliases, registries, ...)...
  "registries": { "@jixoai": "https://ui.jixoai.com/r/{name}.json" },
  "jixoai": { "brandHue": 160 }
}
```

## Usage

```bash
npx jixoai-ui init --hue 160   # namespace + config + theme + hue, one shot
npx jixoai-ui add toc          # = shadcn add @jixoai/toc, hue re-applied
npx jixoai-ui add llms-txt     # AI export: llms.txt / llms-full.txt / page .md
npx jixoai-ui upgrade          # refresh locked items + run upgrade tasks
npx jixoai-ui hue 165          # retheme by changing one number
npx jixoai-ui config           # print the resolved jixoai config
```

`llms-txt` installs `vite-plugins/llms-txt.mjs` — the build-time
llms.txt/llms-full.txt/per-page-`.md` generator (llmstxt.org proposal
v2). Wire it ONE way: `llmsTxt()` in vite plugins for plain-build sites,
or `generateLlmsTxt(distDir, config)` as the last step of an orchestrated
build. Full law + config schema:
`skills/jixoai-website/references/llms-txt.md`.

Requires `components.json` (run `npx shadcn init` first in fresh projects —
this CLI extends shadcn's config, it never replaces it).

## upgrade

`npx jixoai-ui upgrade` pulls the latest version of every installed
component and runs the idempotent upgrade tasks. Running it again changes
nothing — a converged second run performs zero writes, so it is safe in CI
and in any shell loop.

- **Lock**: `init`/`add` record every installed item in `jixoai-ui.lock`
  (next to `components.json`) as
  `{ items: { [name]: { files: { [path]: sha256 } } } }`. Paths are resolved
  through `components.json` aliases; hashes cover canonical registry content
  (pre-hue, pre-task). A missing or empty lock fails with exit code 1 and
  tells you to `add` first.
- **Refresh**: every locked item is fetched from `registries["@jixoai"]`
  with `{name}` replaced (`file://` URLs work for local registries). A file
  is written only when its registry sha256 differs from the locked one;
  identical content is skipped and counted as unchanged. Network, HTTP, and
  JSON failures abort with an explicit error and exit code 1.
- **Hue**: after the writes the brand hue is re-applied to `jixoai.css`.
- **Tasks**: `bin/upgrade-tasks.mjs` exports the task array
  `[{ name, item?, applies(content, ctx), run(ctx) }]`. A task fires only
  while its legacy pattern still exists (`applies`), so re-running always
  converges:
  - `legacy-import-paths` — `@lib/toc-engine` → `$lib/toc-engine` and
    `../lib/toc.css` → `$lib/toc.css` (only where the old specifier exists).
  - `spine-axis` (item `toc`) — `left: 2px` → `left: 0px` in the toc css.
  - `scroll-margin-cleanup` — diagnostic only: warns when the app-level css
    declares both `scroll-margin-top` and `scroll-padding-top` (the offsets
    stack; which one owns the offset is an app decision jixoai-ui never
    makes for you). It never edits files, so it re-reports on every run
    until the redundancy is removed.
- **Summary**: `updated N / unchanged M / tasks ran X, skipped Y`, then the
  lock hashes are updated.

CI usage — always upgrade, build, and test against the freshest components:

```bash
npx jixoai-ui upgrade && npm run build && npm test
```

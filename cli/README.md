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
npx jixoai-ui hue 165          # retheme by changing one number
npx jixoai-ui config           # print the resolved jixoai config
```

Requires `components.json` (run `npx shadcn init` first in fresh projects —
this CLI extends shadcn's config, it never replaces it).

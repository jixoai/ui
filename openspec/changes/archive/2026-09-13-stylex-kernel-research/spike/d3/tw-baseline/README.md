# d3/tw-baseline — the TW4-today consumer

D3 fixture (change 2026-09-13-stylex-kernel-research, design §4 D3). The BASELINE
configuration: vite 8 + svelte 5 empty-shell consumer carrying the 8 frozen families in
their TW forms (registry/files closure copy, `$lib/` imports rewritten relative) + TW4
wiring = `@tailwindcss/vite` plugin line (vite.config.ts) + `./app.css` import (main.ts).

Payload trims (disclosed, research/d3-consumer.md §scope):
- code-card highlight seam → plain-text null backend (no highlight engine in ANY config)
- jixoai.css @fontsource imports neutralized (no font files in ANY config)

## Exact rerun

```bash
cd spike/d3/tw-baseline
npm ci                       # from the committed package-lock.json
npx vite build               # the timed build command
```

Environment pins: node v24.21.0, npm 11.19.0, svelte 5.57.0, vite 8.3.0,
@sveltejs/vite-plugin-svelte 7.3.0, tailwindcss + @tailwindcss/vite 4.3.3,
clsx 2.1.1, tailwind-merge 3.6.0, typescript 5.9.3 (exact, no ^).

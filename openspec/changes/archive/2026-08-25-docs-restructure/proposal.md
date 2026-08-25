# docs restructure — the learning-path tree (/docs.html, three-section spine)

> Original request (2026-08-25, Owner): "新增新入口 docs.html；把
> components.html 重构成 docs/components.html，因为现在这些页面已经
> 不是单纯 components 的行为了" — grouped after shadcn's docs model,
> centered on the learning path ("重点是学习思路"). The IA settled
> through five Owner direction rounds against a LIVE prototype
> (/prototype-docs, dev server :5199); quotes are pinned in each
> section. Ruling: "我觉得你可以和 Codex 展开详细切实的可落地的方案了"
> — this change is that plan.

## Why

components.html has outgrown its name: it carries the catalog, the
guides, the engine docs and every planned getting-started page, but its
IA is a flat antd-taxonomy dump. The docs need a spine that answers
"where do I start, what exists, how is it distributed" — Sections /
Components / Registry — with every page reachable in a reading order
(prev/next) and every install target discoverable (the registry
inventory). The prototype settled the structure; this change lands it
as the real /docs tree and retires the prototype.

## What Changes

### 1. The three-section spine (settled through five Owner rounds)

Final shape (prototype = ground truth, `/prototype-docs`):

```
Sections    章节 — curriculum: introduction / installation / usage·CLI
                     (planned) · theming & tokens (→ tokens) ·
                     where wrapping stops · recipes (→ recipes) ·
                     jx-pure · the componentless face (→ jx-pure)
Components  组件 — the UI-module inventory: registry:ui ONLY (73),
                     antd taxonomy groups with counts
Registry    生态 — protocol info: registry overview (the installable
                     inventory table) · registry.json ·
                     registry-item.json (planned) · llms-txt
```

Decision journey (Owner quotes, pinned):

- "分成：Sections、Components、Get Started、Registry。本质是：
  Sections=大方向的章节…Components=罗列所有模块、Get Started=
  提供入口相关的信息、Registry=提供生态相关的信息" — the original
  four-group model; nav IS the sections.
- "这个 GUIDE 有点奇怪，recipes 这个章节什么作用？" → the Guides
  chapter was a junk drawer; recipes is the boundary contract.
- "js-pure 不该属于 components，它应该独立成为一个章节" → jx-pure
  (the componentless face, Tier 0) leaves the component listing.
- "lib 也要迁移一下" → ALL non-UI items leave Components.
- "Engines 这个你想表达什么内容？我有点懵，怎么 native-form 都进来？"
  → an Engines nav chapter is structurally wrong: the 11 non-UI items
  are install targets, not doc destinations (only llms-txt has a
  standalone page; native-form's page IS jx-pure's; toc-outline rides
  an anchor of scroll-area's page). Engines dissolves.
- "把 GET STARTED 改成 Sections，然后Boundary和 JX-Pure 挪到 Sections
  这里会更好一些" → the settled spine above: Boundary + jx-pure are
  curriculum chapters under Sections.

### 2. Route migration（r1 修正：基数终律见 design.md P0）

- `/docs.html` — new docs entry (the learning path home).
- `/docs/components.html` — the catalog (current components.html
  content, CardGrid + overview cards).
- `/docs/components/<name>.html` — **73 canonical pages**: 58 one-to-one
  dirs move; form.html SPLITS into 13 item pages (+ a family hub that
  keeps the historical fragments and is NOT in the inventory);
  scroll-area.html splits into scroll-area + scroll-virtual.
- registry.json `meta.href` rewritten per item (unique canonical page);
  catalog.ts + catalog.spec.ts locks follow; `npm run build` (shadcn)
  regenerates payloads; llms.txt output + its spec follow (and its
  section config drops the old dirs).
- Old routes: generated static redirect shells via
  legacy-doc-routes.json + a build-site emitter (design.md D1).
- svelte.config entries rebuilt from the route model (crawl:false
  enumerates every page explicitly).

### 3. Top nav (prototype → production)

Keep the Components pill (catalog mega panel, click-open — the
2026-08-25 click-toggle law) and add a Docs pill whose second-level
panel lists the SECTIONS. The prototype gate in +layout.svelte
(protoItems) becomes the single real items model. PAGE_ORDER (view
transition carousel) extends — D8.

### 4. The docs sidebar

A sections nav (single data source: the docs route model) rendering on
all /docs routes. Chrome integration — D2: in-content two-column
(prototype form) vs the website-scaffold tree cell (ComponentTreeNav's
slot, with its mobile bar + immersive hide laws). ComponentTreeNav's
fate on docs routes (replaced by the sections nav?) and on the tokens
route (kept?) is part of D2.

### 5. Page relations

- prev/next pager along the antd taxonomy reading order (73 ui modules
  chain; first/last fall back to "all components" / "docs home").
- related links: same-group neighbors + the Sections chapter links.
- breadcrumb: docs / components / group / name.

### 6. Type-driven section lock + registry overview page

- The docs route model derives sections from catalog TYPES:
  registry:ui → Components; non-UI → install targets with NO nav
  presence, documented via host pages.
- New lock tests: a lib/theme/file can never appear under Components
  nav; every registry:ui appears exactly once; the prev/next chain
  covers all 73; host-page hrefs resolve.
- The registry overview page (prototype: /prototype-docs/registry)
  carries the installable inventory table (name · type · documented-on
  host · install command) — the install targets' one discoverable
  surface.

### 7. Taxonomy review (Owner, 2026-08-25: "Feedback 这个应该是 Layer 吧？")

Feedback's 15 members split ~10 floating surfaces (dialog, popover,
tooltip, sheet, hover-card, alert-dialog, popconfirm, command, toast,
tour?) from ~5 true feedback states (alert, progress, skeleton, spin,
result). Candidate: a Layer 浮层 group + a slimmed Feedback group —
registry.json meta.group rewrite + catalog.spec + nav counts follow.
D3 rules the split, its exact member assignment and ids.

### 8. Planned pages（r1 裁决：不发布）

introduction / installation / usage·CLI / registry-item.json do NOT
enter production docsSections until real content exists (public stubs
would pollute llms.txt as incomplete docs — Codex r1 rejection of the
original lean). The prototype keeps them as preview-only entries.

### 9. Prototype retirement

The /prototype-docs surface (+ the layout prototype gate) is deleted
when the real tree lands; its docs-structure model migrates to the
production route model.

## Impact（r1 审计并入——Codex 实证，ZCode 交叉核验）

- apps/www/src/routes: 63 dirs move/split into 73 canonical pages +
  form family hub; new docs.html, docs/registry; +layout.svelte items
  model + prototype gate removal
- apps/www/svelte.config.js:16 — static prerender entries rebuilt from
  the route model (crawl:false enumerates every page)
- scripts/build-site.mjs — dist assertions (:64), llms sections config
  (:107), + the D1 redirect-shell emitter
- scripts/capture-baseline.mjs:24 — route discovery scans
  routes/components (retarget or it shoots nothing)
- 10 Playwright verify scripts hardcode old paths: verify-layer-law,
  verify-hook-law, verify-jx-pure(×2), verify-press, verify-trygrid,
  verify-surface, gen-mirror-manifest…
- catalog.ts + catalog.spec.ts (href existence + group locks), new
  docs-route-model lock spec (source route + built canonical HTML +
  href-path uniqueness + legacy manifest)
- llms.txt generation + test/llms-txt.spec.ts; test/batch3:27 fixed
  href; homepage +page.svelte:144 + components.html:26 copy;
  apps/www/docs/PAGE_STANDARDS.md:15
- registry.json (meta.href × every item; meta.group per D3) + shadcn
  payloads + registry-payload-parity
- view-transition PAGE_ORDER + single-active-pill law (D8), scroll
  memory, hash ladder
- blueprint scenes hardcoding nav hrefs (terminal-header, breadcrumb)
- shots-site/ exists but is empty — no historical shots to migrate

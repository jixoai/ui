# docs-restructure — verification (the evidence index)

> 状态：r1 实现完成（3 commits：cfa33c8 spec / ecb17d4 card /
> b0908f2 docs 主体）；Codex 实现复核轮进行中（结果回填于下）。

## P0 — 73 canonical pages

- `ls apps/www/src/routes/docs/components | grep -c '\.html'` = 74
  (73 items + form family hub)
- registry cardinality script: 73 registry:ui → 73 DISTINCT canonical
  paths (locked in test/docs-structure.spec.ts)
- form split (subagent, cross-verified): 13 pages × (+page.svelte
  +page.ts), `npx vite build` prerendered all 14 family routes;
  historical anchors #all-types / #select-textarea / #example-form /
  #native-base present in prerendered form.html (grep PASS ×4)
- scroll split: scroll-virtual.html carries the 100k-row canvas +
  playground; scroll-area.html keeps native/overlay + toc-metadata,
  `#virtual-scrolling` anchor lands on the sibling card

## D1 — legacy shells

- legacy-doc-routes.json: 64 frozen routes; coverage script asserted
  every old registry path ⊆ manifest (generation-time assert)
- build-site emitter: `npm run build:site` log "legacy shells: 64
  emitted";抽查 public/components/form.html — meta refresh(0) +
  canonical → /docs/components/form.html + robots noindex,follow +
  `location.replace(to + location.hash)`
- llms.txt: 83 pages, `grep -c "ui.jixoai.com/components"` = 0（零旧路径），
  80 条 /docs 链接

## D2/D8 — chrome + pills

- component-tree-nav.svelte `git rm`'d；docs-sections-nav 渲染于
  data-area="tree"（浏览器 DOM count=1 visible=true @1440）
- PAGE_ORDER = ['/', '/docs', '/docs/components', '/tokens']；单 active
  律在 items 派生中（isComponentsTree）
- 布局级 DocsPager：input.html 实测 prev=tour（layer→data-entry 跨组
  链序正确）/ next=select / related=select,textarea,checkbox,radio
  （nearest-first）；form hub 与目录页正确无 pager

## D3 — taxonomy

- registry.json：10 条 group→layer（design 逐成员表执行）；
  docs-structure.spec 锁 layer 位置 = navigation+1、engines 组消失
- 浏览器：/docs/components.html 出现 "Layer 浮层" 标题 + dialog 卡片

## 测试与构建门禁

- `npm test`：**335/335**（327 基线 + 8 新锁）
- `npm run build:site`：**7/7**（vite+prerender 73 页、64 壳、
  shadcn 86 文件、llms 83 页）
- `npm run build:blueprints`：场景 href 迁移后重渲（15.0s）
- 浏览器 SSR 走查 5 页全过（docs home / catalog / input 拆分页 /
  form hub / registry inventory）

## 子代理交叉核验（编排协议）

- #1 form-split：13 页实存、prerender 13/13、锚点 4/4、改动集 28
  文件无越权；反馈的摩擦点（Svelte 属性 `{start,end}` 表达式坑、
  catalog 导出名偏差）已记录
- #2 链迁移：10 脚本 node --check 全过；capture-baseline 三层扫描
  静态模拟 83 unique；残留 4 处中 2 处归 ZCode（catalog.ts:93 报错
  文案、layout 过时注释——均已修复入库），1 处 lib 目录 import 非
  路由，1 处为自写注释

## Codex 复核轮（r2 → 修复）

- **r2 评分 7.2/10（↑0.8 vs design 轮 6.4）**，17m57s，gpt-5.6-terra
  xhigh；完整结论存 review-r2.md。主体认可：「实现主体比设计轮成熟
  得多」，73 canonical、拆分、壳、Layer 归类、llms 镜像全实证落地。
- **三个 P1 全部修复**：
  1. 目录页数据源 → docsComponentGroups（73 卡；engines/guides 分区
     消失；toc 同步）+ 源守卫锁 + dist 锚点锁（catalog.spec 同步）
  2. isComponentsTree → $derived（SPA 跳转后单 active 律保持；初始
     态浏览器实测：组件页 Components active / registry 页 Docs active）
  3. 锁闭环：manifest 快照全等（64 冻结旧世界 + to-可达性）+ entries
     精确集（missing/extra diff）+ dist 页面闭环 + **emitter 四件套
     自检**（emit 时点，零竞态）+ **md 镜像自检**（generation 时点）
- **r2 过程发现的环境事实**：共享工作树上另一 Agent 并发 build 会让
  vitest 读到 public/ 半写产物（实测复现：字节包含而断言失败的假象）
  ——架构修正：vitest 产物锁只查 dist/，public/ 契约由 build-site
  自检承担（同时机无竞态）
- 修复后门禁：**338/338**（含 11 项结构锁）+ build:site 7/7（自检
  全过）+ 浏览器行为复验 6/6

## Codex r3（确认轮）

- **8.3/10（↑1.1）**，14m49s；完整结论 review-r3.md
- 判定：P1-1 fixed（curl 实证 73 UI 全等、utils/toc-engine/guides=0）、
  P1-2 fixed（$derived 实证）、P1-3 partial——快照曾从活 catalog 推导
- r3 修复（本轮）：**冻结字面量快照**（64 条 from 写死在测试内，
  不再随 catalog 演化——未来新组件不再错误要求 legacy 壳）；
  md 镜像自检扩展到 hub + sections/registry 页；P2 两项
  （entries 单一来源生成器、dist/md 内容级 parity）记为显性债务
  （tasks #16）
- 终态门禁：338/338、build:site 7/7（自检 0 失败）、锁 18 项全绿

# ghostty-term — the live terminal surface, powered by libghostty-vt wasm

## Why

jixoai 的理念：我们能做到的，就别让用户自己去组装 (Owner directive,
2026-08-28)。今天一个 SvelteKit 站点想要"真正的终端面"（文档演示、web
shell、日志流），只能自己在 xterm.js + canvas + 字体 + pty 管线里组装。
Ghostty 上游已经在 GitHub releases 发布 `ghostty-vt.wasm`
（libghostty-vt 的 wasm 构建：VT 解析内核 + render-state 脏行迭代 +
key/mouse 编码器 + 快照，~981KB，`ghostty-vt-small.wasm` ~711KB）。我们把
它接进 jixoai 体系，交付一个 `ghostty-term` 组件：消费者 `shadcn add`
+ 装一个 vite 插件，即得到一块活的终端画布。

Owner 提出的两个直接问题，本 change 给出答案：

1. **vite@8 会自动识别 wasm 并迁移到 dist 吗？** — 只在 wasm 位于模块图
   内时（`import x from './x.wasm'` / `?url` / `?init`；vite 8 还把
   `?init` 扩到了 SSR）。CI/构建期从 release 抓下来的文件**不在模块图
   里**，vite 不会搬运；SSR 构建默认也不 emit 客户端资产。所以必须有
   插件：dev 中间件 + build `emitFile` + 把 URL 交给代码的虚拟模块。
   这正是 `packages/vite-plugin` 的存在意义（design.md D1/D3）。
2. **components 分组方式** — 新设 `terminal` 分组（品牌原生面），
   `ghostty-term` 入驻，并把散落的 `terminal-card`（data-display）、
   `terminal-header` / `terminal-footer`（layout）迁入，导航与目录由
   CATALOG 自动派生（design.md D6）。

## What

- **`packages/vite-plugin`（新 npm 包 `@jixoai/vite-plugin`）** —
  `jixoaiGhostty()` vite 插件：解析 wasm 来源（env 覆盖 → sha256 校验
  缓存 → 按 pin 下载并校验），dev 以中间件伺服，build 以 `emitFile`
  落进 dist（hash 即 sha256 前缀，天然长缓存），并向组件暴露虚拟模块
  `virtual:jixoai-ghostty`（`{ url, sha256, variant, version }`，
  纯数据、SSR 安全）。零运行时依赖。
- **ghostty wasm 供给链（GitHub Actions）** — 仓库提交 **pin 清单**
  （url/version/sha256/size），二进制不进 git。新 workflow
  `ghostty-wasm-sync.yml`（定时 + 手动）：下载 tip release 的两个变体
  → `WebAssembly.validate` + node ABI 冒烟探针（terminal_new / vt_write
  / render_state 迭代）→ 通过才更新 pin 并开 PR。deploy 构建
  `actions/cache` 按 sha256 键缓存 wasm，网络只走一次且永远校验。
- **`ghostty-vt`（registry:lib，framework-free）** — wasm ABI 绑定层：
  运行时解析 `ghostty_type_json()` 类型布局（零硬编码 offset，抗 ABI
  漂移），封装 terminal 生命周期 / vt_write / resize /
  render-state 脏行与单元格迭代（含 style/grapheme/hyperlink）/
  key 编码 / paste 安全门 / build_info。`loadGhosttyVT({ url | bytes })`
  显式注入来源——lib 本体不 import 虚拟模块，node 可测。
- **`ghostty-term`（registry:ui，Svelte 5）** — canvas 2D 渲染器：
  DPR 感知单元格网格、脏行重绘、SGR 基本面（bold/italic/underline/
  reverse/fg/bg/调色板）、宽字符与 grapheme、JetBrains Mono
  （theme 既有依赖）+ `document.fonts.ready` 后首测、OKLCH token →
  canvas sRGB（复用 `lib/color-utils.ts`）、ResizeObserver →
  cols/rows → `terminal_resize`、键盘 → key encoder → `onData` 字节
  回调（pty 是消费者的线）、paste 走 `ghostty_paste_is_safe`、
  viewport 滚动走 `terminal_scroll_viewport`。遵守既有法则：
  native-element-first（canvas 即原生元素）、`data-jx-ghostty-term`
  钩子、composition-first props、density 内核参与（design.md D5）。
- **分组迁移** — `terminal` 组：`ghostty-term`（新）+ `terminal-card`
  + `terminal-header` + `terminal-footer`（迁入）；registry.json
  `meta.group` + www `CATALOG_GROUPS` 各一行级改动，href 不变。
- **www 集成** — apps/www 装插件（npm `file:` 依赖，CI 零网络）、
  same-source 镜像新文件、mirror manifest 再生、新文档页 + 回环
  demo pty（页面内 canned VT 场景 + 输入回显，无网络依赖）。

## Non-goals（V1 明确不做）

鼠标上报、OSC 52 / hyperlink 交互 UI、快照恢复 UI、scrollback 完整
交互（V1 仅 viewport 滚动）、kitty 图片、搜索、ligature（mono 网格按
cell 绘制）。留待后续 change，避免首期失焦。

## Verification highlights

- 插件：vitest —— build emit 断言（vite `build()` 编程调用）、dev
  中间件 fetch 断言、sha256 不匹配报错、env 覆盖。
- 绑定层：node 直载 bytes —— plain-text formatter 黄金输出、脏行迭代
  形状、Enter 键编码黄金值、type_json 解析。
- 组件：jsdom 逻辑级（网格度量、resize 映射）+ 站点构建后
  playwright/computed 探针 + ZCode 内置浏览器真实渲染验收（像素级
  文本呈现、暗色 token、resize 行为）。
- 既有门禁全绿：svelte-check / vitest / verify:surface /
  verify:mirror / verify:hook-law / build:site / docs-structure
  快照更新。
- Codex 里程碑复核闭环（change 文档冻结 → 实现 → 复核评分迭代）。

## Codex

Phase 0 change 文档冻结评审（本 change 的门），实现里程碑按标准闭环
（review-rN.md 归档）。

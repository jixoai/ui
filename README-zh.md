<!--
Orthogonal intents (maintained 2026-09-06; original user request 2026-09-06
Asia/Shanghai: 所有站点需要至少提供中英两种语言的支持，这需要同步更新所有
的 README.md，提供 README-zh.md 等):
1. Faithful zh mirror of README.md: identical structure, tables, and code
   blocks; prose translated only.
2. Top language cross-links keep the zh↔en pair discoverable (the
   unipty/opendweb README pair convention).
-->

# jixoai-ui

[English](README.md) | 简体中文

jixoai 设计语言，以 [shadcn registry](https://ui.shadcn.com/docs/registry) 形式
分发。终端/新粗野主义、等宽优先、每个项目只带一个品牌色相的 OKLCH 令牌法则。
这里的一切都毕业自 [unipty](https://unipty.jixoai.com) 与
[openspecui](https://www.openspecui.com) 的生产实践。

> 正交意图（2026-08-20）：设计语言 registry；消费者工效；Owner 托管。
> registry 是唯一事实源；文档站（后来的 `apps/`）只是浏览它。

## 消费

把命名空间加进你的 `components.json`，然后添加条目：

```bash
npx shadcn add @jixoai/press-button
# 或用 CLI：npx jixoai-ui add effects        （整个分组）
#           npx jixoai-ui add effects/glass  （单个成员）
```

```jsonc
// components.json
{
  "registries": {
    "@jixoai": "https://ui.jixoai.com/r/{name}.json"
  }
}
```

### 前置条件：Tailwind v4 + jixoai 入口（registry:ui 条目）

`registry:ui` 条目基于 Tailwind v4 与 jixoai 令牌表以 utility 方式编写。你的
项目需要一个 css 入口，且顺序必须是下面这个精确顺序（主题会随每个条目的
`registryDependencies` 自动到达）：

```css
@import 'tailwindcss';
@import './lib/jixoai.css'; /* delivered by @jixoai/jixoai-theme */
/* optional: @import './lib/jx-pure.css'; — the componentless face */
```

此外还需要 devDependencies 里有 `tailwindcss` + `@tailwindcss/vite`（v4）并接好
vite 插件。检查脚本在本仓库（`scripts/check-tw4-prereq.mjs`）——把它拷走，或
直接从某个 checkout 在你的项目里运行；每一块缺失它都会以命名修复项报错。

安装后的布局是文件夹形的：每个 ui 条目落在 `src/lib/ui/<name>/**`，带一个纯
桶文件 `index.ts`（`import X from '$lib/ui/<name>'`），并且在设计法则要求手写
css 的地方有一个同目录的 `<name>.css`（仅标准 CSS——`@layer components` +
`:where()`，经规范化 layer 序言做到顺序无关；消费者 utility 永远压过组件
paint）。引擎与主题条目保持框架无关。

### 标记契约：语义钩子是 `data-jx-*` 属性

组件标记把 css 持有的选择器名作为 class（状态机、表面——例如
`.jx-toggle-track`、`.jx-sheet`），而每个无 css 的语义锚点都是 `data-jx-*`
属性。**破坏性变更（2026-08-25，data-jx-hooks）**：旧的无 css `.jx-*` 钩子
class 已移除——不保留任何兼容 class。查询迁移：

```js
// before (hook-class era)          // after
document.querySelector('.jx-kbd')   document.querySelector('[data-jx-kbd]')
'.jx-badge-destructive'             '[data-jx-badge="tonal"]'  // ladder variant = valued attribute
el.classList.add('jx-foo')          el.setAttribute('data-jx-foo', '')
el.classList.contains('jx-foo')     el.hasAttribute('data-jx-foo')
```

变体族收敛为一个带值属性（`data-jx-badge={variant}`——阶梯是
`fill | tonal | outline`，永远不是语义色名；错误状态 = `variant="tonal"` +
`jx-hue-error` 注入）——当裸的基础钩子与该族共存时
（`jx-alert jx-alert-${variant}`），它们合并进这同一个带值属性
（`[data-jx-alert]` 仍按存在性匹配）；部件锚点保持布尔形态
（`data-jx-badge-title`）。本仓库自带的审计器：
`scripts/jx-inventory.mjs`（结构化扫描）和
`scripts/verify-hook-law.mjs --post`（出现任何无 css 的 `jx-*` 令牌或命名空间
遮蔽即失败）。

## 目录

| 条目 | 类型 | 是什么 |
| ---- | ---- | ------ |
| `jixoai-theme` | `registry:theme` | 完整的 OKLCH 令牌表（明/暗、硬阴影、圆角法则、字体）与 `--brand-hue` 法则——每个项目只改一个数字 |
| `toc-engine` | `registry:lib` | 框架无关的 ToC 几何引擎：IoM 权重（`intersection / min(block, viewport)`）、行选取（viewport 顶行，margin 向下解析）、76px 移动端行偏移 |
| `reveal` | `registry:lib` | 滚动显现 action：静态 `data-reveal` 钩子法则、delay/rise 级联、减弱动效安全 |
| `press-button` | `registry:ui` | 粗野主义按压物理按钮 |
| `section-card` | `registry:ui` | 眉题/标题/摘要内容卡（站点语法原子） |
| `terminal-header` | `registry:ui` | 终端条站点头（品牌 + 导航胶囊 + 主题槽） |
| `terminal-footer` | `registry:ui` | 幽灵字标页脚 |
| `theme-toggle` | `registry:ui` | light / dark / system 切换器，无闪烁引导 |
| `toc` | `registry:ui` | Combo ToC：桌面端 Rule Tracker（书脊 + 权重驱动节点）+ 移动端 Terminal Rail（玻璃单行视口，展开只变高、随行驱动） |

组件以 Svelte 5 为先（所有 jixoai 站点都是 SvelteKit）；引擎与主题框架无关。
非 Svelte 消费者仍可安装 `jixoai-theme` 与 `toc-engine`。

## 开发

```bash
pnpm install

pnpm dev                # the site + live registry development:
                        #   registry/files ⇄ apps/www/src/lib mirror sync
                        #   (edit either side, the other receives the bytes,
                        #   vite HMR picks it up) + vite dev on :5199
pnpm dev --prod         # dev server in production mode + the
                        # experimental client bundle strategy (single;
                        # JIXOAI_BUNDLE=split|single|inline to pick)
pnpm build              # full deployable artifact → public/ (site +
                        # /r/*.json registry payloads + llms.txt exports)
pnpm build:registry     # just the shadcn payloads → public/r/*.json

bun run --bun dev       # the whole chain under bun instead of node
                        # (runtime-transparent scripts: children spawn
                        # from process.execPath, nothing hardcodes node)
```

条目源码位于 `registry/files/…` 之下；`registry.json` 是索引。条目之间的依赖
使用 `registryDependencies`。

## Owner 待办（阻塞首次发布）

- [x] 创建 GitHub 仓库 `jixoai/ui`（品牌名 jixoai-ui）并推送（公开；中央
      registry 索引只列出公开命名空间，但去中心化托管两种方式都能工作——
      私有仓库需要付费版 Pages）
- [ ] 把 `ui.jixoai.com` 的 CNAME 指向 GitHub Pages（与
      `unipty.jixoai.com` 相同的 DNS 流程），在 `public/r` 工件上启用 Pages
- [ ] 决定 `jixoai-theme` 出厂默认的 `--brand-hue`（默认 `0`，jixoai 红；
      unipty 用 `165` 幽绿）——消费者改一个数字，或运行 `jixoai-ui hue <n>`

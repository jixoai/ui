# jx-pure — 方案简报（v0 草案，供 Codex 讨论）

> 原始需求（2026-08-23，Owner）：实现 `jx-pure.css`。提供 `jx-pure` className，
> 挂载到任意 DOM 即启用该子树内原生元素的重写。不单是 form，还有 button、
> summary、fieldset、nav、ol、ul 等原生元素，以及亮/暗模式支持。启发于
> Pico CSS（classless 语义化默认）与 daisyUI（语义化 class 词汇）。
> 特性：纯 CSS 零 JS，服务纯静态网页；开发者不需要学 jixoai-ui 组件，
> 只用 HTML 就能做出 jixoai-ui 风格；也适合 CustomElement 场景。
> 独立文档页 `components/jx-pure.html`；native-form 这套迁移进来。

## 0. 现状事实（本仓库，2026-08-23）

- `registry/files/theme/native-form.css`：Tier-1 纯 CSS 表单层，**opt-in 类
  词汇**（.jx-field/.jx-label/.jx-error/.jx-input/.jx-field-shell/.jx-input-lane/
  .jx-range/.jx-color-field/.jx-color），registry item `native-form`
  （type `registry:lib`，target `@lib/native-form.css`）。
- Tier-2 Svelte 组件（input/range/number-input/hue-popover）**消费这些全局类**
  ——迁移不能破坏它们。
- token 表 `registry/files/theme/jixoai.css`：`--background/--foreground/
  --border/--primary/--ring/--shadow-2xs…` 全部 token；暗色 = `.dark` 类
  整块覆盖 token；**没有** `prefers-color-scheme` 自动暗色；`.jx-light` 强制亮。
- 站点目录自动派生：`apps/www/src/lib/catalog.ts` 从 registry.json 的
  `meta:{group,href}` 生成导航/概览，catalog.spec.ts 强制 meta 存在。
- 文档页惯例：`apps/www/src/routes/components/<name>.html/+page.svelte`，
  SectionCard + ComponentCanvas + ToC；构建走 `scripts/build-site.mjs`。
- 站内样式加载：`app.css` → `@import './lib/jixoai.css'; @import './lib/native-form.css';`

## 1. 定位（一句话）

**jx-pure = jixoai-ui 的"无组件面"**：一份纯 CSS，两种用法——
1. `.jx-pure` 挂任意容器 → 该子树的原生元素自动获得 jixoai 法则
   （元素作用域，Pico 式）；
2. 现有 `.jx-*` 类词汇继续可用（显式 opt-in，daisyUI 式）。

## 2. 架构提案

```
registry/files/theme/jx-pure.css     ← 新家（native-form.css 迁入并扩展）
  Part A  .jx-* 类词汇（原样保留，全局，Tier-2 依赖它）
  Part B  .jx-pure 元素作用域规则（新增）
  Part C  暗色/无障碍法则（token 驱动 + reduced-motion/transparency）
```

### 2.1 作用域与特异性

- 元素规则一律 `.jx-pure <selector>` 前缀（如 `.jx-pure button`、
  `.jx-pure input[type='range']`）→ 特异性 (0,1,1)，单类同级，
  Tailwind 工具类仍可覆盖；挂 `body` 或任意子树均可。
- **不进 shadow DOM**（文档明示）：CustomElement 需在自身 shadow root 内
  `@import` 本表，或保持 light DOM。
- `:where()` 降特异性？**不用**——保持 (0,1,1) 让“最后声明 wins”的覆盖
  语义与类词汇一致。（讨论点 D1）

### 2.2 Part B 元素覆盖清单（v1 范围提案）

分组 | 元素 | 法则草案
--- | --- | ---
排版 | h1–h6, p, small, b/strong, blockquote, code/kbd/samp, pre, mark, hr | 字号阶梯走 token；blockquote 左 1px 边；code 用 mono token；hr = 1px var(--border)
链接 | a | 下划线 offset 法则 + hover primary；`a.button`?（讨论点 D2：是否提供 `.jx-pure a[role=button]` 或类通道）
按钮 | button, input[type=button/submit/reset], `button[jx-variant]`? | 方形 1px 边框、hover shadow-2xs 抬升、active 压入（press 物理纯 CSS 版）、:disabled 50%、:focus-visible ring 外描边——与 press-button 视觉对齐但**不复制**其 WAAPI（无 JS）
表单 | input 全类型, textarea, select, checkbox, radio, label, fieldset/legend, progress, meter, output | **迁移 native-form 全部法则**：text-like 走 `.jx-input` 同款盒子（元素作用域版）；checkbox/radio 自绘方/圆；range 走 `.jx-range` 几何；color 走 swatch；select 定制箭头（mask glyph）+ `appearance:none`
交互 | summary/details | 自绘 marker（+/− 旋转）、hover 边框响应；details[open] 过渡（grid-template-rows 或 interpolate-size，渐进增强）
导航/列表 | nav a, ol, ul, dl, li | ul/ol marker 换 jixoai 方块/短线（::marker）；nav 内链接下划线收敛为 hover 显现；dl 网格
分组 | fieldset, figure/figcaption | fieldset 1px 边 + legend 小型大写标签（font-nav token）
表格 | table, caption, th, td | th 小型大写、行 hover、边 token

（v1 明确不做：dialog 面板、popover、tooltip——浮层法则属于组件层；只做
 inline 元素与文档流元素。讨论点 D3）

### 2.3 暗色策略（讨论点 D4，需定案）

token 表现状：`.dark` 类切换，无媒体查询自动暗色。零 JS 静态页三种姿态：
- **a. 手动**：`<html class="dark">`（静态写死暗色站）——现在就支持；
- **b. 跟随系统**：需要 `@media (prefers-color-scheme: dark)` 把 `.dark`
  token 块再输出一遍。放哪？jx-pure.css 内加 opt-in 类
  `.jx-auto-dark`（挂 html，`@media dark` 下输出暗 token）→ token 复制
  块的维护成本与漂移风险（jixoai.css 是 single source）；
- **c. 行内 bootstrap**（Pico 式 3 行 JS 方案）——违背"零 JS"但只 3 行。

**倾向**：jx-pure.css 顶层 `@import './jixoai.css'`？不行——消费者路径
不稳。倾向 b 的变体：jx-pure.css 里用 `@media (prefers-color-scheme: dark)
{ .jx-auto-dark:not(.dark) { …仅含 jx-pure 用到的 token… } }`，并加注释
"与 jixoai.css .dark 块同步维护"；或者干脆 v1 只支持 a + 文档说明。
**请 Codex 权衡 a/b/c。**

### 2.4 native-form 迁移（讨论点 D5）

- 文件迁移：`registry/files/theme/native-form.css` → `registry/files/theme/jx-pure.css`
  （Part A 类词汇规则**逐字保留**，Tier-2 组件零改动）。
- registry item：**方案甲**：`native-form` item 删除，新 item `jx-pure`
  （type `registry:lib`，target `@lib/jx-pure.css`，meta: engines 组）；
  **方案乙**：保留 `native-form` 作为同文件别名 item（零成本兼容旧安装）。
  倾向甲（仓库原则：大胆破坏性更新，不做胶水；消费方是 Owner 自己的站）。
- 站内 `app.css` import 改为 jx-pure.css；`apps/www/src/lib/native-form.css`
  同步换文件。

### 2.5 文档页 `components/jx-pure.html`

- registry meta：`{ group: 'engines', href: '/components/jx-pure.html' }`
  → 自动进导航/概览。
- 页面结构沿用 form.html 惯例（SectionCard + ToC），分区提案：
  1. `#getting-started` install + 一行挂载示例（`<main class=jx-pure>`）
  2. `#typography` 排版/链接/hr
  3. `#buttons` 按钮 + disabled + focus
  4. `#forms` 全表单类型（复用 form.html 的 all-types 骨架，纯 HTML 版）
  5. `#disclosure` details/summary
  6. `#nav-lists` nav/ol/ul/dl
  7. `#tables-fieldset` 表格 + fieldset/figure
  8. `#dark-mode` 暗色三姿态说明 + 演示（亮暗分栏 canvas）
  9. `#custom-element` CustomElement/shadow DOM 说明
- 每区演示用 `SectionCard` 内嵌 `<div class="jx-pure">` 包裹的裸 HTML。

### 2.6 验证方案

- `scripts/verify-jx-pure.mjs`（沿 verify-hue 惯例）：playwright-core +
  本地 Chrome，对文档页断言——
  - 作用域内：button/input/summary 计算样式 = 法则值；
  - 作用域外：同名元素 = UA 原生（证明 opt-in）；
  - `.dark` 切换后 token 翻转、元素颜色跟随；
  - 像素采样关键自绘（checkbox 方块、select 箭头、summary marker）。
- ego-browser 人工走查（Owner 指定流程），亮暗双模式截图归档
  `.agents/images/<date-group>/`。

## 3. 需 Codex 定案的讨论点汇总

- D1 特异性：`.jx-pure x` (0,1,1) vs `:where(.jx-pure) x` (0,0,1)？
- D2 链接按钮：是否给 `a` 提供按钮外观通道（class 或 attribute）？
- D3 v1 边界：浮层类（dialog/popover）不进 jx-pure 是否正确？
- D4 暗色：a/b/c 哪条路？（token 复制块的漂移风险 vs 零 JS 完整性）
- D5 迁移：方案甲（删 native-form item）vs 乙（别名保留）？
- D6 范围：2.2 清单有无过度/不足？（progress/meter/output 是否砍？）
- D7 select 自绘箭头 vs 保留原生箭头（native-select.svelte 组件已有定制，
  纯 CSS 版是否对齐同一 glyph？）

## 4. 交付物清单

1. `registry/files/theme/jx-pure.css`（A+B+C 三部分）
2. registry.json item（按 D5 定案）
3. `apps/www/src/lib/jx-pure.css`（站点副本）+ `app.css` import 更新
4. `apps/www/src/routes/components/jx-pure.html/+page.svelte`
5. `scripts/verify-jx-pure.mjs` + ego-browser 走查截图
6. catalog/导航自动生效验证（catalog.spec.ts 通过）
7. llms 导出再生成（build-site.mjs 管线）

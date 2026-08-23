# jx-pure 方案定案

> 评审对象：`.scratch/jx-pure-brief.md`（v0）
> 评审日期：2026-08-23
> 范围：只做方案裁决，不在本轮修改实现文件。

## 0. 总裁决

接受 `jx-pure` 作为 jixoai-ui 的无组件面，但不接受 v0 将所有原生元素、表单层、主题复制和动画增强一次性铺开的实现边界。

- Part A/B/C 作为**逻辑分层**保留：A 是既有 `.jx-*` 类契约，B 是 `.jx-pure` 子树内的元素默认值，C 只承载 token 消费和无障碍降级。
- A 的既有规则必须原样保住 Tier-2 的依赖关系；B 不得反向改变 `.jx-input`、`.jx-range` 等现有类的语义。
- B 的第一版只覆盖稳定、可验证的文档流和基础控件；`progress`、`meter`、`output`、复杂浮层和跨引擎 select 重绘延期。
- 交付上可以有一个 `jx-pure` registry 入口，但 `native-form` 不能在同一发布切片中被静默删除：保留一个指向同一源码、旧 target 的弃用别名，避免现有 registry 依赖断裂。
- 不在 `jx-pure.css` 复制 `.dark` token 块；v1 只消费 `jixoai.css` 的 `.dark` 与 `.jx-light`。系统暗色若没有外部 bootstrap，不承诺自动跟随。

## 1. Part A/B/C 与作用域

### 裁决

逻辑分层通过；物理上不要把 B 做成一个无边界的全局 reset。Part A 继续是显式 `.jx-*` 类词汇，Part B 只允许以 `.jx-pure` 为祖先的元素选择器，Part C 不拥有新的颜色常量。

`.jx-pure` 约定为“包裹子树的容器”，不承诺容器本身若同时是 `button` 就自动获得样式。Custom Element 的 shadow root 仍须显式采用这份样式；light DOM 不会穿透 shadow boundary。

### 理由

当前 `native-form.css` 已有五个正交意图、约 500 行，并且 `input`、`range`、`number-input` 直接消费 `.jx-*` 类。把完整排版、导航、列表、表格、全部表单伪元素和主题策略继续塞入同一份“表单迁移文件”，很快超过单文件意图上限，也会让 Tier-1 的回归难以定位。

v0 对 `.jx-pure x` 的特异性描述不完整：其特异性是 `(0,1,1)`，普通 Tailwind 工具类通常是 `(0,1,0)`；当前站点还有大量未分层的主题规则，而未分层 author CSS 会压过 layered utilities。因此不能同时宣称“保留较高特异性”和“Tailwind 工具类仍可覆盖”。

### 实施约束

- B 使用 `:where(.jx-pure) <element>`，目标特异性降为 `(0,0,1)`。
- B 放入 `@layer components`，让 Tailwind `utilities` 有稳定的覆盖位置；未使用 Tailwind 的消费者仍可用未分层 author CSS 覆盖。必须在构建产物中检查实际 layer 顺序，不能只看源码。
- A 现有类规则先不改层级，避免改变 Tier-2 的级联行为；若要重排 A，必须另开迁移决策。
- 需要保留 `color-scheme`、`:focus-visible`、`prefers-reduced-motion`、`forced-colors` 的明确降级规则；不能把透明材质带入 inline 元素。

### 影响文件

- `registry/files/theme/jx-pure.css`：A/B/C 的边界、selector 特异性和 layer。
- `registry/files/theme/native-form.css`：A 的既有契约及兼容别名来源关系。
- `apps/www/src/app.css`、`apps/www/src/lib/jx-pure.css`、`apps/www/src/lib/native-form.css`：导入顺序与同源副本。
- `registry/files/ui/input.svelte`、`registry/files/ui/range.svelte`：只验证消费的类名不变，不因 B 重写组件语义。

## 2. D1：特异性

### 裁决

采用第三条路：`:where(.jx-pure) <element>` + `@layer components`。不采用 v0 的 `(0,1,1)`，也不把整份表单层降为 `:where()`。

### 理由

元素默认值是低优先级基座，应该让局部工具类、组件类和消费者的未分层 CSS 能够覆盖。`(0,1,1)` 会让一个容器 class 意外压过子元素上的单类工具；如果再处于未分层 CSS，工具覆盖会更难解释。A 的 `.jx-input` 等类是显式 opt-in，现有行为与 B 不同，不能为了 D1 一次性改变它们。

### 影响文件

- `registry/files/theme/jx-pure.css`、`apps/www/src/lib/jx-pure.css`：selector 与 `@layer components`。
- `apps/www/src/app.css`：确认 Tailwind、token、jx-pure 的导入顺序；不在本轮修改 `catalog.ts`。
- 验证脚本：增加计算样式覆盖断言，而不是只断言源码字符串。

## 3. D2：链接按钮

### 裁决

不自动给 `a[role='button']` 赋按钮外观。提供显式 `.jx-button`（或等价的现有按压类组合）作为链接外观通道；真正的按钮行为继续使用原生 `button`。

### 理由

`role="button"` 不补齐 Enter/Space 键盘行为、表单语义和默认 focus 行为，CSS 只画出按钮会制造可访问性假象。静态站点的导航链接可以长得像按钮，但它仍是 link；需要 command semantics 时应使用原生按钮和脚本行为。

按钮的 hover/active 必须复用 jixoai 的 press 物理：hover 只增大 token shadow，active 身体向页面内压 1px，同时使用对应的 `*-press` shadow；不得为 jx-pure 另造一套 transform 或圆角法则。

### 影响文件

- `registry/files/theme/jx-pure.css`：`.jx-button` 选择器及 press 状态。
- `apps/www/src/routes/components/jx-pure.html/+page.svelte`：分别展示 link-like button 与真正 button 的语义。
- 不改 `registry/files/ui/press-button.svelte` 的 WAAPI 选项；纯 CSS 只复刻静态按压契约。

## 4. D3：浮层边界

### 裁决

保留 v1 排除 `dialog`、`popover`、`tooltip`。`details/summary` 属于文档流 disclosure，可以纳入，但默认不做复杂 open/close 动画。

### 理由

浮层已有 `.jx-surface`、真实 shadow layer、top-layer、`prefers-reduced-transparency` 和 WAAPI kernel 的所有权边界。把它们再放进元素面会形成两套 surface 规则，并且无法用纯 CSS 可靠地承接组件层的关闭时序。`summary` 的 marker 和静态 open 状态不触碰 top-layer，因此是合理的 v1 边界。

`grid-template-rows`、`interpolate-size` 等 disclosure 动画都属于渐进增强，不应成为核心可用性或验证门槛；reduced motion 下必须完全静止。

### 影响文件

- `registry/files/theme/jx-pure.css`：只写 `details/summary` 的静态 marker/focus/hover 法则，明确不匹配 `[popover]`、`dialog`。
- `apps/www/src/routes/components/jx-pure.html/+page.svelte`：交叉链接既有浮层组件文档，不复制 surface 演示。
- `registry/files/theme/jixoai.css`：不因 jx-pure 增加第二套浮层 token。

## 5. D4：零 JS 暗色

### 裁决

v1 选 a：只支持现有 `.dark` 手动姿态和 `.jx-light` 局部强制亮色；不在 jx-pure 内复制 `.dark` token 块，也不把三行 bootstrap 偷换成“零 JS”。b、c 均延期。

### 理由

当前 `jixoai.css` 的 `.dark` 是 token 的单一事实源，且没有 `prefers-color-scheme` 自动覆盖。把 token 子集复制到 `.jx-pure.css` 会产生 token 漂移，且“只复制 jx-pure 用到的 token”会让以后新增元素悄悄改变同步面。c 虽能解决首屏闪烁，却明确违反纯 CSS/静态网页定位。

静态消费者要跟随系统时，应由页面自身的主题 bootstrap 或自己的 token 层把 `.dark` 加到根节点；jx-pure 文档只说明这一前置条件，不在库里暗藏行为。未来若需要 b，应先为 token 表建立生成式单一来源，再输出媒体查询变体。

### 影响文件

- `registry/files/theme/jx-pure.css`、`apps/www/src/lib/jx-pure.css`：不新增 `.jx-auto-dark` 或 token 副本。
- `registry/files/theme/jixoai.css`：继续作为 `.dark`/`.jx-light` 唯一 token 源。
- `apps/www/src/routes/components/jx-pure.html/+page.svelte`：演示手动 `.dark`、局部 `.jx-light`，并说明 system 需要宿主 bootstrap；不改 `apps/www/src/app.html` 的既有站点 bootstrap。

## 6. D5：native-form 迁移

### 裁决

采用第三条路：`jx-pure` 成为新 canonical registry item；`native-form` 保留为**同源、旧 target 的 deprecated alias**，至少跨一个发布窗口。别名不复制 CSS，不保留两份实现。

- `jx-pure` item 指向 `registry/files/theme/jx-pure.css`，target 为 `@lib/jx-pure.css`。
- `native-form` item 暂时也引用同一 `jx-pure.css` 内容，但 target 仍为 `@lib/native-form.css`，并在描述/docs 中标记 deprecated。
- 新的 `input`、`range`、`number-input` registryDependencies 改为 `@jixoai/jx-pure`；旧安装名仍能解析。
- 旧别名的移除必须是单独的、有版本说明的 breaking change，不能和首次元素面引入绑在一起。

### 理由

方案甲不仅删除一个名字：它会让 `input`、`number-input`、`range` 的 registryDependencies、站点 import、form 文档、parity 测试、`verify-hue` 路径和已生成的 public payload 同时变化。`native-form` 是公开的 `npx ... add` 参数，不是只供 Owner 站点内部引用；“消费方是 Owner 自己的站”不足以证明删除公共安装契约没有代价。

这个别名是 registry metadata 的兼容窗口，不是运行时胶水：只有一份 CSS 源码，两个 item 仅提供新旧安装入口。若 Owner 明确要求 v1 立即破坏兼容，则必须接受上述全量迁移清单，并把删除作为发布说明中的 P0，而不是只改文件名。

### 影响文件

- `registry.json`：新增 `jx-pure`、保留并标记 `native-form` alias，更新三个依赖项和 docs/meta。
- `registry/files/theme/jx-pure.css`、`apps/www/src/lib/jx-pure.css`：canonical 源与站点副本。
- `apps/www/src/app.css`、form 文档、`apps/www/test/native-form-parity.spec.ts`、`scripts/verify-hue.mjs`：改为 canonical 名称，同时保留 alias 回归检查。
- `apps/www/svelte.config.js`、`scripts/build-site.mjs` 触发的 `public/r/*.json`：在构建/生成阶段验证新旧 payload 和静态路由，不手改生成文件。

## 7. D6：2.2 元素清单

### 裁决

缩小 v1，采用“稳定基础 + 明确延期”清单。

保留：

- 排版的最小集合：`p`、`small`、`strong`、`blockquote`、`code/kbd/samp`、`pre`、`mark`、`hr`；标题只设相对层级或消费已存在的 typography token，不在本文件发明不可追踪的字号 token。
- `a`、`button`、`input[type=button|submit|reset]`、`textarea`、文本类 input、`fieldset/legend/label`。
- `checkbox`、`radio`、`range`、`color` 只在明确的可验证引擎矩阵内提供重绘。
- `details/summary`、`nav`、`ol/ul/dl`、基础 `table/caption/th/td`。

延期：

- `progress`、`meter`、`output`：语义与引擎伪元素/可访问名称需要独立契约，当前没有 token、状态和跨引擎验收定义。
- `figure/figcaption`：不属于表单/基础控件主路径，可保留 UA 文档语义，待文档排版层单独评审。
- 所有复杂的 `input` 类型统一重绘：必须先建立 allowlist，不能用裸 `input` 选择器误伤 hidden、file、checkbox、radio、range、color 和 submit。

### 理由

v0 同时承诺 classless 排版、完整表单、导航列表、表格和跨引擎小部件，范围已经超过一个 Tier-1 slice。当前 token 表也没有明确的 typography size token；“字号阶梯走 token”不能靠在 jx-pure 文件里散落数字来兑现。`opacity: 0.5` 的 disabled 视觉还可能降低文字/边框对比度，不能仅凭“50%”作为无障碍法则。

所有颜色仍须来自 token 或 `currentColor`；SVG mask 中的黑色只能作为 alpha 源，并须保留现有 parity 解释。方形、1px 边、bevel/corner-shape 和 press 物理应沿用现有主题法则，不新增圆角卡片或品牌硬编码色。

### 影响文件

- `registry/files/theme/jx-pure.css`：元素 allowlist、排除矩阵、token 使用和 disabled/focus/forced-colors 规则。
- `registry/files/theme/jixoai.css`：如确实需要正式 typography tokens，应另开主题 token 变更；本次不偷偷添加。
- `apps/www/src/routes/components/jx-pure.html/+page.svelte`：按保留/延期清单组织 demo，不能把延期元素写成已支持契约。
- `scripts/verify-jx-pure.mjs`：按元素矩阵验证，包含作用域内外、键盘 focus、disabled、reduced motion 和 forced colors 能力检测。

## 8. D7：select 箭头

### 裁决

默认保留原生箭头；自绘箭头改为显式 opt-in（例如 `select.jx-select` 或 `data-jx-select`），且只覆盖 single-select。multiple、`size>1`、forced-colors 和不支持 mask 的引擎回到原生表现。

### 理由

`appearance:none` 能隐藏平台箭头，却不能统一平台 popup、键盘、触摸和高对比模式。mask glyph 还要处理 RTL、padding、Safari/Firefox/Chromium 细节，以及 select 与 `native-select.svelte` 的视觉 parity；自动对所有 `select` 重绘会把一个可用的原生控件变成跨引擎维护面。

`native-select.svelte` 已有定制 chevron，但那是组件拥有的 DOM/交互边界，不能反向证明 classless CSS 也应默认隐藏 UA 箭头。纯 CSS v1 先保证边框、字体、focus 和 token 色，箭头保留平台 affordance；自绘路线必须有实机矩阵和 forced-colors 截图后才能升级为默认。

### 影响文件

- `registry/files/theme/jx-pure.css`：默认不关闭 select appearance；未来 opt-in selector 与 `--jx-icon-chevron`。
- `registry/files/ui/native-select.svelte`：只做 parity 对照，不在本决策中改组件。
- 文档与验证脚本：分别展示 native、opt-in、multiple/forced-colors fallback。

## 9. v0 遗漏的顶层风险

### 9.1 Tailwind preflight 与 layer 顺序（P0）

站点的真实顺序是 `tailwindcss` → `jixoai.css` → `native-form.css`；app.css 还在 `@layer base` 对 `*` 设置 border、`corner-shape`、`accent-color`。Preflight 会改变 margin、font、border-style、appearance 等初始值，UA shadow pseudo 又不完全受 author reset 控制。必须用构建后的 CSS 检查 B 的 layer 和 computed styles，不能以源码顺序推断覆盖关系。

### 9.2 跨引擎小部件成本（P0）

checkbox/radio 的 `appearance:none`、range 的 WebKit/Mozilla 双伪元素、color swatch、date indicator、select arrow 都不是同一套 CSS 能力。要定义支持浏览器、不可绘制时的原生 fallback、RTL、touch、forced-colors 和 `prefers-reduced-motion`，否则“classless 一致”只是 Chromium 演示。

### 9.3 无障碍状态契约（P0）

需要显式定义 `:focus-visible`、`:disabled`/`[aria-disabled]`、`[aria-invalid]`、键盘操作、`forced-colors: active`、`color-scheme` 和 reduced motion。禁用态不能只用半透明；自绘 checkbox/radio 不能丢失 native state/label/FormData；summary marker 不能取代可见 focus。

### 9.4 shadow DOM 与逃生口（P1）

普通 CSS 不穿透 shadow root；“在 shadow root 内 @import”需要文档明确 `<style>`/adoptedStyleSheets 的装载方式和资源解析基准。相反，挂在大型子树上会误伤第三方/custom component 的内部 light DOM。v1 至少要定义挂载边界，并评估是否需要 `data-jx-pure-skip` 逃生口；不能用一条危险的 `all: revert` 当通用解决方案。

### 9.5 性能与体积预算（P1）

一份全元素表会在每个静态页加载，且含 data-URI mask、伪元素矩阵和多媒体查询；站点还同时维护 registry 与 `apps/www` 副本。简报没有 CSS 原始/gzip、首屏解析和构建产物预算。实现前应记录 native-form 基线，设置新增 raw/gzip 上限，并在 `build-site` 后检查 route CSS 是否重复打包。

### 9.6 生成链和路由漂移（P1）

`catalog.ts` 是 registry 派生投影，本身不应手改；但新增 `meta.href` 仍必须同步 `apps/www/svelte.config.js` 的 prerender entries。registry payload、llms 导出、站点副本和 parity 测试都是生成/同步链的一部分，不能只提交一个 CSS 和一个页面。

### 9.7 选择器误伤与不可逆默认值（P1）

`:has()`、`nav a`、`table tr:hover`、裸 `input` 等规则会影响挂载子树中的复杂组件和嵌套表单。每个元素都应有 allowlist、排除类型和“作用域外保持 UA”测试；不存在可靠排除时，应把规则退回显式类，而不是继续扩大 `.jx-pure`。

## 10. 交付闸门

在进入实现前，Owner 需要确认三件事：

1. 是否接受 `native-form` 一个发布窗口的 deprecated alias；若不接受，按 D5 的全量 breaking checklist 单独发布。
2. 目标浏览器与 forced-colors/RTL/移动端矩阵，尤其是 select、checkbox/radio、range、color。
3. CSS 体积和构建产物预算，以及 `.dark` 必须由宿主 bootstrap 提供的零 JS 边界。

确认后再实现，并以生成后的 CSS/HTML 和实机截图作为验收证据；catalog/navigation 只是 registry meta 与 route 存在性验证，不能替代浏览器视觉验收。

# jx-pure 实现评审

评审日期：2026-08-23

评审对象：当前工作区中与 `jx-pure` 相关的真实文件、未提交 diff、生成载荷，以及 `.scratch/jx-pure-brief.md` / `.scratch/jx-pure-decisions.md`。

说明：工作区另有约 145 个 ToC、website-scaffold、页面和 blueprint 的未提交改动；它们没有被归因到本次 jx-pure 评价。以下只评价 jx-pure 迁移、registry、站点文档、验证脚本和由其生成的载荷。

## 验证证据

- `node scripts/verify-jx-pure.mjs 5201`：21/21 通过，覆盖作用域内外、allowlist、select 双姿态、layer 顺序、暗色岛和主要计算样式。
- `pnpm --dir apps/www test -- --run test/jx-pure-parity.spec.ts`：24 个测试文件、324 个测试通过；输出只有仓库既有 Svelte 可访问性/未使用选择器警告。
- `git diff --check`：通过。
- `pnpm --dir apps/www build`：已通过；同样只有既有警告。
- `registry/files/theme/jx-pure.css` 与 `apps/www/src/lib/jx-pure.css`：字节一致，各 44,672B；gzip 后 10,536B。
- CSS 大括号平衡、PostCSS 解析和 Chromium 文档页走查均通过。当前证据主要是 Chromium；没有 Firefox/WebKit 或真实 Windows forced-colors 运行证据。

## A. 阻塞问题

### A1（P1，发布前必须修）旧文档仍指向已删除的文件

`apps/www/src/routes/components/form.html/+page.svelte:252-254` 仍生成 `@import './lib/native-form.css'`，`915-917` 仍把 `native-form.css` 描述为当前 Tier-1 入口。`apps/www/src/lib/native-form.css` 和 `registry/files/theme/native-form.css` 已删除；因此用户从仍在导航中的 form 页面复制出的示例会直接得到不存在的站点副本/新安装路径。`public/llms-full.txt` 也保留了这些旧段落，说明生成导出已经把错误文案发布出去。

具体修复：把 form 页的示例和说明改成 `jx-pure.css` / `jx-pure`，明确旧名只作为 registry deprecated alias；随后运行 `scripts/build-site.mjs`，并检查 `public/llms-full.txt`、`public/llms.txt` 和对应 `.md` 镜像不再把 native-form 当 canonical 入口。

### A2（P1，D4 实现不完整）同元素 `.jx-light.jx-pure` 没有强制浅色 `color-scheme`

`registry/files/theme/jx-pure.css:518-523` 只有：

```css
:where(.jx-light) :where(.jx-pure) { color-scheme: light; }
```

这只匹配“`.jx-light` 祖先包住 `.jx-pure`”，不匹配决策和文档实际推荐的 `<div class="jx-light jx-pure">`。在 `html.dark` 下，真实 Chromium 计算结果是该节点 `color-scheme: dark`，虽然 token 变量已经是浅色；原生 date/color/select picker 因而仍可能采用暗色平台外观。`jx-pure` 文档 `+page.svelte:44` 正好展示了同元素写法。

具体修复：补 `:where(.jx-pure.jx-light)`，并把该同元素姿态加入 `verify-jx-pure.mjs` 的暗色测试；同时验证 `--background`、`color-scheme` 和 date/color 原生 picker 的姿态一致。

### A3（P1，无障碍/视觉风险）fieldset 禁用态会发生透明度叠加

`registry/files/theme/jx-pure.css:1118-1122` 给 `fieldset:disabled` 设置 `opacity: .5`，而文本控件、checkbox/radio/range/color/button 的各自 `:disabled` 规则又在 `669-673`、`767-773`、`918-920`、`974-977`、`1012-1015`、`1100-1103` 设置 `.5`。真实 DOM 中 fieldset 禁用会让后代控件匹配 `:disabled`，所以组层和控件层合成后约为 `.25` 的视觉不透明度；计算样式虽然分别显示 `.5`，截图合成会更暗，边框/文字对比度不可接受。

具体修复：选择一个透明度所有者。推荐保留 fieldset 的组级 `.5`，在 `fieldset:disabled` 后代控件规则中明确 `opacity: 1`，或者取消 fieldset 的 opacity、只保留各控件自身的 disabled law；两种方案都要补 group-disabled 的对比度/截图断言，不能继续让两层都 dim。

### A4（P1，若公开承诺三引擎则为发布闸门）自绘控件只有 Chromium 证据

`jx-pure.html/+page.svelte:292-295` 将 checkbox/radio、range、select chevron 标成 Chromium/Firefox/WebKit “same”，但 `scripts/verify-jx-pure.mjs` 只启动 Chrome，且没有实际的 Firefox/WebKit 或 Windows forced-colors 截图。尤其 `input::before/::after` 对 replaced input 的绘制、range 两套伪元素、color swatch 和 `appearance:auto` fallback 都是引擎相关行为。当前 Chromium 能证明“本地页面工作”，不能证明表格中的跨引擎契约。

具体修复：在发布前建立目标浏览器矩阵（至少 Chromium、Firefox、Safari/WebKit；另加 forced-colors 能力测试），逐项验证 checked/indeterminate、range thumb、color swatch、select opt-in 和 keyboard/focus。不能提供矩阵时，应把文档措辞降为“Chromium 已验证，其它引擎回退/未承诺”，而不是继续写 `same`。

没有发现必须立即停止所有实现的 P0；上述 P1 必须在发布前收敛。

## B. 可验证的修复建议

| 优先级 | 文件与位置 | 具体改法与验收 |
| --- | --- | --- |
| P1 | `apps/www/src/routes/components/form.html/+page.svelte:250-254, 912-920` | canonical 示例改成 `jx-pure.css` / `jx-pure`；保留一小段 deprecated alias 迁移说明。运行 `scripts/build-site.mjs` 后在 `public/llms-full.txt`、`public/llms.txt`、`.md` 镜像中搜索，旧名只能出现在迁移说明/alias 条目。 |
| P1 | `registry/files/theme/jx-pure.css:518-523`；`scripts/verify-jx-pure.mjs` | 增加同元素 `.jx-pure.jx-light` 选择器；在根为 `.dark` 时断言该岛为 `color-scheme: light` 且 text/date/color/select 计算变量为 light。 |
| P1 | `registry/files/theme/jx-pure.css:1118-1122` 及各 disabled 规则 | 让 fieldset 或控件只负责一次 opacity；推荐添加 fieldset-disabled 后代 `opacity: 1` 覆盖，并用截图/对比度测试确认最终视觉约 `.5` 而非 `.25`。 |
| P1 | `registry/files/theme/jx-pure.css:1304-1316` | forced-colors 中对 `select.jx-select` 同时清除 `background-image`，否则 `appearance:auto` 可能与残留渐变 chevron 叠成双箭头；补 forced-colors 断言。 |
| P1 | `registry/files/theme/jx-pure.css:1267-1295` | reduced-motion 规则补上 `select` 和 `input[type=radio]` 根节点的 transition；若仓库约定“完全静止”，同时在该媒体查询中清掉 button 的 `translate`、range thumb 的 active transform，不能只把过渡时间设为 0。 |
| P1 | `registry/files/theme/jx-pure.css:531-550` | D6 明确要求不在本文件发明 typography token，但实现写死了 heading `rem` 阶梯和 `letter-spacing:-0.01em`。推荐先把 `letter-spacing` 改为仓库法则的 `0`，并将字号阶梯移入正式 `jixoai.css` token 变更；在 token 变更前用 `font-size: revert`/UA 阶梯，避免散落新数字。 |
| P1 | `registry/files/theme/jx-pure.css`（B1） | 当前没有 `:where(.jx-pure) p` 规则；站点 Tailwind preflight 会把段落 margin 清零，导致“文档流排版”中的裸 `p` 没有段落间距。补 `p` 的明确 margin/line-height 法则，或在文档中明确接受 preflight 的零 margin，并为有/无 Tailwind 消费者分别验证。 |
| P1 | `registry/files/lib/icons.ts:61-64`、`apps/www/src/lib/icons.ts:61-64`、`scripts/verify-hue.mjs:5-8` | 将注释中的 `native-form.css` 更新为 `jx-pure.css`；这不是运行时 bug，但会让维护者继续编辑已删除路径。 |
| P1 | `registry.json:687`、`registry/files/ui/input.svelte:18,28-30,228-230`、`registry/files/ui/number-input.svelte:15-18,180-182`、`registry/files/ui/range.svelte:11,280-282`、`apps/www/src/lib/ui/range.svelte` | 术语从“native-form sheet”更新为 `jx-pure` Part A；源码注释改完后重生成 `public/r/input.json`、`number-input.json`、`range.json`，避免 payload 内继续发布旧 canonical 说法。 |
| P2 | `apps/www/test/jx-pure-parity.spec.ts` | 目前 parity 只锁 icon 几何、同源 alias 和站点副本；补一个 snapshot/规范化比较，明确“规则内容 verbatim、文件头迁移说明允许变化”，否则当前事实是旧文件 18,508B、jx-pure Part A 前缀 18,473B，和注释中的“逐字/verbatim”表述不完全相符。 |
| P2 | `apps/www/src/lib/catalog.ts` / registry metadata | alias 当前会作为 data-entry 目录项再次出现并指向同一 jx-pure 页面。若不希望导航重复，应增加可验证的 `deprecated`/`hidden` metadata 投影；若保留可见迁移入口，应在 catalog 测试中锁定这一意图。 |
| P2 | `registry/files/theme/jx-pure.css`、`apps/www/src/lib/jx-pure.css`、build 产物 | 记录 raw/gzip 上限和路线级 CSS 重复打包预算。当前从 native-form 18,508B/5,598B(gzip) 增至 jx-pure 44,672B/10,536B(gzip)，增量约 26,164B raw、4,938B gzip（约 +141% / +88%）；这不是功能失败，但应成为发布门槛而不是只在说明中留数字。 |

## C. 实现质量评价

整体实现质量较高，主架构与既定方案高度对齐：

- Part A 保持 unlayered `.jx-*` 契约，Tier-2 依赖已切到 `@jixoai/jx-pure`，并通过同源 alias 避免了 silent delete；这是 D5 的关键风险控制。
- Part B 的元素规则确实集中在 `@layer components`，选择器使用 `:where(.jx-pure)`，验证脚本实测 Tailwind utility 能覆盖、作用域外保持 UA paint；D1 落实不是只停留在源码宣称。
- D2/D3/D7 落实清晰：没有自动把 `a[role=button]` 画成按钮，没有越权实现 dialog/popover/tooltip，select 默认保留平台箭头、`.jx-select` 才 opt-in。
- 颜色基本走 token/currentColor，方形边、1px border、hard offset shadow 和 active press 与仓库 brutalist/press law 一致；没有在 B 中复制 `.dark` token 块，D4 的单一事实源边界正确。
- allowlist、forced-colors fallback、focus-visible、placeholder distinction、generated registry/payload 和站点副本都考虑到了，且构建/单测/浏览器验证链完整。

主要质量扣分来自“实现覆盖面超过验证面”：跨引擎声明没有证据，`.jx-light` 同元素姿态和 disabled fieldset 的最终合成视觉未被 21 项脚本捕获，reduced-motion 只覆盖了大多数 transition 而非完整的静止契约。另有迁移文案和维护注释没有随删除文件同步，说明生成链的内容一致性仍需一轮收口。

### 顶层风险复核

- **Tailwind preflight / layer**：站点顺序和 `@layer components` 已在 Chrome 中验证，但 registry 消费者未必使用 Tailwind；`p` margin、链接装饰、button focus 等差异仍需无-Tailwind fixture。不能把站点 computed style 当成所有安装者的契约。
- **作用域逃生口**：`.jx-pure` 会影响其子树中的第三方 light-DOM 控件，当前没有 `data-jx-pure-skip` 或组件边界约定；shadow root 的“重新 import”说明是正确的，但没有说明 bundler/CSP 下 adoptedStyleSheet 或相对 URL 的装载方式。
- **跨引擎控件**：checkbox/radio replaced-input 伪元素、range/color/select 的 UA shadow 都应有“自绘成功 / 原生回退 / forced-colors”三态，而不是只测试 appearance 值。
- **性能与重复打包**：registry 源、副本、站点 bundle、`public/r` 和 llms 是多条同步链；除 raw/gzip 外，还应检查静态路由是否重复包含整份 44KB CSS，以及 CustomElement 重复注入是否造成多份解析成本。

## D. 综合评分与 D1-D7 对照

**综合评分：7.8 / 10。**

评分依据：

- D1：**完整落实**。`:where(.jx-pure)` + `@layer components`，且有 computed-style/layer 验证。
- D2：**完整落实**。显式 `.jx-button`，不自动美化 `a[role=button]`；press shadow/active +1px 与主题 token 对齐。
- D3：**完整落实**。details/summary 是静态文档流法则，浮层仍归 Tier-2；没有引入另一套 surface ownership。
- D4：**设计落实、边界有缺口**。没有 token copy/自动暗色/隐藏 JS，`.dark` 岛通过；但 `.jx-light.jx-pure` 同元素的 `color-scheme` 选择器遗漏，必须修正。
- D5：**架构落实、迁移收口不足**。canonical `jx-pure` + 同源旧 target alias 正确，依赖已迁移；form 文档、icons/verify-hue 注释、Tier-2 术语和生成 llms/payload 仍有旧名残留。
- D6：**大部分落实**。allowlist、延期元素和控件排除正确；但 heading 的硬编码字号/负字距违反“不发明 typography token/letter-spacing=0”，且 `p` 没有明确排版规则。
- D7：**落实**。默认 native select、显式单选 opt-in chevron、multiple/size 排除均存在；forced-colors 还应清掉 opt-in 的渐变背景，并补跨引擎证据。

如果先修 A1-A3、补齐跨引擎/forced-colors 验证，再处理 D6 的 typography 与迁移文案，评分可到 8.8 左右；在这些问题未收口前，不建议把当前实现标记为“发布完成”。

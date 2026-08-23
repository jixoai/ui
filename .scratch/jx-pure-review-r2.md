# jx-pure 第二轮实现复核

评审日期：2026-08-23

评审范围：当前工作区中 jx-pure 的实现、生成链与本轮修复；ToC、website-scaffold、其它页面和 blueprint 的并行改动不归因于本任务。

## 验证证据

- `node scripts/verify-jx-pure.mjs 5201`：23/23 通过。
- `pnpm --dir apps/www test -- --run test/jx-pure-parity.spec.ts`：24 个测试文件、326/326 通过；仅有仓库既有 Svelte 警告。
- `pnpm build:site`：成功；站点、registry、llms 导出均生成，86 个 registry payload 存在。
- `git diff --check`：通过。
- `registry/files/theme/jx-pure.css` 与 `apps/www/src/lib/jx-pure.css`：字节一致，46,072B；gzip 10,934B，低于 11KB 闸门。
- `registry/files/theme/jx-pure.css` 的 Part A（旧表单 sheet 的规则主体）与 `HEAD:registry/files/theme/native-form.css` 的 body 一致；当前新文件仅保留 canonical 头注和 B/C 追加部分。
- Chromium 的 forced-colors/reduced-motion emulation 额外核对显示 select 的 `appearance:auto`、`background-image:none` 与 button 的 `transition:none` 生效；但下述 reduced-motion 选择器问题使 checkbox/radio/range 的静止契约仍不完整。

## A. 剩余阻塞

### R1（P1，发布阻塞）：reduced-motion 的 checkbox/radio/range 规则在 Chromium 被整条丢弃

`registry/files/theme/jx-pure.css:1306-1312` 将 checkbox/radio 根节点、两个伪元素、`::-webkit-slider-thumb` 和 `::-moz-range-thumb` 放在同一个普通 selector list：

```css
:where(.jx-pure) input[type='checkbox'],
:where(.jx-pure) input[type='checkbox']::before,
:where(.jx-pure) input[type='radio'],
:where(.jx-pure) input[type='radio']::after,
:where(.jx-pure) input[type='range']::-webkit-slider-thumb,
:where(.jx-pure) input[type='range']::-moz-range-thumb {
  transition: none;
}
```

Chromium 不认识 `::-moz-range-thumb` 时会把这个非 forgiving selector list 作为一条规则丢弃。实测在 `prefers-reduced-motion: reduce` 下：

- checkbox 根节点仍为 `background-color 0.15s, border-color 0.15s`；
- checkbox `::before` 仍为 `clip-path/opacity/transform 0.15s`；
- radio 根节点仍为 `border-color 0.15s`，其 `::after` 仍为 `transform 0.15s`；
- range thumb 仍保留 `transition: all`。

这直接违反本轮声明的“完全静止”契约，且现有 23 项探针没有覆盖 reduced-motion，所以 23/23 不能证明该项已关闭。

**可验证修复：**拆为按 engine/pseudo 分开的规则，至少把 checkbox/radio 根节点单独一条，把 `::before`、`::after`、`::-webkit-slider-thumb`、`::-moz-range-thumb` 各自单独声明；同步 `apps/www/src/lib/jx-pure.css`，并在 `scripts/verify-jx-pure.mjs` 用 `page.emulateMedia({ reducedMotion: 'reduce' })` 断言根节点/伪元素 transition 为 `none`、active button 的 `translate` 为 `none`、range thumb 的 active transform 为 `none`。同样检查 Firefox/WebKit 解析结果。

### R2（P1，发布一致性阻塞）：number-input 的 canonical registry 文案仍指向旧 sheet 名

`registry.json:687` 仍写“spinner law live in the native-form sheet”。`pnpm build:site` 后该旧表述同步进入：

- `public/r/registry.json:687`
- `public/r/number-input.json:5`
- `public/components.md:425,429`
- `public/llms-full.txt:6484,6488`

这不是运行时断裂：`native-form` alias 仍有意保留，且 payload 与源 registry 一致；问题是新 canonical 已经是 `jx-pure`，但 registry 说明和 AI 导出仍把旧名写成 Tier-1 归属，迁移收口不完整。

**可验证修复：**把 `registry.json:687` 的 `native-form sheet` 改为 `jx-pure sheet`（必要时明确“Part A class vocabulary”），只修改源 registry，随后运行 `pnpm build:site`，检查上述四类产物只在 deprecated alias/迁移说明中保留 `native-form`。

没有发现 P0 级运行时或数据损坏问题。`native-form` 同源旧 target alias 本身是正确的 D5 决策，不列为缺陷。

## A1–A4 复核状态

| 项 | 当前裁决 | 证据与剩余边界 |
| --- | --- | --- |
| A1 | 已关闭 | `form.html:251-255, 915-919` 使用 `jx-pure.css`/`jx-pure` canonical 文案；旧 import 不再出现在站点/llms 输出。alias 说明保留正确。 |
| A2 | 已关闭 | `jx-pure.css:521-527` 同时覆盖祖先 `.jx-light` 和同元素 `.jx-pure.jx-light`；文档 `jx-pure.html:348-357` 有暗色根内嵌浅色岛；验证脚本 line 159 断言 light `color-scheme`。 |
| A3 | 已关闭 | `jx-pure.css:1129-1138` 由 fieldset 唯一持有 `.5`，后代控件显式 `opacity:1`/`cursor:not-allowed`；文档 locked section 与 line 160 探针均存在。 |
| A4 | 条件关闭 | 文档 `jx-pure.html:298-311` 已改为 Chromium verified of record，其余 authored law/unverified build，并声明 forced-colors 回退；因此不再虚报跨引擎证据。实际 Firefox/WebKit/Windows forced-colors 矩阵仍未运行，不能把它当跨引擎验收完成。 |

## B 表逐项核验

| B 项 | 状态 | 核验结论 |
| --- | --- | --- |
| reduced-motion 完全静止 | **未关闭，见 R1** | select、button active 的规则可见且 button 已用 `translate:none`；但 checkbox/radio/range 共用的跨引擎 selector list 在 Chromium 被丢弃，实测仍有 transition。 |
| forced-colors select 双箭头 | 已关闭 | `jx-pure.css:1332-1341` 对 `select.jx-select` 同时恢复 `appearance:auto` 并清 `background-image`；Chromium emulation 结果为 `auto`/`none`。 |
| D6 heading 字距归零 | 已关闭（字号债务保留） | heading 不再有负字距；rem 阶梯仍保留并在 `jx-pure.css:531-535` 明确标注等待 token 裁决，符合 Owner 本轮不回滚的决定。 |
| p/flow-group margins + line-height | 已关闭 | `jx-pure.css:558-563` 显式恢复 preflight 清掉的 margin 与 p line-height。 |
| icons/verify-hue/input/range/number-input 迁移注释 | 基本关闭 | 相关源码注释已改为 jx-pure；parity suite 的历史 suite 名仍保留 native-form，是别名/几何 parity 语义，不是运行时路径。 |
| registry/payload/llms 重生成 | **部分关闭，见 R2** | `build:site` 成功且 payload 与源一致，但 `number-input` registry 描述仍向所有镜像传播旧 canonical 名。 |
| Part A unlayered / Part B components layer / site copy | 已关闭 | parity 的层结构与副本字节一致锁通过；B 仍是 `@layer components` + `:where(.jx-pure)`。 |
| alias 同源锁 | 已关闭 | `native-form` 旧 target 指向 `jx-pure.css`，无第二份 CSS；这是 D5 预期兼容窗口。 |
| gzip 发布闸门 | 已关闭 | parity 锁为 `<= 11KB`，当前 10,934B。 |
| catalog alias 去重 | 按 Owner 决策保留 | 未去重，保留可见迁移入口；这是明确选择，不归因缺陷。 |

## B. 本轮修复质量评价

本轮修复覆盖了上一轮最重要的架构和迁移问题，质量明显提升：

- D1 已真实落地：B 规则在 `@layer components`，选择器是 `:where(.jx-pure)`，验证中 utility 覆盖了 law，作用域外保持 UA paint。
- D2/D3 已保持边界：`.jx-button` 是显式 link channel，未把 `a[role=button]` 伪装成 command；details/summary 只做文档流法则，dialog/popover/tooltip 仍归 Tier-2。
- D4 已遵守单一 token 来源：没有复制 `.dark` token，也没有在库内偷偷注入 system-follow JS；`.dark` 与 `.jx-light` 的 same-element 姿态已补齐。
- D5 的同源 deprecated alias、Tier-2 依赖迁移和 registry/站点副本同步做得正确，避免了 silent delete；剩余 R2 只是 canonical 文案收口。
- D6 的 type allowlist、p/flow margins、forced-colors 回退、临时 rem 阶梯头注均已按 Owner 决策处理；rem 阶梯仍是明确的 typography token 债务，不应误报为本轮遗漏。
- D7 的默认 native select、`.jx-select` 单选 opt-in、multiple/size 排除和 forced-colors 清渐变均已实现。
- 体积闸门、同源副本、layer 结构、alias 和生成 payload 都有自动锁；但验证脚本此前只覆盖静态/普通 Chromium，导致 R1 这种 CSS 解析级问题逃过了 23 项绿灯。

非阻塞观察：`apps/www/test/jx-pure-parity.spec.ts:48` 的 suite 名仍使用历史 `native-form` 术语；这是 alias/parity 历史语义，不能与 R2 的对外 registry canonical 文案混为一谈。heading rem 阶梯和未实际运行的 Firefox/WebKit 仍是已记录的设计/验收债务。

## C. 更新后的综合评分

**8.4 / 10（上一轮 7.8，+0.6）。**

评分依据：

- D1、D2、D3、D5、D7：基本完整，层级、作用域、语义边界、alias 和 select 双姿态均有源码与自动化证据。
- D4：从“同元素 light scheme 缺失”提升为完整实现；仍只承诺 Chromium-of-record，跨引擎证据不扩大解释。
- D6：allowlist、preflight margin、字距修复和 deferred 清单已收敛，但 rem 阶梯仍等待正式 token；更关键的是 R1 使 reduced-motion 完全静止契约尚未成立。
- 发布收口：构建、payload、gzip 和 326/326 测试均通过，R2 仍让新 registry/llms 文案暴露旧 canonical 名称。

结论：架构和大部分本轮修复可接受，当前不应标记为“发布完成”；先拆分 reduced-motion selector 并补 emulation 探针，再收口 `number-input` registry 文案和生成镜像，评分可进入约 9 分的发布候选区间。

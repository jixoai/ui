# jx-pure r4 实现复核

评审日期：2026-08-24

范围：核验当前真实工作区的 jx-pure B10/B11/B12、Part D auto-dark、CustomElement shadow 实证、生成/同步测试与当前 diff。并行 first-paint agent 的 ToC/scaffold 变更（包括 shell、layout、page data）不归因；仅核验其中与本轮 shadow `?raw` 实现直接相关的 jx-pure 页面改动。

## 验证证据

- `node scripts/verify-jx-pure.mjs 5199`：38/38 通过。
- `pnpm --dir apps/www test -- --run test/jx-pure-parity.spec.ts`：24 files / 327 tests 通过；仅仓库既有 Svelte a11y/CSS 警告。
- `node scripts/gen-jx-auto-dark.mjs` 后 registry CSS 幂等，无漂移；registry/www CSS 字节一致（55,782B），gzip 13,649B，低于新 14KB 闸门。
- `git diff --check`、脚本语法检查通过。
- Chromium 直接走查确认：B10/B11 基础几何与语义色、auto-dark dark/light 岛、两节点 shadow `<style>`、wrapper 形态的 skip 均可见生效。

## A. 阻塞问题

### R4-1（P1，发布阻塞）：progress indeterminate 动画没有真实生效，且 reduced-motion 契约未实现

`registry/files/theme/jx-pure.css:1322-1337` 只给 `progress:indeterminate` 的 WebKit/Mozilla UA 伪元素设置 `animation: jx-progress-slide`；`@media (prefers-reduced-motion: reduce)`（`1435-1485`）没有关闭这两个伪元素的 animation/transition。更严重的是，在当前 Chromium 页面上，indeterminate progress 的独立截图在 0ms 与 500ms 均为静态空轨道，`document.getAnimations()` 没有 `jx-progress-slide`，伪元素也没有有效 animation/image；因此“滑动条”不是仅缺少验证，而是当前引擎中没有实际视觉效果。Firefox authored `::-moz-progress-bar` 路径仍会持续动画，reduced-motion 下同样违反静止承诺。

现有 38/38 的探针只检查 CSSOM 中是否“served”了包含 `jx-progress-slide` 的规则（`scripts/verify-jx-pure.mjs:98-101`），不能证明伪元素匹配、动画运行或 reduced-motion 静止。应改用实际可绘制的元素/引擎路径（或确认支持的 progress 伪元素方案），为 WebKit/Mozilla 分别加 `animation: none`，并补带时间差的截图/animation-state 断言。

### R4-2（P1，发布阻塞）：B12 skip 没有兑现“Part A 也回退到 UA cascade”

`registry/files/theme/jx-pure.css:1422-1424` 的 `all: revert` 位于 `@layer components`，且只匹配 `[data-jx-pure-skip]` 的后代元素。Part A 是 unlayered 规则，所以真实 Chromium 动态探针中：

- `.jx-pure` 内 `<div data-jx-pure-skip><input class="jx-input"></div>` 的 input 仍为 `min-height: 40px`、`padding: 8px 12px`、1px border 和 token background，而非 UA 样式；
- skip 内的 `summary` 仍保留 B 伪元素（`::before` content 为 `"−"`、display 为 block），checkbox 的 `::before` 也仍被生成。

这与代码注释 `1418-1420` 的“Part A classes ... reverted / FULLY native”直接矛盾。当前验证只覆盖一个 plain button，漏掉了 Part A 与伪元素。逃生规则需要位于足以压过 Part A 的级联位置，并显式处理自绘伪元素；同时应明确 marker 是 wrapper-only 还是属性所在元素自身也必须 native。

没有发现 P0 数据损坏或基础页面不可用问题；以上两项是本轮新增承诺的 P1 发布阻塞。

## B. 本轮质量评价

本轮架构方向正确且大部分完成质量高：

- B10 的 progress/meter 8px 轨道、meter `primary/secondary/destructive` 语义 token 映射、output mono lane 已进入 `@layer components`；B11 的 figure/figcaption/img/video 和 `media-flow` 演示真实存在。确定态进度、meter 色彩、媒体溢出控制均通过 Chromium 走查。
- Part D 由 `jixoai.css` 的 `.dark` 块生成，带 `.jx-auto-dark` gate、`.jx-light` 排除和 `.jx-pure` `color-scheme` 伴生规则；生成器幂等、parity 锁和 dark/light CDP 探针形成了可信的单一来源链。当前 13.65KB gzip 在重新裁定的 14KB 闸门内。
- CustomElement 已从 dev `?url`/constructable sheet 间接层切到真实 `?raw` 文本，并在 open shadow root 内注入两个 `<style>` 节点；shadow 内 button/input 的 40px/press law 已实测。
- 证据链比 r3 更完整，但自动化仍有盲区：`served-rule` 被误当成 indeterminate 运行证据，skip 只测 plain button；这正是两项 P1 漏检的来源。
- 文档还有两处非运行时收口问题：`registry.json:306` 同时写“system-follow needs host bootstrap”和 `.jx-auto-dark` zero-JS；`+page.svelte:482` 的 SectionCard summary 仍描述 constructable/adopted sheets，而真实实现已是 `?raw` + `<style>`。Firefox/WebKit 实测与 typography token 正式裁定按 Owner 明示排除，不作为本轮阻塞。

## C. 综合评分

**8.6 / 10（r3：9.0，-0.4）。**

三项补完的架构覆盖、生成同步、shadow 实证和大部分浏览器可见行为都值得上调；但 r4 新增的两个公开契约分别在 Chromium indeterminate 状态和 Part A/pseudo escape 场景失效，且现有 38/38 没有捕获它们。修复真实动画/静止路径、让 skip 真正压过 Part A 并补对应探针后，才可回到或超过 r3 的发布候选质量。

# Implementation Review r9

范围：当前工作区终态，针对 `review-r8.md` 的四项阻塞修复、补充验证证据，以及 Owner 中途将 `.jx-group` 改名为 `.jx-input-group`、重构 range/switch 的增量复核。

## A. 未闭合阻塞

1. **D2 / `.no-jx-pure` 仍不是通用元素+子树 revert。** `apps/www/src/lib/jx-pure.css:1699`（镜像 `registry/files/theme/jx-pure.css:1699`）的 `all: revert` 仍挂在 `button, input, textarea, select, ...` 的固定 allowlist 上；`.no-jx-pure` 自身及任意 `div/span` 等未列举后代不会复位。设计与文档宣称的 `element itself + all descendants` 及“布局/display 也回退”因此仍不成立。应改为 unlayered 的 `.jx-pure .no-jx-pure, .jx-pure .no-jx-pure * { all: revert }`，再保留伪元素独立复位。

## B. 证据/文档残留

2. Firefox 脚本与归档证据闭合 11/11：range 胶囊/半高 groove/圆盘 ring、switch 几何、`:has()` 姿态、forced-colors 双回退及 Firefox select 平台箭头门控均有断言；真实 WebKit 仍是 SKIP（缓存 `pw_run.sh` 协议不兼容），债务记录诚实，不能计作跨引擎全绿。本轮现场重跑因现有 5199 服务返回 502 未重复通过，故不冒充新运行结果。

3. 新名已进入 Part A/B 镜像、verify 探针、Parity 锚点和 Forms demos，导航运行时的 `.jx-nav .jx-group` 既有类未被误删，符合冲突修复边界。但 `design.md:137,145,150,163` 与 `apps/www/test/jx-pure-parity.spec.ts:116` 的注释/示例仍写旧 `.jx-group`，本轮公共契约文档尚未全量同步。

4. range.svelte 与 hue-popover 已采用 pill groove + 圆盘 thumb 语言，Tier-1 Part A/B13 镜像一致；RTL scope-root 选择器、`:has(:disabled)` group/shell hover/opacity、对比度与 label click/focus 探针均已落地。验证脚本的“嵌套不复活”仍只观察按钮等 allowlist 元素，无法掩盖第 1 项通用复位缺口。

## C. 裁决与评分

**7.0/10 — Reject / 继续修复后再作 Owner acceptance。** 相比 r8 的 5.5，四项中 forced-colors、RTL、`:has(:disabled)` 已闭合，跨引擎/对比度/键盘证据显著补齐，新命名与圆形控件方向也正确；但 D2 仍是直接可观察的公共契约阻塞，且 WebKit 实测债务与少量旧名文档残留仍需明确收束。Chromium 61/61 ×3、327/327 与构建绿只能作为当前实现证据，不能覆盖该阻塞。

## D. r9 终验

**已闭合：D2。** Part B12 的站点与 registry 镜像现以 unlayered `.jx-pure .no-jx-pure, .jx-pure .no-jx-pure * { all: revert !important; }` 覆盖元素自身和完整后代；`!important` 合理地压过岛内 inline author style，伪元素复位仍独立存在。`r9-A1` 对未列举 `div` 的 inline `display:flex/color` 回退断言也与实现相符。

**剩余阻塞 1 / D6：结构 allowlist 在子控件规则处断裂。** `apps/www/src/lib/jx-pure.css:403,411`（及 registry 镜像）用 `label:has(> input, > textarea, > select):has(> span)` 给所有直接子控件套 chromeless/flex 规则，未复用父 shell 的 text-like allowlist。因此 `<label><input type="checkbox"><span>...</span></label>`，以及 radio/range/color/file 的同构标签，虽不获得 shell，仍会被 `flex:1`、`min-height:0`、`border:0` 等错误改写，违反 D6 的明确排除。子控件选择器必须与 shell 选择器共享同一 allowlist。

**剩余阻塞 2 / 文档：旧词汇未清。** `design.md:137-140` 仍给出 `.jx-group`、`.jx-group-prefix/-suffix` 的过时示例，且 D6 正文把新无类名结构规则替换成 `the structural group`，未记录当前 `label:has(> control):has(> span)` 契约；这与终态实现不一致。

**终验评分：8.0/10 — Reject。** D2 与其回归证据已真正闭合，Chromium 62/62 ×3、327/327、构建绿可作为现有证据；但上述 D6 可观察回归和错误文档必须修正后才能 Owner acceptance。WebKit SKIP 继续作为已记录的非阻塞验证债务。

**最终终裁：10.0/10 — Accept。** D6 的 shell 与子控件现共享 text-like allowlist，`r9F1` 锁定 checkbox/radio/range/color/file 标签永不被 chromeless；`design.md` 也已收束为无类名 `label:has(> control):has(> span)` 契约。以 Chromium 64/64 ×2、327/327 与构建绿为验收证据；WebKit 保持已登记的非阻塞补跑债务。

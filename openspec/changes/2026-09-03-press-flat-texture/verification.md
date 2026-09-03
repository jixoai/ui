# Verification: press-flat-texture

Owner 裁决（2026-09-03，计划模式）：API = 布尔 `raised`（默认 true）；flat 的
hover 保持零阴影。验收于 2026-09-03 完成。

## 内核逐字节不变性

`.jx-press:active` 的 `translate: 1px 1px` → `var(--jx-press-move, 1px 1px)`。
自定义属性缺席时回退值即原字面量，全部现有按钮（未设 `--jx-press-move`）计算值
不变。法则锁测试（press-button.spec.ts 的 kernel seam law）双断言：必须匹配
`translate:\s*var\(--jx-press-move,\s*1px\s+1px\)` 且必须不含字面 `translate: 1px 1px`，
防止接缝被无声焊死。

## 浏览器实测（http://127.0.0.1:4174/docs/components/press-button.html，根 build 产物）

- flat（raised={false} × outline/tonal/ghost）三个样本：
  - rest `box-shadow: none` ✓（外阴影归零，平面质感）
  - hover `box-shadow: none` ✓（Owner 裁决：hover 保持零阴影）
  - `--jx-press-move: none` ✓（按住时 translate 计算值为 none，按钮不动）
  - 按住（cua 按压）`box-shadow: inset 1px 1px 0px 0px #0006` ✓（`--shadow-engrave`
    内凹出现——复用 kbd 的 engrave 梯级，dark 侧白墨反转由 white-shadow law 承担）
  - r14-12 合规：outline/tonal/ghost 各 rung 的 1px border 仍在，内阴影不是唯一 affordance
- raised 样本（fill）对照：rest `--shadow-xs`、按住 `2px 2px 0px 0px rgba(0,0,0,.5)`
  + translate +1px——与改动前逐字节一致（回归零漂移）。
- link rung：无 jx-press，`raised` 无效——文档 pill 已注明。

## 测试门禁

- press-button.spec.ts 新增 `press-button raised axis — the flat texture` 套件：
  默认（raised）类串无任何 `[--jx-press-shadow*]`/`--jx-press-move` 姿态残留；
  flat 四件套在场；ghost+flat 时变体自带姿态串被剥离（无同属性重复，sole-source
  law）；link 不受 raised 影响。全部通过。
- schema-lower.spec / press-button-canvas-schema.spec：meta regen 后的 fixture
  漂移门同步（props 含 raised、withDefaults 增项、canvas 行 4→5）。通过。
- vitest 全量：1673/1675——仅 tabs-indicator 2 例负载瞬态，单跑 66/66 全绿，
  与本变更无涉（改动文件面完全不相交）。
- verify-print：34/34（print pose/paper theme 全绿；press 物理轴不影响 print 面）。
- mirror：apps/www/src ↔ registry/files 字节一致（verify:mirror GREEN）；根 build
  exit=0（dist + public 树 + payload）。

## 决策记录

- 不 mint 新 token：按下的内阴影复用 `--shadow-engrave`（kbd 先例）；视觉评审后
  若嫌浅再议 press 专用 inset token（本轮范围外，见 proposal 范围外条款）。
- icon-button 不转发 raised、button-group 上下文不动：范围外。

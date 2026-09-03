# Verification: press-flat-footers

Owner 指令（2026-09-04）："在 Card、Dialog 的 Footer 中，使用 Context 将
raised 的默认值改成 false"。验收于 2026-09-04 完成。

## 架构判定

复用既有先例：`ButtonVariantScope`（r14 tuning 2 为 "Context 控制
DialogHeader/Footer 里按钮默认值" 而生的零 DOM 边界）加 `raised` 接缝。
context 走 press-button 自有的新 key `PRESS_TEXTURE_KEY`
（`Symbol.for('jx-press-texture')`），**不**复用 `BUTTON_GROUP_KEY`——组键
是画笔策略且每个 ButtonGroup 都会重置它，物理轴必须穿透 joined group 不被
遮蔽（"physics never change with paint" 的 context 面）。scope 侧
inherit-then-provide：只声明画笔的嵌套 scope 不会反平面化外围 zone。

## 分辨率语义

`raised` 摘除静态默认：`explicit ?? zone ?? true`。副产物：meta 中 raised
失去 default → lowered schema 的 `required` 增补 raised（schema-lower
漂移门同步）；docs PropsTable 补行（默认列注明 zone-scoped）。ghost 的
none-trio（r13）与 flat 块的区分判据 = `[--jx-press-move:none]`（只有 flat
块设置它；ghost 凸面自带 none-trio 但不设 move）。

## 浏览器实测（http://127.0.0.1:4174，根 build 产物）

- dialog.html：打开 demo dialog，footer 的 Close 按钮
  `--jx-press-move: none` + `box-shadow: none` ✓；head 的 ×（IconButton）
  varMove 空（内核 1px 回退，凸面不变）✓
- card.html：两组 CardFooter（Cancel/Save、Clear/Checkout——ghost 与 fill
  油漆混排）全部 `varMove: none` + 零阴影 ✓（fill × flat = 物理与油漆
  正交的实证）；页面 body/head 按钮不受影响 ✓

## 测试门禁

- 受影响套件（press-button / dialog-ghost-scope / card / schema-lower /
  canvas-schema / button-group / dialog-grid）：106/106 全绿
- 全量 vitest：1682 例中 1673 绿；9 失败分解——2× button-group-overflow
  与 1× button-group.spec 快照属并行 card 流**当日 "real-DOM 分割线"
  在途改造**（其 button-group.svelte wrap apply 改为 separator 占位偶数
  列算法，spec 尚未跟上；与本变更无涉——本变更未触碰 button-group.svelte/
  .css/dialog-footer），tabs-indicator 2 例 + table 1 例为已知负载瞬态
  （单跑全绿），其余为同流在途文件的连带
- registry-payload-parity ✓（根 build 后）、verify:mirror GREEN、
  verify:meta ✓、verify:docs ✓、verify-print 34/34 ✓、根 build exit 0
  （一次 .svelte-kit 增量态损坏，清 output 重跑自愈）

## 并行流隔离记录

card/（含 card.svelte 的 foot-flat 挂载与 card.spec 断言）、
button-group.svelte/.css、dialog-footer.svelte、button-group.spec、
card-grid、blueprints、mirror-manifest.json、registry.json 等在途文件
照旧不卷入本次提交——card 侧的 flat 挂载与断言随该流提交落地。

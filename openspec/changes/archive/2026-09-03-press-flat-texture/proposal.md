# Proposal: press-flat-texture — press-button 的 raised 质感轴

## Why

Owner 需求（2026-09-03）：现有按钮阴影全部是外阴影（凸起感）；需要一种
**平面按钮质感**——静止无阴影，**按下时按钮不位移，用内阴影制造
"被按进去"的错觉**。

今天的 press law 只有凸起一种物理：rest `--shadow-xs` → hover `--shadow-sm`
→ active 位移 +1px,+1px 且阴影按 minus-1px 法则反缩。ghost 虽可三姿态
全 none，但保留裸位移——平面无阴影的按压反馈仍要靠移动，无法表达
"按进平面里"。

Owner 裁决：API 为布尔 **`raised`（默认 `true`）**；flat 的 hover 保持
零阴影（各油漆 rung 自带 hover 色调已足够表达可按性）。

## What Changes

1. **内核接缝一处**（jixoai.css press law，unlayered）：
   `.jx-press:active` 的 `translate: 1px 1px` 改为
   `translate: var(--jx-press-move, 1px 1px)` —— 按压向量成为第四个
   姿态接缝（与 `--jx-press-shadow/-hover/-active` 同族）。默认行为
   逐字节不变。
2. **press-button 新 prop**：`raised?: boolean = true`。`raised={false}`
   （非 link rung）时剥离变体自带的 `[--jx-press-shadow*]` 姿态串
   （ghost 冲突源——同属性工具类不得共存），追加 flat 姿态块：
   `[--jx-press-shadow:none] [--jx-press-shadow-hover:none]
   [--jx-press-shadow-active:var(--shadow-engrave)] [--jx-press-move:none]`。
3. **零新 token**：按压内阴影复用 `--shadow-engrave`（engrave 层级：
   刻入平面；light 黑墨 / dark 白墨反转，white-shadow law 现成）。
4. **法则记录**（component-authoring delta）：变体语法的油漆梯子依旧
   封闭；`raised` 是与油漆正交的**物理轴**，全部经由既有姿态定制机制
   （--jx-press-* customs）表达——机制新增 `--jx-press-move` 接缝。
   press 位以 engrave 内凹表达按压是获准的姿态表达（press 位本身就是
   affordance），区别于 well-at-rest 控件"hover 只变强度不变层级"法则。
5. r14-12 合规：flat 保留 1px border 框，内阴影永不做唯一 affordance；
   loading 位保持 press law；效果循环（shimmer/ripple 等）与阴影姿态
   无关。

## Impact

- 文件：jixoai.css（内核一行 + 注释）、press-button.svelte（prop +
  姿态组合）、press-button.meta.ts（regen）、docs 页 press-button.html
  （flat 演示行 + prose）、press-button.spec.ts（raised 轴套件）、
  css 法则锁测试；镜像（press-button / theme css / test / docs 页）、
  manifest、根 build。
- 范围外：icon-button 不转发 raised（后续按需）；button-group 上下文
  不动；不 mint 新阴影 token（视觉评审嫌浅再议 engrave-press）。
- link rung 无 jx-press，raised 无意义（文档注明）。

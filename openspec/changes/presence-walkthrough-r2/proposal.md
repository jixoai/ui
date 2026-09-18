# presence-walkthrough-r2 — Owner 视觉走查 R2 的六项修复

## Why

Owner 于 2026-09-19 对 presence-liveness 终态（Codex R3 8.5/10 后）
做了真机视觉走查，判定「大部分没问题」，给出两个主要瑕疵 + 四个
次要瑕疵。本变更收敛这六项——不扩大范围（不过度迭代法则）。

## Owner 反馈（逐字，走查记录）

主要：
1. 「目前的颜色轮转需要改进改进，不然两个相邻颜色之间太相似了，
   最好是在一个圆形色盘上，每次选色能选到对面的色，当然不是正对面，
   因为也要尽量避免颜色重复或者相似」
2. 「多个 property-kit 内有同一个 component 的 id，所以你在记录选中的
   时候，要同步记录选中的 property-kit。不然我现在看到不论怎么选，
   始终渲染 property-kit#1」

次要：
1. 「彩带的绘制还是有 BUG，好像是 border-image 的宽度不对，我给你
   截图了」
2. 「后面进来的用户，无法立刻收到前面用户的状态（如果前面用户没动作
   的话，就没有事件给它推送好像），需要主动推送状态快照」
3. 「光标的样式需要改进，现在是一个 dot，最好绘制成真正鼠标的形状。
   另外使用混合模式，来避免遮挡 canvas 的内容」
4. 「光标、指示器都带有用户 ID，这个 ID 最好用半透明背景保护起来
   (badge)，否则看不到文字」

## 根因定位（2026-09-19，代码实证）

| # | 反馈 | 根因（文件:行） |
| --- | --- | --- |
| 主1 | 相邻色相太相似 | `ledger.ts:69` `hueOfCounter = (73*counter)%360`——固定 73° 步进，第 n 与 n+1 个玩家永远只差 73° |
| 主2 | 永远渲染 kit#1 | picker 已带 frameId（picker.js:526,595），但 shell 上报硬编码 `frameId: null`（shell.svelte:432）；overlay 的 `resolveAttentionBox` 按 DOM 序扫 iframe 取首个命中（presence-overlay.js:231-234） |
| 次1 | 彩带宽度 bug | vision 子代理像素判读（146×68 裁剪，非黑比 1.0）：彩带渐变本体正确 2px 竖向分段；旁边多出一条等宽纯色浅蓝（rgb(86,156,255)=--primary）——nav 行内层 family Item 的 selected 强调边 `box-shadow: inset 2px 0 0 var(--primary)`（item.css:401-404）与行元素彩带并排叠加成 8 物理像素。树行 selected 仅文字变色，无此问题 |
| 次2 | 晚来者无状态 | gateway `#viewOf` 的 roster 视图不含 cursor（gateway.ts:440）——welcome 只带 attention；存量玩家不动就没有 presence 帧给后来者 |
| 次3 | 光标是 dot | overlay 的 cursor 元素是 9px 圆点（presence-overlay.js:77-82），无混合模式 |
| 次4 | ID 看不清 | ring badge `.jx-remote-badge` 无背景（presence-overlay.js CSS 块）；cursor tag 有背景但 ring badge 没有 |

## What Changes

1. **色相分配重设计（主1）**：圆形色盘上的「对面偏置最大最小距离」
   选色——新玩家色相 = 对全体在场玩家色相的最小圆周距离最大化
   （argmax-min），排除与任一存量色相正对（±180°）的候选避免
   「正对面」，并列时偏向最近加入玩家的对面侧。首个玩家锚定 73°
   （品牌锚不变）。确定性、O(360·N)。ledger 铸造身份时由 gateway
   传入在场色相集合；重连经 token 恢复原记录色相（身份稳定）。
2. **frame 定位的选中（主2）**：attention 的 canvas 分支真实携带
   `frameId`（picker/tree 两侧都有）；overlay `resolveAttentionBox`
   frameId 非空时先按 `iframe[name="jixoai-design-frame-<id>"]` 定位
   kit 再在其文档内查 id，未命中才回退全扫。ring/badge 落在正确的
   kit 上。
3. **彩带宽度修复（次1）**：统一彩带模型裁决——行携带彩带时彩带
   独占左 2px 槽位：`.studio-canvas-row[data-jx-remote-ribbon]` 内的
   `.jx-item[data-selected='true']` 抑制 inset 强调边（selected 的
   背景高亮保留）；无彩带时 family 现状不变。
- **A3 彩带**：选中 nav 行带彩带时，左缘只有彩带一条 2px 竖条
  （矩阵断言：带 ribbon 的选中行 `.jx-item` computed box-shadow 为
  none；无 ribbon 的选中行保持 inset 2px）。
4. **welcome 状态快照（次2）**：`#viewOf` 增加 `cursor` 字段
   （additive，词表向后兼容）；store 解析 welcome roster 时并入
   RemotePlayer.cursor——晚来者打开即渲染存量玩家光标/注意力，
   不依赖对方再动。
5. **真箭头光标 + 混合模式（次3）**：cursor 元素改为内联 SVG 箭头
   （经典指针形状，玩家色描边/填充），`mix-blend-mode: difference`
   避免遮挡 canvas 内容；名签不参与混合（可读性优先）。
6. **badge 半透明背景（次4）**：ring badge 补 `hsl(h, 85%, 45%, .92)`
   系背景 + 深色文字（与 chips/caret tag 家族一致）；cursor tag 复核
   对比度。

## 验收标准（每项可断言）

- **A1 色相**：连续 5 个新玩家加入，任意两两色相圆周距离 ≥ 60°
  （单元测试锁 argmax-min 语义：第 2 人 ≈ 对面但非正对、第 3 人
  远离两者）；重连玩家色相不变。
- **A2 kit 定位**：同一 component id 存在于两个 kit 时，在 kit#2
  内选中 → 对端 ring 渲染于 kit#2 的组件 box 上（矩阵双实例断言：
  ring 几何落点在 kit#2 iframe 的 box 内，不在 kit#1）。
- **A4 快照**：A 先在场且光标停留 → C 后加入 → C 端 2s 内渲染 A 的
  光标与 ring，A 无任何新动作（矩阵断言）。
- **A5 光标**：远程光标元素为箭头形状（SVG/clip-path 可断言）且
  带 mix-blend-mode；不遮挡下的内容可读（视觉走查终验）。
- **A6 badge**：ring badge 与 cursor tag 均有半透明背景
  （computed background 非 none，矩阵断言 + 走查）。

## Impact

ledger/gateway（色相法、roster 视图）、shell（attention frameId）、
presence-overlay（resolveAttentionBox 定位、光标形状、badge）、
store（welcome cursor 并入）；矩阵新增 A1-A6 断言组；
单测：色相算法、roster 快照、frame 定位解析。

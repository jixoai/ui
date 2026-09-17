# design — 中心化网关 + Player 在场 + 三类指示器

减法原则沿用验收修复轮：规律可述、单一真相、复用现有机制（picker 的
overlay/glide 家族、admission 钩子、lens 广播）。

## 1. 消息词表（冻结——服务端与客户端的共享边界）

WebSocket 端点 `/__design__/ws`，JSON 消息、tagged-union（协议风格）。

**连接（Auth，极简 token）**：URL query `?name=<urlencoded>&kind=human|ai&token=<t>`。
- 无 token：服务端签发新 token（随机 32hex）+ 新 Player 身份（新色号）。
- 有 token 且账本命中：恢复该 Player（同 playerId、同色号、同 name）。
- token 错误/过期：按新 Player 处理（token 是身份凭据，不是密码——
  dev 级 Auth；正式鉴权后置分布式引擎轮）。

**C→S**：
```jsonc
{ "type": "cursor", "surface": "canvas|shell|frame:<frameId>", "x": 0, "y": 0 }   // 文档内坐标，~50ms 节流
{ "type": "attention", "focus": { "kind": "canvas", "component": "press-button", "instance": 1, "frameId": null } }
{ "type": "attention", "focus": { "kind": "panel", "field": "prop-raised", "digest": "raised=false→true" } }
{ "type": "virtual-mouse", "enabled": true }    // AI 注册/注销虚拟鼠标
{ "type": "ping" }
```

**S→C**：
```jsonc
{ "type": "welcome", "playerId": "p3", "token": "…", "colorHue": 219, "players": [ /* PlayerView[] */ ] }
{ "type": "join", "player": PlayerView }
{ "type": "leave", "playerId": "p1" }
{ "type": "presence", "playerId": "p3", "cursor": {…}|null, "attention": {…}|null, "hasMouse": true }  // 合并节流广播
{ "type": "journal-tail", "seq": 1234 }   // journal 行数——客户端增量 /sync
```

**PlayerView**：`{ playerId, name, kind: 'human'|'ai', colorHue, hasMouse,
attention: focus|null }`（不含 cursor——cursor 在 presence 流里）。

`playerId` 形如 `p<n>`；`n` 与色号同源（Player 序号即加入次序，
counter 永不复用）。

## 2. presence 账本（单一真相，持久化）

`.jx-collab/presence.json`（schema fail-stop，store.ts 风格）：

```jsonc
{ "counter": 7,
  "players": [ { "playerId": "p1", "name": "owner", "kind": "human",
                 "tokenHash": "sha256:…", "colorHue": 73, "firstSeen": 0, "lastSeen": 0 } ] }
```

- `counter` 只增不减：每个新 Player（无 token 或 token 未命中）→
  `counter += 1`、`playerId = p<counter>`、`colorHue = (73 * counter) % 360`。
- 在线状态是网关内存态（WS 连接表），**不落盘**；账本只记身份。
- 离线超时（如 5s 无 ping）→ leave 广播 + 内存摘除；重连（同 token）
  → join 广播、色号不变。

## 3. 网关实现（server/presence/）

- `gateway.ts`：`attachPresenceGateway(httpServer, host)`——`upgrade`
  事件路由 `/__design__/ws`（其它 upgrade 不碰，Vite HMR 的 ws 通行）。
  `ws` 库（`new WebSocketServer({ noServer: true })`）。
- 广播规律：cursor/attention 按 ~50ms 合并（每 player 每 kind 一条）；
  join/leave 即时；`journal-tail` 在 admission 成功钩子处即时。
- **admission 钩子**：`collab-host.ts` 成功 commit 后调
  `gateway.notifyJournalTail()`；同时把 op 的 actor 映射为 Player 代发
  attention（actor→player：服务端启动 dsh 会话时代注册 `kind:'ai'`
  Player；面板 op 的 sessionHint 就是 playerId）。映射不到就只发
  journal-tail，不造 ghost。
  **注意力的分工**（视觉走查钉死的语义）：面板来源的 op（sessionHint
  带 field）→ **panel focus**——人此刻在表单上操作，观察端看到面板
  描边，digest 首字段是目标组件 id（`a4 · raised=false→true`——观察者
  立即知道对方在动哪个组件）；无 field 的 op（AI lane、CLI）→
  **canvas focus**（ghost ring 落在目标组件上）。客户端主动的
  C→S `attention` 上报 v1 未接线（API 保留，画布直编辑轮接入）。
- WS 断连的 studio 降级：presence 指示器消失，**编辑链路一字不动**
  （op 走 HTTP——WS 从不是关键路径）。

## 4. 客户端（studio/presence-store.ts + overlay）

- store：连接（studio 打开即连，URL 带 name=`designer`?name 参数或缺省
  `human-<rand4>`、kind=human）、重连退避、players 表、自己的
  playerId/token（sessionStorage 存 token）。
- **Player 列表**：顶栏 chips（色点 hsl(hue,85%,45%)、名、在线数）。
- **鼠标行为指示器**：自己端 pointermove → cursor 上报（surface 判定：
  命中 canvas iframe → 'canvas' + canvas 文档坐标（lens 反算）；
  否则 'shell' + 壳坐标）。远程渲染：canvas surface 的远程光标进
  canvas 文档 overlay（picker 同层）；shell surface 进壳 overlay。
  元素 per-player 常驻（join 建、leave 删），CSS transition 平滑。
- **画布聚焦指示器（ghost ring）**：远程 attention{canvas} → canvas
  文档 overlay 的 per-player ring（Player 色、1px、opacity .55、
  badge `<name> · <component>#<n>`）；目标变化 glide（同 picker 的
  transition 家族）；跟随复用每帧对齐思路（attention 不动就不重摆）。
- **网页聚焦指示器**：远程 attention{panel} → 壳上目标字段行
  （`#<field>` 或 panel 容器）描边（Player 色 2px）+ 右上名签 +
  digest 文本；字段离开/变化时平滑移交。
- 三指示器同族：`[data-jx-remote="<playerId>:<kind>"]` 命名空间，
  共享一套 INDICATOR_CSS 风格注入（canvas 文档与壳各一份）。

## 5. AI 侧

- dsh 会话启动：服务端代注册 ai Player（name=`dsh`、无鼠标）。
  admission 钩子代发其 attention（op 的 target → canvas/panel focus）。
- AI 自主虚拟鼠标：AI 进程（或 ego-browser 的 agent）直连 WS，
  `virtual-mouse enabled` 后发 cursor——渲染与人类光标同规。
- 测试用 mock agent：node 脚本连 WS + fetch /admit（复用 W6 的
  Loro 信封构造）。

## 6. 测试矩阵

**TDD（playwright，node:test 内嵌或独立 mjs）**——双 browser context
连同一临时 server（测试自起自收）：
- 人×人：join/leave 互见；Player 列表与色序（73°,146°,219°…）；
  光标互见（A 移动 → B 端 overlay 坐标断言）；A 勾选 raised →
  B 端 journal-tail → /sync → 画布 HMR 更新 + A 的**面板聚焦描边**
  （digest `a4 · raised=…`——面板 op 的注意力分工，见 §3；AI/画布
  直 op 才产生 ghost ring）；双方重叠编辑 → 冲突卡（既有 §6 行为
  不回归）。
- 人×AI：mock AI（WS kind:'ai' + /admit op）→ 人端看到 AI 的
  attention（画布聚焦 ring、面板聚焦描边）；AI 无光标断言。
- AI×AI：两个 mock AI 交错 op（W6 三向模式的 ai-lane 复刻）→
  双方 attention 各自广播、融合落盘。
- 边缘：断线重连（同 token 同色号）；退出再进（新号新色，counter
  只增）；并发 admit 409 重试链路；WS 全断时编辑照常；虚拟鼠标注册
  前后光标显隐；presence.json 损坏 fail-stop（studio 照常起、网关
  重建账本）。
**ego-browser 双实例**（vision 子代理）：真浏览器视觉走查——光标
移动的平滑过渡、ghost ring 的 glide、颜色与名签、面板聚焦描边、
断线时指示器消失。

## 7. 不做（记录在案）

- 分布式引擎 / 正式鉴权（token 即身份的 dev 级 Auth）。
- op 上 WS（admission 通道不动——WS 只通知）。
- 光标的文档间连续动画（跨 surface 切换直接换层，不做 FLIP 接力）。
- 客户端主动 C→S `attention` 上报的接线（API 与词表保留；画布直编辑
  轮接入——v1 的注意力全部经服务端 admission 钩子代发）。
- 后台标签页的 presence 冻结（rAF 饥饿——前台协作不受影响，视觉
  走查记录在案）。

# collab-presence

## Why

epic40 的协同内核（admission/journal/file-resync）已落地并经 Owner 验收，
但它是**请求驱动**的：没有实时通道、没有多 Player 的可见性。Owner 裁决
（2026-09-17）：把协作内核推到真正可用——先上**简单的中心化服务器**提供
Auth 认证与 WebSocket 连接服务（分布式引擎后置）；测试要双浏览器实例
（AI 测试用 ego-browser 给 vision 子代理、TDD 用 playwright），模拟
人类×人类、人类×AI、AI×AI 三种协作并覆盖边缘情况；人类与 AI 统称
Player（或 Designer）。

## What Changes

- **中心化网关**（design server 自身）：`/__design__/ws` WebSocket 端点
  挂在 Vite httpServer 的 upgrade 上；极简 token Auth（首连签发、重连
  恢复同身份同色号）；presence 广播 + journal 追加通知。**op 不搬上
  WS**——admission 权威与既有 HTTP 链路一字不动，WS 只做通知与在场。
- **Player 与颜色**：workspace 级 presence 账本
  （`.jx-collab/presence.json`，append 心态的 counter 永不复用）；
  色号 n 从 1 单调累加，`hue = (73 * n) % 360`；退出再进取新号，
  永不复用旧色。
- **三类指示器**（共享元素思维，与 picker ring 同族的 overlay/glide）：
  1. **鼠标行为指示器**——远程 Player 的光标（名签 + Player 色箭头，
     按 surface 分发到 canvas 文档 overlay 或 studio 壳 overlay）；
     AI 默认无鼠标不显示，可注册**虚拟鼠标设备**（注册后其 cursor
     上报照常渲染）；
  2. **画布聚焦指示器**——远程 Player 的画布注意力的 ghost ring
     （Player 色、细线降透明、badge 带 Player 名）；
  3. **网页聚焦指示器**——远程 Player 正在操作的表单/字段描边 +
     名签（知道 AI 在改哪个面板、做什么）。
- **AI 的注意力 = 最后一次 op**：服务端在 admission 成功后把 op 的
  actor 映射到 Player 身份并代发 attention 广播（dsh 会话由服务端代注
 册 kind:'ai'）；AI 也可自己连 WS 注册虚拟鼠标发 cursor。
- **Player 列表**：studio 顶栏 chips（色点 + 名 + 在线计数）。

## Impact

- 新增 `packages/design-tool/src/server/presence/`（gateway + ledger）、
  `studio/presence-store.ts`、remote 指示器 overlay（canvas 文档侧 +
  壳侧）；改 `server/create.ts`（upgrade 挂载）、`collab-host.ts`/
  `collab-api.ts`（admission 成功钩子 → journal-tail 通知）、
  `shell.svelte`（store 接线 + Player 列表）、picker/entries（remote
  ring 家族）。
- 依赖 +`ws`（+@types/ws）。
- 协议词表零改动（WS 通知不是 op 通道）；specs：collab-protocol
  ADDED presence requirement、design-studio-shell ADDED 三指示器。
- 验证：playwright 双实例 TDD 矩阵（人×人 / 人×AI / AI×AI / 边缘）+
  ego-browser 双实例视觉走查（vision 子代理）+ 既有全量与 walkthrough
  不回归。

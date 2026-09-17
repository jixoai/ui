# tasks

## 1. 服务端网关

- [x] 1.1 `ws` 依赖；`server/presence/gateway.ts`（upgrade 路由
      `/__design__/ws`，Vite HMR ws 通行）
- [x] 1.2 token Auth（首连签发/重连恢复）+ presence 账本
      `presence.json`（counter 只增、hue=(73n)%360、schema fail-stop）
- [x] 1.3 广播：join/leave/presence（cursor+attention 合并节流 ~50ms）/
      journal-tail；ping/pong 离线超时
- [x] 1.4 admission 成功钩子（collab-host → gateway）：journal-tail +
      actor→Player 代发 attention；dsh 会话代注册 ai Player
- [x] 1.5 网关单测（纯函数 + 内存 server；词表契约测试）

## 2. 客户端

- [x] 2.1 `studio/presence-store.ts`（连接/重连退避/players/身份 +
      sessionStorage token；URL ?name= 支持）
- [x] 2.2 Player 列表 chips（色点+名+计数）集成进 shell 顶栏
- [x] 2.3 鼠标行为指示器：双端上报（surface 判定 + 坐标映射）+ 远程
      光标 overlay（canvas 文档层 / 壳层，per-player 常驻元素）
- [x] 2.4 画布聚焦指示器：远程 ghost ring（Player 色、glide、badge）
- [x] 2.5 网页聚焦指示器：面板字段描边 + 名签 + digest
- [x] 2.6 AI 虚拟鼠标：virtual-mouse 注册后 cursor 照常渲染
- [x] 2.7 客户端单测（store 词表契约 + overlay source-law）

## 3. 测试矩阵

- [x] 3.1 playwright 双实例：人×人（presence 互见/色序/光标/编辑同步/
      冲突卡）
- [x] 3.2 人×AI（mock agent：attention 呈现、无光标）与 AI×AI（交错
      op 融合）
- [x] 3.3 边缘：重连同号、退出再进新色、并发 409、WS 断连降级、
      账本损坏 fail-stop、虚拟鼠标开关
- [x] 3.4 ego-browser 双实例视觉走查（vision 子代理）通过

## 4. 收口

- [x] 4.1 全量包测试 + walkthrough 不回归
- [x] 4.2 specs delta（collab-protocol ADDED presence；
      design-studio-shell ADDED 三指示器）+ validate --strict
- [x] 4.3 对抗复核（阻塞清零）+ 提交推送

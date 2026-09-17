# tasks

## 1. TDD 先行（红）

- [x] 1.1 矩阵新增 P1-P7 断言组（.zcode/presence/tdd-matrix.mjs；时延
      页内 rAF 打点、跨帧连续性、range 渲染、border-image computed
      形态）——红线基线两轮（48/62 → 51/62，期望红集 = P3/P4③/P5/P6，
      B/C 线范围）
- [x] 1.2 单测：selection→attention 接线（presence-indicators 源文法
      则更新）、caret range 词表（gateway/store 校验 + 测试）、
      browserPresenceSocket 预连接缓冲（P1 教训回归测试）、
      ribbonOf 的 Owner 语法输出（C 线随实现落）

## 2. 实现

- [x] 2.1 selection→attention：shell 选中/清除上报（优先级法则：
      面板字段 focus > canvas 选中 > 无；presenceStoreRef/panelFocusHeld
      必须 $state——plain let 让 effect 在 mount 时空读早退后永不再跑，
      probe 实证）；远程端渲染 A 的选中环（P1）
- [x] 2.2 frame-entry 光标转发 + overlay offset 换算（P2）：
      surface `frame:<id>` 全链（帧内 pointermove rAF → postMessage →
      overlay 转发 → shell 透传 → gateway）；**坐标空间法则：kit 上报
      是帧内 CSS px（pre-lens），iframe rect 是 post-lens 视口 px，
      两者只经实测缩放 k=rect.width/kitViewportWidth 相通**——
      placeCursor 与 resolveAttentionBox 的 kit 分支都要乘 k
- [ ] 2.3 面板输入实时 admit（300ms debounce，P3）——B 线
- [ ] 2.4 remote-caret 重写（参考 HTML 法）+ selection range 词表
      与渲染（P4）——B 线
- [ ] 2.5 nav/树彩带 Owner 语法统一模型（P5/P6）——C 线
- [x] 2.6 延迟压缩（cursor 上报 rAF / gateway 合并窗 50→16ms /
      attention 节流 32ms 待 B 线落到面板，P7）

## 3. 验证与收口

- [ ] 3.1 矩阵 P1-P7 全绿（含既有断言不回归）
- [ ] 3.2 vision 子代理 ego-browser 双实例真机走查（七项逐条）
- [ ] 3.3 全量 + validate + 提交推送

## 血泪法则（本变更新增，后续任务必读）

- **studio SPA 是预构建静态 bundle**（`packages/design-tool/dist-studio`，
  `npm run build:studio`）：改 `src/studio/**` 后不重构建，浏览器跑的是
  旧代码——第一轮矩阵 P1/P2 全红即为 stale bundle 假红。任何
  shell/panel/tree 改动后的运行时验证前必须 build:studio。
  （`src/server/entries/**` 走 vite 直出，不受此限。）
- **WebSocket CONNECTING 期 send 会同步抛**——browserPresenceSocket
  现已预连接缓冲 + 垂死静默丢弃；此前该异常在 mount 期炸毁了 shell 的
  selection→attention $effect（Svelte 效果抛错即死）。
- 矩阵时延断言用页内 rAF 打点，不用轮询 evaluate 的到达时刻
  （矩阵负载下 RTT 50-100ms，会把 40ms 实测成 205ms）。

## 3.4 vision 真机走查（2026-09-18，七项判定：5 符合 / 2 发现）

- [x] P1/P2/P4/P5/P6(单人)/P7 真机符合（截图 .zcode/presence/walkthrough/，
      10 张全过黑图校验；P7 实测光标全管线 127-156ms 中位 131ms，caret
      ~65ms，P5 像素级验证竖向分段 + self 首段）
- [ ] **发现 A（P3 残口）**：popovertarget 类 prop 文本 input 实时链路
      不通（打字+失焦 800ms 均不同步）——slot textarea（428-481ms）与
      其余 prop 行正常。疑与发现 B 同根（地址缝）。
- [ ] **发现 B（P6 真实链路缝）**：画布点击上报的 attention.component
      对部分组件是帧实例 id（o2/p2），与树行 usage 的 componentId
      （press-button 等）命名空间不匹配——树 multi 分段在真实 UI 中
      仅对带协议 id 的组件（如 hero 的 a4）可达，mock/矩阵路径已证
      渲染本身正确。下一迭代：统一 stamping 的 componentId 语义
      （picker 各 emit 路径的 id 兜底/回退法则）。

## 3.5 提交

- [x] 全量电池 556/556（走查前同棵树复跑）+ 矩阵 62/62（green5）
- [x] openspec validate --strict 通过（archive 顺序注记：需
      collab-presence → presence-visuals 先归档）

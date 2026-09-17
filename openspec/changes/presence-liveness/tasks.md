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
- [x] **发现 A（P3 残口）— 已修复（2026-09-18 复核定根）**：真实根因
      是「对端 materialize 后本端面板不 reseed」——镜子里新 buffer 容器
      已到，但面板的 buffer 列表是 seed 期结构，新 prop 行永不成为可表
      示、远程输入框永远空。修复：面板 subscribe 每次镜像变化都探
      `mirrorCarriesUnseededBuffer`（冻结字符集外的名字一律 false，
      绝不抛——首个实现把 ariaLabel 探进了 slug 校验、整面板炸成
      unavailable，这是探针自身的教训），发现增长即 reseed。回归锁：
      矩阵 P8②（双端真实选中 p2，B 打字 → A 镜像；实测 162-347ms）。
- [x] **发现 B（P6 真实链路缝）— 复核不成立 + 真缝另在（2026-09-18）**：
      命名空间本就对齐（o2/p2/press-loading-light 全是 ingest 的合法
      协议 id；probe 实证 attention='p2' → 树行点亮）。走查命中的是
      两个真问题：(1) kit 帧内容加载竞态——空帧上的点击 promote 成容
      器 id；(2) 折叠/晚渲染行的彩带同步缺口——ribbon map 先于行渲染
      定型后，晚到的 li 不再被同步（修复：树根 MutationObserver 补同
      步，childList-only 无回环）。回归锁：矩阵 P8①（真实点击 →
      attention=p2 + badge + 树行 multi 含远程段）。矩阵学到的测量
      法则：折叠下方的 kit 要先 scrollIntoView（y=1138>视口的点击打
      在页底什么都选不中）。

## 3.5 提交

- [x] 全量电池 556/556（走查前同棵树复跑）+ 矩阵 62/62（green5）
- [x] openspec validate --strict 通过（archive 顺序注记：需
      collab-presence → presence-visuals 先归档）

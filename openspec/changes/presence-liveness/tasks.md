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
- [x] 2.3 面板输入实时 admit（300ms debounce，P3）——B 线（矩阵 P3/P8② 锁）
- [x] 2.4 remote-caret 重写（零宽 span 镜像法）+ selection range 词表
      与渲染（P4）——B 线（矩阵 P4 全绿）
- [x] 2.5 nav/树彩带 Owner 语法统一模型（P5/P6）——C 线（矩阵 P5/P6 全绿）
- [x] 2.6 延迟压缩（cursor 上报 rAF / gateway 合并窗 50→16ms /
      attention 节流 32ms 待 B 线落到面板，P7）

## 3. 验证与收口

- [x] 3.1 矩阵全绿 64/64（P1-P8 含既有断言不回归；final 轮）
- [x] 3.2 vision 真机走查：5/7 符合，2 项发现已定根修复并回归锁（P8）
- [x] 3.3 全量 556/556 + validate 绿 + 提交推送（d1fbd91d + 6cd2e96a）

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

## 3.6 Codex 对抗复核 R1（2026-09-19，5.5/10 NEEDS-WORK → 修复迭代）

复核报告 `.zcode/presence/codex-review-r1.md`（独立双跑矩阵：40/42
fatal / 58/64；焦点单测/strict/build 亲证绿）。三个阻塞项 + 五个
非阻塞观察，处理如下（抓重点，不过度迭代）：

- [x] **B1 树点击断链（产品缺陷，deterministic）**：component-tree
      的 pick() payload 漏 `componentId` ——树入口的 selection 永远
      不带 protocol id，attention 断链。修复：payload 透传
      `componentId: node.componentId`；矩阵新增 P1③（树行点击 →
      observer 收 kind=canvas/component=<stamp id> → 对端 ring badge
      命中同组件 + stamp 落画布核实）。
- [x] **B2 门槛放宽 + 不可复现（TDD 诚信）**：上轮把 P1②/P3/P4② 抬到
      500/1000/150ms —— 已回滚到 Owner 冻结预算 200/600/100 作硬断
      言；噪声（loadavg/采样明细）进 evidence JSON 回执（矩阵自动落
      .zcode/presence/runs/，curated 副本进本变更 evidence/）。稳定
      性修复：D13② 重建三条件改 10s 轮询（一次性快照会读半途态）；
      P 组整体 FATAL 防扩散 try/catch（单块崩溃不再吞掉 P4-P8+FIX）。
- [x] **B3 P4 caret 长尾（356ms 实测超 150ms 门槛）**：根因 =
      selectionchange 读取的纯 rAF hop 在 rAF 饥饿下无上界（重页面
      一帧 300ms+）。修复：dualTrackSchedule（rAF + 8ms setTimeout
      双轨单发，输家 no-op；node/ssr 无 rAF 时纯 net）。门槛回滚
      100ms 硬断言。
- [x] **N1 nav 彩带行本位**：ribbon 属性+style 移到 `.studio-canvas-row`
      行元素自身（与树 li[data-path] 同律），子 span 与其 CSS 退役；
      矩阵 P5①② 增加 on='row' 断言；E3/P5 读取器行优先、子兜底。
- [x] **N2 客户端 range guard 镜像**：presence-store 的 isAttention
      补齐 gateway isValidFocus 同律（panel selection 整数/非负/
      end≥start；canvas component 非空、instance 整数）；单测
      'panel attention selection mirrors the gateway range guard'。
- [x] **N3 类型债**：shell 的 `surface as never` → 运行时收窄
      （'canvas'/'frame:<id>' 词表外即拒）；panel 的
      HTMLSelectElement→HTMLInputElement 强转 → instanceof 分支。
      两者均有源码法单测更新。
- [x] **N4 注释漂移**：三处 ~50ms 表述改实况（gateway 16ms 窗、
      store 16ms 节流、overlay rAF 汇报）。
- [x] **N5 全量电池 1 fail**：collab-host fs.watch 首事件超时——
      Codex 亦判定为环境既有抖动、非 presence 改动；本轮三次电池
      557/558→558/558→558/558（flake 实证），如实记录不美化。

### R2 重验证（2026-09-19）

- [x] 焦点单测 87/87（8 文件）+ 全量电池 558/558
- [x] build:studio 重建（stale-bundle 法则）+ validate --strict
- [x] 矩阵（Owner 预算硬门槛 200/600/100）：r2 61/65 → r3 64/65 →
      **r4 65/65 全绿**（回执 curated 于 evidence/，含 loadavg 与采样
      明细；关键采样：P1② 63ms、P1③ 树点击链 stamp=kit帧 ✓ badge
      "alice-p · a4"、P3 357ms、P4② 23ms、P7② 73ms、P8② 347ms）
- 本轮矩阵两条新法则（已写进矩阵注释）：(1) 树页面行点击触发 W1
  锚定相机 tween——涉锚定的断言必须排在 P2 之后（r2 实测 -393px
  lens 漂移）；(2) E6②「blur→null」与 selection-reclaim 设计矛盾
  ——瞬态 null 可被 16ms 合并窗折叠（latest-wins），断言改确定性
  reclaim 法则，真 null 路径由 P1 Escape 轮 + gateway 单测覆盖。

# Verification: print-paper-theme

## 纸是白的——强制 light 与声明式暗纸（2026-09-03）

证据快照（本轮全绿）：

| 门禁 | 结果 |
|------|------|
| apps/www vitest 全量 | 112 files / **1661 tests 全过**（含本轮新增 15 用例：page-config 4、pipeline 6、freeze 3、gate 1、code-card 1） |
| registry 镜像测试 | print-page-config / print-stylesheet-gate 两份逐字节同步 |
| `verify:mirror` | **GREEN**（105 items / 373 file pairs；清单刷新留在工作区归 card 批次合并提交） |
| root `npm run build` | 通过（106 registry payloads；payload parity 复验通过） |
| `verify:print`（真实 Chromium） | **34/34 全过**，新增两查： |

关键探针读数（verify-print §2k）：

```
暗色文档（html.dark + color-scheme:dark）→ 默认飞行:
  stamp=light  scope=jx-light  color-scheme=light
  正文墨水 ink=oklch(0 0 0)（亮度 0 —— 修法前是 oklch(1 0 0) 白字白纸）
  --tok-token-function = color-mix(… oklch(.6489 .237 330) 62%, oklch(0% 0 0))
                        （浅色公式，零 oklch(1 0 0) 白混字面量）

直接盖声明暗章（data-print-theme='dark' + dark 作用域）:
  printColorAdjust=exact  纸底=oklch(0 0 0)（亮度 0）
  墨水=oklch(1 0 0)（亮度 1，黑纸白字）
  --tok-token-function 带 oklch(100% 0 0)（深色公式接管）
```

### 探针驱动的追加修复（审计漏网的第三条渗漏路径）

首轮探针 FAIL 抓到：token 作用域只修复**消费者**（在元素处
`var()` 代换），**继承链**没修——`body` 在文档主题下把 `color`
算成白色，纯继承色的正文穿白进产物。修法（已入内核 §10a + gate 断言）：

```css
[data-print-output] { color: var(--foreground); }  /* 继承重扎，主题无关 */
```

同时 sim-shell 真实打印开关补 `body { background: none }`（画布传播
中和——暗站 + 用户开「背景图形」时不再渗出暗色页边；两域皆安全，
暗纸的纸色由 `.pagedjs_page` 自绘）。

### 探针口径修正

- Chromium 把 token 色 computed 序列化为 `oklch(L C H)`：亮度解析
  补 oklch 通道（L 即感知亮度），rgb() 走 WCAG 相对亮度。
- 字面量 `oklch(1 0 0)` 被规范化为 `oklch(100% 0 0)`：白混断言
  双序列化匹配。

## Codex 复核

### 第一轮（gpt-5.6-terra · xhigh，2026-09-03，34m29s）— 评分 5.5/10，REVISE

- **P1 阻塞（属实，已修）**：`runPrint` 的挂载产物 fast path
  （pipeline.svelte.ts `reuse = purpose === 'print' && !ambient &&
  artifact !== undefined`）不复比本次 options——「挂载 light sim →
  显式 `theme:'dark'` 直接打印」静默打出旧浅色产物；挂载态下非法
  theme 也不会 fail-loud。既有「theme-only rebuild」测试只覆盖
  runSim→runSim 的全量路径，漏了 fast path 入口。
- **非阻塞（已修）**：`PrintPaperTheme` 未从 print barrel 导出
  （API 完整性缺口）。
- **环境级（不成立/不采信为缺陷）**：复核沙箱内 Chromium 启动
  SIGABRT、openspec CLI 不可用——本机 verify:print 34/34 为真实
  运行输出（两轮），复核自身也独立确认了 build/mirror/定向
  vitest 全过。

### P1 修复（同日）

fast path 只在「本次 options 的样式表哈希 === 产物哈希」时短路
（`stylesheetHashFor(options) === artifact.stylesheetHash`）——哈希
计算内含 `parsePageConfig`，非法声明在挂载态同样 fail-loud；r7
零重建法则对「同声明的活内容」原样成立（探针 `same artifact (r7)`
继续通过）。回归测试 ×3：挂载 light sim + dark 直接打印 → 重建且
章为 dark；挂载态 + 非法 theme → reject；同 config → fast path
保持零重建。

复验：print-pipeline.spec 25/25；全量 vitest 1663/1665（仅两个
tabs 键盘用例满载超时，隔离复跑 93/93 全过——与本变更零交集的
负载抖动）；rebuild 后 verify:print **34/34**。

### 第二轮（fix-only 复核，56m02s）— P1 闭合，评分 8.5/10（上轮 5.5，+3.0）

- **(a) P1 闭合：是**。行级依据（复核方独立核对）：哈希链
  （parsedSignature→parsePageConfig 含 theme，pipeline.svelte.ts:285/
  303）、fast path 哈希复比（:903）、挂载态非法 theme 沿既有
  guarded() catch 走 lastError/dispose/status='error'/rethrow
  （:987）、三条回归测试（print-pipeline.spec.ts:241）。
- **(b) 新发现**：无阻塞。非阻塞两项本轮已处置——本文档占位行
  与 EOF 空行（git diff --check 告警）已清。
- **细节观察（记录不处理）**：缺席 theme 与显式 `theme:'light'` 的
  parsedSignature 不同，二者切换会多付一次重建；不影响正确性
  （仅效率），文档页单一 DEFAULT_PRINT_CONFIG 场景不触发。
- **本轮独立验证（复核方）**：定向打印套件 117/117、生命周期隔离
  20/20、`npm run build` 通过、verify:print bundle gate 通过；其沙箱
  Chromium 启动 SIGABRT（环境缺口，两轮一致），34 项浏览器探针以
  实现方本机两轮真实运行输出为准（均 34/34）。
- **评分依据**：P1 消除、API 补齐、回归测试充分 → +3.0；未满 9 的
  扣分即上述环境缺口与文档占位（占位本轮已清）。

复核闭环：两轮 REVISE→闭合，任务验收完成。

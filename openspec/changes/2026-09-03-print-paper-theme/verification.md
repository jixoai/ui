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

（异步进行中，结论回填于下）

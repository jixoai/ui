# Design: print-paper-theme — 盖章机制与渗漏审计

## 1. 渗漏面审计（实现前的全量清点）

主题总线 = `<html>.dark` 类 + token 作用域（`jixoai.css`：light 在
`:root, .jx-light`，dark 在 `.dark`）。打印产物在 `document.body` 下，
继承文档级联。逐面清点：

```
渗漏面                        载体                修法
─────────────────────────────────────────────────────────────
token 值 (--fg/--border/     CSS 自定义属性       产物根盖章 jx-light
--card/影梯…)                 继承                （就近声明胜祖先）
code-card --tok-* 深色适配    :where(.dark        .jx-light 回翻块
（字面 oklch(1 0 0) 混色）      .jx-code-card)     （顺序在后胜）
inline-code dark:[--tok-*]    Tailwind dark: 变体  克隆退役 dark: 类
表单件 dark:scheme-dark        Tailwind dark: 变体  克隆退役 dark: 类
UA 控件/滚动条                 color-scheme        产物根 inline
                                                   colorScheme 盖章
```

`dark:` 变体**不做全局手术**：`&:where(.dark, .dark *)` 改成
`:not(.jx-light, .jx-light *)` 会误杀 light 作用域内嵌套的 `.dark`
孤岛（canvas 暗色舞台），CSS 无法表达「最近作用域胜」。克隆退役只作用于
产物，屏幕树零影响——这是投影变换（与 splitPreLines 同一家族），不是
全局法则改动。

## 2. 数据流（一次飞行）

```
PrintRunOptions.config ──parsePageConfig──▶ PrintPageConfig.theme
                                                │ (缺席 = 'light' 法则即默认)
                    ┌─────────────────────────┤
                    ▼                         ▼
        prepareSnapshot（事务，不动主题）    ensureOutputRoot(standby, theme)
                    │                         │ 幂等盖章:
                    ▼                         │   data-print-theme = theme
              深克隆 clone ──(light)──▶        │   classList jx-light|dark
        retireDarkUtilities(clone)            │   style.colorScheme = theme
                    │                         ▼
                    └────── fragment ──▶ pagedjs preview(…, outputRoot)
                                                │
                              theme 进 parsedSignature → stylesheetHash
                              （仅换主题 → 重建产物，永不误复用他域工件）
```

主题解析在 `parsePageConfig` 之后、克隆交接之前——codex r2 P1-5 审过的
「config 解析落在事务之后」次序原样保留（坏 config 的释放法在此路同样
成立）。退役在复用检查之后：复用路径不动克隆（同 config 同主题，章已
在）；重建路径每次重盖，跨域无残留。

## 3. 暗纸适配（声明的例外）

黑纸 = 声明 dark 后的三件事，全部键于管线章：

```
[data-print-output][data-print-theme='dark']        (内核 §10)
├─ print-color-adjust: exact        ← 浏览器默认剥背景;exact 声明
│   (-webkit- 前缀)                   「此颜色必不可少」,导出保留
│   (继承属性:一 declaration 覆盖     整条墨水链:纸底/虚线/框线)
└─ .pagedjs_page
   background: var(--background)    ← 纸张自绘纸色;var 在产物自身
                                        的 dark 作用域内解析
```

内核规则同时命中 sim（屏幕）与真实打印：Polisher 把内核样式注入
document head（无层、居尾），(0,3,0) 特异性压过 sim-shell 的
`#fff` (0,2,0)——sim 纸张如实变黑，预览即所得。AST 门禁法不受影响
（§10 无 `@media not print`、无 `[data-jx-print-sim]`）；内核仍主题
无关：light 域下内核零主题规则（gate 断言锁死）。

已知诚实边界：真实打印的最终纸色仍受打印对话框「背景图形」开关影响——
`print-color-adjust: exact` 是作者侧最强声明，Chromium PDF 导出遵循；
sim 预览始终如实。这在 docs 页 `paged.html` 的暗纸演示语义里可接受。

## 4. 回翻块的作用域语义（code-card.css）

`:where(.dark .jx-code-card)` 与 `:where(.jx-light .jx-code-card)` 同为
(0,0,0) 特异性——**源序即裁决**，回翻块在后：

| 文档域 | 产物域 | 命中 | 结果 |
|--------|--------|------|------|
| dark | jx-light | 两块皆中 | 回翻（后）胜 → 浅色公式 ✓ |
| light | dark | 仅 dark 块 | 深色公式 ✓（对称） |
| dark | jx-light › 嵌套 .dark 舞台 | 两块皆中 | 回翻胜,但公式内 var() 就舞台域解析 → 深色变体 ✓（惰性代换兜底） |

第三行是嵌套孤岛的优雅退化：公式里 `var(--primary)`/`var(--foreground)`
在使用点按最近作用域取值，字面量只剩 `oklch(1 0 0)` 一处,而它已被回翻
块换成了 `var(--foreground)` 公式。

## 5. 放弃的方案

- **翻 `<html>` 主题（打印期临时摘 `.dark`）**：一枚机制覆盖一切，但
  sim 期全站闪白、与 theme-toggle 竞态、afterprint 恢复路径多一条
  失败面。产物盖章零屏幕影响,语义就是「打印内容的 Context」。
- **`@custom-variant dark` 加 `:not(.jx-light *)` 守卫**：破坏嵌套暗岛
  （§1）。克隆退役是投影侧的正交修法。
- **kernel 里给 light 域写规则**：token 表已是浅色块的单源,内核写规则
  即第二源。盖章复用词汇,内核保持主题无关（gate 负面断言锁死）。

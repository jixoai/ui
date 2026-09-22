# Owner 验收档案 — explicit-props（八轴通用属性系统）

> 状态：**RELEASE-READY（未发布）**。全部提交在本地 main（4e7960b9..HEAD），未推送。
> 视觉验收环（六轮 vision 子代理真实交互走查）全部组 READY；全部门禁绿
> （verify-all 35/35、全套件 3170/3170、棘轮 2·7·7·42 双向锁死）。
> Codex 终审闭环：NO-GO 7.6/10（一个真实 P1）→ 修复 4f1cd484 → 焦点复审
> **GO 9.4/10**（阻塞项逐行验证闭合 + 思想实验确认账本防静默）。

## 一、验收动线（dev server + 八轴活体）

```bash
# 仓库根
node scripts/dev.mjs --port 5230   # 或 apps/www: npm run dev -- --port 5230
```

按序走这十站（即视觉走查的采集面，明暗双相都看——右上角主题切换）：

1. `/docs/universal-props.html` — 概念页：语法总纲、三道表、query()
   （把窗口拉过 40rem 边界看卡片翻转）、§14 六形状降级表、三个活体 dogfood
   （同心圆 20→6px）。
2. `/docs/components/press-button.html` — 旗舰 dogfood：右侧控制坞逐轴翻转
   （size 命名/数字、shape=squircle、radius、density、color=error、
   elevation=level2、motion），reset 应回基线；暗舞台看 shimmer 标签。
3. `/docs/components/component-canvas.html` — canvas 旗舰：六轴控制 + 全轴
   暗舞台；specimen 消费六轴（em 文本座位、锚面板、填充按钮、motion 量规）。
4. `/docs/components/dialog.html` + `sheet.html` — 浮层：开合动画、
   §7 阴影+表面配对、Escape 关闭；sheet 的 width（改名自 size）。
5. `/docs/components/select.html` — portal 收据：打开 listbox 看自携带载体
   的提升面板。
6. `/docs/components/input.html` — 原生家族：size=14/density=small 的紧凑
   对比、原生属性零泄漏。
7. `/docs/density-2xs.html` — 密度阶梯（表格横向滚动，右滚看 HIT 列全值：
   24px 是唯一低于 28px 护栏的档）。
8. `/tokens` — 色相滑杆（全站含舞台实时重着色）、密度五档、阴影阶梯
   （暗相反转）、全 sheet 双值标签。
9. `/docs/components/prose.html` — measure（改名自 size）+ 版面度。
10. 任意组件页 — PropsTable 的 universal 共享段（110/110 页统一渲染）。

## 二、八轴速览

| 轴 | 命名步 | 数字道 | 试什么 |
|---|---|---|---|
| size | small/medium/large | px | 根字号缩放，部件 em 跟随 |
| shape | round/scoop/bevel/notch/square/squircle | — | squircle 连续角 + ×2 律 |
| radius | small/medium/large（auto=同心圆） | px | auto 子件算 max(0, R−P) |
| density | small/medium/large | 系数 | 间距/行高阶梯，2xs 地板 24px |
| color | primary/secondary/error/warn/success/info | 色相度 | oklch 主色系重着色 |
| theme | light/dark/system | — | system 跟随全局（JS 可变源） |
| elevation | level-1…level5（M3 表） | dp | 阴影配方 + 表面阶梯配对 |
| motion | reduced/subtle/normal/expressive | 系数 | 运动强度跨内核 |

语法：`named | auto | ${number}`，正交包装 `query({ sm: 'large', '@sm/card': 20 })`
（viewport 键 vs 容器键，命名容器 `@md/card`，Tailwind v4 语法）。

## 三、开放裁决项（未来精化，全部不阻塞本次验收）

1. **避名碰撞（§13 未裁决改名，轴被留空转发 ambient）**：
   chip/badge 的 `shape`（'square'|'pill' 轮廓词汇）；terminal-card/header 与
   ghostty-term 的 `theme`（壳主题字面量/对象）；code-card 与 mermaid 的
   `theme`（shiki/引擎令牌）；component-canvas 的 `theme`+`density`
   （舞台预览 bindable 双向绑定锁名）。→ 一条未来改名裁决即可采纳这些轴。
2. **分裂道（§13 类推适用，dossier 记录）**：chart / scroll-area /
   scroll-virtual 的 `size`/`radius` 数字道喂家族本有语义（甜甜圈直径/滑块
   chrome），命名步走轴。
3. **岛影 KNOWN EDGE（W-next 协议轮）**：island 作用域（.jx-light/.dark）
   重声明 `--jx-color-effective` 会遮蔽祖先章；干净解法是 supply/effective
   双变量拆分。已标记未绕过。
4. **squircle ×2 视觉读数**：r4 判读疑议已解析——链条逐字消费因子 2，
   §2 等角模型恰好预测观测排序（squircle@12 读数 ≈ round@6）。
5. 小项：tokens 页无专门 §7 配对并置段（现为间接成立）；2026-09-04 存档
   tasks.md 停在 system-dialog 改名前（测试带引证覆盖，存档按冻结法不动）；
   84 张 blueprint SVG 与现行管线再生成有差异（先在债）；d2xs LG 行 IMAGE
   格省略号样式；r1 历史采集 /tmp 被无域重跑覆写（已被消费，无仓影响）。

## 四、收据索引

- **实现链**：W1-W2 见 tasks.md 各 LANDED 行；W3 八批（census LANDED 段，
  115/115 零洞）；W4 64a4f3e9（110/110 清单门、概念页、llms 131 文件）；
  W5 628ca6e7+e5e694e9（门禁五件套 + 存量 82→0）；W6 三组件修复 +
  采集装置（0d43f95e/513392c6/c6cd11ee/a02579d6）。
- **门禁**（编排者独立复跑）：verify-all 35/35（含 CHROME_PATH +
  GHOSTTY_WASM 环境）；全套件 190 文件/3170 测试 0 失败；
  verify:explicit-props 115 家族六条款；棘轮收据 2·7·7·42 逐字绑定；
  deps 16+3 未动；shadcn-add 真实收据 13/13（曾抓出 query 引擎漏发的
  真实 registry 缺陷）。
- **视觉环**：六轮（采集 65→67、四组判读、19 项修复全收据、双组重判 +
  终判 READY）；逐轴像素差收据（AXIS-NOT-VISIBLE 已成失败类）。
- **内核法则沉淀**（census W6 段）：provider-snapshot 法则（lint E4 编码）、
  :root 替换色消费法则、elevationPairOf 泛化、shimmer face、hue 源头、
  双半采集律、进度分数定格律。

## 五、发布指令位

一切就绪。你说发布，我才 push + 发布流程（版本号/CHANGELOG 按仓库惯例）。

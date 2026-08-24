# jx-pure Owner round 2 — design decisions

本文件是 2026-08-24 Owner 八项裁决后的六项定案。规格以现有
`registry/files/theme/jx-pure.css` 的 Part A/B/C/D、`jixoai.css` 的 token
架构及 Tier-2 组件的既有契约为基准；本轮只改变本文件。

## D1 — range 几何终律：细轨、大柄

**裁决。** POC 推理成立。WebKit 的 thumb 使用轨高 border-box，借
`outline` 画出可见大柄；Firefox 使用真实的大 `-moz-range-thumb`，填充由
`-moz-range-progress` 承担。`overflow: hidden` 只裁 shadow fill，不裁
outline，因此不会再出现“thumb 埋在轨道里”。

**尺寸契约。**

| size | rail / input paint box | 可见 thumb | WebKit border-box | WebKit outline | Firefox thumb |
| --- | ---: | ---: | ---: | ---: | ---: |
| sm | 6px | 16px | 6px | 5px solid | 16px |
| md | 8px | 20px | 8px | 6px solid | 20px |
| lg | 12px | 24px | 12px | 6px solid | 24px |

所有尺寸为 `box-sizing:border-box`、方形、`border-radius:0`。轨道为
`border:1px solid var(--border)`，未填充段为 `var(--background)`，填充和
thumb 为 `var(--jx-range-fill-color, var(--primary))`；invalid 只改该变量和
thumb 边框为 `var(--error)`，不改变几何。WebKit thumb 的 `outline` 只承载
可见面积，不承载 shadow、位移或尺寸；hover 仅把 outline/border/填充换为
`var(--primary)`，press 不移动 thumb、不改变 fill 几何。focus 仍是轨道外
`1px var(--ring)`，与 Part A 的 focus law 一致。

WebKit：输入 `height:rail`、`container-type:inline-size`、`overflow:hidden`；
thumb 的 width/height 均为 rail，fill 继续使用现有 cqw spread shadow，
thumb `outline: outline-width solid currentColor`，`outline-offset:0`。
Firefox：track 为 rail 高度；`::-moz-range-progress` 为 rail 高度、填充色；
`::-moz-range-thumb` 为可见 thumb 尺寸，`border:1px solid var(--border)`，
不依赖 shadow fill。不得把 WebKit outline 规则套到 Firefox。

RTL 通过 `--jx-range-dir:-1`（`[dir='rtl']` 或 scope 内继承）翻转 cqw fill
方向；thumb 的几何和键盘语义不翻转。`prefers-reduced-motion: reduce` 下
去除所有 range transition（当前范围不应新增动画）；hover/press 仍可换色，
不得以 outline 或 shadow 模拟位移。影响文件：`registry/files/theme/jx-pure.css`
（Part A + B5）、其站点镜像/生成产物、验证 probe 与文档 range 行；Tier-2
`range.svelte` 仅需对齐三档变量，不引入 JS fill。

## D2 — `no-jx-pure` 是反向作用域

**裁决。** 选 **(b)**。保留现有 unlayered `all: revert` 逃生机制，删除
`[data-jx-pure-skip]` 词汇并将其泛化为 `.no-jx-pure`；这样不会让每条 B 规则
膨胀 `:not()`，也能同时压过 Part A 未分层规则和 B 的 layered 规则。

**具体规格。** `.jx-pure` 内所有 B 规则默认生效，包含单选 `select` 的自绘
chevron；`.no-jx-pure` 可挂在任意后代元素上，元素自身及其全部后代（含
`::before`、`::after`、summary marker、checkbox/radio 伪元素）回到 UA/用户
层：对 B surface 使用 `all:revert`，并显式 `content:revert`/`background:revert`
等必要伪元素复位。逃生口必须位于 @layer 之后且保持 unlayered；`no-jx-pure`
嵌套 `.jx-pure` 仍以外层逃生为准，除非作者把该子树移出逃生节点。文档改为
展示 `.no-jx-pure`，不再宣传 data attribute。影响文件：`jx-pure.css` Part B
select、Part B12、文档 scope-laws、verify/parity probes 及镜像产物。

## D3 — number 裸控件恢复平台 spinner

**裁决。** 选 **(a)**。裸 HTML `input[type=number]` 在 jx-pure 中恢复
`appearance:auto`（不再隐藏 WebKit spin pseudos），完全交给平台绘制；这是
唯一满足零 JS、保留原生 min/max/step/键盘/辅助技术语义的方案。作者绘制
`::-webkit-inner/outer-spin-button` 继续视为不可依赖，不能再尝试。

**Tier-2 对齐。** `number-input.svelte` 是独立的复合步进器，保留其真实
`- / input / +` button、按住加速、FormData 和禁用 readonly 契约；其内部
`.jx-num-input` 必须显式 `appearance:textfield; -moz-appearance:textfield`，
以不受全局裸 number 恢复影响。纯 CSS `the structural group` 中的 number 属于裸控件，
因此显示平台 spinner；需要复合步进器时使用 Tier-2 组件而非伪元素。影响
文件：`jx-pure.css` Part A/B4、`number-input.svelte`（仅 scoped parity）、
文档 forms/number demo、验证矩阵。

## D4 — switch 重新建立开关可读性

**裁决。** 保持 checkbox + `role="switch"` 的零 JS 机制，改为方形、明显的
轨/柄比例：

| size | track (w×h) | knob | travel |
| --- | --- | ---: | ---: |
| sm | 32×20px | 16px | 12px |
| md | 40×24px | 20px | 16px |
| lg | 48×28px | 24px | 20px |

track 与 knob 均 `border-radius:0`；knob 占轨道高度的 5/6（两侧各 2px
内缩），轨道保留 1px `var(--border)` 内圈。off：轨道
`var(--muted)`，柄 `var(--background)`，柄边框 `var(--border)`；on：轨道
`var(--primary)`，柄 `var(--primary-foreground)`，确保黑白主题均有硬对比。
滑块通过 logical `translate`/`margin-inline-start` 行进，不写左右物理值。

label 为 inline-flex，文字与轨道间距 `0.75rem`，文字在 inline-start、控件
在 inline-end；整个 label 可点击。hover 只把 off 轨道内圈改为 primary，不
改变尺寸；focus-visible 在轨道外 `1px var(--ring)`、offset `2px`；invalid
将 off/on 轨道、柄边框及 checked fill 改为 `var(--error)`，disabled 统一
opacity `.5`。checked 的色彩仍是 primary 策略，不能使用 destructive。所有
颜色/滑动 transition 在 reduced-motion 下为 none；press 不制造第二套位移
物理。Part B13 与 `toggle.svelte` 的 md/sm/lg 变量必须使用同一比例表，Tier-2
仍可保留圆角组件姿态但数值需与新尺寸对齐。影响文件：`jx-pure.css` B13、
`toggle.svelte`、文档 switch demo、验证 probe。

## D5 — 语义色板与验证重映射

**裁决。** 采用 `success / warning / info / error`，不用“积极/消极/中性”作为
token 名：前者可被 CSS、ARIA、表单状态和 API 稳定引用；中文文档可将其解释为
成功/警告/信息/错误。`--destructive` 维持当前黑白单色反转对，不改造成红色。
`error` 是新增的红色语义色，专用于错误/invalid。

**token 提案（light / dark）。** 每个 token 都必须有 `-foreground`，并进入
`@theme inline` 的 `--color-*` 映射：

| token | light | light fg | dark | dark fg |
| --- | --- | --- | --- | --- |
| `success` | `oklch(0.62 0.19 145)` | `oklch(1 0 0)` | `oklch(0.72 0.16 145)` | `oklch(0 0 0)` |
| `warning` | `oklch(0.82 0.18 85)` | `oklch(0 0 0)` | `oklch(0.78 0.17 85)` | `oklch(0 0 0)` |
| `info` | `oklch(0.62 0.16 245)` | `oklch(1 0 0)` | `oklch(0.74 0.14 245)` | `oklch(0 0 0)` |
| `error` | `oklch(0.60 0.20 25)` | `oklch(1 0 0)` | `oklch(0.72 0.16 25)` | `oklch(0 0 0)` |

light/dark 保持现有 primary 的纪律：dark 提升 L、降低 C，固定语义 hue；前景
仅取黑/白以维持可读性。`secondary` 仍是黄色强调底，`accent` 仍是蓝色装饰/交互
强调，不能互相别名；`destructive` 仍是单色反转的“破坏性操作”而非 error。

chart harmony 审计后固定为：`chart-1=primary`、`chart-2=success`、
`chart-3=info`、`chart-4=warning`、`chart-5=error`（light/dark 均引用同名
token），避免当前 chart 与状态色重复/漂移。B14 映射：`aria-invalid='false'`
的边框、checkbox/radio/range 正向提示使用 `var(--success)`；
`aria-invalid='true'` 的边框、图标、checked switch、range fill/thumb 使用
`var(--error)`；`--destructive` 只保留 destructive action 和原有单色用途。
影响文件：`registry/files/theme/jixoai.css` 两主题块与 `@theme`、`jx-pure.css`
Part A/B14、镜像/生成产物、chart/validation 文档及 parity/contrast probes。

## D6 — label 版 InputGroup（零类名结构语法，二次 Owner 澄清后终态）

**裁决。** input-group 是 jx-pure 面的**结构语法**，零类名：`<label>` 内含
直接子级 text-like 控件 AND 直接子级平文本 `<span>`，这个结构本身就是
组合 shell 的开关（`:has()` 检测）。prefix/suffix 即那些 span。第一版
`.jx-group` 与 terminal-header 导航类冲突（已删），第二版 `.jx-input-group`
被 Owner 澄清取代——无任何专用类。

**契约。**

```html
<label>
  <span>https://</span>
  <input type="text" aria-label="website" />
  <span>.example.com</span>
</label>
```

- shell 检测与子控件规则共享同一 text-like allowlist（checkbox/radio/
  range/color/file 的 label 永不匹配——shell 与 chromeless 都不得波及）；
- label 取盒法则（1px border、radius 0、40px 行、hover shadow、
  `:has(:focus-visible)` 内描边、`:has(:disabled)` 半透明、
  `:has([aria-invalid])` dashed error）；span 骑 prefix/suffix
  （muted、padding-inline）；控件去盒（无 border/背景/min-height，
  `flex:1; min-width:0`）；
- 暗色只消费 token；number 按 D3 显平台 spinner；复合步进器仍归
  Tier-2 number-input.svelte。

## 提案遗漏的风险（必须在实现与验收中显式检查）

1. `all: revert` 会同时回退作者对字体、布局、`display` 的刻意设置；`.no-jx-pure`
   必须文档化为整棵原生岛，而不是“只撤销颜色”。
2. `:has()`、range pseudo 与 outline overflow 在 Firefox/WebKit 仍需真实截图；
   Chromium POC 不能替代跨引擎验收，forced-colors 还必须恢复 `appearance:auto`。
3. native number spinner、date/time indicator 的尺寸和可见性由平台决定；文档
   只能宣称“平台绘制”，不能承诺像素一致。
4. RTL 需同时验证 range fill、group prefix/suffix、switch travel 和 label 点击
   顺序；不能仅检查 `dir=rtl` 下的文字方向。
5. `.no-jx-pure` 与业务已有 class 可能冲突；应在验证中覆盖嵌套 scope、shadow
   root（CSS 不穿透）及重新挂载 `.jx-pure` 的边界。
6. 新语义色需做 light/dark/forced-colors 对比度审计；chart 引用 token 后，
   旧的截图/快照和任何硬编码 chart hue 都可能失真。
7. auto-dark 是生成物，新增 success/warning/info/error 必须进入生成脚本和
   parity 锁，否则静态 OS-follow 页面会发生 token 漂移。
8. label 组内嵌套控件的可访问名称、点击聚焦、prefix/suffix 文本朗读需用真实
   AT/键盘走查；不可把视觉槽位当作 label 文本或交互按钮。

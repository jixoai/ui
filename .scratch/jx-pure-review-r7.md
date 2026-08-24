# jx-pure r7 Owner 轮综合复核

评审日期：2026-08-24

范围：真实工作区 jx-pure 本轮改动（glyph 修复、cqw range、B13 switch、B14 validation、hue-popover/range Tier-2 同步、验证脚本与 registry）；并行 firstpaint 改动不归因。对照基线：r5 9.1/10。

## A. 阻塞

### R7-1（P1，B14 规格未完全兑现）：invalid radio 的 checked dot 仍为 primary

`apps/www/src/lib/jx-pure.css:1055-1069` 无条件将 `input[type='radio']::after` 的圆点绘制为 `var(--primary)`。B14 在 `1584-1588` 只把 invalid checkbox/radio 的根节点背景/边框改为 `var(--destructive)`，没有覆盖 `radio[aria-invalid='true']:checked::after` 的背景。因此 invalid radio 的“checked 填充翻转”只改了边框，实际选中圆点仍是 primary，违反本轮明确的验证矩阵（checkbox/radio/switch 的 checked fill 均应 invalid→destructive）。应补 radio checked pseudo 的 destructive paint，并增加运行态像素/计算样式断言；这不是 firstpaint 归因问题。

除该项外，未发现 P0 数据/交互损坏或发布链断裂。

## B. 质量

- 滴管 z 序修复成立：`.jx-color-field` 建立定位层，`.jx-color` 位于其下，实测 glyph zone 89 个差异像素；原生 color widget 不再遮住 glyph。
- 日历/时钟 indicator 已切到 literal-stroke INK URI，light/dark/`.jx-light` 三姿态变量均存在；hover 主色弃权与路径 (c) 记录一致。UA shadow pseudo 的 computed-style 不能单独证明绘制，但现有截图/zone 探针通过。
- range cqw shadow + `container-type:inline-size` + `overflow:hidden` 实测填充、未填充侧和 8px 等厚轨道均成立；`.jx-range-sm/lg` 计算高度为 6/12px，RTL 方向变量为 `-1`。Tier-2 `range.svelte` 保留 28px 命中条和 20px thumb，registry/site 组件同步。
- B13 switch 的语义选择器、36×20 方形几何、checked primary 与 reduced-motion 停止均成立；B14 lanes 的 dashed/INK、valid primary、invalid checkbox/switch/range 翻转成立，但 radio dot 遗漏如 R7-1。
- `node scripts/verify-jx-pure.mjs 5173`：51/51 全绿；`pnpm --dir apps/www test -- --run test/jx-pure-parity.spec.ts`：327/327 全绿；两份 jx-pure CSS `cmp` 一致，gzip 实测 16,218B（≤16KB，余量 166B）。
- 验证脚本已加入水合等待，降低 shadow style 注入竞态；但验证矩阵仍未覆盖 invalid radio dot、Firefox/WebKit、forced-colors。后两项按 Owner 既有边界列为非阻塞债务。
- 工作树存在 reveal 删除、页面及 firstpaint 等大量并行改动，本评审未将其归因于本轮。

## C. 评分

**8.8 / 10**（r5：9.1）。本轮大部分 Owner 裁决已由真实浏览器、像素、parity、同步和体积证据闭环；扣分集中在一个明确且可局部修复的 B14 radio invalid 视觉契约，以及 166B 的体积余量。补齐 radio pseudo 的 destructive 覆盖并加入探针后，可回到 9.1 或更高。

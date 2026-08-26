# Density Adoption Implementation Review

日期：2026-08-26

范围：`582141e...HEAD`（K0 `582141e`、F `3c7767b`、A-E merge `e2f55e0`、当前 `5140baf`）

契约：`openspec/changes/density-adoption/design.md`、`packet-manifest.md`、`tasks.md`

结论：**BLOCK archive**。Owner 的五张截图和直接浏览验收仍是独立的人类门禁，本审查不替代该门禁。

## 1. 阻塞项

### 1.1 Adoption verifier 对 C 为空通过，A/B/D/E 浏览阶段也没有执行

这是最高优先级阻塞。`scripts/density-adoption-registry.mjs:32-203` 只有 `K0/A/B/D/E`，没有 `C` 行；因此 `rowsForPacket('C')` 返回空数组。`scripts/verify-density-adoption.mjs:116-118` 又明确 `continue` 所有非 K0 行，所以 A-E 的 browser phase 没有 stamps、used values、物理 hit lane、nested scope 或 resize 断言。`rowIsComplete`（`scripts/density-adoption-registry.mjs:205-207`）甚至不检查 `lanes`、`visualOnly`、`exceptions`、`hitFloor`、`resize` 是否存在，`exceptions` 也从未被 verifier 使用（`verify-density-adoption.mjs:53-90`）。

可复现证据：

```text
node scripts/verify-density-adoption.mjs --packet C
PASS  fixture server started (public/)
1/1 passed (packet C)

node scripts/verify-density-adoption.mjs --packet all
28/28 passed (packet all)   # 实际只执行 K0 browser 的 2 项
```

修复：补齐完整 C registry row；让每个 packet row 进入 browser phase，实际挂载对应 docs route，执行四个 scope、root-default、inherited-parent、stamps、USED 值、`lanes` 可点击矩形、`visualOnly` glyph 尺寸和 `resize` 关系；`rowIsComplete` 必须校验全部 row 字段及 focused test 文件存在。修复后必须看到每个 packet 的非零、可解释的断言数，而不是仅看到 fixture server started。

### 1.2 F 的 jx-pure density-owned geometry 仍是硬编码，四 scope 没有真正 adoption

F 的 v2 类名在两份 sheet 中已切换，slider thumb 也确实消费 `--jx-d-ctl-icon`（`apps/www/src/lib/jx-pure.css:536-575`），但控制面契约没有完成：

- Part A `.jx-control` 仍有 `padding: 0.5rem 0.75rem`、`font-size: 0.875rem`、`line-height: 1.45`（`jx-pure.css:171-183`）。
- `.jx-control-shell.jx-slotted` 仍写死 `padding-inline: 0.75rem`，`.jx-control-lane` 仍写死 `min-height: calc(2.5rem - 2px)`、padding、font-size、line-height（`jx-pure.css:260-261,466-475`）。
- Part B text-control face 仍写死 `min-height: 2.5rem`、padding、font-size、line-height（`jx-pure.css:944-974`）；summary 也保留 40px/固定 padding（`1392-1404`）。
- sheet 中没有 `.jx-pure` 的 `font-size: var(--jx-d-text)` / `line-height: var(--jx-d-leading)` 作用域声明；`rg -- '--jx-d-text|--jx-d-leading' apps/www/src/lib/jx-pure.css` 只命中注释上下文之外的 0 个实际声明。

在 built `public/` 上用 Chromium 注入同一组 `.jx-pure[data-density]` controls 的 USED-value probe：

```text
scope       root font/line   .jx-control padding/font   .jx-control-lane min-height
xs          16px / 24px      8px 12px / 14px            38px
default     16px / 24px      8px 12px / 14px            38px
lg          16px / 24px      8px 12px / 14px            38px
```

只有 shell 的 `min-height`/gap 和 slider 的 16/20/24px thumb 随 scope 变化；这不满足“control/shell hit+pad+gap”及 `.jx-pure` typography contract。修复：canonical/mirror 两份 sheet 的 density-owned declarations 全部改为 `--jx-d-ctl-*`/`--jx-d-text`/`--jx-d-leading`，为 xs/default/lg 加 USED-value 回归断言，并重新跑 jx-pure 65 gate。

### 1.3 v2 breaking rename 遗漏真实 consumer：HuePopover 仍使用 `.jx-range`

`apps/www/src/lib/components/hue-popover.svelte:76-80` 仍写 `<input class="jx-range jx-hue-range">`，而两份 `jx-pure.css` 已经没有 `.jx-range` 规则；同文件 `148-153` 仍把它称为 Tier-1 `.jx-range`。这是一个实际运行时 consumer，不是历史注释。修复：改为 `.jx-slider` 并明确覆盖 hue 的自定义轨道/overflow，或删除旧类后补齐该 consumer 的完整 slider face；重新扫描 source、registry、built output，旧类必须为零（允许明确的迁移测试字符串除外）。

### 1.4 Packet C 引入了 baseline 不存在的 TypeScript/Svelte 错误

当前 focused `svelte-check` 对本轮修改的 C 文件报告：

- `apps/www/src/lib/ui/anchor/anchor-item.svelte:29-35`：`$props` 自引用导致 `href/className/rest/fragmentId/active/props` 隐式 `any`。
- `apps/www/src/lib/ui/float-button/float-button.svelte:150-151`：`actions ?` 条件恒真。
- `apps/www/src/lib/ui/pagination/pagination-link.svelte:40-60`、`pagination-next.svelte:31-46`、`pagination-previous.svelte:32-47`：同类 `$props` 自引用和隐式 `any`。

我在干净的 `582141e` worktree 上运行同一过滤检查没有这些 C diagnostics；因此不能按 packet 报告中的“pre-existing”免责。修复 Props 声明/解构顺序和 optional snippet 条件，canonical/mirror 同步后，必须对 C 文件跑 `svelte-check` 并得到零错误。

## 2. 契约核对与实际质量

| 区域 | 实际确认 | 质量 |
|---|---|---:|
| K0 resolver | `density.svelte.ts:24-32` 是 explicit -> inherited -> fallback；所有 provider roots（含 Table/Tabs/menu）在 derived 前 capture inherited；Table `:85` 的 sm fallback 不覆盖 inherited。 | 7/10 |
| K0 aliases/rename | `jixoai.css:832-958` 四 scope 的 ctl equations 一致；实际 source/mirror 没有 `ItemSize`、`controlSize` 或旧 `data-size` authority（命中只剩测试/脚本断言）。 | 8/10 |
| F vocabulary | 两份 sheet 的 v2 names-only、range size classes 消失、slider thumb = ctl-icon 均通过；但 control/shell/lane/typography literals 使整体 contract 失败。 | 3/10 |
| A form-text | 各 root 有 `density?` 与 `data-density`，控件 CSS 使用 ctl aliases，form page 增加了 ladder；packet A CLI 只有 row-complete + server 两项，未量 hit rectangles/resize。 | 5/10 |
| B boolean | checkbox/radio wrapper 使用 ctl-hit，square 使用 ctl-icon；toggle equations、range/color aliases 在 CSS 中存在；B static selector matcher 不识别多数 `:where(...)`，browser 未执行，focused test 没有物理 rect 证明。 | 5/10 |
| C buttons/navigation | PressButton/float/pagination/anchor 的 class 使用 ctl-hit/ctl-pad/ctl-text；但无 C registry row、无 browser proof，且上述 TypeScript errors 阻塞。 | 2/10 |
| D menus | Dropdown/Menubar/Navigation/Command/Popconfirm/Breadcrumb roots capture provider，panel roots 带 `data-density`（例如 menubar/navigation panel）；D 的 22/22 主要是静态匹配，packet test 没有 panel/nested inherited browser proof。 | 5/10 |
| E data/status | Table source 正确使用 `resolveDensity(density, inheritedDensity, 'sm')` 并给 frame/table stamp；tabs/labels/indicators 使用 aliases；但 test 只覆盖 unparented sm，没有 parent-lg Table -> lg 断言，E CLI 未执行 browser。 | 5/10 |
| parity/build | `diff -ru` packet families 35/35；`gen-mirror-manifest --check` GREEN；site build GREEN。 | 8/10 |

## 3. Gate ledger（本轮实跑）

```text
cd apps/www && npx vitest run                  45 files, 508/508 PASS
verify-density-kernel.mjs                      61/61 PASS
verify-item-ruler.mjs                          18/18 PASS
verify-item-matrix.mjs                         37/37 PASS
verify-density-adoption.mjs --packet A         2/2 PASS (row + server only)
verify-density-adoption.mjs --packet B         2/2 PASS (row + server only)
verify-density-adoption.mjs --packet C         1/1 PASS (empty row set + server)
verify-density-adoption.mjs --packet D         22/22 PASS (static D declarations + server)
verify-density-adoption.mjs --packet E         2/2 PASS (row + server only)
verify-density-adoption.mjs --packet all       28/28 PASS (K0 browser only)
verify-jx-pure.mjs 5199                        all checks passed
gen-mirror-manifest.mjs --check                GREEN
packet family diff -ru                         35/35 PASS
npm run build:site                             GREEN
```

`verify-jx-pure` 的 65-check claim 因而是绿的，但它只证明它列出的 default fixture；它没有覆盖上面的 xs/default/lg `.jx-control` USED values。Vitest/build 的既有 Svelte accessibility/state warnings 仍存在，但不是本轮主要 blocker。

## 4. Packet 报告交叉核验

- A/B/D/E 都修改了 K0-owned、manifest 未列入 A-E 的 `scripts/density-adoption-registry.mjs`；报告已经承认这个 ownership contradiction。`packet-manifest.md` 的 exact-list/merge-stop 规则因此没有被真实执行，应由单一 orchestrator 修复并重新生成 registry，而不是接受五个自报 row。
- C 报告明确承认没有 registry row；其“1/1”不能作为 C gate。
- B 报告明确承认 `:where(...)` selector 不被 static matcher 识别；这解释了空通过，不是 B 实现证明。
- D/E 报告明确承认 browser phase 只运行 K0；A 报告把 shared shell token-only conversion 留给 F/K0，但 F 实际仍保留本报告 1.2 所列硬编码。
- 报告中的 mirror claims 与实际 `diff -ru` 一致；但 focused `svelte-check` 的 C 错误与报告的“pre-existing”描述不一致，基线复跑证明它们不是 582141e 的错误。

## 5. Standards / residuals / shortcuts

1. `scripts/density-adoption-registry.mjs:23,32,205,209` 新导出没有逐项 public API 注释；这违反全局 AGENTS 的 exported-interface comment law。
2. 新增 `density-adoption-data.spec.ts`、`density-adoption-menus.spec.ts` 没有文件顶部 intent/original request/timestamp；`density-adoption-buttons.spec.ts:1` 只有一句用途注释，仍缺完整 intent metadata。
3. verifier 每个 `(root, selector)` 重复读取目录（`verify-density-adoption.mjs:55-65`），并且用简单 selector-block regex 代替真实 compiled CSS/used-value 检查；这是当前 vacuous pass 的结构性来源，不应继续用 focused jsdom tests 充当 browser gate。
4. `scripts/verify-density-kernel.mjs` 的 61 项证明 kernel ruler 与 list-item residual，只扫描 list-item literal；它不能证明 A-E closed token rule。closed-token scanner 必须覆盖所有 registry rows。
5. Owner 五张 handoff screenshots 已存在于 `.agents/documents/2026-08-26-density-adoption/owner-{ladder,form,boolean,menus,table}.png`，但没有在本轮被当作自动化替代；最终视觉 ACCEPT 仍由 Owner 直接浏览决定。

## 6. 修复后重新验收顺序

1. 先修 C 类型错误、HuePopover v2 consumer、jx-pure token-only/四 scope USED values。
2. 单一 owner 补 C row、重写 adoption verifier 的全 packet browser/static contract，并移除 A-E 对 shared registry 的并发修改。
3. 增加 Table parent-lg、menu panel stamps、B physical wrapper/glyph、A/C resize/click tests；重新跑 focused svelte-check 与全套 gates。
4. 重新对照 `packet-manifest.md` exact paths、两树 parity、build output，再把五张截图交给 Owner 做独立视觉 ACCEPT。

## Final call

**Score: 3.5/10**
**Archive: BLOCK**

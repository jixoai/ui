# verification — ghostty-term

> 证据汇总（2026-08-28）。全部命令可在 worktree 复跑；
> 真实浏览器验证含人工视觉判读（截图存证于会话）。

## 测试套件

| Suite | 结果 | 说明 |
| --- | --- | --- |
| packages/vite-plugin vitest | **64/64** | pin schema（含跨字段+tag 穿越+stable fixture）、resolver（env/offline/cache-miss/host allowlist/流式上限/body-null 有界读）、probe（合法/截断/篡改/import 非空）、插件 build/dev（emit 内容寻址文件名、named-only、shape gate）、vite native 行为 fixture（裸/?url/?init/publicDir + 真实 wasm import/export 断言 imports=[]） |
| ghostty-vt node 黄金测试 | **16/16** | type_json 解析、formatter/脏行形状、Enter→\r、resize 存活、paste 语义、use-after-free、streaming 回退 clone |
| ghostty-term jsdom | **23/23** | 度量/映射/onData 桥/rest/class 合并/data-state/free、pre-ready write 竞态（延迟 loader）、真实 wasm data: URL 端到端 |
| apps/www 全量 | **600/600** | 51 files（含 docs-structure/catalog/nav-filter 快照、blueprints 覆盖锁） |

## 门禁

| Gate | 结果 | 说明 |
| --- | --- | --- |
| openspec validate --strict | GREEN | 文档轮 r0-r6 与实现轮 r1-r4 全程使用 |
| verify:mirror | GREEN | 93 items / 308 file pairs；color-utils 移出 unreferencedLib |
| verify:ghostty-pin（在线/offline/self-test） | GREEN | schema/跨字段/allowlist/tracked-wasm=0 |
| verify:shadcn-add | ALL GREEN | 新增 fixture D（ghostty-term clean consumer：五依赖连带+零 wasm+consumer vite build+named-only bundled 断言）与 E（color-picker pre-seeded 回归锁） |
| verify-density-adoption | **73/73** | 浏览器相位实测 terminal family：lane 480px、密度 11/13/15px |
| svelte-check | 255 = main 基线 | 本 change 增量 0（中途增量已全部归零） |
| build:site | GREEN | 94 registry payload + 站点 + llms 89 页/91 文件共存；含插件 dist 自动重建路径（mv dist 后复跑验证） |
| verify:surface / verify:hook-law | 46/47 / 3 失败 | **存量欠账**：origin/main 同样红（progressive-blur mid-entry 与存量组件 hook 债），本 change 承诺并实证「不新增失败」 |
| vite build (www) | GREEN | dist/assets/ghostty-vt-517821d618931c33.wasm（981,125B，sha16 与 pin 一致）；SSR+client 双环境 |

## 真实浏览器验证（ZCode 内置浏览器，built public/ on 127.0.0.1:8791）

- 主 demo（data-state=ready）：wasm 渲染横幅、ANSI 色彩矩阵（fg 31-37/bg 40-47）、样式样本（bold/italic/underline/reverse 反白）、shell 提示符——canvas 像素级呈现。
- 键盘回环：点击聚焦 → 输入 `col` 回显于提示符后 → 补 `or` + Enter → `color` 命令执行、色彩矩阵重放、新提示符（onData → keyEncode → demo shell → write → vtWrite → dirtyRows → canvas 全链路）。
- 状态机：页面 8 实例——ready×6（主 demo/密度 sm,default,lg/主题/usage）、error×2（故意降级演示，终端风格错误文案 + children face）。
- 侧栏导航：GENERAL 8 / TERMINAL 4 / LAYOUT 8 分组生效（冻结计数一致）。

## Codex 复核闭环

- 文档冻结评审：r0 4.0 → r6 **8.4 冻结**（review-r0..r6.md 归档）。
- 实现复核：r1 5.5 → r4 **8.8 冻结通过**（review-impl-r1..r4.md 归档）。
- 每轮结论实际处理并回归验证；两处事实纠偏（vite@8 wasm 资产语义、
  wasm imports=[]）与一处存量 bug 发现（color-picker 干净安装缺
  color-utils）均来自评审而非自评。

## 已知边界（如实声明）

- tip release 的 buildInfo 实测为 "0.1.0-dev"（无 git commit 信息）——
  pin 身份由 sha256 承担，buildInfo 仅信息性。
- rolldown-vite 8 SSR 对特定页面图结构敏感（E 批 bisect 定位并重写
  规避，页面内有警示注释）；建议未来上游上报。
- worktree 本地需要 packages/vite-plugin/node_modules/vite symlink
  到 www 同版本（gitignored 层，真实消费者经 peerDep 去重不受影响）。
- Owner TODO（发布前置）：npmjs.com 为 @jixoai/vite-plugin 配置
  trusted publisher。

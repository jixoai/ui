# design — ghostty-term

> Orthogonal intents: (1) wasm 供给链与 vite 插件形态；(2) libghostty-vt
> ABI 绑定层设计；(3) ghostty-term 组件架构与分组裁决。Owner 原始需求：
> 2026-08-28 "引入 ghostty-term / packages/vite-plugin / 思考 components
> 分组"。r1：按 Codex r0 评审（4.0/10）修订全部阻塞项。

## D1. vite@8 的 wasm 行为（Owner 问题直答，8.2.2 源码核验）

```
wasm 引用形态                    vite 8 (rolldown, 8.2.2 实测源码)
──────────────────────────────  ──────────────────────────────────────────
                                KNOWN_ASSET_TYPES 不含 wasm：
                                wasm 不是通用静态资产类型，
                                由专用 vite:wasm-helper 插件处理
import './x.wasm'（裸）          parseWasm → 自动实例化 glue。实测
                                tip 两变体 import 表为空、导出无
                                global，故裸 import「能跑」——但文件
                                必须已在模块图内，且实例化时机与
                                URL 完全不受控
import './x.wasm?init'           export default opts => init(opts, url)
                                （vite 8 起支持 Node runtime 的 SSR，
                                走文件路径实例化）
import './x.wasm?url'            显式 URL 导入（asset plugin 处理；
                                wasm-helper 只管裸 import 与 ?init）
                                → URL 字符串 + 文件 emit 进 dist
模块图外、非 publicDir 的运行    ❌ 不搬运、不校验（引用不到即 404）
时文件（CI 抓取、运行时拼 URL）
publicDir/ 内的文件              client build 原样复制到 outDir
                                （无 hash、无校验；能搬但绕过内容
                                寻址缓存与 pin 校验，且要求手动放
                                文件）
SSR 构建 import 的资产           默认不 emit 客户端资产
                                （build.ssrEmitAssets 规则另立）
```

结论：三种模块图内形态都会把 wasm emit 进 dist，但**没有任何一种
适合我们的场景**——三者都要求 wasm 文件已经在消费者项目的模块图里，
而我们的 wasm 来自 release 下载；裸 import 还额外失去加载时机与 URL
控制。依赖 releases 下载的 wasm 必须由插件接管：dev 中间件 +
build `emitFile` + 虚拟模块交 URL。这就是 `packages/vite-plugin` 的
全部职责边界：不转译 wasm、不做实例化（那是 lib 层的事），只负责
「来源解析 → 校验 → 伺服/落盘 → 交 URL」。Batch A 附一个 vite
native 行为 fixture 测试（裸/`?url`/`?init`/publicDir 复制矩阵 +
以 pin 真实二进制断言 import/export 表——当前期望 imports=[]、导出
含必需族；上游漂移时该 fixture 与 probe 双哨兵失败），防止文档结论
随 vite 或 ghostty 升级漂移。

## D2. 供给链：pin 清单 + GitHub Actions，二进制不进 git

```
ghostty-org/ghostty release "tip"（滚动，唯一带 wasm 的 release）
 ├─ ghostty-vt.wasm        ~981KB（全量，含 grapheme 表）  ← 默认
 └─ ghostty-vt-small.wasm  ~711KB（裁剪变体）              ← 可选
        │ ①每周+手动: ghostty-wasm-sync.yml（唯一运行期 pin 写入者）
        ▼
  下载两变体 → WebAssembly.validate → probe（见下）→ 组装 pin
        │ 全部通过                       │ 任一失败
        ▼                                ▼
  与现 pin 逐字段比对：             workflow 失败标红，pin 不动
  无变化 → no-op；
  有变化 → 提 PR 更新 pin
        │ Owner merge
        ▼
仓库唯一落盘物 = pin 清单（文本，可 review、可回滚、可审计）
        │ ②任意构建（deploy / dev / consumer）
        ▼
  插件解析：JIXOAI_GHOSTTY_WASM_PATH(env) → cacheDir(sha256 命中)
          → 按 pin.url 下载 → sha256 校验 → 写 cacheDir
        │
        ▼
  dev: 中间件伺服   build: emitFile（内容寻址文件名）
```

**pin schema（冻结；schema test 锁定）**：

```jsonc
// packages/vite-plugin/ghostty.pin.json
{
  "pinnedAt": "2026-08-28T00:00:00Z",          // 本仓库提交时间
  "source": { "repo": "ghostty-org/ghostty", "tag": "tip",
              "releaseUrl": "…/releases/tag/tip" },
  "variants": {
    "full":  { "url": "…/download/tip/ghostty-vt.wasm",
               "sha256": "517821d6…", "size": 981125,
               "buildInfo": "…ghostty_build_info 原文…" },
    "small": { "url": "…/download/tip/ghostty-vt-small.wasm",
               "sha256": "13fd84dc…", "size": 711247,
               "buildInfo": "…" }
  }
}
```

- 每变体独立携带 url/sha256/size/buildInfo（r0 的顶层 url+variants
  混合结构废弃——Codex 阻塞#5）。
- **版本标识**：tip release 对象的 `publishedAt` 停在 2022-11-17
  （资产每夜替换但 release 不更新），不能当版本。`buildInfo` 取自
  探针从 wasm 内读出的 `ghostty_build_info`（git commit + 构建时间）。
- **pin 写入者唯一**（Codex 阻塞#6）：初始 pin 由 Batch A 用 probe
  本地验证后提交；之后唯一写入者 = ghostty-wasm-sync workflow（经
  PR）。Batch A/C 只读。

**probe 规格（`jixoai-ghostty-probe`，接口冻结）**：

- 包内 bin：`packages/vite-plugin` 经 tsdown 构建产出 `dist/probe.js`，
  `package.json` 声明 `"bin": { "jixoai-ghostty-probe": "./dist/probe.js" }`。
- CLI：`jixoai-ghostty-probe --wasm <path> --variant full|small --json`
  → stdout 输出 pin 片段 `{ variant, sha256, size, buildInfo }`；
  失败时非零退出 + stderr 点名原因。
- 检查面（Codex 建议，采纳加强）：(1) `WebAssembly.validate`；
  (2) 导出清单 superset 断言（terminal/render_state/key_encoder/
  paste/build_info/type_json/wasm_alloc 必需族）；(3) import 面
  断言（**实测两变体 imports=[]**；出现任何 import 即 ABI 变更，
  失败并点名——绑定层的实例化以空 imports 为契约）；(4) 实例化 +
  ABI 冒烟：type_json 解析 → terminal_new → vt_write(着色文本) →
  render_state 脏行迭代出非空 cell → Enter 键编码 = `\r`；
  (5) simd128 探测（wasm 编译期报错即失败）。

**威胁模型与残余风险（明示）**：sha256 pin 提供完整性，不提供发布者
真实性—— authenticity 依赖 GitHub release URL 固定在
ghostty-org 仓库 + pin 变更必经 PR 评审（人的把关点）。minisig 签名
验证可提供发布者真实性，但公钥分发与轮换的复杂度超出本 change 收益，
列为 non-goal；若上游未来提供签名公钥的官方分发，再升级。

**下载安全（Codex r1 阻塞#5 采纳）**：解析器与 verify:ghostty-pin 的
网络路径统一硬化——仅允许 `https:`；最终 host allowlist
`{github.com, objects.githubusercontent.com,
release-assets.githubusercontent.com}`，逐跳校验重定向（每跳 host
必须在 allowlist 内，最多 5 跳）；请求超时 30s；下载**流式累计
4MB 硬上限**（不依赖 Content-Length——缺失或超限立即失败并断流）；
URL 结构校验：路径必须匹配
`/ghostty-org/ghostty/releases/download/${pin.source.tag}/<variant
资产名>`（由 pin 的 source.tag 参数化生成——tip 与未来 stable tag
同规则；仓库路径与资产名白名单，防 URL 内跳转绕过；verify/probe
测试覆盖 tip 与非 tip tag 两种形态）；HEAD 仅作预检，真正的
安全决策在响应流上；缓存写入原子化
（tmp 文件 + rename，避免半写文件被后续读取）。

**二进制不进 git 的双护栏（Codex r1 阻塞#6 采纳）**：默认缓存目录
= `<cwd>/node_modules/.cache/jixoai-ghostty/`（npm 生态标准约定位，
天然被既有 node_modules ignore 规则覆盖，npm consumer 与本仓库
统一无特例；本仓库各脚本以各自 cwd 自然落位）。缓存唯一写入通道
是插件的 resolver API（内容寻址，tmp+rename）；B/C 批与测试对缓存
只读。`verify:ghostty-pin` 与 CI 断言 `git ls-files '*.wasm'` 为
空——tracked wasm 即 gate 红。

**resolver 行为矩阵（冻结；resolver tests 逐行覆盖）**：

| 场景 | 行为 |
| --- | --- |
| `JIXOAI_GHOSTTY_WASM_PATH` 已设 | 读该文件 + sha256 对 pin 校验；`path` 返回**源文件绝对路径**（不复制进缓存、不写缓存）；offline 标志无关（env 是显式本地意图） |
| 无 env，`offline: true` | 仅读缓存；miss 即报错（错误信息点名 env 覆盖用法） |
| 无 env，`offline: false` | 缓存命中（校验）→ `path` = 缓存路径；miss → 按下载安全规则下载校验 → 原子写缓存 → `path` = 缓存路径 |

**verify:ghostty-pin 硬化（Codex 建议，采纳）**：校验 pin json 合法
（schema）、每变体 url 为固定 origin（github.com/ghostty-org）、
HEAD 请求跟随重定向后 200 且最终 host 在 allowlist、Content-Length
存在时 ≤ 4MB 上限、本地 cache 若存在则逐字节 sha256 一致、
tracked wasm 为零；`--offline` 跳过网络断言。workflow 侧：
`concurrency: group=ghostty-pin`、permissions 最小化
（contents: write + pull-requests: write 仅在该 job）。
**校验深度边界（Batch C 摩擦反馈的裁决，2026-08-28）**：verify 的
在线态是轻量哨兵（形状 + 可达性 + 头部约束），**不**做全量下载
哈希——全量字节校验由两处承担：sync workflow 的 probe（下载 +
sha256 计算 + ABI 冒烟，drift 在 pin 更新 PR 里显形）与 resolver
的流式校验（消费路径逐字节把关）。良形状错 sha 在 verify 在线态
放行是设计内行为，不是漏洞；ad-hoc 深审直接跑 resolver 或 probe。

**deploy 低网络依赖**：deploy.yml 增加 `actions/cache`
（key = pin 各变体 sha256 拼接）把 wasm 预填进插件 cacheDir；cache
命中即零下载且仍校验，miss/eviction 时允许经 resolver 重新下载
（不承诺绝对零网络——网络路径本身是受控且校验的）。airgap/CI
artifact 场景用 `JIXOAI_GHOSTTY_WASM_PATH` 直指本地文件（同样校验
sha256）。

裁决理由（不变）：不提交二进制（nightly 滚动 + git 历史膨胀）；
不依赖 coder/ghostty-web npm 包（Owner 指定 ghostty 官方 releases；
其 wasm 为打补丁的 fork 构建，与 release 资产不同源；自持绑定层直吃
上游 render_state 脏行 API）；探针先行才 pin（nightly 可能坏）。

## D3. `packages/vite-plugin` — `@jixoai/vite-plugin`

```
packages/vite-plugin/
├─ package.json      name @jixoai/vite-plugin, type module, node>=20
│                    peerDeps: vite ^8.0.0；零 dependencies
│                    bin: jixoai-ghostty-probe；files: dist/ + pin
├─ src/index.ts      export jixoaiGhostty(): Plugin[]
├─ src/resolve.ts    来源解析（env → cache → fetch+verify，纯函数可测）
├─ src/probe.ts      probeGhosttyWasm(bytes) → ProbeResult（bin 复用）
├─ src/pin.ts        pin schema 读取 + 校验（schema test 锁定）
├─ ghostty.pin.json  pin 清单（唯一写入者 = sync workflow）
├─ tsdown.config.ts  构建 dist/index.js + dist/probe.js（ESM）
│                    + dts：dist/index.d.ts + dist/client.d.ts
│                    （tsdown dts 生成；npm pack --dry-run 与 CI
│                    断言两个 dts 均在 files 产物内）
└─ test/*.test.ts    vitest（见 D7 矩阵）
```

插件行为（`jixoaiGhostty({ variant?: 'full'|'small', cacheDir? })`）：

- **build emit 时序（Codex 阻塞#3 修正）**：wasm 字节在
  `buildStart` 阶段解析完成（resolve + 校验，一次）；虚拟模块
  `load()` 钩子内 `this.emitFile({ type: 'asset',
  fileName: 'assets/ghostty-vt-<sha256前16>.wasm', source })` 拿到
  referenceId，模块代码用 `import.meta.ROLLUP_FILE_URL_<ref>` 生成
  url——emit 发生在模块渲染之前，占位符在 renderChunk 期解析为
  最终相对 URL。文件名由**我们的 sha256** 内容寻址（Codex 阻塞#4：
  rollup 的 `[hash]` 不是 pin 的 sha256 前缀；显式 `fileName` 才能兑现
  「hash 即 sha256」的承诺），测试断言 dist 内真实文件名。
- **emit 恰好一次**：虚拟模块同 build 只 load 一次（rollup 模块缓存
  保证）；SvelteKit 的 client/server 双构建各自独立调用，server
  consumer（`this.environment.config.consumer === 'server'`）不
  emitFile，url 字段返回同名字符串（服务端不使用）。
- **dev**：`configureServer` 中间件伺服 wasm 字节，路径
  `/@jixoai/ghostty-vt-<sha256前16>.wasm`（含摘要前缀，配合
  `Cache-Control: public, max-age=31536000, immutable` 才成立——
  Codex 非阻塞建议采纳），`Content-Type: application/wasm`。
- **虚拟模块** `virtual:jixoai-ghostty`（resolveId 认领 + `\0` 内部
  id）：导出纯数据 `{ url: string, sha256: string,
  variant: 'full'|'small', buildInfo: string }`。**不在模块求值期碰
  fetch/WebAssembly**——SSR 与 vitest node 环境安全 import。
- 解析失败要给**点名修法**的错误（对照 check-tw4-prereq 的报错风格）：
  网络失败 → 提示 `JIXOAI_GHOSTTY_WASM_PATH` 覆盖；sha256 不匹配 →
  提示 pin 与 url 漂移 + sync workflow 状态。

**npm 发布（Codex 阻塞#12）**：release.yml 增加 `publish-vite-plugin`
job，沿用 cli 的 npm Trusted Publishing（OIDC）模式：pack
`packages/vite-plugin`（先 `npm ci && npm run build`）→ 幂等 publish
（已发布版本跳过）→ tarball 附到 tag release。**包工程自包含**
（Codex r2 阻塞#3）：`packages/vite-plugin` 是独立 npm 工程——自带
`package-lock.json`（Batch A 生成并维护）与 devDependencies
（tsdown/vitest/typescript），CI 内 `npm ci` 可复现构建，不依赖根
安装（根不是 workspace，www 的 file: 依赖照常工作）。Owner TODO
（发布前置，不阻塞开发）：在 npmjs.com 为 `@jixoai/vite-plugin`
配置 trusted publisher（绑定本仓库 + release.yml + npm-publish
environment）。

**resolver 公共 API（冻结——Batch B 的可执行入口）**：

```ts
// packages/vite-plugin，node 侧同样可用（零运行时依赖）
import { resolveGhosttyWasm } from '@jixoai/vite-plugin';
resolveGhosttyWasm(opts?: {
  variant?: 'full' | 'small';   // default 'full'
  cacheDir?: string;            // default <cwd>/node_modules/.cache/jixoai-ghostty
  offline?: boolean;            // true = 仅缓存，miss 即抛错
}): Promise<{
  bytes: Uint8Array;
  path: string;                 // env 覆盖时 = 源文件绝对路径；
                                // 否则 = 缓存路径（<cacheDir>/<sha256>.wasm）
  sha256: string; variant: 'full' | 'small'; buildInfo: string;
}>
```

缓存文件名 = `<sha256>.wasm`（内容寻址）；唯一写入通道、tmp+rename
原子写；env/缓存/下载三路行为见上方 resolver 行为矩阵。B 批测试用
它取 bytes（offline:false 首跑下载、后续命中），C 批 workflow 用
probe bin，互不越界。

**client 类型子导出的物理形状（冻结）**：

```
packages/vite-plugin/src/client.d.ts        // 源
packages/vite-plugin/dist/client.d.ts       // tsdown 产出（copy 或 emit）
package.json exports:
  ".":        { "types": "./dist/index.d.ts", "import": "./dist/index.js" }
  "./client": { "types": "./dist/client.d.ts" }
```

`src/client.d.ts` 内容 = ambient
`declare module 'virtual:jixoai-ghostty' { export const url: string;
export const sha256: string; export const variant: 'full'|'small';
export const buildInfo: string }`（**named exports，无 default**，
与插件运行时生成的模块形状一致）。peerDependency 收窄为
`vite ^8.0.0`（8 是唯一实测面；更旧版本不承诺，README 明示）。
消费者接入：在自己项目的 d.ts 环境文件加一行
`/// <reference types="@jixoai/vite-plugin/client" />` 即获得类型
（apps/www fixture：`src/vite-env.d.ts` 加该行，svelte-check 必须
绿——引用即断言）；apps/www 用 `file:../../packages/vite-plugin`
本地解析（发布与否不影响仓库内开发）。

## D4. `ghostty-vt`（registry:lib）— ABI 绑定层

上游 wasm 是 C-ABI + 运行时反射：`ghostty_type_json()` 返回全部结构
offset/enum 值/ABI 宽度。官方 example 的编组模式即为规范用法 ——
**零硬编码 offset，布局全部运行期解析**，这是抗 nightly ABI 漂移的
关键，也是绑定层的第一个职责。

```
registry/files/lib/ghostty-vt.ts
export loadGhosttyVT({ url? , bytes? , variant? }): Promise<GhosttyVT>

GhosttyVT
├─ buildInfo / typeLayout（诊断暴露）
├─ terminal 新建/释放/重置/resize（cols,rows）
├─ vtWrite(Uint8Array)            ← pty 输出侧入口
├─ renderState                    ← 渲染侧读取面
│   update() → begin/endUpdate 包裹 vtWrite 事务
│   dirtyRows(): Iterable<RowSnapshot>
│   RowSnapshot → cells: CellView[] { grapheme, style, hyperlinkUri }
│   style: { fg?, bg?, bold, italic, underline, reverse, invisible… }
├─ keyEncode(KeyboardEvent-like): Uint8Array   ← 输入侧
├─ paste { isSafe(text), encode(text) }
├─ scrollViewport(lines)
├─ snapshotEncode()（V1 仅 encode 暴露；decode 不进 V1 API 面）
└─ free()（wasm 线性内存不由 GC 管，组件 onDestroy 接）
```

- 实例化：`WebAssembly.instantiateStreaming`，imports 传 `{}`（实测
  两变体 import 表为空——契约由 probe 断言锁死）；不支持 streaming /
  wasm 编译失败（含 simd128 缺失）→ 抛带 `cause` 的类型化错误，
  组件层转 `data-state="error"`（Codex 建议采纳）。
- 编组助手（setField/getField 按 typeLayout 的 offset/类型）与官方
  example 同源，泛化为表驱动。
- **url/bytes 显式注入**：lib 不 import 虚拟模块（框架无关 + node 可
  测：测试直接 `bytes: readFileSync(...)`）。虚拟模块交接发生在 ui
  组件层（D5），wasm 前置契约因此挂在组件 item 上（registry delta）。
- 安装链冻结（Codex r0#7 + r2#1；impl-r1#5 修订：density 入约）：
  `ghostty-term` 声明
  `registryDependencies = ["@jixoai/ghostty-vt", "@jixoai/jixoai-theme",
  "@jixoai/utils", "@jixoai/color-utils", "@jixoai/density"]`
  （utils = clsx+twMerge class 合并；color-utils = OKLCH→sRGB 画布
  换算；density = `--jx-text/--jx-line` 内核探针 + resolveDensity——
  组件 import `$lib/density.svelte`，list-item 先例同款依赖边）；
  `ghostty-vt` 与 `color-utils` 两个 lib item 均零 npm `dependencies`。
- **新 item：`color-utils`（registry:lib，engines 组）**——现状是
  `registry/files/lib/color-utils.ts` 躺在 mirror manifest 的
  `unreferencedLib`（site-consumed），且 `color-picker` 的 registry
  源码 import `$lib/color-utils` 却无人承载（**存量潜在断裂**：干净
  `shadcn add @jixoai/color-picker` 会缺文件）。本 change 为其建立
  item（canonical `@lib/color-utils.ts`），`color-picker` 的
  registryDependencies 补 `@jixoai/color-utils`（修复存量断裂，
  shadcn add 探针双向覆盖 color-picker 与 ghostty-term），
  `color-utils` 退出 unreferencedLib。
- mirror-manifest：ghostty-term 的 `canonicalMain =
  ghostty-term.svelte`（字段名以 apps/www/mirror-manifest.schema.json
  与 gen-mirror-manifest.mjs 为准——现行 registry spec 文本中的
  `canonicalMainSource` 是陈旧表述，本 change delta 顺手校正），
  `lib/ghostty-vt.ts` 以 sharedClaimOf 归属 ghostty-vt item。Phase 3
  用 `verify-shadcn-add.mjs` 先例加真实 shadcn add 探针，双向断言：
  `@jixoai/ghostty-term`（ghostty-vt + theme + utils + color-utils +
  density 连带、无二进制 payload）与 `@jixoai/color-picker`（color-utils
  连带——存量断裂修复的回归锁）。

## D5. `ghostty-term`（registry:ui）— 组件架构

```
consumer (pty: websocket / ssh / loopback demo)
   ▲ onData(bytes)                          │ write(bytes) 派生 API
   │                                        ▼
┌─ ghostty-term.svelte ──────────────────────────────────────────┐
│ root <div data-jx-ghostty-term data-state>（…rest、class 合并、│
│      tabindex=0、aria-label、hit-lane、focus ring）             │
│ ┌────────────┐  ResizeObserver → 度量 → terminal.resize        │
│ │ <canvas>   │  rAF 批处理：vtWrite 事务 → dirtyRows → 重绘    │
│ │ (aria-     │  cell 绘制：bg rect → grapheme fillText         │
│ │  hidden)   │  style 映射：SGR → canvas（token/调色板桥）     │
│ └────────────┘  字体：jetbrains mono + fonts.ready 后首帧      │
│ keyboard: root keydown → keyEncode → onData；paste → isSafe 门 │
│ 释放：onDestroy → renderState/terminal free                    │
└────────────────────────────────────────────────────────────────┘
        wasm url ← virtual:jixoai-ghostty（插件前置契约）
        OKLCH→sRGB ← lib/color-utils.ts（oklchToRgb 既有）
```

### D5.1 组件契约（component-authoring 法则清单，Codex 阻塞#11）

- `$props()` 强类型：`{ cols?, rows?, fontSize?, onData?, theme?,
  class?, children? , …rest }`；`…rest` 全量转发 root div；
  `class` 经 `$lib/utils`（clsx + twMerge）合并到 root。
- **可访问焦点**：root div `tabindex="0"`（canvas 本身不聚焦，
  `aria-hidden="true"` 纯画布）；`aria-label` 默认 `"terminal"`，
  消费者经 rest 覆盖；`role` 默认不设（generic container + label），
  文档说明语义边界；focus ring 用 `:focus-visible` utilities。
- **hit-lane**：root 是交互面（键盘输入）→ `min-block-size:
  var(--jx-hit)` 进 colocated css（`:where()` + 标准 layer 序言，
  folder css law）；浏览器断言覆盖。
- **density**：行高与 cell 度量吃 `--jx-line-*` 内核 token，
  density-adoption 表登记 family；`data-state={loading|ready|error}`
  为 stamped-attribute 面。`fontSize` prop 是数值覆盖（px）：默认值
  由 density token 派生；显式传入必须为有限正数（校验拒绝
  NaN/≤0/Infinity），在 density exception registry 留档（受限逃生口，
  不进 token allowlist、不承诺 token 对齐）。
- **错误降级**：wasm 加载/编译失败（含 simd128 缺失）→
  `data-state="error"` + 可插槽的降级 UI（默认一段终端风格错误
  文案），不白屏。
- **颜色边界声明**（Codex 建议采纳）：ANSI/256/truecolor 是**内容
  色彩空间**（终端输出的忠实还原，不属于 design-tokens 管辖）；
  design-tokens 管的是**外壳**——默认 bg/fg/光标/选区从 jixoai
  token 取值，`theme` prop 只覆盖外壳与调色板映射，不重定义内容色。
- 快照 API：V1 只暴露 `snapshotEncode()`（诊断/测试用），
  decode 不出现在公共面（r0 自相矛盾处已删）。

### D5.2 渲染与输入（继承 r0 设计）

- 渲染循环：`requestAnimationFrame` 合并多次 vtWrite 为一帧；
  `begin_update → vt_write* → end_update → dirtyRows` 只重绘脏行；
  全量重绘仅在 resize/主题变更/字体加载完成时。滚动用
  `terminal_scroll_viewport`（V1 不做 scrollback UI，non-goal）。
- 样式面（V1）：bold（weight 700）/ italic / underline / reverse /
  fg / bg（默认调色板 + 256 + truecolor）/ invisible 跳过绘制；
  宽字符与 grapheme 由 cell 的 grapheme 串直接 fillText（上游已做
  cluster 切分）。
- 尺寸双模式：显式 `cols/rows` 或 `auto`（ResizeObserver 容器
  驱动）；度量 = `measureText('W')` advance 宽 + `--jx-line-*` 行高。
- 字体时序：`document.fonts.ready` + 兜底重测；首帧允许 fallback
  mono，字体就绪后全量重绘（FOUT 预期，不隐形等待）。

### D5.3 demo / docs 页

`/docs/components/ghostty-term.html`（路由带 `.html`——SvelteKit
目录路由 `ghostty-term.html/+page.svelte`，与 catalog href 及既有
全部组件页一致）：live demo = 页内回环 pty（canned VT 场景：
prompt、色彩矩阵、进度条动画）+ 键盘回显（echo + 行编辑），
零网络零后端。文档覆盖：安装前置（tw4 + vite 插件两步）、
onData/write 契约、尺寸模式、主题覆盖边界、错误降级。

## D6. 分组裁决：新 `terminal` 组（迁移触及面冻结）

品牌身份是 terminal/neo-brutalist——终端面值得一等分组：

```
CATALOG_GROUPS（apps/www/src/lib/catalog.ts）
 general → [terminal] → layout → navigation → layer
                              ↑ 新组插在 general 之后：品牌脸面靠前
 terminal: "The brand's native surface: live and static terminal faces"
   ├─ ghostty-term（新，live 表面）
   ├─ terminal-card（自 data-display 迁入）
   ├─ terminal-header（自 layout 迁入）
   └─ terminal-footer（自 layout 迁入）
```

**迁移后冻结计数**（docs-structure.spec.ts 快照同步为）：
`general:8, terminal:4, layout:8, navigation:10, layer:10,
data-entry:18, data-display:15, feedback:5`（UI 项合计 77→78）。

**完整触及面**（Codex 阻塞#10；缺一即 gate 红）：

| 文件 | 改动 |
| --- | --- |
| `registry.json` | 4 项 `meta.group`（ghostty-term 新条目 + 3 迁移） |
| `apps/www/src/lib/catalog.ts` | `CatalogGroupId` 封闭 union + `CATALOG_GROUPS` 数组插行 |
| `apps/www/test/docs-structure.spec.ts` | 组数/计数冻结快照更新 |
| `apps/www/test/catalog.spec.ts` | 分组派生锁（若含组序断言则同步） |
| `apps/www/svelte.config.js` | `entries` 增加 ghostty-term 页路由 |
| reading chain（prev/next/related） | 由 docs-route-model 自动派生——测试锁全链覆盖，不需手改 |

item href 与 payload 名不变（组迁移 = meta 字段编辑 + 镜像行）。
迁移后的 reading-chain 顺序（prev/next/related）由 docs-route-model
自动派生，docs-structure.spec.ts 的全链覆盖断言即顺序快照——组迁移
后测试更新时同步冻结新链顺序。
**拒绝拆分**（Codex 非阻塞建议）：terminal 迁移不拆独立 change——
迁移本身无独立交付价值（没有 ghostty-term 的 terminal 组是空壳），
批次 D 已按「独立可验收批次」管理，且上述触及面全部冻结在案。

## D7. 测试与门禁

| 层 | 手段 | 关键断言 |
| --- | --- | --- |
| vite native 行为 | vitest fixture（Batch A） | 裸/`?url`/`?init` 在 vite 8 的真实行为矩阵（防文档漂移） |
| 插件 resolve | vitest 纯函数 | env 覆盖优先；cache 命中不 fetch；sha256 不符报错点名 |
| 插件 dev/build | vitest + vite build() 编程调用 | 中间件 serve application/wasm + immutable；**dist 真实文件名 = assets/ghostty-vt-<sha16>.wasm**；虚拟模块 url 可 import；SSR 构建不炸 |
| probe | vitest | 合法 wasm 过；截断/篡改 wasm 各失败路径 + 必需导出断言 |
| pin schema | vitest | pin json 结构锁定；variant key 完整 |
| 绑定层 | vitest node + bytes 直载 | type_json 解析；formatter plain 黄金输出；脏行迭代形状；Enter→`\r`；resize 存活 |
| 组件逻辑 | vitest jsdom（canvas mock 度量） | 网格度量换算；auto→cols/rows 映射；onData 桥；…rest/class 合并 |
| 组件渲染 | build:site 后 playwright 探针 + ZCode 浏览器验收 | 文本像素采样非空；暗色 token；resize 重排；键盘回环；focus/hit-lane/density 断言（D5.1） |
| 安装链 | verify-shadcn-add 先例扩展 | 双向：`shadcn add @jixoai/ghostty-term` → ghostty-vt + jixoai-theme + utils + color-utils + density 连带、无二进制 payload；`shadcn add @jixoai/color-picker`（其余前置依赖就位的 fixture）→ color-utils 连带回归 |
| blueprint | scenes + build:blueprints | scenes/ghostty-term.svelte + 提交 SVG + blueprints.spec.ts 覆盖锁 |
| 供给链 | workflow 内 probe | validate + ABI 冒烟通过才更新 pin |
| 既有门禁 | 全量 | svelte-check / vitest / verify:surface / verify:mirror / verify:hook-law / verify:ghostty-pin / build:site / docs-structure / catalog |

## D8. 风险与开放问题

- **tip 是 nightly 滚动**：ABI 探针挡坏构建；重大破坏时 lock 旧 pin
  （回滚 = revert pin PR）。若上游未来出 stable tag 带 wasm，pin 源
  切 stable，机制不变。
- **ROLLUP_FILE_URL 依赖 rollup 语义**：emit-in-load + 占位符是
  rollup 文档化行为，vite build() 集成测试锁定；vite major 升级时
  该测试是哨兵。
- **显式 fileName 与 rollup 去重**：同 build 双 emit 同名会硬错误；
  虚拟模块单 load 保证唯一，集成测试覆盖 SvelteKit client+server
  双构建路径。
- **jsdom 无 canvas**：组件渲染断言全部走真实浏览器探针，jsdom 只测
  纯逻辑；不引入 node-canvas。
- **wasm 内存增长**：render_state clean + 显式 free 在 onDestroy；
  demo 长跑观察，V1 不做内存仪表。
- **npm 发布依赖 Owner 配置 trusted publisher**：不阻塞开发
  （file: 依赖），发布日 TODO 已列。
- **仓库锁文件事实**：根仓库跟踪的是 `package-lock.json`
  （npm）；`pnpm-lock.yaml` 在 .gitignore 中被忽略。apps/www 独立
  npm 安装；`packages/vite-plugin` 亦为自带 lockfile 的独立 npm
  工程（见 D3）。不改动该格局（单独 change 再议）。

# design — ghostty-term

> Orthogonal intents: (1) wasm 供给链与 vite 插件形态；(2) libghostty-vt
> ABI 绑定层设计；(3) ghostty-term 组件架构与分组裁决。Owner 原始需求：
> 2026-08-28 "引入 ghostty-term / packages/vite-plugin / 思考 components
> 分组"。

## D1. vite@8 的 wasm 行为（Owner 问题直答）

```
wasm 文件                     vite 8 (rolldown) 行为
───────────────────────────  ─────────────────────────────────────────────
模块图内 import './x.wasm'    静态资产：emit 到 dist/assets/（hash 名）
import './x.wasm?url'         同上，JS 拿到 URL 字符串
import './x.wasm?init'        emit + 返回 init(imports) 实例化函数
                             （vite 8 新增：SSR 也可用 ?init）
模块图外（CI 抓取目录、运行   ❌ 不搬运、不校验、SSR 构建默认不 emit
时 URL 拼接、public/ 硬拷贝    客户端资产；public/ 能搬但绕过 hash/
以外的随意路径）               缓存/校验，且要求用户手动放文件
```

结论：**依赖 releases 下载的 wasm 必须由插件接管**——dev 中间件 +
build `emitFile` + 虚拟模块交 URL。这就是 `packages/vite-plugin` 的
全部职责边界：不转译 wasm、不做实例化（那是 lib 层的事），只负责
「来源解析 → 校验 → 伺服/落盘 → 交 URL」。

## D2. 供给链：pin 清单 + GitHub Actions，二进制不进 git

```
ghostty-org/ghostty release "tip"（滚动，唯一带 wasm 的 release）
 ├─ ghostty-vt.wasm        ~981KB（全量，含 grapheme 表）  ← 默认
 └─ ghostty-vt-small.wasm  ~711KB（裁剪变体）              ← 可选
        │ ①每周+手动: ghostty-wasm-sync.yml
        ▼
  下载 → WebAssembly.validate → node ABI 冒烟探针
        │ 通过                              │ 失败
        ▼                                   ▼
  更新 packages/vite-plugin/          保持旧 pin，workflow 标红
  ghostty.pin.json + 开 PR
  {url, version, buildInfo,
   sha256, size, variants{full,small}}
        │ Owner merge
        ▼
仓库唯一落盘物 = pin 清单（文本，可 review、可回滚、可审计）
```

> 版本标识修正：tip release 对象的 `publishedAt` 停在 2022-11-17（资产
> 每夜替换但 release 不更新），不能当版本。pin 的 `version` 取自探针
> 从 wasm 内读出的 `ghostty_build_info`（git commit + 构建时间），
> 每夜可区分、消费者可显示。
        │ ②任意构建（deploy / dev / consumer）
        ▼
  插件解析：JIXOAI_GHOSTTY_WASM_PATH(env) → cacheDir(sha256 命中)
          → 按 pin.url 下载 → sha256 校验 → 写 cacheDir
        │
        ▼
  dev: 中间件 /@jixoai/ghostty-vt.wasm   build: emitFile
```

裁决理由：

- **不提交二进制**：tip 是 nightly 滚动，1MB×每次变更会把 git 历史撑
  成垃圾场；pin 清单给了等强的可复现性（sha256 锁死）。
- **不直接依赖 coder/ghostty-web npm 包**：Owner 指定以 ghostty 官方
  releases 为依赖源；且自持绑定层后 render loop 直接吃 render_state
  脏行 API（上游为渲染宿主设计的面），不被第三方补丁版绑死。
  ghostty-web 的 wasm 是打了 patch 的 fork 构建，与 release 资产不同源。
- **探针先行才 pin**：nightly 可能坏；ABI 冒烟（new/vt_write/render
  迭代/key 编码）不过就不升级，供给链稳定性以旧 pin 兜底。
- **minisig 不用**：公钥分发的复杂度超过 sha256 pin 模型（pin 本身由
  repo 提交历史保护），列为 non-goal。

deploy.yml 增加 `actions/cache`（key=pin sha256）把 wasm 放进插件
cacheDir：首次后所有构建零下载、仍然校验。airgap/CI artifact 场景用
`JIXOAI_GHOSTTY_WASM_PATH` 直指本地文件（同样校验 sha256）。

## D3. `packages/vite-plugin` — `@jixoai/vite-plugin`

```
packages/vite-plugin/
├─ package.json      name @jixoai/vite-plugin, type module, node>=20
│                    peerDeps: vite ^6||^7||^8；零 dependencies
├─ src/index.ts      export jixoaiGhostty(options?): Plugin[]
├─ src/resolve.ts    来源解析（env → cache → fetch+verify，纯函数可测）
├─ src/probe.ts      export probeGhosttyWasm(bytes): Promise<ProbeResult>
│                    （workflow 复用；不依赖 vite）
├─ ghostty.pin.json  pin 清单（workflow 更新；npm files 白名单包含）
└─ test/*.test.ts    vitest（build emit / dev fetch / 校验失败 / env 覆盖）
```

插件行为（`jixoaiGhostty({ variant?: 'full'|'small', servePath?, cacheDir? })`）：

- dev：`configureServer` 中间件伺服 wasm 字节，
  `Content-Type: application/wasm` + `Cache-Control: immutable`。
- build：`generateBundle` 阶段 `emitFile({type:'asset',
  name:'ghostty-vt.wasm', source})`；文件名模板挂 sha256 前缀 →
  内容寻址、长缓存天然成立。
- 虚拟模块 `virtual:jixoai-ghostty`（rollup 约定 id + `\0` 内部 id）：
  dev 直接导出 `{ url: '/@jixoai/ghostty-vt.wasm', sha256, variant,
  version }`；build 用 `import.meta.ROLLUP_FILE_URL_<ref>` 生成 url。
  **纯数据模块**：不在模块求值期碰 fetch/WebAssembly —— SSR 与 vitest
  node 环境安全。
- 解析失败要给**点名修法**的错误（对照 check-tw4-prereq 的报错风格）：
  网络失败 → 提示 env 覆盖；sha256 不匹配 → 提示 pin 与 url 漂移。

apps/www 接线：`"@jixoai/vite-plugin": "file:../../packages/vite-plugin"`
（www 走 npm，deploy 的 npm install 零网络即可解析本地包），
vite.config.ts `plugins: [sveltekit(), tailwindcss(), ...jixoaiGhostty()]`。

## D4. `ghostty-vt`（registry:lib）— ABI 绑定层

上游 wasm 是 C-ABI + 运行时反射：`ghostty_type_json()` 返回全部结构
offset/enum 值/ABI 宽度（usize 对齐等）。官方 example 的编组模式即为
规范用法 —— **零硬编码 offset，布局全部运行期解析**，这是抗 nightly
ABI 漂移的关键，也是绑定层的第一个职责。

```
registry/files/lib/ghostty-vt.ts
export loadGhosttyVT({ url? , bytes? , variant? }): Promise<GhosttyVT>

GhosttyVT
├─ buildInfo / typeLayout（诊断暴露）
├─ terminal 新建/释放/重置/resize（cols,rows → 物理行）
├─ vtWrite(Uint8Array)            ← pty 输出侧入口
├─ renderState                    ← 渲染侧读取面
│   update() → begin/endUpdate 包裹 vtWrite 事务
│   dirtyRows(): AsyncOrSyncIterable<RowSnapshot>
│   RowSnapshot → cells: CellView[] { grapheme, style, hyperlinkUri }
│   style: { fg?, bg?, bold, italic, underline, reverse, invisible… }
├─ keyEncode(KeyboardEvent-ish): Uint8Array   ← 输入侧（含 kitty 协议协商态）
├─ paste { isSafe(text), encode(text) }
├─ scrollViewport(lines)          ← viewport 滚动
├─ snapshot encode/decode（V1 只 encode 暴露，UI 不做）
└─ 释放语义：显式 free()（wasm 线性内存不由 GC 管，组件 onDestroy 接）
```

- 实例化：`WebAssembly.instantiateStreaming`，import 只需 `env.log`
  （官方契约）；不支持 streaming 的环境回退 `instantiate`。
- 编组助手（setField/getField 按 typeLayout 的 offset/类型）与官方
  example 同源，但泛化为表驱动。
- **url/bytes 显式注入**：lib 不 import 虚拟模块（框架无关 + node 可
  测：测试直接 `bytes: readFileSync(...)`）。虚拟模块的交接发生在
  ui 组件层（D5），对应 registry 法则里 wasm 前置契约挂在组件 item 上。
- 颜色：wasm 侧 `ghostty_color_*`（palette_default/parse/contrast）可
  选用；默认调色板从 wasm 取，主题化叠加在组件层做（OKLCH token 覆盖）。

## D5. `ghostty-term`（registry:ui）— 组件架构

```
consumer (pty: websocket / ssh / loopback demo)
   ▲ onData(bytes)                          │ write(bytes) 派生 API
   │                                        ▼
┌─ ghostty-term.svelte ──────────────────────────────────────────┐
│ props {cols?|auto, rows?, fontSize?, theme? overrides,        │
│        onData?(bytes), class, children? (overlay slot)}       │
│ ┌────────────┐  ResizeObserver → 度量 → terminal.resize       │
│ │ <canvas>   │  rAF 批处理：vtWrite 事务 → dirtyRows → 重绘   │
│ │ data-jx-   │  cell 绘制：bg rect → grapheme fillText        │
│ │ ghostty-   │  style 映射：SGR → canvas（token/调色板桥）    │
│ │ term       │  字体：jetbrains mono + fonts.ready 后首帧     │
│ └────────────┘  DPR：canvas 物理像素 × css 像素换算           │
│ keyboard: keydown → keyEncode → onData；paste → isSafe 门     │
│ 释放：onDestroy → terminal/renderState free                    │
└────────────────────────────────────────────────────────────────┘
        wasm url ← virtual:jixoai-ghostty（插件前置契约）
        OKLCH→sRGB ← lib/color-utils.ts（oklchToRgb 既有）
```

- **props 纪律（composition-first 既有法）**：`onData` 回调 + 派生
  `write`/`reset`/`resize` 方法句柄（`bind:this`），不内置任何传输
  协议；pty 归消费者，demo 页示范回环。
- **尺寸双模式**：显式 `cols/rows`（固定画布）或 `auto`（容器驱动）；
  度量 = `measureText('W')` 的 advance 宽 + 行高（density token
  `--jx-line-*` 参与，遵守 density 内核法则）。
- **渲染循环**：`requestAnimationFrame` 合并多次 vtWrite 为一帧；
  `begin_update → vt_write* → end_update → dirtyRows` 只重绘脏行；
  全量重绘仅在 resize/主题变更/字体加载完成时。滚动用
  `terminal_scroll_viewport`，V1 不做 scrollback UI（non-goal）。
- **样式面（V1）**：bold（伪粗 weight 700）/ italic / underline /
  reverse / fg / bg（默认调色板 + 256 + truecolor）/ invisible 略过
  绘制；宽字符与 grapheme 由 cell 的 grapheme 串直接 fillText（上游
  已做 cluster 切分，这是选 ghostty 的核心理由）。
- **钩子法**：`data-jx-ghostty-term` 根锚 + 状态属性
  `data-state={loading|ready|error}`；canvas 之外的 chrome（边框、
  标题条不需要——terminal-card 已有静态面）全部留给消费者组合。
  css：原则上零 css（canvas 自绘）；确需 focus ring 用 utilities。
- **前置契约（registry delta 落法）**：安装 `ghostty-term` 需要
  (a) Tailwind v4 + jxoai theme（既有 tw4 法则）、(b) vite 配置里
  挂 `@jixoai/vite-plugin` 的 `jixoaiGhostty()`。文档 + 组件加载
  失败信息双通道点名（虚拟模块解析失败的 vite 报错文本会被文档
  引用）。

### demo / docs 页

`/docs/components/ghostty-term`：live demo = 页内回环 pty（canned VT
场景：prompt、色彩矩阵、进度条动画、vim 风格全屏切换）+ 键盘回显
（echo + 简单行编辑），零网络零后端。文档覆盖：安装前置（插件 wire
一步）、onData/write 契约、尺寸模式、主题覆盖。

## D6. 分组裁决：新 `terminal` 组

现状 terminal 三件套散落：`terminal-card`（data-display）、
`terminal-header` / `terminal-footer`（layout）。品牌身份是
terminal/neo-brutalist——终端面值得一等分组：

```
CATALOG_GROUPS（www/src/lib/catalog.ts）
 general → [terminal] → layout → navigation → layer
                              ↑ 新组插在 general 之后：品牌脸面靠前
 terminal: "The brand's native surface: live and static terminal faces"
   ├─ ghostty-term（新，live 表面）
   ├─ terminal-card（自 data-display 迁入，静态卡片）
   ├─ terminal-header（自 layout 迁入）
   └─ terminal-footer（自 layout 迁入）
```

- 改动面：registry.json 四项的 `meta.group` + CATALOG_GROUPS 插入一
  行；导航/计数/docs components.html 分组自动派生；**item href 不变**
  （页面按 item name 组织）。
- 需同步：docs-structure.spec.ts 冻结快照（组数与计数）、
  verify:surface / item-matrix 若硬编码组名则同步（实现期核对）。
- 拒绝的备选：并入 data-display（弱化品牌、live 表面不是"读数据"）；
  为 vite-plugin 设组（它不是 registry item，走 npm 包 + build-plugins
  spec，不进目录）。

## D7. 测试与门禁

| 层 | 手段 | 关键断言 |
| --- | --- | --- |
| 插件 resolve | vitest 纯函数 | env 覆盖优先；cache 命中不 fetch；sha256 不符报错点名 |
| 插件 dev/build | vitest + vite build() 编程调用 | 中间件 serve application/wasm；dist 落盘 + hash 名；虚拟模块 url 可 import |
| 绑定层 | vitest node + bytes 直载 | type_json 解析；formatter plain 黄金输出；脏行迭代形状；Enter→`\r`；resize 存活 |
| 组件逻辑 | vitest jsdom（canvas mock 度量） | 网格度量换算；auto→cols/rows 映射；onData 桥 |
| 组件渲染 | build:site 后 playwright 探针 + ZCode 浏览器验收 | 真实文本像素呈现（采样非空）；暗色 token 生效；resize 后重排；键盘回环 |
| 供给链 | workflow 内 probe | validate + ABI 冒烟通过才更新 pin |
| 既有门禁 | 全量 | svelte-check / vitest / verify:surface / verify:mirror / verify:hook-law / build:site / docs-structure 更新快照 |

新脚本：`verify:ghostty-pin`（node：pin json 合法 + url 可达 HEAD +
本地 cache 若存在则 sha256 一致）——本地/CI 都可跑的轻量供给链哨兵。

## D8. 风险与开放问题

- **tip 是 nightly 滚动**：ABI 探针挡坏构建；重大破坏时 lock 旧 pin
  （回滚 = revert pin PR）。若上游未来出 stable tag 带 wasm，pin 源
  切 stable，机制不变。
- **jsdom 无 canvas**：组件渲染断言全部走真实浏览器探针，jsdom 只测
  纯逻辑；不引入 node-canvas 巨型依赖。
- **字体度量时序**：`document.fonts.ready` + resize 兜底重测；首帧
  允许 fallback mono，字体就绪后全量重绘（视觉上一次跳变，符合
  FOUT 预期，不搞隐形等待）。
- **wasm 内存增长**：render_state clean + 显式 free 在 onDestroy；
  长会话泄漏由探针页（demo 长跑）观察，V1 不做内存仪表。
- **apps/www 是 npm 而根是 pnpm 混锁**：www 侧继续 npm file: 依赖，
  不动根工作区模型（既有事实，单独 change 再议）。

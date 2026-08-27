# review-r0 — change-doc freeze review (Codex gpt-5.6-terra xhigh)

> 评审对象 f483fea（r0 文档）。结论：4.0/10，不可冻结。12 项阻塞驱动 r1 修订。

## Codex 结论（verbatim）

  评审基线为当前 HEAD=f483fea，仅包含 6 份 change 文档；无实现代码。git diff --check 通过。

  openspec validate ghostty-term --strict 当前通过，但：

  openspec show ghostty-term --json --deltas-only
  → Change must have a What Changes section

  综合评分：4.0/10，不可冻结进入实现。

  ## 阻塞问题

  1. OpenSpec proposal 标题不符合 CLI 约定

     openspec/changes/ghostty-term/proposal.md:27 使用 ## What，当前 CLI 要求 ## What Changes。
     修复：改标题后重新运行 openspec show ghostty-term --json --deltas-only。

  2. Vite 8 wasm 结论有事实错误

     proposal.md:16-20、design.md:13-19 声称裸 import './x.wasm' 会自动作为静态资产处理。Vite v8.0.0 官方实现默认只把 wasm 专门处理为 ?init；?url 是显式 URL 导入，裸 .wasm 不在默认 KNOWN_ASSET_TYPES 中，
     除非配置 assetsInclude 或插件。

     同时，SSR ?init 仅支持 Node-compatible runtime。
     修复：改正文档结论，并加入真实 Vite 8 client/SSR fixture，覆盖裸导入、?url、?init、ssrEmitAssets。

  3. Rollup asset emission 时序不可执行

     design.md:95-100 把 emitFile 放到 generateBundle，同时要求虚拟模块使用 import.meta.ROLLUP_FILE_URL_<ref>。此时模块代码已经解析/渲染，未定义可用的 asset reference 生命周期，build URL 很可能无法生成。

     修复：在 buildStart/load 前完成 emitFile 并保存 ref，或明确实现 renderChunk 重写方案，并用真实 vite build() 检查最终 URL。

  4. “sha256 文件名”承诺没有实现机制

     design.md:95-97 仅写 emitFile({ name: 'ghostty-vt.wasm' })，没有 fileName 或 assetFileNames 方案。Rollup 的 [hash] 不是 pin 中的 SHA-256 前缀。

     修复：显式生成 ghostty-vt-${sha256-prefix}.wasm，或删除 sha256 文件名承诺；测试必须断言真实 dist 文件名。

  5. pin manifest 的双变体结构不可执行

     design.md:40-41、design.md:87-88、specs/build-plugins/spec.md:36-47 同时描述顶层 url/version/sha256/size 和 variants{full,small}，但没有定义每个变体的 URL、大小、摘要、buildInfo 如何取值。

     修复：冻结 JSON schema，例如 variants.full、variants.small 各自包含 url/version/buildInfo/sha256/size，并加入 schema test。

  6. Batch A/C 共享边界冲突，probe 接口未冻结

     subagent-briefs.md:16-24 将整个 packages/vite-plugin/** 包括 pin 交给 A；subagent-briefs.md:40-48 又要求 C 更新 pin，并假定 A 提供不存在于 design.md:80-88 的 jixoai-ghostty-probe bin。

     修复：明确 pin 的唯一写入者；冻结 probe 的 bin 名、输入输出、构建方式和 CI 调用命令，或让 workflow 直接调用预编译入口。

  7. ghostty-vt 与 theme 的 shadcn 安装链未闭合

     specs/registry/spec.md:29-36,37-45,69-77 要求共享 lib 与 jixoai theme 可安装，但 tasks/design 没有冻结 ghostty-term 的具体 registryDependencies 或 files[] 关系。现有 mirror generator 对重复 source
     只记录 sharedClaimOf，不会自动保证 payload 安装正确。

     修复：明确单一 owner，例如 ghostty-term 通过 registryDependencies 引入 @jixoai/ghostty-vt 和 @jixoai/jixoai-theme，并加入真实 shadcn add 断言及 mirror-manifest 更新职责。

  8. registry delta 存在拼写错误

     specs/registry/spec.md:53 写成 jxoai-theme，真实 registry item 是 jixoai-theme。
     修复：改正并加入 registry name 校验。

  9. 路由、SvelteKit 入口和 blueprint 任务缺失

     subagent-briefs.md:64-68 把 ghostty-term.html 写成单文件；仓库实际结构是：

     apps/www/src/routes/docs/components/<name>.html/+page.svelte
     apps/www/src/routes/docs/components/<name>.html/+page.ts

     另外 apps/www/test/blueprints.spec.ts:45-78 要求每个 catalog item 有 scene 和提交的 SVG，但 tasks 未包含 scenes/ghostty-term.svelte、static/blueprints/ghostty-term.svg、svelte.config.js 入口。

     修复：统一 .html href，补全 Batch E 文件集和 blueprint 构建步骤。

  10. terminal 分组迁移影响被低估

     design.md:217-221 只说改 registry.json 四项和 CATALOG_GROUPS 一行。实际还必须修改：
      - apps/www/src/lib/catalog.ts:30-40 的封闭 CatalogGroupId
      - apps/www/src/lib/catalog.ts:61-71 的分组数组
      - apps/www/test/docs-structure.spec.ts:73-78 的固定计数
      - svelte.config.js 的精确路由集合
      - reading chain 的 prev/next/related 结果

     迁移后的预期 UI 计数应明确冻结为：general:8, terminal:4, layout:8, navigation:10, layer:10, data-entry:18, data-display:15, feedback:5。

  11. ghostty-term 未落实 component-authoring 法则

     design.md:154-186 没有冻结 $props/runes、...rest、root class 合并、可访问焦点和 min-block-size: var(--jx-hit)。尤其 canvas 默认不可键盘聚焦，但设计又要求 canvas 接收 keydown。

     修复：明确 root/native element、tabindex/ARIA 语义、rest 属性转发、hit-lane 规则，并加入属性、焦点、44px lane、density 的浏览器断言。

  12. npm 发布要求没有对应 release 任务

     specs/build-plugins/spec.md:7-10 要求发布 @jixoai/vite-plugin，但 .github/workflows/release.yml:17-44 只发布 CLI，tasks 也没有包版本、build、pack、publish 或 trusted publishing 任务。

     修复：补 release workflow/版本策略，或把 spec 限定为当前仓库内部 file dependency。

  ## 非阻塞建议

  - design.md:93-100 的 dev 固定 URL 与 Cache-Control: immutable 冲突；建议 URL 带 sha/version，或 dev 使用短缓存。
  - pin + SHA-256 能保证完整性，但不能证明 GitHub release 发布者真实性。design.md:70-71 放弃 minisig 时应补 threat model 和 residual risk。
  - Ghostty tip wasm 官方说明依赖 simd128；应在运行时做能力检测并给出 data-state="error" 的明确降级。
  - ABI probe 应检查 required exports/imports、ghostty_type_json 结构版本或 schema hash，而不只检查 create/write/render。
  - verify:ghostty-pin 目前只写 HEAD 可达和本地 cache hash；应定义重定向、响应状态、Content-Length 上限、cache 路径、variant key、workflow concurrency 和权限。
  - design.md:133 的 “snapshot encode/decode（V1 只 encode）”自相矛盾，删除未交付的 decode 或明确 API。
  - 绑定层、插件、组件、供给链和分类迁移集中在一个 change，存在明显的 scope creep；建议至少拆出 terminal taxonomy migration。
  - 原始 ANSI/256/truecolor 是终端内容色，不应被误认为 design-tokens 的品牌色；建议在 spec 中明确边界。

  ## 质量评价

  文档优点是产品动机清晰，二进制不进 git、pin 校验、PR 更新、显式 wasm 注入和测试矩阵都有较好的方向；现行 registry delta 的六个场景当前也已补齐，严格 validate 通过。

  但核心 Vite 结论不准确，Rollup 时序不可执行，pin schema 和批次边界未冻结，且新增 registry item 会触发路由、blueprint、catalog、mirror 多处未列出的门禁。实现尚不存在，因此没有任何运行时质量或端到端证据
  可采信。

  必须先修复以上阻塞项，再进入实现；当前不满足评分 >=8 的冻结门槛。


# review-r1 — change-doc re-review (Codex gpt-5.6-terra xhigh)

> 评审对象 75f27e2（r1 文档）。结论：7.0/10（r0→r1 +3.0），仍未冻结。4 旧阻塞残留 + 3 新阻塞驱动 r2 修订。

## Codex 结论（verbatim）

结论：暂不能冻结。当前评分 7.0/10，相对 r0 的 4.0 分提升约 +3.0。

  验证结果：openspec validate ghostty-term --strict 通过；openspec show ghostty-term --json --deltas-only 通过，deltaCount=5；git diff --check 通过。结构性 r0 问题大多已闭合，但仍有以下冻结阻塞。

  仍阻塞项

  1. Vite/wasm 事实仍错误。
     openspec/changes/ghostty-term/proposal.md:15、openspec/changes/ghostty-term/design.md:16、openspec/changes/ghostty-term/design.md:211 都断言当前 ghostty-vt.wasm 导入 env.log。实际下载 tip 的 full
     981125 bytes、small 711247 bytes 后，WebAssembly.Module.imports() 均为 []；导出包含 ghostty_build_info、ghostty_type_json、ghostty_wasm_alloc。Vite 8.2.2 的 wasm glue 是根据真实 import 表生成的，因
     此当前裸 import 不会因 env.log 解析失败。
     修复：删除 env.log 断言；以 pin 中的真实二进制生成 import/exports fixture，当前 import 期望为空，未来漂移由 probe 明确失败。

  2. proposal 公共契约未同步新 schema。
     openspec/changes/ghostty-term/proposal.md:32 仍写虚拟模块字段 version，pin 仍写顶层 url/version/sha256/size；而 openspec/changes/ghostty-term/design.md:66 和 openspec/changes/ghostty-term/specs/
     build-plugins/spec.md:50 已冻结 buildInfo + source/variants。
     修复：统一所有文档为 {url, sha256, variant, buildInfo} 和新的嵌套 pin schema，并增加一致性 grep/schema 检查。

  3. registry 场景中的插件名拼错。
     openspec/changes/ghostty-term/specs/registry/spec.md:78 使用 jxoaiGhostty()，冻结接口实际是 jixoaiGhostty()。
     修复：更正拼写，并让场景 fixture 实际 import 该导出。

  4. 文档 URL 与路由结构冲突。
     openspec/changes/ghostty-term/design.md:291 写 /docs/components/ghostty-term，但 tasks/briefs 已冻结 ghostty-term.html/+page.svelte/+page.ts；现有 apps/www/src/lib/catalog.ts:91 和 catalog 测试要求
     .html 路由。
     修复：统一为 /docs/components/ghostty-term.html，并在 registry meta.href、svelte.config.js、文档中使用同一值。

  新发现阻塞

  5. 供给链重定向与下载上限仍不完整。
     openspec/changes/ghostty-term/design.md:115 只约束初始 URL 为 GitHub，并要求跟随重定向；实际下载会跳到 release-assets.githubusercontent.com。没有最终 host allowlist，也没有对实际响应流强制 4MB 上
     限，Content-Length 缺失时的行为也未定义。
     修复：定义允许的 GitHub asset host；逐跳校验重定向；下载采用流式大小限制，缺失或超限立即失败，不能只依赖 HEAD。

  6. “二进制不进 git”没有仓库级护栏。
     openspec/changes/ghostty-term/tasks.md:42 要求把 wasm 放入 .cache，但当前 .gitignore:1 未忽略该目录，也没有 git ls-files '*.wasm' 门禁。
     修复：固定缓存目录并加入 .gitignore，同时在 verify:ghostty-pin/CI 中断言仓库没有被跟踪的 wasm 文件。

  7. mirror manifest 字段名与真实生成器不一致。
     change 使用 canonicalMainSource（openspec/changes/ghostty-term/design.md:222），但当前 apps/www/mirror-manifest.schema.json:5 和 scripts/gen-mirror-manifest.mjs:84 使用 canonicalMain。
     修复：在实现前裁定唯一字段名，并同步 living spec、schema、generator、change 文档及 mirror test；否则 Batch E 的 shared claim 不能可靠落盘。

  非阻塞建议

  - D4 完整 ABI、双变体 nightly 供给链、Trusted Publishing、三项 terminal 迁移合并在一个 change，范围明显大于最小组件交付；建议保留当前批次但明确后续拆分边界。
  - fontSize? 与 design-tokens 的闭合 density allowlist 关系未定义；应说明它是 token 映射、受限覆盖，还是禁止任意值。
  - ghostty-term.css 任务应显式要求 css-architecture 规定的顶部意图注释与时间戳。
  - ?url 由 Vite asset plugin 处理，vite:wasm-helper 主要处理裸 import/?init；文档可进一步精确措辞。
  - 终端根节点使用 div tabindex=0 aria-label 但不设 role，建议在浏览器可访问性探针中确认实际语义。
  - probe 测试应优先固定当前 pin bytes，避免普通单测隐式依赖网络。

  质量评价

  实现规划质量由 r0 的结构性不足提升到可执行水平：批次文件集、emit 时序、内容寻址、probe、pin schema、安装链、蓝图和分组触及面均已具体化。六份现行 spec 中，hit-lane、runes/rest、CSS layer、token 外壳色边
  界、jx-pure consume-only 等方向基本一致；registry delta 也保留了原有场景，OpenSpec 门禁为绿。

  文档质量仍受跨文件契约漂移影响，尤其是 wasm import 事实、version/buildInfo、插件拼写、路由 URL 和 manifest 字段。这些问题会直接导致实现或消费者按文档操作失败，因此尚未达到冻结标准。

  综合评分：7.0/10

  r0 的 12 项主要缺口大部分已修复，验证门禁也恢复通过；但当前仍存在 4 项未闭合契约问题和 3 项供给链/共享文件新阻塞。修复上述阻塞后，预计可达到 8 分以上进入实现。

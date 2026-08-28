# subagent-briefs — terminal-input-p0

> 统一约束（与前序 change 相同）：
> 1. 严禁 git commit/push（ZCode 提交）。
> 2. 共享资源（registry.json、mirror-manifest、herdr、dev server）不碰；
>    所需变更写进报告由 ZCode 落盘。
> 3. 报告含：文件清单、ABI 实测偏差、自测输出、困难与解决方式。
> 4. 工作目录：/Users/kzf/Dev/GitHub/jixoai-labs/ui-term-input（worktree，
>    分支 feat/terminal-input-p0，只改本 brief 文件集）。
> 5. 法则信源：openspec/specs/** + 本 change design.md（冻结接口唯一出处）。
> 6. wasm 本地副本：/tmp/ghostty-research/ghostty-vt.wasm（sha 与 pin 一致）。

## Batch A — 绑定层（先行）

- 文件集：registry/files/lib/ghostty-vt.ts、
  apps/www/test/ghostty-vt.spec.ts、新 apps/www/test/mouse-probe.spec.ts、
  新 apps/www/test/osc-probe.spec.ts。
- 交付：design D3/D4 冻结面全量；探针先行（OSC 52 载荷、SGR 字节、
  MOUSE_TRACKING 翻转、SIZE 换算），偏差如实报告。
- 关键接口冻结（B 批依赖）：见 design D3/D4 代码块。

## Batch B — 组件（前置：A 完成）

- 文件集：registry/files/ui/ghostty-term/ghostty-term.svelte、
  apps/www/test/ghostty-term.spec.ts。
- 交付：design D1 优先级链/D2 IME/D3 路由/D4 安全模型全量；
  fake vt 扩 A 批新面。

## Batch C — 页面与 demo（前置：B 完成）

- 文件集：apps/www/src/routes/docs/components/ghostty-term.html、
  demo/pty-terminal/src/App.svelte（demo 目录在 .git/info/exclude，
  改后本地构建即可，不进 git）。
- 交付：playground mouse 开关、标题栏接 onTitleChange、demo 复验
  （报告附 vim 点击/OSC 52/IME 实测结果）。

## 冲突面（ZCode 落盘清单）

- 镜像（src/lib/ghostty-vt.ts、src/lib/ui/ghostty-term/**）→ ZCode。
- mirror-manifest、registry.json docs 字段 → ZCode。
- openspec/** → ZCode。

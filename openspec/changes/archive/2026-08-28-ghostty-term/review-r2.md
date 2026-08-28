# review-r2 — change-doc review round (Codex gpt-5.6-terra xhigh)

> 评分 7.5/10。

## 要点

- vite/wasm 事实仍错（env.log 断言——实测 imports=[]）
- proposal 契约未同步新 schema（version 字段残留）
- registry 场景插件名拼错 jxoaiGhostty
- 文档 URL 与 .html 路由结构冲突
- 供给链重定向与下载上限不完整（无最终 host allowlist/流式上限）
- 二进制不进 git 无仓库级护栏（无 gitignore/无 tracked-wasm 断言）
- mirror 字段名 canonicalMainSource ≠ 真实 canonicalMain

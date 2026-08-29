# review-impl-r1 — implementation review round (Codex gpt-5.6-terra xhigh)

> 评分 5.5/10。

## 要点

- clean checkout www/deploy 构建失败（file: 依赖指向 gitignored dist，无前置构建）
- 虚拟模块仍生成 default export（违反 named-only 冻结契约）
- sync workflow 裸 curl 无硬化（host/redirect/流式上限全缺）
- deploy cache 路径与 resolver cwd 不一致 + key 非双变体
- registry density 依赖与冻结四项不一致（裁决：入约）
- verify-shadcn-add 探针未实现（ghostty-term/color-picker 双 fixture 缺）
- tracked-wasm 护栏未进 CI；release 无 d.ts gate
- tag 正则接受 ..（路径穿越，实测验证）；stable tag 正向测试缺
- pre-ready write 数据丢失竞态（真实 bug）

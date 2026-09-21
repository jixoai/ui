# settings-model-parity — tasks

- [x] T1 服务端目录：`model-catalog.ts`（pi-ai 数据解析锚点链 + 投影 +
      icons + 缓存 + typed UNAVAILABLE）；`provider-icons.generated.ts` 拷贝；
      API `GET catalog.json`（fixture 目录单测：投影形状/排序/排除/降级）
- [x] T2 dsh-test 增强：可选 `modelId`（清单核对）+ `apiKey`（直传探活，
      scrub 覆盖直传 key；不落盘不回显）+ 单测（fixture 服务器）
- [x] T3 客户端 lib `settings-panel-lib.ts`：nextRouteSlug/numberedSlugParts/
      routeDisplayLabel/avatarHue/hueAvatarColor/readableModelName/
      formatTokenCount/parseTokenShorthand/catalogModelCandidates（命名空间
      净化 + 当前 provider 置顶）/catalogModelDefaults（efforts clamp：
      内核词汇表 ∩ 目录 tiers − off，缺省 low/high/max）+ node:test 单测
- [x] T4 面板重写：去 dsh 文案；pick 画廊（搜索/卡片/Added ×N/点卡即建）；
      rail 头像 + 展示名；模型折叠卡（补全/预填/简写/逐模型测试/两步删除）。
      修复：token 字段受控 value 缺 oninput 导致 blur 提交读旧值；活动路由
      模型列表草稿感知（改名后 active model 重指，引用完整性门不再拒save）
- [x] T5 探针扩展（p-probe-settings.mjs 42/42）：catalog.json 可达、画廊
      点卡建路由（编号 slug + 预填模型）、id 补全预填、token 简写往返 +
      非法阻断、r4-2 P1-1 efforts 回归（卡片版）、两步删除、可见文案无 dsh
- [x] T6 电池 611/611 全绿（+18 新测试）+ build:studio + vision 风格自检
- [x] T7a Codex 复核 R1：6.8/10 NEEDS-WORK（五个 P1：自定义表单断层/index 键错绑/
      catalog decoder 不严/锚点链偏离/efforts 残留；+Spec-P1 key 聚焦缺失；交互式
      TUI 当日工具通道故障，改 codex exec 无头 + read-only 沙箱承接）
- [x] T7b R2 处置：nonce 键 + saved 双胞胎；asCatalogDoc 严格 decoder（恶形状
      整体拒收降级）；锚点链纯函数三段链（resolveFromCandidates 测试缝）；
      effortsTouched 换 id 重预填/离目录清空；自定义表单复用模型卡 + key 先落 +
      dsh-test ad-hoc 探针（未存路由 baseURL+api）；pending-key hint + 聚焦；
      请求代次门；clamp 单源化；added ✓；svelte-ignore。聚焦 23/23、探针 53/53、
      电池 615/616（唯一失败为 collab-host fs.watch 负载抖动，隔离复跑 20/20 绿）
- [x] T7c Codex 复核闭环：R1 6.8 → R2 7.7 → R3 条件性 8.6（达 ≥8.5 线）。
      R3 两会话命令通道先后劣化（当日环境故障，复核者自证 pwd 无回显后拒绝
      伪证），其未核验清单与本地已锁证据一一对应：formKey 随探针（鉴权网关
      57/57 探针实证）、保存后 dirty 退役（探针）、decoder dup/控制字符+链
      去重（单测 24/24）、slug 复用再聚焦（探针）、dsh 文案（R2 独立扫过 +
      探针）。R1/R2 均为全通道独立源码核验。按 Owner「别过度迭代」指令收口。
- [x] T7d R3 增量：卡 formKey 阶梯（formKey > 存 key > test-only）；save()
      重建 modelsSaved；decoder 拒 dup/控制字符；候选链保序去重；
      keyFocusDone 事件化复位；supportsReasoningEffort=false 提示；种子卡
      name '' 未触语义。电池 617/617、探针 57/57、聚焦 24/24、build 零警告
- [ ] T8 提交推送 + 5199 重启 + 汇报（进行中）

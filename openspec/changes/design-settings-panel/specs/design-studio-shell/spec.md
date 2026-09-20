# design-settings-panel — spec delta (design-studio-shell)

## ADDED Requirements

### Requirement: Settings Entry and Model Routes Panel

studio 导航底部 MUST 有常驻 settings 入口，打开 list-detail 弹窗：
左列 model 路由（缺 key 的 amber 点、活动路由 badge）+ 新建；右侧
编辑单条路由（credential / endpoint / models / active model）。

#### Scenario: 入口与空态

- **WHEN** studio 打开且无任何路由
- **THEN** nav 底部 settings 行可见；弹窗显示「add your first model
  route」引导 + custom endpoint 表单入口

#### Scenario: 建路由 → 存 key → 选活动模型 → 保存

- **WHEN** 用户创建路由（provider/baseURL/api/首个模型 id）、粘贴
  key、选定 provider+model（+effort）、点 save
- **THEN** rail 行出现（amber 点随 key 消失）、「· key stored」回显、
  save 后 revision+1，重开弹窗状态完整恢复

### Requirement: Two-Face DSH Settings Persistence

设置 MUST 以两副面孔持久化：私有面 `~/.jixoai-design/steward-store/`
（富字段 JSON + 0600 凭据，key 永不跨 API）；DSH 面
`~/.jixoai-design/dsh-home/`（settings.yaml 的 `llm-pi-ai` providers
白名单段 + `agent-default-model` 保存选择段 + `.credentials.yaml`
version-1 `refs:` 布局），桥接写 MUST 保留未知顶层段。

#### Scenario: 桥接 YAML 形状

- **WHEN** 保存含活动模型（带 effort）的配置
- **THEN** settings.yaml 同时含 providers 白名单（仅 id+contextWindow
  等内核字段，name/efforts/maxOutputTokens 不得跨桥）与
  agent-default-model {provider, model, reasoningEffort} 段

#### Scenario: 凭据非披露

- **WHEN** 任何 settings API 响应
- **THEN** 响应含 keyPresence 布尔映射、不含任何 key 本体

### Requirement: Bridged dsh Spawn

dsh 适配器 MUST 逐轮解析活动桥接路由（模型+路由+key 齐备）：齐备时
spawn 挂 DSH_HOME 指向桥接 home 且不带 patch（内核原生热加载消费）；
任一缺口回退既有 env+patch 航道。

#### Scenario: 面板配置即生效

- **WHEN** 面板保存活动路由后发起下一轮对话
- **THEN** 该轮 spawn 以桥接 home 运行；面板清空活动模型后下一轮回退
  env+patch（无需服务器重启）

# settings-model-parity — Model 配置对齐 skill-creator-v2 打磨版

## Why

Owner 走查反馈（2026-09-21，风格修复 `4f6cd51a` 之后）：

1. 「不要去强调 "dsh"，比如有些地方你显示了 "dsh model routes"，这没必要。」
   —— 内核名是内部事实，不得出现在用户可见文案。
2. 「对于 model 配置的支持，和我在 skill-creator-v2 我打磨的那套，差距还是
   非常大的。」—— design-settings-panel 首轮移植只搬了「路由 + 表单」骨架，
   没有搬 skill-creator-v2 数轮打磨出的能力面。

skill-creator-v2 打磨版的能力清单（`webui/src/lib/components/settings/`
+ `src/daemon/model-catalog.ts`，本次逐项对照）：

- **provider 目录画廊**（models.dev 镜像 = pi-ai `dist/providers/data`）：
  搜索 + 卡片网格（icon/letter 头像 + label + baseURL + 模型数 + Added ×N），
  点卡片**立即建路由**（编号 slug + 目录 baseURL/api + top-4 图像优先模型
  富预填：name/contextWindow/maxOutputTokens/efforts）
- **编号 slug**：同名 provider 可加多份（zai → zai-2 → zai-3，凭据各自独立），
  展示名 `Z.ai (1)`、`(2)` 回投影
- **路由头像**：16px 图标三级回退（route.icon → 目录图标 → 确定性色相字母
  头像）+ key 缺失 amber 点
- **模型折叠卡**：默认收起（名称 + test/edit/remove 图标钮 + dirty 点）；
  展开全字段；**model id 补全**（当前 provider 置顶 + 跨 provider 剔命名空间
  id）；**目录命中预填**（换 id 时未手触字段重新接管）；**token 简写**
  （`253k`/`0.5M` 失焦解析回显规范化）；**逐模型连接测试**（无已存 key 时
  test-only key 直传不落盘）
- **删除确认**（ConfirmDialog）；**新建后粘 key 引导**（聚焦凭据输入）

## What Changes

1. **服务端目录**（新 `src/server/settings/model-catalog.ts`）：
   pi-ai 数据投影（解析锚点：`JIXOAI_DESIGN_CATALOG_DIR` env → `$DSH_HOME/
   profiles/node_modules` → `~/.dsh/profiles/node_modules`；解析失败 typed
   UNAVAILABLE——画廊降级，自定义表单不受影响）。图标内联 dataURL
   （`provider-icons.generated.ts`，与 skill-creator-v2 同源拷贝）随目录
   payload 下发。进程内缓存。
2. **API**（`dsh-settings-api.ts`）：新增 `GET catalog.json`；`dsh-test`
   增强——可选 `modelId`（在 /v1/models 清单中核对，无生成成本）与
   `apiKey`（test-only 直传探活，用后即弃、不落盘不回显；scrub 律覆盖
   直传 key）。
3. **面板重写**（`settings-panel.svelte` + 新 lib `settings-panel-lib.ts`）：
   - 文案去 dsh（副题、onboarding）
   - new-route 两态：**pick 画廊**（搜索 + 卡片网格 + Added ×N + 点卡即建）
     与 **form**（自定义端点，补全 datalist）
   - rail 行加头像 + 展示名（编号 slug 回投影）+ amber 点（已有）
   - **模型折叠卡**：dirty 点/补全/预填/token 简写/逐模型测试（test-only
     key 输入）；efforts 仍受内核词汇表约束（THINKING_LEVELS）
   - **两步删除确认**（footer remove → arm → confirm；studio 语言，不引
     新弹窗）
   - 保留本轮已定的事实：active model 块（studio 无 composer 选择器）、
     key 只写不回显（本仓 non-disclosure 法，与 skill-creator 客观回显
     刻意分叉）、effort 固定词汇表（内核拒收档外语汇）

### 刻意不做（记录裁决）

- key 客观回显：本仓安全法（key 永不过 API，keyPresence 布尔回显）经
  Codex 六轮复核定型——不随 skill-creator 的 R16 回退。
- inputTypes/outputTypes chips：内核模型面不消费这些字段（桥接白名单
  不含），引入即死数据。
- active-outside-routes 警示：本仓服务端引用完整性门（model 必须引用
  modelRoutes 内条目）使该状态不可达。
- 「Your presets」本地预设存档：后续轮次再议。

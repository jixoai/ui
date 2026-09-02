# r9 Tasks

## 1. 搜索（S1–S5）
- [x] 1.1 S1 dev 语料中间件（ZCode）
- [x] 1.2 S4 search 图标入 manifest + gen:icons + 镜像（ZCode）
- [x] 1.3 S2/S3/S5 搜索 UI 簇（子代理 A：dialog 重写、header 入口、文案英化；19/19 specs）
## 2. 打印（P1–P3）
- [x] 2.1 P1 sim-bar label+description 重排（子代理 B：81/81 + verify:print 32/32）
- [x] 2.2 P2 表列行号（ZCode：kernel CSS + gate 校准 + 81/81 specs + Playwright 几何探针）
- [x] 2.3 P3 高亮后端可拔插（子代理 C：18/18 新门禁 + context 内核投影锁定）
## 3. 整合（ZCode）
- [ ] 3.1 镜像同步（search-palette/code-card/docs-nav 双侧）+ manifest 再生
- [x] 3.2 依赖落盘；全管线 build 绿（99 页语料 749KB）+ verify:print 32/32（table-row 实证）+ r9 specs 160/160
- [ ] 3.3 子代理对抗预审 → codex 送审（r9）→ 消化 → Owner 终报

## 4. r10 验收修正（Owner 复验）
- [x] 4.1 面板留白/排版去拥挤 + Pending/NoResult 双态（specs 14/14）
- [x] 4.2 触发钮迁 `[Search][Navs][Hue]` 位
- [x] 4.3 打印崩溃修复：gutter 回退悬挂缩进（pagedjs indexOfTextNode 崩溃源=匿名单元格；32/32 + 121/121 全量）

## 5. r11 动画升级（Owner）
- [x] 5.1 palette 骑表面内核（jx-surface 三层 + jx-waapi 门 + backdrop 同时间线；Chromium 活体实证）
- [x] 5.2 列表错落入场（160ms rise + 18ms stagger，首 8 项封顶）+ 状态块快升切换
- [x] 5.3 动画库选型结论：本轮零依赖；Motion 作为条件触发的未来采用（见 proposal r11 段）

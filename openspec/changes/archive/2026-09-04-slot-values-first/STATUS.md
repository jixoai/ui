# STATUS — slot-values-first 终报

日期：2026-09-04 · 分支：feat/context-defaults-economy · 终态：**完成，已归档**

## 交付

values-first 函数式槽工厂（Owner 定调，Vue 式学习）：`defineLiteralSlot(values,
default)` / `definePaintSlot(values, own)`——值域即类型源，default ∈ values
编译期锁死；`defineOpenSlot<T>(own)` 覆盖三个开放标量域（sheet 自由 CSS
长度 / chart size / nav inset）；旧工厂删除无别名。37 家族 47 槽迁移为具名
槽常量（"能力集中在单个 slot 上"），union 经 ReturnType 反查，同文件夹
union 声明与 satisfies 载体退役；toast 两槽保持 lib 单源（values 常量 +
typeof 反查）；press-button 别名唯一化。门禁 A2 具名常量解析 / A4 第一参
提取 / metadata 发射链同步（verify:meta 为验收门）。

## 复核轨迹（codex，gpt-5.6-terra/xhigh）

- change 文档轮：七轮 5.0→4.0→6.5→7.0→7.5→…→**9.0 READY**。评审抓出：
  r3 修复脚本中途崩溃未落盘（codex diff 实证）、toast own 行为回归（'tonal'
  vs 现值 'outline'）、探针引用不实（旧 string-only 探针 vs 三态探针）、
  B1 域覆盖（5 个非字符串槽）、B2 metadata 发射链。
- 实现轮：7.5（same-source 裁剪引用未标明 + registry 描述/payload 漏更 +
  deps dead 边——单键法删 ButtonGroupApi.variant 时产生、验收照抄旧 GREEN
  未实测）→ 修复后 **9.5 READY TO ARCHIVE**（新增 guide-same-source 漂移
  测试钉死 values 行逐字）。

## 验收（tasks.md 验收记录节）

四门禁（context/mirror/deps/meta）GREEN；目标套件 156/156 + 漂移门 21/21；
typecheck 零错；全量 1776/1778（唯二 = main 侧进行中 card-grid foot-mode，
三次定责）；rg 零残留；guide/blueprint/payload/living specs 全同步。

## 非阻塞遗留

- def-from-slot 派生与 slot-targeting 插件（Owner 方向记录，待首消费者）。
- meta 例外三家族组件 Props 侧 inline union 保留（spec 例外从句在案）。
- 环境债与 37 手写页 ambient 标注（承前 change 记录，建议并入 docs+环境
  清理小 change）。

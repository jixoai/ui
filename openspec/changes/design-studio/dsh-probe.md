# dsh 探测证据（T8 素材，2026-09-11）

## 安装通道

- 官方 registry.npmjs.org：metadata 端点可达（npm view 正常），tarball
  CDN 几乎不可达——`npm pack` 直接 network error，完整 install 挂起
  15min+ 未完成（4 个 npm 进程常驻）。
- npmmirror.com（`--registry=https://registry.npmmirror.com`）：
  **14 秒装完 519 包**（241 个 @deepseek-ai/* 包）。
- 结论：dsh 分发的现实约束是国内网络必须走镜像。`jixoai-ui design
  --agent dsh` 的错误信息里应该给镜像安装提示。

## 架构事实（读包源码 + README 确认）

- dsh = profile 启动器：`dsh --profile <name>` 启动
  `$DSH_HOME/profiles/<name>` 下的 profile；profile = `dsh.profile`
  （bundles 顺序表）+ `cordis.patch.yml`（用户 patch 层）。
- bundles 先从 dsh 安装目录解析（dsh-base/dsh-web-app/dsh-headless/
  dsh-sdk-app/dsh-sdk-minimal/dsh-acp-app），再从 profile 自身
  node_modules（树外插件经 `dsh plugin --profile <name> <pnpm args>`
  安装）。
- `dsh web` = `--profile web` 别名；`dsh --profile <new>
  --from-default-profile web` 从模板派生自定义 profile。
- dsh-web-app 的本体是一份 484 行 cordis.patch.yml（dsh-base 之上的
  浏览器 roster + 传输层 + host 行）；浏览器端从
  `window.__DSH_BOOT__` 启动。
- `--dump-config` / `--dump-default-config` 可无启动检视组合树。

## 冒烟结果（/tmp/dsh-mirror，真实执行）

1. `dsh --help` ✅（boot a DeepSeek Harness profile…）
2. `dsh --profile headless "reply with exactly: pong"` ✅ →
   输出 `pong`（模型 key 已在宿主环境配好；仅有一条 SOCKS 代理
   环境警告，不影响）。

## DshAgent v0 裁决

- **主路径**：headless 逐回合适配——每条 chat 消息 = 一次
  `dsh --profile headless <message>`，cwd = design workspace；
  返回单 text 事件 + done（无流式粒度，v0 接受）。设计上下文
  （knowledge pack 要点）拼进消息前缀。
- **升级路径**：`dsh --profile sdk`（换行分隔 JSON-RPC over stdio，
  初始化请求带 provider/model/cwd）——真会话、真流式，是正式
  DshAgent 的形态；v0 只做接口占位与文档。
- **webui 替换（stretch goal）可行性笔记**：dsh 原生姿势 =
  `dsh --profile jixoai-design --from-default-profile web` 派生
  profile → 编辑 `dsh.profile` 的 bundles 去掉 dsh-web-app →
  `dsh plugin` 安装我们的 webui bundle 包（提供自己的
  cordis.patch.yml：webserver + frontend-static 行 + 浏览器 roster
  指向我们的 studio）。484 行 patch 的替换面 = 前端 roster 与
  frontend 静态资源行，api 控制器行可原样保留。本轮不实施。

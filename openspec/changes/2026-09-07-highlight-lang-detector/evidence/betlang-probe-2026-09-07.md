# betlang wasm 探测实证 — 2026-09-07

Owner 门禁：wasm ≤ 100 KiB 可用；否则退 linguist heuristics 或转非默认
detector。本档案记录构建序列、尺寸矩阵、功能实测与通道结论（全文
KiB=1024B 口径，不使用 KB）。

## 源

- repo: https://github.com/DioxusLabs/betlang（MIT），clone @ HEAD
  (shallow, 2026-09-07)——**探针快照可复现口径（r3-N3）**：不可变
  来源为 crates.io `betlang-0.1.1` tarball（最终发行物 CI 以
  `cargo build --locked --offline` 从钉死版本构建，crate checksum +
  git commit 一并记入 ARTIFACT.md；探针的 git HEAD 仅溯源用）；
  工具链：rustup stable-aarch64-apple-darwin / rustc 1.98.0
  (88d9e12a 2026-08-18) / Homebrew rust 不带 wasm32 std（构建必须
  rustup 工具链）
- 依赖：`fearless_simd ^0.4`——**tarball 自锁 0.4.0**（本节最初按 git
  快照实测写 0.4.1，系快照新鲜锁差异；正式口径以 tarball 自锁为准，
  git 值降级为 comparison-only）
- 模型：内嵌 `assets/magika/source-student-q4.bin` **47,840 字节（46.72 KiB）**
  （sha256 8493d2d3757572c8661141e414b1c0755aa08d4c4e5382dfbbc6b73b02d89083（README 声明，最终发行物门禁实测复核）），架构
  wordseq-b1024-k3-m2048-tiny-3conv-hidden
- 输出：48 标签（asm…yaml），held-out `test_fs_accuracy=0.942`
  macro_recall=0.940；概率经校准（歧义输入报分裂分）
- 依赖：`fearless_simd ^0.4`（SIMD 抽象，wasm32 走 simd128/fallback
  双路径）——纯库，无 wasm-bindgen；正式口径 = tarball 自锁 0.4.0
  （git 快照曾测 0.4.1，属 comparison-only，见尺寸矩阵节）

## 构建序列（r11-B1：脚本本体逐字内嵌——无注释式伪代码、无占位符；下方实录由该脚本在全新 mktemp 目录原样产生）

```bash
#!/usr/bin/env bash
# betlang wasm 探针复现（r10-B1：全可执行，任一校验失败即非零退出）
set -euo pipefail
W0="$(mktemp -d /tmp/betlang-repro.XXXXXX)"; cd "$W0"
# 1. 不可变来源：crates.io sparse index + tarball，双重校验
curl -fsSL https://index.crates.io/be/tl/betlang -o index.jsonl
IDX=$(node -e '
  const fs = require("fs");
  const rows = fs.readFileSync("index.jsonl", "utf8").trim().split("\n").map(JSON.parse);
  const r = rows.find(x => x.vers === "0.1.1");
  if (!r) { console.error("vers 0.1.1 not in index"); process.exit(1); }
  if (r.yanked) { console.error("yanked"); process.exit(1); }
  console.log(r.cksum);')
echo "index cksum: $IDX"
curl -fsSL "https://static.crates.io/crates/betlang/betlang-0.1.1.crate" -o betlang.crate
GOT=$(shasum -a 256 betlang.crate | cut -d' ' -f1)
echo "tarball cksum: $GOT"
test "$GOT" = "$IDX" && echo "CKSUM-OK" || { echo "CKSUM-MISMATCH"; exit 1; }
# 2. 解包 + 自锁版本断言
tar -xzf betlang.crate && mv betlang-0.1.1 betlang-probe
LOCKED=$(rg -A1 'name = "fearless_simd"' betlang-probe/Cargo.lock | rg -o '[0-9]+\.[0-9]+\.[0-9]+')
test "$LOCKED" = "0.4.0" && echo "betlang 自锁 fearless_simd: 0.4.0 OK" || { echo "unexpected lock $LOCKED"; exit 1; }
# 3. wrapper（依赖显式钉 0.4.0——fresh lock 会漂 0.4.1）
cargo new --lib wasm-probe >/dev/null 2>&1 && cd wasm-probe
cat > Cargo.toml <<'TOML'
[package]
name = "betlang-wasm-probe"
version = "0.0.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
betlang = { path = "../betlang-probe" }
fearless_simd = "=0.4.0"

[profile.release]
opt-level = "z"
lto = true
panic = "abort"
strip = true
codegen-units = 1
TOML
cat > src/lib.rs <<'RS'
#[no_mangle]
pub extern "C" fn probe_detect(code: *const u8, len: usize) -> i32 {
    let bytes = unsafe { std::slice::from_raw_parts(code, len) };
    let detection = betlang::detect(bytes);
    match detection.language() { Some(l) => l as i32, None => -1 }
}
RS
~/.cargo/bin/cargo generate-lockfile >/dev/null 2>&1
WL=$(rg -A1 'name = "fearless_simd"' Cargo.lock | rg -o '[0-9]+\.[0-9]+\.[0-9]+')
test "$WL" = "0.4.0" && echo "wrapper lock fearless_simd: 0.4.0 OK" || { echo "lock drift: $WL"; exit 1; }
# 4. 构建（Homebrew rust 无 wasm std → 显式 rustup rustc）
RUSTC_BIN="$HOME/.rustup/toolchains/stable-aarch64-apple-darwin/bin/rustc"
RUSTC="$RUSTC_BIN" \
  ~/.cargo/bin/cargo build --release --target wasm32-unknown-unknown --locked
W=target/wasm32-unknown-unknown/release/betlang_wasm_probe.wasm
RAW=$(stat -f%z "$W"); SHA=$(shasum -a 256 "$W" | cut -d' ' -f1)
GZ=$(node -e 'const z=require("zlib"),fs=require("fs");const b=fs.readFileSync(process.argv[1]);console.log(z.gzipSync(b,{level:9}).length)' "$W")
echo "rawBytes: $RAW"; echo "gzipBytes: $GZ"; echo "sha256: $SHA"
# 5. 预算断言（KiB 字节精确；硬预算先判——exit 1，预警线后判——exit 2）
test "$RAW" -le 102400 || { echo "raw over hard budget"; exit 1; }
test "$GZ"  -le 71680  || { echo "gzip over hard budget"; exit 1; }
test "$RAW" -le 100352 || { echo "raw over warn line"; exit 2; }
echo "BUDGET-OK"
echo "rustc: $("$RUSTC_BIN" -Vv | head -1)"
echo "cargo: $(~/.cargo/bin/cargo -V)"
```

**r11 重放实录（fresh mktemp，EXIT=0，逐行对应上方脚本）**：

```
index cksum: 5f89b0929539eaee70109704ae4e345df438be6ab02e4dc8ac060e05098ad1b7
tarball cksum: 5f89b0929539eaee70109704ae4e345df438be6ab02e4dc8ac060e05098ad1b7
CKSUM-OK
betlang 自锁 fearless_simd: 0.4.0 OK
wrapper lock fearless_simd: 0.4.0 OK
   Compiling fearless_simd v0.4.0
   Compiling betlang v0.1.1 (/private/tmp/betlang-repro.ruy5gF/betlang-probe)
   Compiling betlang-wasm-probe v0.0.0 (/private/tmp/betlang-repro.ruy5gF/wasm-probe)
    Finished `release` profile [optimized] target(s) in 2.45s
rawBytes: 100139
gzipBytes: 58486
sha256: 721cd6fac52636b101f4ac879c23b83361ddf43cbfa86dd5df71ccfc55845d37
BUDGET-OK
rustc: rustc 1.98.0 (88d9e12ae 2026-08-18)
cargo: cargo 1.98.0 (797e8a9bc 2026-08-05)
EXIT=0
```

## 口径律（r1-B7）

所有预算与实测以 KiB=1024 字节精确计量（全文仅此一口径）；gzip 以
Node zlib.gzipSync level 9 为冻结算法。最终发行物（packages/
betlang-wasm 真实装载器导出 + 全 entry）在任务 4.1 **重新测量并以
as-shipped ARTIFACT 值为准**（探针观测带不沿用作发行基准），复测
记录落 packages/betlang-wasm/ARTIFACT.md。

## 尺寸矩阵（comparison-only：git 快照源 + fearless_simd 0.4.1——
## 历史对照，不入门禁；正式观测带见上节）

| 绑定 | raw | gzip |
|---|---|---|
| 朴素探针（`format!("{l:?}")` 拖入 fmt 机器，默认 release） | 117,260 B = **114.5 KiB** | 64,332 B（62.8 KiB） |
| lean 探针（枚举序号返回 + opt-level=z + lto + panic=abort + strip） | 100,055 B（97.65 KiB） | 58,461 B（57.09 KiB） |

（本段为 git 快照源 + 0.4.1 的历史实测，comparison-only；正式口径
见"观测带"节）该次 sha256
`56d0243d271097e5517a936a508393e1f5fe11e34961f0e73f3b12f8b3182360`；
magic bytes `\0asm` 验证通过；gzip 为 Node zlib.gzipSync level 9。
门禁输入 = .wasm 字节本身（装载器 JS 与 tarball 不入预算，tarball
sha 仅完整性记录）。

其中 47,840 B（46.72 KiB）为内嵌模型（不可压缩权重，gzip 后仍占
大头）。真实绑定增加 wasm-bindgen 或手写装载器胶水：手写 ~40 行 JS
（线性内存 UTF-8 进出）不增 wasm 字节；wasm-bindgen 会使 raw 增约
3-8 KiB（可能越 100 KiB 帽）→ **design D4 裁决手写装载器**。

**双口径判定：raw 观测带 ≤ 98 KiB 预警线 ✓、gzip ≤ 70 KiB ✓ —— betlang 进
DLD L4 作默认统计层。**

## 功能实测（native host，8/8）

| 样本 | 检出 | 期望 |
|---|---|---|
| `fn main() { println!("hi"); }` | Rust | rust ✓ |
| `def add(a, b):\n    return a + b` | Python | python ✓ |
| `const x: number = 1;` | TypeScript | typescript ✓ |
| `{"name": "jixoai", "v": [1, 2]}` | Json | json ✓ |
| `package main…func main()` | Go | go ✓ |
| `#!/usr/bin/env python3\nimport sys` | Python | python ✓ |
| `SELECT * FROM users WHERE id = 1;` | Sql | sql ✓ |
| `<div class="x">hello</div>` | Html | html ✓ |

（短样本即中——README 混淆矩阵另示歧义输入报分裂分，DLD 取 top1 +
confidence 直传。）

## 通道结论

- npm `betlang@0.0.0`：**占位空包**（ISC，无依赖，1 版本），非官方
  wasm 发行；`betlang-wasm` 等名 404
- 上游 repo 无 wasm 构建脚本（playground 在 dioxus-code 仓库另行包装）
- → **无官方 wasm 通道**。裁决见 design D4：**冻结 A**——自建
  `@jixoai/betlang-wasm` npm 包（lockfile 供应链）。B（release 资产 +
  pin，ghostty 法则）**仅存本档历史评估记录，不构成本 change 的实现
  路径**。二进制不入 git 在冻结通道下成立。

## linguist 数据盘点（L1/L2 数据源 + B 方案储备）

- `lib/linguist/languages.yml`：165,390 B，**2,069 语言条目**
  （extensions / interpreters / aliases 字段为 L1/L2 表源）
- `lib/linguist/heuristics.yml`：40,624 B，**138 组扩展名歧义消解块**
  （Ruby 兼容正则 + named_patterns 复用；`.h`→C/C++/ObjC 类）——
  L1 排除表的来源；完整 JS 移植为 Non-Goal（design D6）

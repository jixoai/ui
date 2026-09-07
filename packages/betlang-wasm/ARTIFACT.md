# ARTIFACT — @jixoai/betlang-wasm 0.1.1 (as-shipped)

As-shipped record of the wasm this package distributes (design D4):
the canonical hash is the value recorded HERE by whoever builds the
release (CI release build owns the shipped values; local rebuilds vary
— the build embeds its directory path, evidence r9). `scripts/
verify-betlang-pin.mjs` checks every field below against the actual
dist bytes and Cargo.lock. Budget law (KiB = 1024 B, gzip = Node zlib
level 9): raw ≤ 102400, gzip ≤ 71680, warn line raw ≤ 100352.

Supply chain: crates.io `betlang 0.1.1` (tarball sha256 =
crate checksum, verified against the sparse index before every build)
with `fearless_simd 0.4.0` pinned to betlang's own
lock (fresh locks drift to 0.4.1 — never unpin). Binaries never enter
git; npm is the only distribution channel.

```
wasmPath: dist/betlang_wasm.wasm
wasmRawBytes: 100299
wasmGzipBytes: 58549
wasmSha256: 4767e4197020009c41fdf72ca15a86970667a8b947e8b00e6ffe39ed2ee2f764
tarballSha256: 5f89b0929539eaee70109704ae4e345df438be6ab02e4dc8ac060e05098ad1b7
crateChecksum: 5f89b0929539eaee70109704ae4e345df438be6ab02e4dc8ac060e05098ad1b7
fearlessSimdVers: 0.4.0
fearlessSimdCksum: 76258897e51fd156ee03b6246ea53f3e0eb395d0b327e9961c4fc4c8b2fa151a
rustcVersion: rustc 1.98.0 (88d9e12ae 2026-08-18) | binary: rustc | commit-hash: 88d9e12ae178fab0fb5cc050a94da85685d449ea | commit-date: 2026-08-18 | host: aarch64-apple-darwin | release: 1.98.0 | LLVM version: 22.1.8
cargoVersion: cargo 1.98.0 (797e8a9bc 2026-08-05)
```

# Changelog

## v0.15.1 — UE5.1 / UE5.5 compatibility distribution

### Added

- `SmithUEClient.getReady()` 支持插件 `/ready` 返回的可选 `engine_version` 字段。
- 端口文件与发现结果类型增加可选 `engine_version`，`smithue-cli status` 优先使用 `/ready` 返回值，并在缺失时回退到端口文件。
- 单元测试分别覆盖 UE5.1 与 UE5.5 版本字符串，确认 JSON 透传和 `status` 输出形态。
- `/ready` 的 HTTP 503 + `{ready:false}` 现在被视为合法启动状态，`status --wait` 会继续轮询；其他非 2xx 响应仍报错。
- 兼容分支改为提交干净构建后的 `dist/`，避免 npm 安装 Git 依赖时因临时克隆缺少 TypeScript 开发工具而在 `prepare` 阶段失败。
- GitHub 兼容分支取消自动 `postinstall` 生命周期钩子，改用显式 `smithue-cli skill --install`；避免 npm 11 在 Git 依赖完成文件展开前执行钩子导致安装失败。

### Compatibility

- CLI 仍按 HTTP 协议而不是 UE 版本耦合；同一 CLI 分支可连接 SmithUE 的 UE5.1、UE5.5 兼容分支。
- `engine_version` 为可选字段，未提供该字段的旧版 SmithUE 插件继续正常工作，不会伪造或猜测引擎版本。
- 插件版本号与 CLI npm 版本号继续独立，不进行数值对齐或错误的“版本不一致”判断。

### Verification

- `npm run typecheck`：通过。
- `npm run build`：通过。
- `npm test -- --run`：25 个测试文件、193 项测试全部通过。
- `npm pack` 的干净产物不包含编译后的测试文件；安装到临时 prefix 后 `smithue-cli --version` 返回 `0.15.1`。
- 直接从 `github:s2272756972-prog/smithue-cli#ue5.1-ue5.5-compat` 安装到临时 prefix 的分发链路已验证；安装不依赖目标机执行 TypeScript 编译。
- 分别连接真实 UE5.1 `-NullRHI` 与 UE5.5 编辑器完成 `status --wait` / `ping` 只读验证，两个实例均返回 `ready:true`、真实 `engine_version` 与 `pong`。

### Distribution status

- `package.json` 版本为 `0.15.1`，通过 `github:s2272756972-prog/smithue-cli#ue5.1-ue5.5-compat` 分发。
- 尚未发布到 npm；裸 `npx smithue-cli` 仍会解析到上游 npm 包，文档和升级命令不再使用该入口。
- 全局安装后如需部署 AI skill，显式执行 `smithue-cli skill --install`；兼容分支不依赖 npm 安装脚本。

## v0.15.0 — Skill bundle: rename reference/ → references/ + new domain docs

### Changed
- **Skill 目录规范化**：`skill/reference/` → `skill/references/`（对齐 Agent Skills 生态惯例）；SKILL.md 及全部文档内路径同步更新。
- `skill --install` 与 `postinstall.cjs` 在安装后自动**清理旧 `reference/` 残留**（cp 为 merge 拷贝，升级用户目标目录中的旧目录不会被覆盖删除）；`--install` 输出新增 `migrated` 字段。

### Added
- `references/parent-class-redirect.md` — 蓝图父类丢失/空壳修复：位置移动 vs 改名判定决策树、CoreRedirects 语法、固化退役流程、致命时序陷阱（经 UE 5.8.1 实验验证）。
- `references/asset-slimming.md` — 资产减负：贴图/材质/Mesh/骨骼（含骨骼缺失修复）/文件整理/资产版本警告六域的检测→决策→命令映射、次序铁律、SmithUE 能力缺口需求清单。
- SKILL.md 路由表新增上述两个入口行。

## v0.13.2 — Auto-install the smithue-control skill on global install

### Added
- **`postinstall` hook** (`scripts/postinstall.cjs`) auto-deploys the `smithue-control` skill on a **global** install (`npm i -g smithue-cli`) — no extra `smithue-cli skill --install` step needed.
  - Targets `~/.agents/skills/smithue-control/` (always) plus `~/.claude/skills/` and `~/.codex/skills/` when those agent homes already exist; idempotent (overwrites to refresh on update).
  - Self-contained CommonJS, shipped as-is; runs ONLY on global installs (`npm_config_global=true`) so local dev `npm install` never touches your home dir.
  - Fully defensive — never throws / never fails the install. Opt out with `SMITHUE_SKILL_NO_AUTOINSTALL=1`.
- `smithue-cli skill --install <dir>` remains for manual / custom-location installs.

## v0.13.1 — Fix: bundle skill/SKILL.md in the published package

### Fixed
- **`smithue-control` skill was not shipped in the npm package.** `package.json` `files` whitelist omitted `skill/`, so `skill/SKILL.md` was excluded from the published tarball. `smithue-cli skill --install <dir>` therefore failed with `SKILL.md not found at … Reinstall smithue-cli to fix` on any clean install. Added `skill/` to `files`; verified `skill/SKILL.md` (12.8 kB) is now present in the packed artifact.

## v0.13.0 — Exec param input modes

### Added
- `exec --stdin`: read params as JSON from stdin (pipe-safe; works identically on PowerShell 5.1, 7+, cmd, bash).
- `exec --params-file <path>`: read params from a file.
- `exec <cmd> -`: shorthand for `--stdin` (Unix convention).
- UTF-8 BOM stripping for stdin and file inputs (common in Windows redirections).

### Changed (breaking for edge cases)
- Params are now validated to be a JSON **object** across all three input modes; arrays, scalars, and `null` are rejected with exit code 1. Previously, non-object positional params flowed through unchecked.
- Invalid-JSON input from the positional path now exits with code **1** (Bad input) instead of code 4.

### Notes
- The three input modes are mutually exclusive; supplying more than one at a time exits 1.
- An explicit source with empty content exits 1.
- Zero sources still defaults to `{}` as before.

## v0.9.1 — Packaging polish

### Fixed
- `bin` path normalized to `dist/cli.js` (removed `./` prefix) to eliminate npm publish warning.
- CLI program name set to `smithue-cli` so `--help` shows the correct usage line.

## v0.9.0 — Portfile Robustness

### Fixed
- **Portfile not deleted on timeout**: `checkLiveness` now returns without unlinking when the probe times out (AbortError). Only deletes when process is confirmed dead AND endpoint unreachable simultaneously.
- **Error message taxonomy**: `AbortError` (including when message contains "fetch failed") is now correctly classified as "timed out" — checked before connection-error patterns.

### Added
- `SMITHUE_PROBE_TIMEOUT` env var controls liveness probe timeout (default: 10000ms, was hardcoded 3000ms)
- `src/proc.ts`: `isProcessAlive(pid)` utility using `process.kill(pid, 0)` for pid liveness check
- Backward compatible with old plugins (no plugin_version, no heartbeat endpoint)

---

## v0.8.0

Initial public release with core CLI commands: `exec`, `list`, `search`, `status`, `batch`, `upgrade`, `prune`, `purge`.

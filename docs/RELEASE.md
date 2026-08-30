# smithue-cli 兼容分支分发 Spec（GitHub 安装）

> 给维护者 / AI 代理。本 fork 当前通过 GitHub 分支分发，尚未发布自有 npm 包；未经明确授权不要执行 `npm publish`。

## 0. 前提与身份

- **包名**：`smithue-cli`（保留上游名称，GitHub 安装后仍提供 `smithue-cli` 命令）。
- **分支**：`ue5.1-ue5.5-compat`（remote `s2272756972-prog/smithue-cli`）。
- **安装 spec**：`github:s2272756972-prog/smithue-cli#ue5.1-ue5.5-compat`。
- **与插件版本号完全独立**：`smithue-cli` 与 `SmithUE` 插件是两个独立产品、独立版本号，**禁止互相比较 / 对齐**。兼容性以 HTTP 协议契约为准。
- **工具链**：npm-only（**无 bun**）、TypeScript、ESM / NodeNext（本地 import 必须带 `.js`）、测试用 vitest。

## 1. 关键坑（必读，按踩坑频率）

1. **registry 默认指向 npmmirror（淘宝镜像，只读，不能 publish）。**
   - 本机 `npm config get registry` 往往是 `https://registry.npmmirror.com`。
   - **发布、`npm view`、`npm whoami` 一律显式带 `--registry https://registry.npmjs.org`。** 否则 publish 报 403 / E协议错误。
2. **CJK 文件（`skill/SKILL.md`、`docs/*.md`）用 Edit/Write 工具改，绝不用 PowerShell `Set-Content`**（PS 5.1 按 GBK 误读 UTF-8 → 乱码）。
3. **提交信息用 `git commit -F <file>`**，提交信息文件用 Node/Write 写（PowerShell 多行 `-m` 和 CJK 会被吞 / 拆行）。
4. **已发布版本不可覆盖**：npm 不允许同版本号重发。发错了只能 `npm version patch` 再发一版。
5. **`files` 白名单决定打包内容**：`package.json` 的 `files` = `["dist/","schemas/","skill/","postinstall.cjs","package.json","README.md"]`。**新增需要进包的产物（如新 schema、新 skill 文件）必须同步加进 `files`，否则不会被发布。**
6. **`*.tgz`（`npm pack` 产物）不要提交进仓库**（应在 `.gitignore`）。

## 2. 版本号（semver）

| 改动类型 | bump |
|---|---|
| SKILL 内容 / docs / bugfix / 文案 | **patch**（x.y.**Z**） |
| 新命令 / 新特性（向后兼容） | **minor**（x.**Y**.0） |
| 破坏性变更（参数 / 输出契约改） | **major**（**X**.0.0） |

bump 命令（不打 git tag，提交由本流程统一管理）：
```bash
npm version patch --no-git-tag-version   # 或 minor / major
```

## 3. 发版前门禁（全绿才发）

```bash
npm run build       # tsc -p tsconfig.build.json → 退出码 0
npm test            # vitest run → 全绿
npm run typecheck   # tsc --noEmit → 退出码 0
```

## 4. 标准分发流程（逐步）

```bash
# 1) 改动落地（src / skill/SKILL.md / docs ...），CJK 文件用 Edit/Write 改

# 2) 门禁（见 §3）：build / test / typecheck 全绿

# 3) bump 版本
npm version patch --no-git-tag-version

# 4) 提交并推送兼容分支
git add -A                      # 或精确 add 改动文件
git commit -F <msgfile>
git push origin ue5.1-ue5.5-compat

# 5) 从 GitHub 分支安装到临时 prefix，验证已提交的 dist + bin
npm install -g "github:s2272756972-prog/smithue-cli#ue5.1-ue5.5-compat" --prefix <temp-prefix>
<temp-prefix>/smithue-cli --version
git status
```

> GitHub 安装依赖分支内已提交的干净 `dist/`。修改 TypeScript 后必须先运行 `npm run build` 并提交生成结果；不要依赖 Git 依赖临时克隆中的 `prepare`，目标 npm 环境不保证具备 `typescript` 开发依赖。

> 如未来要发布 npm，必须先确定自有包名/权限并获得明确授权，再单独执行 npm 发布流程；不能覆盖上游 `smithue-cli` 包。

> **doc-only / 非进包改动**（如本 `docs/RELEASE.md`、CONTRIBUTING）：只 `git commit + push`，**不需要 bump / npm publish**（它们不在 `files` 白名单，不进 npm 包）。

## 5. SKILL 部署（`smithue-control`）

- **`skill/`（SKILL.md + `references/` + `scripts/`）是唯一发布 / 部署源**（在 `files` 白名单内）。**不要**改其它同名副本。
- 根目录 `postinstall.cjs` 在**全局安装兼容分支**时自动把整个 `skill/` bundle 部署到：
  - `~/.agents/skills/smithue-control/`（主，始终）
  - `~/.claude/skills/`、`~/.codex/skills/`（仅当对应目录已存在）
  - 幂等覆盖；自动清理 0.15 之前旧布局残留的 `reference/` 目录；可用环境变量 `SMITHUE_SKILL_NO_AUTOINSTALL=1` 关闭。
- **本机已装、未走全局安装** → postinstall 不触发，需**手动同步**让当前环境立即生效：
  ```bash
  # 在仓库根目录（部署整个 bundle，含 legacy reference/ 清理）
  node dist/cli.js skill --install "$HOME/.agents/skills/smithue-control"
  ```

## 6. 一键模板（复制即用）

```powershell
# 在 F:\...\smithue-cli 下
npm run build; if($?){ npm test }; if($?){ npm run typecheck }
if($?){
  npm version patch --no-git-tag-version
  # 用 Write 工具把提交信息写到 commit.txt（CJK 安全），再：
  git add -A
  git commit -F commit.txt
  git push origin ue5.1-ue5.5-compat
  npm install -g "github:s2272756972-prog/smithue-cli#ue5.1-ue5.5-compat" --prefix <temp-prefix>
}
```

## 7. 与插件发版的区别（勿混淆）

- 本流程**只管 smithue-cli（npm）**。
- **SmithUE 插件**走另一套：bump `.uplugin` → 用目标 UE 版本的 UBT 重编 → 打包 `Saved/SmithUE-vX-UE5.x-Win64.zip`（剔除 `.pdb` / Live Coding 临时文件）→ 创建带目标引擎版本后缀的 GitHub Release。详见插件仓库 `docs/spec/`。
- 两者**版本号独立递增**，发版时机互不依赖。

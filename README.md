# smithue-cli

Stateless command line interface for the SmithUE Unreal Engine plugin.

The CLI is engine-version neutral and works with the SmithUE UE5.1 and UE5.5 compatibility branches. Newer compatible plugins expose `engine_version` in `smithue-cli status`; older plugins continue to work without that field.

## For AI Agents

### Quick Deploy
- **Windows**: `npm install -g "https://github.com/s2272756972-prog/smithue-cli/archive/refs/heads/ue5.1-ue5.5-compat.tar.gz"`
- **macOS**: `npm install -g "https://github.com/s2272756972-prog/smithue-cli/archive/refs/heads/ue5.1-ue5.5-compat.tar.gz"`
- **Linux**: `npm install -g "https://github.com/s2272756972-prog/smithue-cli/archive/refs/heads/ue5.1-ue5.5-compat.tar.gz"`

*Note: Node.js 18+ and HTTPS access to GitHub are required for installation from the compatibility branch tarball; Git itself is not required. The v1 plugin server is Windows-only; the CLI can install on any OS but requires a Windows machine running the UE editor.*

### Prerequisites check
Ensure Node.js 18+ is installed. Run `node -v` to check.

### Verification
Run this command to check if the CLI can find your running Unreal Engine project:
```powershell
smithue-cli status
```

### Fault tree (if things go wrong)
1. **Editor not running**: Start Unreal Engine and verify the SmithUE plugin is active.
2. **Multiple instances**: If you have two editors open, the CLI needs help. Use `smithue-cli status` to see PIDs, then pass `--pid <number>` to your command.
3. **Stale portfile**: If the editor crashed, a `.port` file might remain in `%LOCALAPPDATA%\.smithue\`. Run `smithue-cli prune` to clean up dead files.
4. **Connection refused**: Check if your firewall blocks local port traffic. SmithUE only listens on 127.0.0.1.

## Installation
Install the maintained compatibility build directly from this fork:
```bash
npm install -g "https://github.com/s2272756972-prog/smithue-cli/archive/refs/heads/ue5.1-ue5.5-compat.tar.gz"
```
Or run it without a permanent global install:
```bash
npx --yes --package "https://github.com/s2272756972-prog/smithue-cli/archive/refs/heads/ue5.1-ue5.5-compat.tar.gz" smithue-cli <command>
```

Plain `npm install -g smithue-cli` or `npx smithue-cli` resolves the upstream npm package, not this compatibility build.

To deploy or refresh the bundled AI skill after a global install, run:
```bash
smithue-cli skill --install
```
The compatibility branch uses the GitHub branch tarball plus an explicit skill command. This avoids npm versions that create broken global links for direct Git dependencies or restrict install scripts.

## Subcommands

| Command | Description |
|---|---|
| `exec` | Run a remote command in UE |
| `list` | List available domains or objects |
| `search` | Find assets or objects by string |
| `status` | Show running UE instances and their ports |
| `batch` | Run multiple read-only commands sequentially |
| `upgrade` | Update the CLI from this fork's compatibility branch |
| `prune` | Remove stale port files from crashed instances |
| `purge` | Remove the entire `.smithue` directory (full uninstall cleanup) |
| `use` | Pin (or unpin) a default SmithUE instance for multi-editor setups |
| `skill` | Print or install the bundled SKILL.md for AI agent integration |

## Output Modes

By default, `smithue-cli` outputs pretty-printed JSON (2-space indent).

- `--terse` — Minified JSON (no whitespace). Recommended for AI agents to save tokens.
- `--out <file>` — Write result to file; stdout is silent. Useful for large responses.
- Combined: `smithue-cli status --terse --out result.json`

## Batch Mode

Run multiple read-only commands in a single call:

```bash
smithue-cli batch "status" "list"
```

Returns a JSON array: `[{command, ok, data?, error?}, ...]`

Supported commands: `status`, `list`, `search`. Sequential execution only.

## Upgrading

```bash
smithue-cli upgrade
```

Updates `smithue-cli` to the latest version via npm. A warning is printed to stderr if the CLI version does not match the plugin version.

## AI Agent Integration

Recommended flags for AI agent usage:

```bash
# Minified output saves tokens
smithue-cli status --terse

# Write large responses to file, keep context clean
smithue-cli list --out tools.json

# Multiple queries in one call
smithue-cli batch "status" "list" --terse
```

## Examples
List all Material assets:
```bash
smithue-cli list Material
```

Search for blueprints:
```bash
smithue-cli search blueprint
```

Execute a custom action:
```bash
smithue-cli exec my_action '{"key": "value"}'
```

### Shell-safe parameter passing (recommended for complex JSON)

Positional JSON strings can be mangled by some shells — notably **Windows PowerShell 5.1**, which strips quotes or splits on spaces. Use `--stdin` or `--params-file` for shell- and PowerShell-version-agnostic parameter passing:

```powershell
# --stdin: pipe JSON from a file (safe on all shells and PowerShell versions)
Get-Content params.json -Raw | smithue-cli exec my_action --stdin

# Shorthand: pass "-" as the params argument (equivalent to --stdin)
Get-Content params.json -Raw | smithue-cli exec my_action -

# --params-file: read params from a file directly
smithue-cli exec my_action --params-file params.json
```

All three input modes are **mutually exclusive** — supplying more than one at a time is an error (exit 1). An explicit source with empty content is also an error. Omitting params entirely defaults to `{}`.

## Security Notes
- Binds to 127.0.0.1 only. No external network exposure.
- Port files in `%LOCALAPPDATA%\.smithue` are ACL-restricted to the current Windows user.

## Uninstall

Use `purge` to fully clean up after removing SmithUE. Unlike `prune` (which removes stale port files during normal use), `purge` deletes the entire `%LOCALAPPDATA%\.smithue\` directory as the final step of uninstalling the CLI.

```bash
smithue-cli purge          # interactive: lists files and asks for confirmation
smithue-cli purge --dry-run  # preview what would be deleted
smithue-cli purge -y       # non-interactive full purge (CI/scripts)
```

### Options

| Flag | Description |
|---|---|
| `--force` | Skip liveness check; delete all files including non-portfiles |
| `--dry-run` | Show what would be deleted without making changes |
| `-y, --yes` | Skip the confirmation prompt (required when stdin is not a TTY) |

### Exit codes

| Code | Meaning |
|---|---|
| 0 | Success (including cancelled and dry-run) |
| 1 | Non-interactive context without `-y` |
| 2 | `LOCALAPPDATA` not set (Windows-only command) |
| 3 | `.smithue` is a symlink or junction — refused for safety |

For routine cleanup of stale portfiles without removing the directory, use `smithue-cli prune` instead.

## Exit Codes

| Code | Meaning | Common cause |
|---|---|---|
| `0` | Success | Command completed normally |
| `1` | Bad input or disambiguation required | Invalid arguments; multiple instances running without `--pid`/`--project`; `PAYLOAD_TOO_LARGE` |
| `2` | Not found or unreachable | No portfiles found; instance unreachable; PID/project not matched |
| `3` | Command error | `PIE_LOCKED`, `ASSET_NOT_FOUND`, `INVALID_REQUEST`, or unknown plugin error |
| `4` | Internal / editor not ready | `INTERNAL_ERROR`, `EDITOR_NOT_READY`, unexpected exception |
| `5` | Stale session NID | `STALE_NID` — node ID is outdated, re-run the command |
| `6` | Wait timeout | `--wait` exceeded without editor becoming ready |

Scripts can branch on exit codes:
```powershell
smithue-cli status
if ($LASTEXITCODE -eq 2) { Write-Host "Editor not running" }
if ($LASTEXITCODE -eq 5) { Write-Host "Reconnecting (stale NID)..." }
```

## Known Limitations
- Version 1 is Windows-only due to portfile path conventions.
- No persistent configuration files. Use environment variables like `SMITHUE_PORT` or `SMITHUE_PID` for overrides.

## Maintainers

Publishing this package (git + npm) follows a fixed runbook — see **[`docs/RELEASE.md`](docs/RELEASE.md)** (registry gotcha, version bump, CJK-safe commit, `files` whitelist, skill deploy). The SmithUE plugin (separate repo, independent version) has its own release spec in the plugin's `docs/spec/RELEASE.md`.

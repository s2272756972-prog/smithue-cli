// Auto-deploy the `smithue-control` skill on a GLOBAL compatibility-branch install.
//
// Self-contained CommonJS, shipped as-is (no build step). It must NEVER throw
// or exit non-zero because a failing postinstall would break the CLI install.
//
// Behavior (global installs only):
//   copies the ENTIRE skill/ bundle (SKILL.md + references/ + scripts/) to
//     ~/.agents/skills/smithue-control   (primary ecosystem — always)
//     ~/.claude/skills/smithue-control   (only if ~/.claude exists)
//     ~/.codex/skills/smithue-control    (only if ~/.codex exists)
//   Idempotent: overwrites so updates refresh the whole skill.
//   Opt out with SMITHUE_SKILL_NO_AUTOINSTALL=1.
'use strict';

try {
  if (process.env.npm_config_global === 'true' && process.env.SMITHUE_SKILL_NO_AUTOINSTALL !== '1') {
    const fs = require('node:fs');
    const os = require('node:os');
    const path = require('node:path');

    const skillDir = path.resolve(__dirname, 'skill');
    if (fs.existsSync(path.join(skillDir, 'SKILL.md'))) {
      const home = os.homedir();
      const skillsDirs = [path.join(home, '.agents', 'skills')];

      for (const agentRoot of ['.claude', '.codex']) {
        if (fs.existsSync(path.join(home, agentRoot))) {
          skillsDirs.push(path.join(home, agentRoot, 'skills'));
        }
      }

      const installed = [];
      for (const skillsDir of skillsDirs) {
        try {
          const dest = path.join(skillsDir, 'smithue-control');
          fs.mkdirSync(dest, { recursive: true });
          fs.cpSync(skillDir, dest, { recursive: true });

          const legacy = path.join(dest, 'reference');
          if (fs.existsSync(legacy)) {
            fs.rmSync(legacy, { recursive: true, force: true });
          }
          installed.push(dest);
        } catch (_) {
          // Ignore a single target failure (permissions / read-only).
        }
      }

      if (installed.length > 0) {
        console.log('[smithue-cli] smithue-control skill (SKILL.md + references/ + scripts/) installed to:');
        for (const installedPath of installed) console.log('  ' + installedPath);
        console.log('[smithue-cli] reload your AI tool to pick it up. Opt out: SMITHUE_SKILL_NO_AUTOINSTALL=1');
      }
    }
  }
} catch (_) {
  // A postinstall must never fail the install.
}

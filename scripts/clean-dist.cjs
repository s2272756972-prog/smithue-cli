const { rmSync } = require('node:fs');
const { basename, dirname, resolve } = require('node:path');

const repoRoot = resolve(__dirname, '..');
const distDir = resolve(repoRoot, 'dist');

if (dirname(distDir) !== repoRoot || basename(distDir) !== 'dist') {
  throw new Error(`Refusing to clean unexpected path: ${distDir}`);
}

rmSync(distDir, { recursive: true, force: true });

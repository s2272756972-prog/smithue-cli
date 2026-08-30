import { execSync } from 'node:child_process';
import { SmithUEError } from '../portfile.js';
import { printResult, printError } from '../output.js';
import { COMPAT_CLI_INSTALL_SPEC } from '../distribution.js';
export async function upgradeCommand() {
    try {
        const output = execSync(`npm install -g ${COMPAT_CLI_INSTALL_SPEC}`, { stdio: 'pipe', encoding: 'utf-8' });
        printResult({ status: 'updated', output: String(output).trim() });
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            printError(new SmithUEError('npm not found in PATH', 1));
            return;
        }
        if (err instanceof Error) {
            printError(new SmithUEError(err.message, 1));
            return;
        }
        printError(new SmithUEError(String(err), 1));
    }
}

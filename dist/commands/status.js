import { SmithUEClient } from '../client.js';
import { discoverPort, SmithUEError } from '../portfile.js';
import { printResult, printError } from '../output.js';
async function sleep(ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}
export async function statusCommand(opts) {
    try {
        const discovered = await discoverPort(opts);
        const client = new SmithUEClient({ host: '127.0.0.1', port: discovered.port });
        if (opts.wait !== undefined && opts.wait > 0) {
            const timeoutMs = opts.wait * 1000;
            const startedAt = Date.now();
            while (true) {
                const res = await client.getReady();
                if (res.ready) {
                    printResult({
                        port: discovered.port,
                        pid: discovered.pid,
                        project_name: discovered.project_name,
                        ready: res.ready,
                        version: res.version,
                        engine_version: res.engine_version ?? discovered.engine_version,
                        pie_active: res.pie_active,
                        ...(discovered.selection_mode ? { selection_mode: discovered.selection_mode } : {}),
                        ...(discovered.busy ? { busy: true } : {}),
                    });
                    return;
                }
                if (Date.now() - startedAt >= timeoutMs) {
                    throw new SmithUEError('Timed out waiting for editor to be ready', 6);
                }
                await sleep(1000);
            }
        }
        else {
            const res = await client.getReady();
            printResult({
                port: discovered.port,
                pid: discovered.pid,
                project_name: discovered.project_name,
                ready: res.ready,
                version: res.version,
                engine_version: res.engine_version ?? discovered.engine_version,
                pie_active: res.pie_active,
                ...(discovered.selection_mode ? { selection_mode: discovered.selection_mode } : {}),
                ...(discovered.busy ? { busy: true } : {}),
            });
        }
    }
    catch (err) {
        printError(err);
    }
}

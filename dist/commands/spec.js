import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { SmithUEClient } from '../client.js';
import { printError, printResult } from '../output.js';
import { discoverPort } from '../portfile.js';
import { inferSpecFromBp } from '../spec/infer.js';
export async function runSpecInfer(options) {
    const raw = (await options.execCommand('bp_describe_components', {
        bp_path: options.from,
    }));
    const bp = raw.data?.blueprints?.[0];
    if (!bp) {
        throw new Error(`bp_describe_components returned no blueprint for ${options.from}`);
    }
    const spec = inferSpecFromBp(bp, { specId: options.specId, specName: options.specName });
    await mkdir(path.dirname(options.out), { recursive: true });
    await writeFile(options.out, `${JSON.stringify(spec, null, 2)}\n`, 'utf-8');
    return spec;
}
export async function specInferCommand(options) {
    try {
        const { port } = await discoverPort(options);
        const client = new SmithUEClient({ host: '127.0.0.1', port });
        const spec = await runSpecInfer({
            from: options.from,
            out: options.out,
            specId: options.specId,
            specName: options.specName,
            execCommand: (tool, params) => client.executeCommand(tool, params),
        });
        printResult({ out: options.out, spec });
    }
    catch (err) {
        printError(err);
    }
}

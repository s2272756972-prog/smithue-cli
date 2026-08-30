import { discoverPort } from '../portfile.js';
import { SmithUEClient } from '../client.js';
import { printResult, printError } from '../output.js';
export async function listCommand(domain, opts) {
    try {
        const { port } = await discoverPort(opts);
        const client = new SmithUEClient({ host: '127.0.0.1', port });
        const result = await client.listTools(domain);
        printResult(result);
    }
    catch (err) {
        printError(err);
    }
}

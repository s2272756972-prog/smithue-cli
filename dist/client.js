import { SmithUEError } from './portfile.js';
export class SmithUEClient {
    host;
    port;
    timeout;
    constructor(config) {
        this.host = config.host;
        this.port = config.port;
        this.timeout = config.timeout ?? 30000;
    }
    get baseUrl() {
        return `http://${this.host}:${this.port}`;
    }
    headers() {
        // Include charset so the plugin (UE C++ side) never falls back to a system
        // ANSI/GBK code page when parsing the request body — otherwise CJK params
        // (e.g. a Chinese button_text / asset path) can be corrupted server-side.
        return { 'Content-Type': 'application/json; charset=utf-8' };
    }
    async fetchJson(path, init, timeoutMs, acceptedStatuses = []) {
        const ms = timeoutMs ?? this.timeout;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), ms);
        try {
            const response = await fetch(`${this.baseUrl}${path}`, {
                ...init,
                signal: controller.signal,
            });
            if (!response.ok && !acceptedStatuses.includes(response.status)) {
                const body = await response.text().catch(() => '');
                throw new Error(`SmithUE plugin returned HTTP ${response.status}. Body: ${body.slice(0, 200)}`);
            }
            return (await response.json());
        }
        finally {
            clearTimeout(timer);
        }
    }
    async postJson(path, body, timeoutMs) {
        return this.fetchJson(path, {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify(body),
        }, timeoutMs);
    }
    async getJson(path, timeoutMs, acceptedStatuses = []) {
        return this.fetchJson(path, {
            method: 'GET',
            headers: this.headers(),
        }, timeoutMs, acceptedStatuses);
    }
    normalizeRequestError(err, command) {
        const error = err;
        // Check AbortError FIRST — AbortError can have any message including 'fetch failed'
        if (error.name === 'AbortError') {
            return new Error(`SmithUE plugin timed out. Command: ${command} (port: ${this.port})\n` +
                `  The command may STILL be running on the game thread — long batch ops\n` +
                `  (move_folder / move_paths / resave_packages / fixup_redirectors / resolve_redirectors)\n` +
                `  routinely exceed the HTTP timeout while continuing to completion.\n` +
                `  Poll live progress (worker-safe, works while the editor is busy):\n` +
                `    smithue-cli exec get_job_status {}\n` +
                `  Do NOT re-send the command — that queues a SECOND run. Confirm the real\n` +
                `  outcome via get_job_status reaching 100% (or the editor log), then continue.`);
        }
        const msg = error.message ?? '';
        if (msg.includes('ECONNREFUSED') ||
            msg.includes('fetch failed') ||
            msg.includes('Failed to fetch') ||
            msg.includes('ENOTFOUND') ||
            msg.includes('connect ECONNREFUSED')) {
            return new Error(`SmithUE plugin unreachable at ${this.host}:${this.port}. Start UE Editor with SmithUE plugin enabled.\n` +
                `  Fallback: curl -s http://${this.host}:${this.port}/api/v1/execute -d '{"command":"ping","params":{}}'`);
        }
        return err instanceof Error ? err : new Error(String(err));
    }
    async execute(command, params = {}) {
        try {
            const data = await this.postJson('/api/v1/execute', { command, params });
            if (data.status === 'error') {
                throw this.mapErrorCodeToSmithUEError(data);
            }
            return data;
        }
        catch (err) {
            if (err instanceof SmithUEError)
                throw err;
            throw this.normalizeRequestError(err, command);
        }
    }
    async executeCommand(command, params = {}) {
        return this.execute(command, params);
    }
    async ping() {
        const res = await this.execute('ping', {});
        return res.data;
    }
    async listTools(category) {
        const res = await this.execute('list_tools', category ? { category } : {});
        const data = res.data;
        return data.tools ?? [];
    }
    async getReady() {
        // The plugin intentionally returns HTTP 503 with {ready:false} while the
        // AssetRegistry is still loading. Treat that one status as a valid probe
        // result so `status --wait` can keep polling; all other non-2xx responses
        // remain errors.
        return this.getJson('/ready', undefined, [503]);
    }
    async isConnected() {
        try {
            await this.ping();
            return true;
        }
        catch {
            return false;
        }
    }
    async executeWithFailover(command, params = {}) {
        const syncTimeout = parseInt(process.env.SMITHUE_SYNC_TIMEOUT || '10000', 10);
        const asyncTimeout = parseInt(process.env.SMITHUE_ASYNC_TIMEOUT || '120000', 10);
        try {
            return await this.postJson('/api/v1/execute', { command, params }, syncTimeout)
                .then((data) => {
                if (data.status === 'error')
                    throw this.mapErrorCodeToSmithUEError(data);
                return data;
            });
        }
        catch (err) {
            if (err instanceof SmithUEError)
                throw err;
            if (err.name !== 'AbortError') {
                throw this.normalizeRequestError(err, command);
            }
        }
        const taskId = await this.startAsyncTask(command, params);
        const startedAt = Date.now();
        let delayMs = 500;
        while (Date.now() - startedAt <= asyncTimeout) {
            const remainingMs = asyncTimeout - (Date.now() - startedAt);
            if (remainingMs <= 0)
                break;
            const poll = await this.getJson(`/api/v1/async/${encodeURIComponent(taskId)}`, remainingMs);
            if (poll.status === 'error') {
                if (poll.error?.startsWith('Unknown task_id:')) {
                    throw new Error('Task lost — server may have restarted');
                }
                throw this.mapErrorCodeToSmithUEError(poll);
            }
            const data = poll.data;
            if (this.isAsyncTaskComplete(data)) {
                return { status: 'success', data: data.result };
            }
            await this.sleep(Math.min(delayMs, Math.max(asyncTimeout - (Date.now() - startedAt), 0)));
            delayMs = Math.min(delayMs * 2, 4000);
        }
        throw new Error(`Async task timed out after ${Math.ceil(asyncTimeout / 1000)}s`);
    }
    mapErrorCodeToSmithUEError(data) {
        const msg = data.error ?? 'SmithUE command failed';
        switch (data.error_code) {
            case 'STALE_NID':
                return new SmithUEError(msg, 5);
            case 'PIE_LOCKED':
            case 'ASSET_NOT_FOUND':
            case 'INVALID_REQUEST':
                return new SmithUEError(msg, 3);
            case 'PAYLOAD_TOO_LARGE':
                return new SmithUEError(msg, 1);
            case 'INTERNAL_ERROR':
            case 'EDITOR_NOT_READY':
                return new SmithUEError(msg, 4);
            default:
                return new SmithUEError(msg, 3);
        }
    }
    async startAsyncTask(command, params) {
        const data = await this.postJson('/api/v1/async', { command, params });
        if (data.status === 'error') {
            throw this.mapErrorCodeToSmithUEError(data);
        }
        const taskId = data.data?.task_id;
        if (typeof taskId !== 'string' || taskId.length === 0) {
            throw new Error('SmithUE async task did not return a task_id');
        }
        return taskId;
    }
    isAsyncTaskComplete(data) {
        return data?.completed === true && this.isRecord(data.result);
    }
    isRecord(value) {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
    async sleep(ms) {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }
}

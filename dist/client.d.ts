import type { SmithUEExecuteResponse, SmithUEToolSchema } from './types.js';
export interface SmithUEClientConfig {
    host: string;
    port: number;
    timeout?: number;
}
export declare class SmithUEClient {
    private host;
    private port;
    private timeout;
    constructor(config: SmithUEClientConfig);
    private get baseUrl();
    private headers;
    private fetchJson;
    private postJson;
    private getJson;
    private normalizeRequestError;
    execute(command: string, params?: Record<string, unknown>): Promise<SmithUEExecuteResponse>;
    executeCommand(command: string, params?: Record<string, unknown>): Promise<SmithUEExecuteResponse>;
    ping(): Promise<{
        message: string;
    }>;
    listTools(category?: string): Promise<SmithUEToolSchema[]>;
    getReady(): Promise<{
        ready: boolean;
        version?: string;
        engine_version?: string;
        pie_active?: boolean;
    }>;
    isConnected(): Promise<boolean>;
    executeWithFailover(command: string, params?: Record<string, unknown>): Promise<SmithUEExecuteResponse>;
    private mapErrorCodeToSmithUEError;
    private startAsyncTask;
    private isAsyncTaskComplete;
    private isRecord;
    private sleep;
}
//# sourceMappingURL=client.d.ts.map
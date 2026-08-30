export interface GlobalOpts {
    pid?: number;
    project?: string;
    port?: number;
}
export type BatchResult = {
    command: string;
    ok: boolean;
    data?: unknown;
    error?: string;
};
export declare function batchCommand(commands: string[], opts: GlobalOpts): Promise<void>;
//# sourceMappingURL=batch.d.ts.map
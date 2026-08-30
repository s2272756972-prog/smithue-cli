export declare class SmithUEError extends Error {
    readonly exitCode: number;
    constructor(message: string, exitCode: number);
}
export interface PortfileData {
    port: number;
    pid: number;
    project: string;
    project_name: string;
    started_at: string;
    plugin_version: string;
    engine_version?: string;
}
export interface DiscoverResult {
    port: number;
    pid: number;
    project: string;
    project_name: string;
    plugin_version?: string;
    engine_version?: string;
    selection_mode?: 'pinned' | 'most-recent' | 'explicit';
    busy?: boolean;
}
export interface DiscoverOpts {
    pid?: number;
    project?: string;
    port?: number;
    /** When true, revert to hard-error on multi-instance (CI/script mode). Default: false. */
    strict?: boolean;
}
export declare function getPortfileDir(): string;
export declare function readPortfiles(dir: string): Promise<Array<{
    file: string;
    data: PortfileData;
}>>;
export declare function discoverPort(opts?: DiscoverOpts): Promise<DiscoverResult>;
//# sourceMappingURL=portfile.d.ts.map
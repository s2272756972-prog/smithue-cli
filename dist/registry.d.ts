export interface RegistryEntry {
    projectId: string;
    pid: number;
    port: number;
    project: string;
    project_name: string;
    lastConnectedAt: string;
}
export interface Registry {
    entries: RegistryEntry[];
    pinned?: RegistryEntry;
}
export declare function readRegistry(): Promise<Registry>;
export declare function updateLastUsed(entry: RegistryEntry): Promise<void>;
export declare function getPinned(): Promise<RegistryEntry | undefined>;
export declare function setPinned(entry: RegistryEntry): Promise<void>;
export declare function clearPinned(): Promise<void>;
export declare function getMostRecent(): Promise<RegistryEntry | undefined>;
//# sourceMappingURL=registry.d.ts.map
import type { SmithUEConfig } from './types.js';
export declare class ConfigError extends Error {
    constructor(message: string);
}
/** Walk up from startDir looking for smithue.config.json (ESLint-style). */
export declare function findConfigFile(startDir: string): Promise<string | null>;
/** Load and validate a config file at an explicit path. */
export declare function loadConfig(configPath: string): Promise<SmithUEConfig>;
/** Convenience: walk up from startDir and load the first config found. Returns null if none found. */
export declare function resolveConfig(startDir: string): Promise<SmithUEConfig | null>;
//# sourceMappingURL=resolver.d.ts.map
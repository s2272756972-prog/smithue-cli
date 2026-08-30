import type { SmithUEConfig } from './types.js';
/**
 * Build an ownership checker from a config.
 * Conservative default: include empty → all paths are "not owned".
 * exclude has higher priority than include (hard-block).
 */
export declare function createOwnershipChecker(config: SmithUEConfig): (assetPath: string) => boolean;
//# sourceMappingURL=ownership.d.ts.map
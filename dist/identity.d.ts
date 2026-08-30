/**
 * Derive a stable, short identifier for an absolute project path.
 * Inspired by Obsidian's path-hash vault identity — survives pid/port changes.
 *
 * Algorithm: normalize path (resolve + lowercase on Windows) → SHA-256 → first 16 hex chars.
 */
export declare function projectId(absPath: string): string;
//# sourceMappingURL=identity.d.ts.map
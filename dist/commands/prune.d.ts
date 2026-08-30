export interface PruneResult {
    scanned: number;
    pruned: number;
    kept: number;
}
/**
 * Scan `dir` for `.port` files and remove stale ones.
 *
 * A portfile is considered stale if ANY of the following is true:
 *   1. It cannot be parsed (malformed JSON / missing `port` field).
 *   2. The `pid` recorded in the file is no longer alive — even if the port
 *      happens to respond (another process may have reused that port).
 *   3. The PID is alive but the HTTP `/ready` probe fails (connection refused).
 *
 * Only a file whose PID is alive AND whose port responds is kept.
 */
export declare function prunePortfiles(dir: string): Promise<PruneResult>;
export declare function prune(): Promise<void>;
//# sourceMappingURL=prune.d.ts.map
export interface OutputOptions {
    terse?: boolean;
    outPath?: string;
}
export declare function escapeNonAscii(s: string): string;
export declare function setOutputOptions(opts: OutputOptions): void;
export declare function printResult(data: unknown): void;
export declare function printError(err: unknown): void;
//# sourceMappingURL=output.d.ts.map
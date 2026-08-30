import type { LintResult } from '../lint/types.js';
import type { SmithUEConfig } from '../config/types.js';
import type { OutputOptions } from '../output.js';
export declare function runLint(options: {
    specId: string;
    specDir: string;
    config: SmithUEConfig;
    execCommand: (tool: string, params: object) => Promise<unknown>;
    output: OutputOptions;
}): Promise<{
    result: LintResult;
    exitCode: number;
}>;
//# sourceMappingURL=lint.d.ts.map
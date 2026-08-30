import type { SpecModel } from './types.js';
export declare class SpecValidationError extends Error {
    fields: string[];
    constructor(fields: string[], message: string);
}
export declare function loadSpec(filePath: string): Promise<SpecModel>;
//# sourceMappingURL=loader.d.ts.map
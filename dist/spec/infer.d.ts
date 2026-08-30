import type { BpDescribeEntry } from '../lint/checker.js';
import type { SpecModel } from './types.js';
export interface InferOptions {
    specId?: string;
    specName?: string;
}
export declare function inferSpecFromBp(bp: BpDescribeEntry, opts?: InferOptions): SpecModel;
//# sourceMappingURL=infer.d.ts.map
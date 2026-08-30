import { type DiscoverOpts } from '../portfile.js';
import { type InferOptions } from '../spec/infer.js';
import type { SpecModel } from '../spec/types.js';
export interface SpecInferOptions extends InferOptions {
    from: string;
    out: string;
    execCommand: (tool: string, params: object) => Promise<unknown>;
}
export declare function runSpecInfer(options: SpecInferOptions): Promise<SpecModel>;
export declare function specInferCommand(options: {
    from: string;
    out: string;
    specId?: string;
    specName?: string;
} & DiscoverOpts): Promise<void>;
//# sourceMappingURL=spec.d.ts.map
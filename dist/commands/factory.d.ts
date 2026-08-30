import type { FactoryPlan } from '../factory/types.js';
import { type OutputOptions } from '../output.js';
import { type DiscoverOpts } from '../portfile.js';
export interface RunFactoryOptions {
    specId: string;
    dryRun: boolean;
    execCommand: (tool: string, params: object) => Promise<unknown>;
    startDir: string;
    output: OutputOptions;
}
export declare function runFactory(options: RunFactoryOptions): Promise<{
    plan: FactoryPlan;
    exitCode: number;
}>;
export declare function factoryCommand(options: {
    specId: string;
    dryRun?: boolean;
} & DiscoverOpts, output: OutputOptions): Promise<void>;
//# sourceMappingURL=factory.d.ts.map
import type { SpecModel } from '../spec/types.js';
import type { AssetMetadata } from '../classify/types.js';
import type { FactoryPlan } from './types.js';
export interface PlannerOptions {
    spec: SpecModel;
    assets: AssetMetadata[];
    existingBpPaths: Set<string>;
    ownedChecker: (assetPath: string) => boolean;
    outputFolder: string;
}
export declare function planFactory(opts: PlannerOptions): FactoryPlan;
//# sourceMappingURL=planner.d.ts.map
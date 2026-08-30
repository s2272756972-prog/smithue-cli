import type { SpecModel } from '../spec/types.js';
import type { LintFinding } from './types.js';
export interface BpComponent {
    name: string;
    class: string;
    source: string;
    mobility?: string;
    collision?: {
        profile?: string;
        enabled?: string;
    };
    materials?: string[];
    mesh?: string | null;
    inherited_unverifiable?: boolean;
}
export interface BpDescribeEntry {
    bp_path: string;
    parent_class?: string;
    components: BpComponent[];
}
export declare function checkBlueprint(bp: BpDescribeEntry, spec: SpecModel, packagePath: string): {
    findings: LintFinding[];
    unverifiable: string[];
};
//# sourceMappingURL=checker.d.ts.map
export interface ExecParamInput {
    positional?: string;
    stdin?: boolean;
    paramsFile?: string;
}
export interface ExecParamDeps {
    readStdin: () => Promise<string>;
    readFile: (path: string) => Promise<string>;
}
export declare function resolveExecParams(input: ExecParamInput, deps: ExecParamDeps): Promise<Record<string, unknown>>;
//# sourceMappingURL=exec-params.d.ts.map
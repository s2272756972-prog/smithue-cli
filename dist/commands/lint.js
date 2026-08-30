import { writeFile } from 'node:fs/promises';
import { loadSpec } from '../spec/index.js';
import { checkBlueprint } from '../lint/checker.js';
export async function runLint(options) {
    const { specId, specDir, config, execCommand, output } = options;
    const specPath = `${specDir}/${specId}.json`;
    const spec = await loadSpec(specPath);
    const devRoot = config.devContentRoot ?? '/Game/SmithUETest';
    const raw = (await execCommand('bp_describe_components', {
        folder_path: devRoot,
        recursive: false,
    }));
    const blueprints = raw.data?.blueprints ?? [];
    const allFindings = [];
    const allUnverifiable = [];
    for (const bp of blueprints) {
        const packagePath = bp.bp_path.split('/').slice(0, -1).join('/');
        const { findings, unverifiable } = checkBlueprint(bp, spec, packagePath);
        allFindings.push(...findings);
        allUnverifiable.push(...unverifiable);
    }
    const result = {
        spec_id: specId,
        findings: allFindings,
        unverifiable: allUnverifiable,
        checked_assets: blueprints.length,
    };
    if (output.outPath) {
        await writeFile(output.outPath, JSON.stringify(result, null, 2), 'utf8');
    }
    return { result, exitCode: allFindings.length > 0 ? 1 : 0 };
}

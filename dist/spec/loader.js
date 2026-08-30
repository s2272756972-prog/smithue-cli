import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import Ajv from 'ajv';
const require = createRequire(import.meta.url);
const schema = require('../../schemas/spec.schema.json');
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);
export class SpecValidationError extends Error {
    fields;
    constructor(fields, message) {
        super(message);
        this.fields = fields;
        this.name = 'SpecValidationError';
    }
}
export async function loadSpec(filePath) {
    const raw = await readFile(filePath, 'utf8');
    const data = JSON.parse(raw);
    if (!validate(data)) {
        const fields = (validate.errors ?? []).map(errorToField);
        throw new SpecValidationError(fields, `Invalid spec: ${ajv.errorsText(validate.errors)}`);
    }
    return data;
}
function errorToField(error) {
    if (error.keyword === 'required' && typeof error.params.missingProperty === 'string') {
        return joinField(error.instancePath, error.params.missingProperty);
    }
    return error.instancePath.replace(/^\//, '') || 'unknown';
}
function joinField(instancePath, property) {
    const base = instancePath.replace(/^\//, '');
    return base ? `${base}/${property}` : property;
}

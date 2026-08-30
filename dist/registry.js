import { readFile, writeFile, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { getPortfileDir } from './portfile.js';
function getRegistryPath() {
    return join(getPortfileDir(), 'last-used.json');
}
export async function readRegistry() {
    try {
        const raw = await readFile(getRegistryPath(), 'utf-8');
        return JSON.parse(raw);
    }
    catch {
        return { entries: [] };
    }
}
export async function updateLastUsed(entry) {
    const reg = await readRegistry();
    reg.entries = reg.entries.filter((e) => e.projectId !== entry.projectId);
    reg.entries.unshift(entry);
    reg.entries = reg.entries.slice(0, 20);
    await writeRegistryAtomic(reg);
}
export async function getPinned() {
    const reg = await readRegistry();
    return reg.pinned;
}
export async function setPinned(entry) {
    const reg = await readRegistry();
    reg.pinned = entry;
    await writeRegistryAtomic(reg);
}
export async function clearPinned() {
    const reg = await readRegistry();
    delete reg.pinned;
    await writeRegistryAtomic(reg);
}
export async function getMostRecent() {
    const reg = await readRegistry();
    return reg.entries[0];
}
async function writeRegistryAtomic(reg) {
    const path = getRegistryPath();
    const tmp = path + '.tmp';
    await writeFile(tmp, JSON.stringify(reg, null, 2), 'utf-8');
    await rename(tmp, path);
}

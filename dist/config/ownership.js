/**
 * Build an ownership checker from a config.
 * Conservative default: include empty → all paths are "not owned".
 * exclude has higher priority than include (hard-block).
 */
export function createOwnershipChecker(config) {
    const includes = config.ownership?.include ?? [];
    const excludes = config.ownership?.exclude ?? [];
    return function isOwned(assetPath) {
        // 1. If no includes declared, treat everything as not owned (conservative)
        if (includes.length === 0)
            return false;
        // 2. Hard-exclude wins over include
        if (excludes.some(g => matchGlob(assetPath, g)))
            return false;
        // 3. Must match at least one include glob
        return includes.some(g => matchGlob(assetPath, g));
    };
}
/**
 * Minimal glob matcher supporting the /** suffix pattern used for UE asset paths.
 * Covers all patterns expected in smithue.config.json ownership lists:
 *   /Game/Foo/**  → matches /Game/Foo and any descendant
 *   /Game/Foo     → exact match or child prefix
 */
function matchGlob(assetPath, glob) {
    if (glob.endsWith('/**')) {
        const prefix = glob.slice(0, -3);
        return assetPath === prefix || assetPath.startsWith(prefix + '/');
    }
    return assetPath === glob || assetPath.startsWith(glob + '/');
}

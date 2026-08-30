export function isProcessAlive(pid) {
    if (pid <= 0) {
        return false;
    }
    try {
        process.kill(pid, 0);
        return true;
    }
    catch (error) {
        if (error && typeof error === 'object' && 'code' in error) {
            const code = error.code;
            if (code === 'EPERM') {
                return true;
            }
            if (code === 'ESRCH') {
                return false;
            }
        }
        return false;
    }
}

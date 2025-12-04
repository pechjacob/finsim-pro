/**
 * Version utility
 * Provides version information for the app
 */

import packageJson from '../package.json';

/**
 * Get the current version from package.json
 */
export function getVersion(): string {
    return packageJson.version;
}

/**
 * Get the full version string with dev suffix if in development
 */
export function getVersionString(): string {
    const version = getVersion();
    return import.meta.env.DEV ? `${version}-dev` : version;
}

/**
 * Get the git commit SHA (set at build time)
 */
export function getCommitSha(): string {
    return import.meta.env.VITE_COMMIT_SHA || 'dev-build';
}

/**
 * Get a short commit SHA (first 7 characters)
 */
export function getShortCommitSha(): string {
    const sha = getCommitSha();
    return sha === 'dev-build' ? sha : sha.substring(0, 7);
}

/**
 * Get commit count since last tag (for dev versioning)
 * Format: v1.1.0-dev-3 (abc1234) means "3 commits after v1.1.0"
 */
export function getCommitCount(): number {
    // This would need to be set at build time similar to commit SHA
    // For now, return 0 for dev-build
    const sha = getCommitSha();
    return sha === 'dev-build' ? 0 : parseInt(import.meta.env.VITE_COMMIT_COUNT || '0', 10);
}

/**
 * Get the full version display string
 * Dev: "v1.1.0-dev-3 (abc1234)" or "v1.1.0-dev-0 (dev-build)"
 * Prod: "v1.1.0"
 */
export function getFullVersionString(): string {
    const version = getVersion();

    if (import.meta.env.DEV) {
        const commitCount = getCommitCount();
        const shortSha = getShortCommitSha();
        return `v${version}-dev-${commitCount} (${shortSha})`;
    }

    return `v${version}`;
}

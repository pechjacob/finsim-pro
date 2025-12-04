#!/usr/bin/env node

/**
 * Preview unreleased changes based on commits since last tag
 * 
 * Usage:
 *   node scripts/preview-changelog.js        # CLI output
 *   node scripts/preview-changelog.js --sync # Update docs/docs/sdlc/index.md
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RELEASE_NOTES_PATH = path.join(__dirname, '../docs/docs/sdlc/index.md');

/**
 * Get commits since last tag
 */
function getCommitsSinceLastTag() {
    try {
        const lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim();
        const commits = execSync(`git log ${lastTag}..HEAD --pretty=format:"%s"`, { encoding: 'utf-8' })
            .split('\n')
            .filter(line => line.trim());

        return { lastTag, commits };
    } catch (error) {
        // No tags exist yet
        const commits = execSync('git log --pretty=format:"%s"', { encoding: 'utf-8' })
            .split('\n')
            .filter(line => line.trim());

        return { lastTag: null, commits };
    }
}

/**
 * Parse conventional commits into categories
 */
function categorizeCommits(commits) {
    const categories = {
        features: [],
        fixes: [],
        docs: [],
        refactor: [],
        other: []
    };

    const commitRegex = /^(feat|fix|docs|refactor|perf|test|chore|style)\(([^)]+)\):\s*(.+)$/;

    for (const commit of commits) {
        const match = commit.match(commitRegex);
        if (match) {
            const [, type, scope, description] = match;
            const entry = { scope, description };

            if (type === 'feat') {
                categories.features.push(entry);
            } else if (type === 'fix') {
                categories.fixes.push(entry);
            } else if (type === 'docs') {
                categories.docs.push(entry);
            } else if (type === 'refactor' || type === 'perf') {
                categories.refactor.push(entry);
            } else {
                categories.other.push(entry);
            }
        }
    }

    return categories;
}

/**
 * Format changelog for CLI output
 */
function formatForCLI(categories, lastTag) {
    const lines = [];

    lines.push('');
    lines.push('═══════════════════════════════════════');
    lines.push('  UNRELEASED CHANGES');
    lines.push(`  Since: ${lastTag || 'initial commit'}`);
    lines.push('═══════════════════════════════════════');
    lines.push('');

    if (categories.features.length > 0) {
        lines.push('✨ FEATURES:');
        categories.features.forEach(({ scope, description }) => {
            lines.push(`  • [${scope}] ${description}`);
        });
        lines.push('');
    }

    if (categories.fixes.length > 0) {
        lines.push('🐛 BUG FIXES:');
        categories.fixes.forEach(({ scope, description }) => {
            lines.push(`  • [${scope}] ${description}`);
        });
        lines.push('');
    }

    if (categories.refactor.length > 0) {
        lines.push('♻️  REFACTORS:');
        categories.refactor.forEach(({ scope, description }) => {
            lines.push(`  • [${scope}] ${description}`);
        });
        lines.push('');
    }

    if (categories.docs.length > 0) {
        lines.push('📚 DOCUMENTATION:');
        categories.docs.forEach(({ scope, description }) => {
            lines.push(`  • [${scope}] ${description}`);
        });
        lines.push('');
    }

    if (categories.features.length === 0 &&
        categories.fixes.length === 0 &&
        categories.refactor.length === 0 &&
        categories.docs.length === 0) {
        lines.push('  No conventional commits found.');
        lines.push('');
    }

    lines.push('═══════════════════════════════════════');
    lines.push('');

    return lines.join('\n');
}

/**
 * Format changelog for docs (markdown)
 */
function formatForDocs(categories) {
    const lines = [];

    if (categories.features.length > 0) {
        lines.push('**Features:**');
        categories.features.forEach(({ description }) => {
            lines.push(`- ${capitalizeFirst(description)}`);
        });
        lines.push('');
    }

    if (categories.fixes.length > 0) {
        lines.push('**Bug Fixes:**');
        categories.fixes.forEach(({ description }) => {
            lines.push(`- ${capitalizeFirst(description)}`);
        });
        lines.push('');
    }

    if (categories.refactor.length > 0) {
        lines.push('**Code Refactoring:**');
        categories.refactor.forEach(({ description }) => {
            lines.push(`- ${capitalizeFirst(description)}`);
        });
        lines.push('');
    }

    return lines.join('\n').trim();
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Update release notes file with unreleased changes
 */
function updateReleaseNotes(formattedContent) {
    if (!fs.existsSync(RELEASE_NOTES_PATH)) {
        console.error(`❌ ${RELEASE_NOTES_PATH} not found`);
        process.exit(1);
    }

    const releaseNotes = fs.readFileSync(RELEASE_NOTES_PATH, 'utf-8');

    // Find or create "Unreleased" section
    const unreleasedRegex = /## Unreleased\n([\s\S]*?)(?=\n## v|$)/;
    const match = releaseNotes.match(unreleasedRegex);

    let updatedContent;
    if (match) {
        // Replace existing unreleased section
        updatedContent = releaseNotes.replace(
            unreleasedRegex,
            `## Unreleased\n\n${formattedContent}\n`
        );
    } else {
        // Insert new unreleased section after "# Release Notes"
        const headerRegex = /(# Release Notes\n)/;
        updatedContent = releaseNotes.replace(
            headerRegex,
            `$1\n## Unreleased\n\n${formattedContent}\n`
        );
    }

    fs.writeFileSync(RELEASE_NOTES_PATH, updatedContent, 'utf-8');
    console.log(`✅ Updated ${RELEASE_NOTES_PATH} with unreleased changes`);
}

/**
 * Main function
 */
function main() {
    const args = process.argv.slice(2);
    const shouldSync = args.includes('--sync');

    const { lastTag, commits } = getCommitsSinceLastTag();

    if (commits.length === 0) {
        console.log('\n✓ No new commits since last tag.\n');
        return;
    }

    const categories = categorizeCommits(commits);

    // Always show CLI output
    const cliOutput = formatForCLI(categories, lastTag);
    console.log(cliOutput);

    // Optionally sync to docs
    if (shouldSync) {
        const docsContent = formatForDocs(categories);
        if (docsContent) {
            updateReleaseNotes(docsContent);
        } else {
            console.log('ℹ️  No changes to sync (no conventional commits found).');
        }
    } else {
        console.log('💡 Tip: Run with --sync to update docs/docs/sdlc/index.md');
    }
}

main();

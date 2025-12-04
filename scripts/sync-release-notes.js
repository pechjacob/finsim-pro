#!/usr/bin/env node

/**
 * Syncs the latest version from CHANGELOG.md to docs/docs/sdlc/index.md
 * 
 * Usage:
 *   node scripts/sync-release-notes.js
 * 
 * This script:
 * 1. Parses CHANGELOG.md
 * 2. Extracts the latest version section
 * 3. Formats it for the docs release notes
 * 4. Updates docs/docs/sdlc/index.md
 */

const fs = require('fs');
const path = require('path');

// Paths
const CHANGELOG_PATH = path.join(__dirname, '../CHANGELOG.md');
const RELEASE_NOTES_PATH = path.join(__dirname, '../docs/docs/sdlc/index.md');

/**
 * Parse CHANGELOG.md and extract the latest version
 */
function parseLatestVersion(changelogContent) {
    // Match version header: ## [1.2.0](link) (date)
    const versionRegex = /## \[(\d+\.\d+\.\d+)\]\([^)]+\) \(([^)]+)\)/;
    const match = changelogContent.match(versionRegex);

    if (!match) {
        console.error('❌ Could not find version in CHANGELOG.md');
        process.exit(1);
    }

    const version = match[1];
    const date = match[2];

    // Extract content between this version and the next ## heading
    const versionHeader = match[0];
    const versionIndex = changelogContent.indexOf(versionHeader);
    const nextVersionIndex = changelogContent.indexOf('\n## ', versionIndex + 1);

    const versionContent = changelogContent.substring(
        versionIndex + versionHeader.length,
        nextVersionIndex !== -1 ? nextVersionIndex : undefined
    ).trim();

    return { version, date, content: versionContent };
}

/**
 * Format changelog content for release notes
 */
function formatForReleaseNotes(changelogSection) {
    const lines = changelogSection.split('\n');
    const formatted = [];

    for (const line of lines) {
        // Skip empty lines and "Features" / "Bug Fixes" headers
        if (!line.trim()) continue;

        // Convert headers
        if (line.startsWith('### ✨ Features')) {
            formatted.push('\n**Features:**');
            continue;
        }
        if (line.startsWith('### 🐛 Bug Fixes')) {
            formatted.push('\n**Bug Fixes:**');
            continue;
        }
        if (line.startsWith('### 📚 Documentation')) {
            formatted.push('\n**Documentation:**');
            continue;
        }
        if (line.startsWith('### ⚡️ Performance')) {
            formatted.push('\n**Performance:**');
            continue;
        }
        if (line.startsWith('### ✅ Tests')) {
            formatted.push('\n**Tests:**');
            continue;
        }
        if (line.startsWith('### ♻️')) {
            formatted.push('\n**Code Refactoring:**');
            continue;
        }

        // Convert bullet points
        if (line.startsWith('* ')) {
            // Extract description (remove commit hash links)
            const cleaned = line
                .replace(/\* \*\*[^*]+\*\*: /, '- ')  // Remove **scope**:
                .replace(/\s*\([a-f0-9]+\)\s*$/, ''); // Remove (hash)
            formatted.push(cleaned);
        }
    }

    return formatted.join('\n');
}

/**
 * Update release notes file
 */
function updateReleaseNotes(version, formattedContent) {
    const releaseNotes = fs.readFileSync(RELEASE_NOTES_PATH, 'utf-8');

    // Find the "Unreleased" section end (insert after it)
    const unreleasedRegex = /## Unreleased[\s\S]*?(?=\n## v|\n$)/;
    const unreleasedMatch = releaseNotes.match(unreleasedRegex);

    let insertIndex;
    if (unreleasedMatch) {
        // Insert after Unreleased section
        insertIndex = unreleasedMatch.index + unreleasedMatch[0].length;
    } else {
        // Fallback: insert after "# Release Notes" header
        const headerRegex = /# Release Notes\n/;
        const headerMatch = releaseNotes.match(headerRegex);
        if (!headerMatch) {
            console.error('❌ Could not find "# Release Notes" header');
            process.exit(1);
        }
        insertIndex = headerMatch.index + headerMatch[0].length;
    }

    // Create new version section
    const newSection = `\n## v${version} (Current)\n${formattedContent}\n`;

    // Update previous "Current" to remove that label
    // NOTE: We don't add "(Legacy Release)" here because we want the main docs to just show version numbers
    // The "(Legacy Release)" label is only for versioned snapshots (handled in removeUnreleasedFromVersionedDocs)
    const updatedContent = releaseNotes.substring(insertIndex)
        .replace(/## v(\d+\.\d+\.\d+) \(Current\)/, '## v$1');

    // Combine
    const finalContent =
        releaseNotes.substring(0, insertIndex) +
        newSection +
        updatedContent;

    fs.writeFileSync(RELEASE_NOTES_PATH, finalContent, 'utf-8');

    console.log(`✅ Updated ${RELEASE_NOTES_PATH} with v${version}`);
}

/**
 * Remove Unreleased section and update labels in versioned docs snapshot
 */
function removeUnreleasedFromVersionedDocs(version) {
    const versionedDocsPath = path.join(__dirname, `../docs/versioned_docs/version-${version}/sdlc/index.md`);

    if (!fs.existsSync(versionedDocsPath)) {
        console.log(`⚠️  Versioned docs not found at ${versionedDocsPath}`);
        return;
    }

    let content = fs.readFileSync(versionedDocsPath, 'utf-8');

    // 1. Remove Unreleased section
    const unreleasedRegex = /## Unreleased[\s\S]*?(?=\n## v)/;
    content = content.replace(unreleasedRegex, '');

    // 2. Update previous versions (optional cleanup)
    // We don't add "(Legacy Release)" anymore as per user request
    // But we can ensure they don't have "(Current)" if they somehow kept it

    // Find all version headers that are NOT the current version but have (Current)
    // and remove the (Current) label
    const versionHeaderRegex = /^## v(\d+\.\d+\.\d+) \(Current\)/gm;
    content = content.replace(versionHeaderRegex, '## v$1');

    fs.writeFileSync(versionedDocsPath, content, 'utf-8');
    console.log(`✅ Cleaned up versioned docs v${version} (removed Unreleased)`);
}

/**
 * Main function
 */
function main() {
    console.log('📝 Syncing CHANGELOG to release notes...\n');

    // Read CHANGELOG
    if (!fs.existsSync(CHANGELOG_PATH)) {
        console.error(`❌ ${CHANGELOG_PATH} not found`);
        process.exit(1);
    }

    const changelog = fs.readFileSync(CHANGELOG_PATH, 'utf-8');

    // Parse latest version
    const { version, content } = parseLatestVersion(changelog);
    console.log(`📌 Latest version: v${version}`);

    // Format for release notes
    const formatted = formatForReleaseNotes(content);

    // Update docs
    updateReleaseNotes(version, formatted);

    // Auto-version documentation
    console.log('\n📚 Versioning documentation...');
    try {
        const { execSync } = require('child_process');
        execSync(`cd docs && npm run docusaurus docs:version ${version}`, { stdio: 'inherit' });
        console.log(`✅ Created docs version ${version}`);

        // Remove Unreleased section from the versioned snapshot
        removeUnreleasedFromVersionedDocs(version);

        // Add versioned docs to git
        execSync('git add docs/', { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ Failed to version docs:', error.message);
        console.log('   Manually run:');
        console.log(`     cd docs && npm run docusaurus docs:version ${version}`);
    }

    // Auto-commit the changes
    console.log('\n📦 Auto-committing changes...');
    try {
        const { execSync } = require('child_process');
        execSync('git commit --amend --no-edit', { stdio: 'inherit' });
        console.log('✅ Changes automatically added to release commit');
    } catch (error) {
        console.log('⚠️  Could not auto-commit (this is normal if not in a git repository)');
        console.log('   Manually run:');
        console.log('     git commit --amend --no-edit');
    }

    console.log('\n✨ Done! Ready to push.\n');
    console.log('💡 TIP: To auto-restart dev servers next time, run:');
    console.log('  npm run release:dev\n');
    console.log('Next step:');
    console.log('  git push --follow-tags origin main');
}

main();
